import { Router } from 'express';
import { authMiddleware } from '../../shared/auth-middleware.js';
import { requireRole } from '../../shared/require-role.js';

const router = Router();

// Every route on this router requires a valid token with role 'admin'.
router.use(authMiddleware, requireRole('admin'));

// Placeholder — real endpoints are added in later chapters.
router.get('/', (_req, res) => {
  res.status(501).json({ error: 'Not Implemented' });
});

export { router as adminRouter };