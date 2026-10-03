import Fastify, { type FastifyError } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { randomUUID } from 'node:crypto'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'
import { AppError, errorBody } from './lib/errors.js'
import { authRoutes } from './routes/auth.routes.js'
import { productRoutes } from './routes/product.routes.js'
import { brandRoutes } from './routes/brand.routes.js'
import { sourceRoutes } from './routes/source.routes.js'
import { mediaRoutes } from './routes/media.routes.js'
import { contentHistoryRoutes } from './routes/contentHistory.routes.js'
import { healthRoutes } from './routes/health.routes.js'

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
    genReqId: () => randomUUID(),
    trustProxy: true,
    bodyLimit: env.MAX_UPLOAD_BYTES,
  })

  // --- Security middleware -------------------------------------------------
  await app.register(helmet, {
    // The API serves JSON + the local-disk media files, not HTML — a
    // restrictive default CSP is safe and doesn't need app-specific tuning.
    contentSecurityPolicy: env.isProduction,
  })

  await app.register(cors, {
    origin: env.corsOrigins,
    credentials: true, // required so the frontend's cookie-based session actually gets sent
  })

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    allowList: env.isTest ? ['127.0.0.1'] : [],
  })

  await app.register(cookie, {
    secret: env.SESSION_COOKIE_SECRET,
    parseOptions: {},
  })

  await app.register(multipart, {
    limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1 },
  })

  // --- Structured request logging ------------------------------------------
  // Per Chunk 2 blueprint §7: requestId/workspaceId/userId/route/status/latency,
  // never response bodies (so secrets never land in logs by accident).
  app.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        requestId: request.id,
        workspaceId: request.principal?.workspaceId,
        userId: request.principal?.userId,
        method: request.method,
        route: request.routeOptions?.url,
        statusCode: reply.statusCode,
        durationMs: reply.elapsedTime,
      },
      'request completed',
    )
  })

  // --- Global error handler -------------------------------------------------
  app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(errorBody(error.code, error.message, error.fields))
    }

    // Fastify's own schema-validation / rate-limit errors carry a statusCode.
    if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode < 500) {
      if (error.statusCode === 429) {
        return reply.status(429).send(errorBody('RATE_LIMITED', 'Too many requests — try again shortly.'))
      }
      return reply.status(error.statusCode).send(errorBody('VALIDATION_ERROR', error.message))
    }

    // Anything else is unexpected — log the real detail, never send it to the client.
    request.log.error({ err: error, requestId: request.id }, 'unhandled error')
    return reply.status(500).send(errorBody('INTERNAL_ERROR', 'Something went wrong. Please try again.'))
  })

  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send(errorBody('NOT_FOUND', 'Route not found'))
  })

  // --- Routes ----------------------------------------------------------------
  await app.register(healthRoutes)
  await app.register(authRoutes, { prefix: '/api/v1' })
  await app.register(productRoutes, { prefix: '/api/v1' })
  await app.register(brandRoutes, { prefix: '/api/v1' })
  await app.register(sourceRoutes, { prefix: '/api/v1' })
  await app.register(mediaRoutes, { prefix: '/api/v1' })
  await app.register(contentHistoryRoutes, { prefix: '/api/v1' })

  return app
}
