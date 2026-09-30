import { NotFoundError } from "../../shared/errors.js";
import { ValidationError } from "../../shared/validate.js";
import * as repo from "./applications.repo.js";
import { sendInterviewNotification } from "../../shared/mailer.js";
import queue from "../../shared/queue.js";

const STAGE_ORDER = [
  "applied",
  "screening",
  "interview",
  "final_interview",
  "offer",
  "hired",
  "rejected",
] as const;

const INTERVIEW_ELIGIBLE_STAGES = new Set([
  "applied",
  "screening",
  "interview",
]);

type Stage = (typeof STAGE_ORDER)[number];

const TERMINAL_STAGES = new Set<Stage>(["hired", "rejected"]);

function assertValidTransition(current: Stage, target: Stage) {
  if (TERMINAL_STAGES.has(current)) {
    throw new ValidationError(
      `Cannot transition from terminal stage '${current}'`,
    );
  }

  if (!STAGE_ORDER.includes(target)) {
    throw new ValidationError(`'${target}' is not a valid stage`);
  }

  // rejected kisi bhi non-terminal stage se allowed hai
  if (target === "rejected") return;

  const currentIdx = STAGE_ORDER.indexOf(current);
  const targetIdx = STAGE_ORDER.indexOf(target);

  if (targetIdx <= currentIdx) {
    throw new ValidationError(
      `Cannot move backward from '${current}' to '${target}'`,
    );
  }
}

export async function moveApplicationStage(
  recruiterCompanyId: string,
  applicationId: string,
  targetStage: Stage,
) {
  const application = await repo.findApplicationForCompany(
    applicationId,
    recruiterCompanyId,
  );

  if (!application) {
    throw new NotFoundError("Application not found");
  }

  if (application.status === "withdrawn") {
    throw new ValidationError("Cannot change stage of a withdrawn application");
  }

  assertValidTransition(application.stage as Stage, targetStage);

  return repo.updateApplicationStage(applicationId, targetStage);
}

export async function scheduleInterview(
  companyId: string,
  applicationId: string,
  body: { scheduledAt: string; meetingLink: string; notes?: string },
) {
  const scheduled = new Date(body.scheduledAt);
  if (isNaN(scheduled.getTime()))
    throw new ValidationError("scheduledAt is not a valid date");
  if (scheduled <= new Date())
    throw new ValidationError("scheduledAt must be in the future");

  const application = await repo.findApplicationWithApplicant(
    applicationId,
    companyId,
  );
  if (!application) throw new NotFoundError("Application not found");
  if (application.status === "withdrawn") {
    throw new ValidationError(
      "Cannot schedule interview for a withdrawn application",
    );
  }

  // Advance stage to 'interview' if not already at or past it
  const currentStageIdx = STAGE_ORDER.indexOf(application.stage);
  const interviewIdx = STAGE_ORDER.indexOf("interview");
  if (currentStageIdx < interviewIdx) {
    await repo.updateApplicationStage(applicationId, "interview");
  }

  const interview = await repo.createInterview(
    applicationId,
    new Date(body.scheduledAt),
    body.meetingLink,
    body.notes ?? null,
  );

  // Send notification — inline for now (ch67 moves this to a background job)
  await queue.add("send-interview-notification", {
  applicantEmail: application.applicant_email,
  jobTitle: application.job_title,
  scheduledAt: new Date(body.scheduledAt),
  meetingLink: body.meetingLink,
  notes: body.notes ?? null,
});

  return interview;
}

// TODO: wrap stage update and interview insert in a transaction (ch52 pattern)


export async function recordInterviewFeedback(
  companyId: string,
  interviewId: string,
  body: { feedback: string; outcome: 'moved_forward' | 'rejected' }
) {
  const interview = await repo.findInterviewForCompany(interviewId, companyId);
  if (!interview) throw new NotFoundError('Interview not found');

  if (interview.outcome !== 'pending') {
    throw new ValidationError('Feedback has already been recorded for this interview');
  }

  if (interview.application_status === 'withdrawn') {
    throw new ValidationError('Cannot record feedback for a withdrawn application');
  }

  // Update the interview record
  const updatedInterview = await repo.updateInterviewFeedback(
    interviewId,
    body.feedback,
    body.outcome
  );

  // Advance or terminate the application based on outcome
  let updatedApplication: Record<string, unknown> | null = null;

  if (body.outcome === 'rejected') {
    updatedApplication = await repo.updateApplicationStage(interview.application_id, 'rejected');
  } else {
    // outcome === 'moved_forward': advance to the next stage
    const currentStage = interview.application_stage as Stage;
    const currentIdx   = STAGE_ORDER.indexOf(currentStage);
    const nextStage    = STAGE_ORDER[currentIdx + 1];

    if (!nextStage || TERMINAL_STAGES.has(currentStage)) {
      // Already at a terminal or no next stage — do not change stage
      // (This happens if feedback is recorded on an application already at 'offer')
    } else {
      updatedApplication = await repo.updateApplicationStage(interview.application_id, nextStage);
    }
  }

  return { interview: updatedInterview, application: updatedApplication };
}


const ALL_STAGES = [
  'applied', 'screening', 'interview', 'final_interview', 'offer', 'hired', 'rejected'
] as const;

export async function getCompanyPipeline(companyId: string) {
  const applications = await repo.findApplicationsForCompany(companyId);

  // Group into a pipeline object keyed by stage
  const pipeline: Record<string, typeof applications> = Object.fromEntries(
    ALL_STAGES.map((stage) => [stage, []])
  );

  for (const app of applications) {
    pipeline[app.stage]?.push(app);
  }

  return pipeline;
}