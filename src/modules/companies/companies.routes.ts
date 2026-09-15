import { Router } from 'express';
import { authMiddleware } from '../../shared/auth-middleware.js';
import { requireRole } from '../../shared/require-role.js';

const router = Router();

// Every route on this router requires a valid token with role 'recruiter'.
router.use(authMiddleware, requireRole('recruiter'));

// Placeholder — real endpoints are added in later chapters.
router.get('/', (_req, res) => {
  res.status(501).json({ error: 'Not Implemented' });
});

export { router as companiesRouter };