import { Router } from 'express';
import { authMiddleware } from '../../shared/auth-middleware.js';
import { requireRole } from '../../shared/require-role.js';
import { getRecruiterCompany } from '../companies/companies.repo.js';
import { assertJobOwnership } from './jobs.repo.js';
import { NotFoundError } from '../../shared/errors.js';
import { validateBody } from '../../shared/validate.js';
import { createJobSchema, listCompanyJobsSchema } from './jobs.schema.js';
import { closeJob, editJob, getCompanyJobs, postJob, publishJob } from './jobs.service.js';
import logger from '../../shared/logger.js';

const router = Router();

router.use(authMiddleware, requireRole('recruiter'));

/**
 * GET /api/jobs/:id
 *
 * Returns a job posting owned by the authenticated recruiter's company.
 * Steps:
 *  1. Resolve companyId from the verified JWT (via recruiters table).
 *  2. Assert the job belongs to that company.
 *  3. Return the job data.
 *
 * A recruiter from a different company receives 404 — not 403.
 * The response does not confirm the job exists at all.
 */
router.get('/:id', async (req, res, next) => {
  try {
    logger.debug({ params: req.params }, 'request params');
    logger.debug({ jobId: req.params.id }, 'request param id');
    logger.debug({ jobIdType: typeof req.params.id }, 'request param id type');

    const recruiter = await getRecruiterCompany(req.user!.userId);

    if (!recruiter) {
      return next(new NotFoundError('No company associated with this account'));
    }

    const jobId = req.params.id;

    logger.debug({ jobId }, 'final job id');

    await assertJobOwnership(jobId, recruiter.companyId);

    res.json({
      jobId,
      companyId: recruiter.companyId,
    });
  } catch (err) {
    next(err);
  }
});
router.post('/', async (req, res, next) => {
  try {
    const input = validateBody(createJobSchema, req.body);
    const result = await postJob(req.user!.userId, input as any);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const input = validateBody(createJobSchema.partial(), req.body);
    await editJob(req.user!.userId, req.params.id, input as any);
    res.json({ message: 'Job updated.' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/publish', async (req, res, next) => {
  try {
    await publishJob(req.user!.userId, req.params.id);
    res.json({ message: 'Job published.' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/close', async (req, res, next) => {
  try {
    await closeJob(req.user!.userId, req.params.id);
    res.json({ message: 'Job closed.' });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const input = validateBody(listCompanyJobsSchema, req.query);
    const result = await getCompanyJobs(req.user!.userId, input as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
});


export { router as jobsRouter };