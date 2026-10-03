import type { FastifyInstance } from 'fastify'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import * as viralityController from '../controllers/virality.controller.js'

export async function viralityRoutes(app: FastifyInstance) {
  app.get('/virality-config', { preHandler: requireAuth }, viralityController.getViralityConfig)
  app.patch(
    '/virality-config',
    { preHandler: [requireAuth, requireRole('ADMIN')] },
    viralityController.updateViralityConfig,
  )
}
