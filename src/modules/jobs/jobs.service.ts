
// src/modules/jobs/jobs.service.ts
import { NotFoundError, ForbiddenError } from '../../shared/errors.js';
import { getRecruiterCompany } from '../companies/companies.repo.js';
import { assertCompanyRole } from '../companies/companies.service.js';
import {
  assertJobOwnership,
  findById,
  createJob,
  updateJob,
  setJobStatus,
  listJobsForCompany,
  encodeCursor,
} from './jobs.repo.js';
import type { CreateJobInput, ListCompanyJobsInput } from './jobs.schema.js';

import { db } from '../../shared/db.js';
import logger from '../../shared/logger.js';
import { redis } from '../../shared/redis.js';

const PUBLIC_BOARD_CACHE_KEY = 'jobs:public:page1';

export async function getJob(
  jobId: string,
  requestingCompanyId: string,
) {
  const job = await findById(jobId);

  if (!job) {
    throw new NotFoundError('Job not found');
  }

  if (job.companyId !== requestingCompanyId) {
    throw new ForbiddenError('Access denied');
  }

  return job;
}

const JOB_POSTERS = ['owner', 'hr_manager', 'recruiter'] as const;

export async function postJob(
  userId: string,
  input: CreateJobInput,
) {
  const company = await getRecruiterCompany(userId);

  if (!company) {
    throw new ForbiddenError('No company workspace found.');
  }

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

  if (!company) {
    throw new ForbiddenError('No company workspace found.');
  }

  assertCompanyRole(company.companyRole, [...JOB_POSTERS]);

  // Confirm the job belongs to this company
  await assertJobOwnership(jobId, company.companyId);

  await updateJob(jobId, company.companyId, input);
}

export async function publishJob(
  jobId: string,
  companyId: string,
): Promise<void> {
  await assertJobOwnership(jobId, companyId);

  await db.query(
    `UPDATE jobs SET status = 'open' WHERE id = $1`,
    [jobId],
  );

  try {
    await redis.del(PUBLIC_BOARD_CACHE_KEY);
  } catch (err) {
    // Job is published even if cache invalidation fails.
    // Cache will auto-expire in 60s.
    logger.error(
      { err },
      '[cache] Failed to invalidate public board cache',
    );
  }
}

export async function closeJob(
  jobId: string,
  companyId: string,
): Promise<void> {
  await assertJobOwnership(jobId, companyId);

  await db.query(
    `UPDATE jobs SET status = 'closed' WHERE id = $1`,
    [jobId],
  );

  try {
    await redis.del(PUBLIC_BOARD_CACHE_KEY);
  } catch (err) {
    // Job is closed even if cache invalidation fails.
    // Cache will auto-expire in 60s.
    logger.error(
      { err },
      '[cache] Failed to invalidate public board cache',
    );
  }
}

export async function getCompanyJobs(
  userId: string,
  input: ListCompanyJobsInput,
) {
  const company = await getRecruiterCompany(userId);

  if (!company) {
    throw new ForbiddenError('No company workspace found.');
  }

  const rows = await listJobsForCompany(
    company.companyId,
    input,
  );

  const hasNextPage = rows.length > input.limit;

  const items = hasNextPage
    ? rows.slice(0, input.limit)
    : rows;

  const nextCursor =
    hasNextPage && items.length > 0
      ? encodeCursor(
          items[items.length - 1].createdAt,
          items[items.length - 1].id,
        )
      : null;

  return {
    jobs: items,
    nextCursor,
  };
}

// TODO (ch59): invalidate 'jobs:public:page1' when company status changes.

