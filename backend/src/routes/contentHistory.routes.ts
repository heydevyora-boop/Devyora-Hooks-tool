import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as historyController from '../controllers/contentHistory.controller.js'

export async function contentHistoryRoutes(app: FastifyInstance) {
  app.get('/content-history', { preHandler: requireAuth }, historyController.listContentHistory)
  app.get('/content-history/:id', { preHandler: requireAuth }, historyController.getContentHistory)
  app.post('/content-history', { preHandler: requireAuth }, historyController.createContentHistory)
  app.patch('/content-history/:id', { preHandler: requireAuth }, historyController.updateContentHistory)
  app.post('/content-history/:id/performance', { preHandler: requireAuth }, historyController.addPerformanceSnapshot)
  app.get('/content-history/:id/performance', { preHandler: requireAuth }, historyController.listPerformanceSnapshots)
}
