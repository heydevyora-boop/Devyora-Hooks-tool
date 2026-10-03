import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as trendsController from '../controllers/trends.controller.js'

export async function trendsRoutes(app: FastifyInstance) {
  app.get('/trends', { preHandler: requireAuth }, trendsController.listTrends)
}
