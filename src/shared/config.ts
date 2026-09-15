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
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "✖ Invalid environment configuration",
    parsed.error.flatten().fieldErrors,
  );

  process.exit(1);
}

export const config = parsed.data;
