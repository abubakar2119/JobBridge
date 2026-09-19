import express from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { companiesRouter } from './modules/companies/companies.routes.js';
import { applicantsRouter } from './modules/applicants/applicants.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { errorHandler } from './shared/error-handler.js';
import { jobsRouter } from './modules/jobs/jobs.router.js';
import { authMiddleware } from './shared/auth-middleware.js';
import { publicRouter } from './modules/public/publicRouter.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/applicants', applicantsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/jobs', jobsRouter);
app.use(errorHandler);
app.use('/api/public', publicRouter);
app.use('/api/auth',    authRouter);
app.use('/api/jobs',    authMiddleware, jobsRouter);

export { app };