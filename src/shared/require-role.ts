import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from './errors.js';

export function requireRole(
  ...roles: ('admin' | 'recruiter' | 'applicant')[]
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient role'));
    }
    next();
  };
}