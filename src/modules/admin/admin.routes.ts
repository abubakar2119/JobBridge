  import { Router } from 'express';
  import { authMiddleware } from '../../shared/auth-middleware.js';
  import { requireRole } from '../../shared/require-role.js';
  import { db } from '../../shared/db.js';
  import { NotFoundError } from '../../shared/errors.js';
  import * as service from './admin.service.js';

  const router = Router();

  // Every route on this router requires a valid token with role 'admin'.
  router.use(authMiddleware, requireRole('admin'));

  // Placeholder — real endpoints are added in later chapters.
  
  router.get('/jobs/:id', async (req, res, next) => {
    try {
      const result = await db.query(
        `SELECT id, title, company_id, status FROM jobs WHERE id = $1`,
        [req.params.id],
      );

      if (result.rows.length === 0) {
        return next(new NotFoundError('Job not found'));
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

router.get('/companies', async (req, res, next) => {
  try {
    const companies = await service.listCompanies(req.query.status as string | undefined);
    res.json({ companies });
  } catch (err) {
    next(err);
  }
});

router.patch('/companies/:id/verify', async (req, res, next) => {
  try {
    const company = await service.verifyCompany(req.params.id);
    res.json({ company });
  } catch (err) {
    next(err);
  }
});

router.patch('/companies/:id/suspend', async (req, res, next) => {
  try {
    const company = await service.suspendCompany(req.params.id);
    res.json({ company });
  } catch (err) {
    next(err);
  }
});

router.patch('/companies/:id/pending', async (req, res, next) => {
  try {
    const company = await service.pendingCompany(req.params.id);
    res.json({ company });
  } catch (err) {
    next(err);
  }
});

router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await service.listJobs(
      req.query.status as string | undefined,
      req.query.companyId as string | undefined
    );
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
});

router.patch('/jobs/:id/close', async (req, res, next) => {
  try {
    const job = await service.forceCloseJob(req.params.id);
    res.json({ job });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await service.listUsers(
      req.query.role as string | undefined,
      req.query.status as string | undefined
    );
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/suspend', async (req, res, next) => {
  try {
    const user = await service.suspendUser(req.user!.userId, req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/activate', async (req, res, next) => {
  try {
    const user = await service.activateUser(req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

  export { router as adminRouter };