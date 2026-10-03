import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  SESSION_COOKIE_SECRET: z.string().min(16, 'SESSION_COOKIE_SECRET must be at least 16 characters'),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  LOCAL_STORAGE_ROOT: z.string().min(1).default('./storage/uploads'),
  MEDIA_PUBLIC_BASE_PATH: z.string().min(1).default('/media/files'),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(209715200),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  // Fail fast and loud — a misconfigured env is worse than a crash at boot.
  console.error('Invalid environment configuration:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  isProduction: parsed.data.NODE_ENV === 'production',
  isDevelopment: parsed.data.NODE_ENV === 'development',
  isTest: parsed.data.NODE_ENV === 'test',
}
