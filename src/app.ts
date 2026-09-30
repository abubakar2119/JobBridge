import express from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { companiesRouter } from './modules/companies/companies.routes.js';
import { applicantsRouter } from './modules/applicants/applicants.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { errorHandler } from './shared/error-handler.js';
import { jobsRouter } from './modules/jobs/jobs.router.js';
import { authMiddleware } from './shared/auth-middleware.js';
import { publicRouter } from './modules/public/publicRouter.js';
import companiesApplicationsRouter from './modules/companies/applications.routes.js';
import router from './modules/companies/applications.routes.js';
import { globalLimiter } from './shared/rateLimiter.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { httpLogger } from './middleware/httpLogger.js';
import healthRouter from './routes/health.js';
import helmet from 'helmet';
import cors from 'cors';
import {config} from './shared/config.js';


const app = express();


app.use(express.json());
app.disable('x-powered-by');
// Security headers (must be before routes)
app.use(helmet());
app.use(requestIdMiddleware);   // first: assign the ID
app.use(httpLogger);            // second: log with the ID
// Health routes must be accessible without authentication
app.use(healthRouter);   // mounts /health and /ready at the root level
// ... auth middleware and other routes below
app.use(globalLimiter);         // rate limiter
app.use(cors({
  origin: (origin, callback) => {
    callback(
      null,
      origin === config.FRONTEND_URL ? origin : false
    );
  },
  credentials: true,
}));

// ... routes
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
app.use('/api/applicants', applicantsRouter);
app.use('/api/companies/applications', companiesApplicationsRouter);
app.use("/api/companies", router);


export { app };