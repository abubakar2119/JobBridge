import { Worker, Job, Queue } from 'bullmq';
import { config } from '../shared/config.js';
import { JobName } from '../shared/queue.js';
import {
  sendApplicationConfirmationEmail,
  sendInterviewNotification,
} from '../shared/mailer.js';
import { processResume } from './handlers/processResume.js';
import { cleanupExpiredOtps } from './handlers/cleanupExpiredOtps.js';
import { cleanupExpiredTokens } from './handlers/cleanupExpiredTokens.js';
import { sendRecruiterDigest } from './handlers/sendRecruiterDigest.js';
import logger from '../shared/logger.js';



// Separate Queue instance used only to register scheduled jobs
const schedulerQueue = new Queue('jobs', {
  connection: { url: config.REDIS_URL },
});

async function registerRepeatableJobs() {
  // Daily at midnight UTC
  await schedulerQueue.upsertJobScheduler(
  'cleanup-expired-otps',
  { pattern: '0 0 * * *' },
  {
    name: 'cleanup-expired-otps',
    data: {},
  }
);

  // Daily at 01:00 UTC
  await schedulerQueue.upsertJobScheduler(
  'cleanup-expired-refresh-tokens',
  { pattern: '0 1 * * *' },
  {
    name: 'cleanup-expired-refresh-tokens',
    data: {},
  }
);
 
  // Every Monday at 08:00 UTC
  await schedulerQueue.upsertJobScheduler(
    'send-recruiter-digest',
    { pattern: '0 8 * * 1' },
    {
      name: 'send-recruiter-digest',
      data: {},
    }
  );

  await schedulerQueue.close();
}

// Register scheduled jobs before starting the worker
await registerRepeatableJobs();

// Worker connection must be separate from the Queue connection
const worker = new Worker(
  'jobs',
  async (job: Job) => {
    console.log(`[worker] Processing job ${job.name} (id: ${job.id})`);

    switch (job.name as JobName) {
      case 'send-application-confirmation': {
        const { applicantEmail, jobTitle, companyName } = job.data;

        await sendApplicationConfirmationEmail(
          applicantEmail,
          jobTitle,
          companyName
        );

        break;
      }

      case 'process-resume': {
        const { resumeId, s3Key } = job.data;

        await processResume(resumeId, s3Key);

        break;
      }

      case 'send-interview-notification': {
        const {
          applicantEmail,
          jobTitle,
          scheduledAt,
          meetingLink,
          notes,
        } = job.data;

        await sendInterviewNotification(
          applicantEmail,
          jobTitle,
          new Date(scheduledAt),
          meetingLink,
          notes ?? null
        );

        break;
      }

      case 'cleanup-expired-otps': {
        await cleanupExpiredOtps();
        break;
      }

      case 'cleanup-expired-refresh-tokens': {
        await cleanupExpiredTokens();
        break;
      }

      case 'send-recruiter-digest': {
      await sendRecruiterDigest();
      break;
      }
      default:
        console.warn(
          `[worker] Unknown job name: ${job.name}. Skipping.`
        );
    }
  },
  {
    connection: { url: config.REDIS_URL },
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(
    `[worker] Job completed: ${job.name} (id: ${job.id})`
  );
});

worker.on('failed', (job, err) => {
  console.error(
    `[worker] Job failed: ${job?.name} (id: ${job?.id})`,
    err.message
  );
});

process.on('SIGTERM', async () => {
  logger.info('Worker SIGTERM received — closing');
  await worker.close();
  logger.info('Worker closed');
  process.exit(0);
});

console.log('[worker] Worker started and listening for jobs...');