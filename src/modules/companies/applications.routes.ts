import { Router } from 'express';
import * as service from './applications.service.js';
import { requireRole } from '../../shared/require-role.js';
import { authMiddleware } from '../../shared/auth-middleware.js';
import { db } from '../../shared/db.js'; 

const router = Router();

router.use(
  authMiddleware,
  requireRole('recruiter')
);

router.patch('/:id/stage', async (req, res, next) => {
  try {
    const { stage } = req.body;
    const userId = req.user!.userId;

    const recruiterResult = await db.query(
      'SELECT company_id FROM recruiters WHERE user_id = $1',
      [userId]
    );

    const recruiter = recruiterResult.rows[0];
    if (!recruiter) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Recruiter profile not found' } });
    }

    const updated = await service.moveApplicationStage(
      recruiter.company_id,
      req.params.id,
      stage
    );

    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ValidationError' || err.constructor.name === 'ValidationError') {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    next(err);
  }
});

// In applications.routes.ts — add:
router.post('/:id/interview', async (req, res, next) => {
  try {
    const { scheduledAt, meetingLink, notes } = req.body;
    const userId = req.user!.userId;

   
    const recruiterResult = await db.query(
      'SELECT company_id FROM recruiters WHERE user_id = $1',
      [userId]
    );

    const recruiter = recruiterResult.rows[0];
    if (!recruiter) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Recruiter profile not found' } });
    }

  
    const interview = await service.scheduleInterview(
      recruiter.company_id,
      req.params.id,
      { scheduledAt, meetingLink, notes }
    );
    res.status(201).json(interview);
  } catch (err: any) {
    if (err.name === 'ValidationError' || err.constructor.name === 'ValidationError') {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    next(err);
  }
});

// In src/modules/companies/applications.routes.ts
// The router is already mounted — add a new path prefix for interviews

// Option A: mount under the same router with a distinct path
router.patch('/interviews/:id/feedback', async (req, res, next) => {
  try {
    const { feedback, outcome } = req.body;
    const userId = req.user!.userId;

  
    const recruiterResult = await db.query(
      'SELECT company_id FROM recruiters WHERE user_id = $1',
      [userId]
    );

    const recruiter = recruiterResult.rows[0];
    if (!recruiter) {
      return res.status(403).json({ 
        error: { code: 'FORBIDDEN', message: 'Recruiter profile not found' } 
      });
    }

    const result = await service.recordInterviewFeedback(
      recruiter.company_id,
      req.params.id,
      { feedback, outcome }
    );
    res.json(result);
  } catch (err: any) {
    if (err.name === 'ValidationError' || err.constructor.name === 'ValidationError') {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: err.message
        }
      });
    }
    next(err);
  }
});

// GET / — list all applications for this company, grouped by stage
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const recruiterResult = await db.query(
      'SELECT company_id FROM recruiters WHERE user_id = $1',
      [userId]
    );

    const recruiter = recruiterResult.rows[0];

    if (!recruiter) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Recruiter profile not found'
        }
      });
    }

    const pipeline = await service.getCompanyPipeline(recruiter.company_id);

    res.json({ pipeline });
  } catch (err) {
    next(err);
  }
});

export default router;