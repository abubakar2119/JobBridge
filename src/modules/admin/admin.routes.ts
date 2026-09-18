  import { Router } from 'express';
  import { authMiddleware } from '../../shared/auth-middleware.js';
  import { requireRole } from '../../shared/require-role.js';
  import { db } from '../../shared/db.js';
  import { NotFoundError } from '../../shared/errors.js';

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

  export { router as adminRouter };