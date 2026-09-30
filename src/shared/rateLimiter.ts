import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

import { redis } from './redis.js';
import { config } from './config.js';

const redisStore = (prefix?: string) =>
  new RedisStore({
    sendCommand: async (...args: string[]) => {
      const [command, ...commandArgs] = args;
     return redis.call(command, ...commandArgs) as Promise<string>;
    },
    ...(prefix ? { prefix } : {}),
  });

// Global limiter: applies to all routes
export const globalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,

  standardHeaders: true,
  legacyHeaders: false,

  store: redisStore(),

  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests',
      },
    });
  },
});

// Stricter limiter for auth routes: 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  store: redisStore('rl:auth:'),

  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests',
      },
    });
  },
});