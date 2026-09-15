import express from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { companiesRouter } from './modules/companies/companies.routes.js';
import { applicantsRouter } from './modules/applicants/applicants.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { errorHandler } from './shared/error-handler.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/applicants', applicantsRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler);

export { app };