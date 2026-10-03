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

  // AES-256-GCM key for encrypting Instagram OAuth tokens at rest — 32
  // bytes, hex-encoded (64 hex chars). Required even if Instagram isn't
  // configured yet, so the column format never silently changes later.
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
    .regex(/^[0-9a-f]{64}$/i, 'ENCRYPTION_KEY must be hex-encoded'),

  // Official Instagram Business Login / Graph API credentials — optional.
  // When absent, the Instagram integration honestly reports itself as
  // "not configured" rather than fabricating connected-account data. See
  // src/services/instagram.service.ts.
  INSTAGRAM_APP_ID: z.string().optional(),
  INSTAGRAM_APP_SECRET: z.string().optional(),
  INSTAGRAM_REDIRECT_URI: z.string().optional(),
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
  isInstagramConfigured: Boolean(
    parsed.data.INSTAGRAM_APP_ID && parsed.data.INSTAGRAM_APP_SECRET && parsed.data.INSTAGRAM_REDIRECT_URI,
  ),
}
