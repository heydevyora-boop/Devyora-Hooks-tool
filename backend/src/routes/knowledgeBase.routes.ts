import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as knowledgeBaseController from '../controllers/knowledgeBase.controller.js'

export async function knowledgeBaseRoutes(app: FastifyInstance) {
  app.get('/knowledge-base/overview', { preHandler: requireAuth }, knowledgeBaseController.getOverview)
  app.get('/knowledge-base/search', { preHandler: requireAuth }, knowledgeBaseController.search)
}
