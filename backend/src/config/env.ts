import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(8).optional(),
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  FRONTEND_URL: z.string().optional().default('http://localhost:3000'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.cwd() ? process.env : {});
  if (!result.success) {
    const errorIssues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    // Safe error log without dumping environment values or credentials
    console.error('Invalid environment variables detected:\n' + errorIssues.join('\n'));
    throw new Error('Environment configuration validation failed');
  }
  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;

