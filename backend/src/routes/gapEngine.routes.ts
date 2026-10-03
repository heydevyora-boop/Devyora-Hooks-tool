import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as gapEngineController from '../controllers/gapEngine.controller.js'

export async function gapEngineRoutes(app: FastifyInstance) {
  app.get('/gap-analysis', { preHandler: requireAuth }, gapEngineController.getGapAnalysis)
}
