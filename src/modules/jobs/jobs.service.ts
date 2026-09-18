// src/modules/jobs/jobs.service.ts
import { NotFoundError, ForbiddenError } from '../../shared/errors.js';
import { getRecruiterCompany } from '../companies/companies.repo.js';
import { assertCompanyRole } from '../companies/companies.service.js';
import { assertJobOwnership, createJob, updateJob, setJobStatus, listJobsForCompany, encodeCursor } from './jobs.repo.js';
import type { CreateJobInput, ListCompanyJobsInput } from './jobs.schema.js';

export async function getJob(jobId: string, requestingCompanyId: string) {
  const job = await jobsRepo.findById(jobId);
  if (!job) throw new NotFoundError('Job not found');
  if (job.companyId !== requestingCompanyId) throw new ForbiddenError('Access denied');
  return job;
}

const JOB_POSTERS = ['owner', 'hr_manager', 'recruiter'] as const;

export async function postJob(userId: string, input: CreateJobInput) {
  const company = await getRecruiterCompany(userId);
  if (!company) throw new ForbiddenError('No company workspace found.');

  assertCompanyRole(company.companyRole, [...JOB_POSTERS]);

  const jobId = await createJob(company.companyId, input);
  return { jobId };
}

export async function editJob(
  userId: string,
  jobId: string,
  input: Partial<CreateJobInput>,
) {
  const company = await getRecruiterCompany(userId);
  if (!company) throw new ForbiddenError('No company workspace found.');

  assertCompanyRole(company.companyRole, [...JOB_POSTERS]);

  // Confirm the job belongs to this company (throws NotFoundError if not)
  await assertJobOwnership(jobId, company.companyId);

  await updateJob(jobId, company.companyId, input);
}

export async function publishJob(userId: string, jobId: string) {
  const company = await getRecruiterCompany(userId);
  if (!company) throw new ForbiddenError('No company workspace found.');

  assertCompanyRole(company.companyRole, [...JOB_POSTERS]);

  await assertJobOwnership(jobId, company.companyId);
  await setJobStatus(jobId, company.companyId, 'open');
}

export async function closeJob(userId: string, jobId: string) {
  const company = await getRecruiterCompany(userId);
  if (!company) throw new ForbiddenError('No company workspace found.');

  assertCompanyRole(company.companyRole, [...JOB_POSTERS]);

  await assertJobOwnership(jobId, company.companyId);
  await setJobStatus(jobId, company.companyId, 'closed');
}

export async function getCompanyJobs(userId: string, input: ListCompanyJobsInput) {
  const company = await getRecruiterCompany(userId);
  if (!company) throw new ForbiddenError('No company workspace found.');

  const rows = await listJobsForCompany(company.companyId, input);

  const hasNextPage = rows.length > input.limit;
  const items = hasNextPage ? rows.slice(0, input.limit) : rows;

  const nextCursor =
    hasNextPage && items.length > 0
      ? encodeCursor(items[items.length - 1].createdAt, items[items.length - 1].id)
      : null;

  return { jobs: items, nextCursor };
}