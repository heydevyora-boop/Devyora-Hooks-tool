import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as contentHealthController from '../controllers/contentHealth.controller.js'

export async function contentHealthRoutes(app: FastifyInstance) {
  app.get('/content-health', { preHandler: requireAuth }, contentHealthController.getContentHealth)
}
