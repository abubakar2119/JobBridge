import express from "express";
import { errorHandler } from './shared/error-handler.js';
import { jobsRouter } from "./modules/jobs/jobs.router.js";
import { authRouter } from './modules/auth/auth.routes.js';
import { authMiddleware } from './shared/auth-middleware.js';

const app = express();

// Middleware
app.use(express.json());
app.use('/jobs', jobsRouter);
// app.use('/users', userRouter);
app.use('/auth', authRouter);

// Routes
// app.get('/health', async (req, res) => {
//   return res.send({
//     status: 'ok',
//     uptime: Math.floor(process.uptime()),
//     timestamp: new Date().toISOString(),
//   });
// });
app.get('/test/protected', authMiddleware, (req, res) => {
  res.json({ ok: true, user: req.user });
});


app.use(errorHandler);

export default app;