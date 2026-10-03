import pino from 'pino'
import { env } from '../config/env.js'

/**
 * Structured logging per the Chunk 2 blueprint §7: every request logs
 * requestId/workspaceId/userId/route/status/latency, and response bodies
 * are never logged for routes touching secrets (password hashes, session
 * tokens, OAuth tokens) — enforced by never passing those bodies to the
 * logger in the first place, not by a redaction list alone.
 */
export const logger = pino({
  level: env.isTest ? 'silent' : env.isDevelopment ? 'debug' : 'info',
  transport: env.isDevelopment
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
    : undefined,
  redact: {
    paths: ['req.headers.cookie', 'req.headers.authorization', 'password', '*.password', '*.passwordHash'],
    censor: '[redacted]',
  },
})
