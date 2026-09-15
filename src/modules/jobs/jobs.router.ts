import { Router } from 'express';
import { validateBody, validateQuery,validateParam, uuidParam} from '../../shared/validate.js';
import { createJobSchema, listJobsQuerySchema } from './jobs.schema.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const query = validateQuery(listJobsQuerySchema, req.query);
    // query.status, query.page, query.limit are typed and validated
    // ... call service
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = validateBody(createJobSchema, req.body);
    // body is CreateJobInput — title, description, status, etc. all typed
    // ... call service
  } catch (err) {
    next(err);
  }
});

router.get('/:jobId', async (req, res, next) => {
  try {
    const jobId = validateParam(uuidParam, req.params.jobId);
    // jobId: string — guaranteed UUID format
    // ... call service
  } catch (err) {
    next(err);
  }
});



export { router as jobsRouter };