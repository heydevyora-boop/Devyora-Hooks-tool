import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as dashboardController from '../controllers/dashboard.controller.js'

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/dashboard', { preHandler: requireAuth }, dashboardController.getDashboardHandler)
}
