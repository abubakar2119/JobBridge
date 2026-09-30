import dotenv from "dotenv";

import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().url(),

  REDIS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),

  JWT_EXPIRES_IN: z.string().default("15m"),

  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),

  SMTP_HOST: z.string().default("localhost"),
  
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  
  SMTP_USER: z.string().default(""),
  
  SMTP_PASS: z.string().default(""),
  
  SMTP_FROM: z.string().default("noreply@jobportal.local"),
  
  OTP_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(15),

INVITATION_EXPIRES_IN_HOURS: z.coerce.number().int().positive().default(72),

APP_BASE_URL: z.string().url().default('http://localhost:3001'),

FRONTEND_URL: z.string().url().default('http://localhost:3000'),

CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),

RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),

RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

S3_ENDPOINT:        z.string().url(),

S3_REGION:          z.string().default('us-east-1'),

S3_BUCKET:          z.string(),

S3_ACCESS_KEY_ID:   z.string(),

S3_SECRET_ACCESS_KEY: z.string(),

LOG_LEVEL: z
  .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
  .default("debug"),
});



const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "✖ Invalid environment configuration",
    parsed.error.flatten().fieldErrors,
  );

  process.exit(1);
}

export const config = {
  ...parsed.data,
  cacheTtlSeconds: parsed.data.CACHE_TTL_SECONDS,
};

