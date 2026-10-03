import type { FastifyInstance } from 'fastify'
import { login, logout, me } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export async function authRoutes(app: FastifyInstance) {
  // Rate-limited independently and more tightly than the global default —
  // per Chunk 2 blueprint §2.2, blunts credential stuffing.
  app.post(
    '/auth/login',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    login,
  )
  app.post('/auth/logout', { preHandler: requireAuth }, logout)
  app.get('/auth/me', { preHandler: requireAuth }, me)
}
