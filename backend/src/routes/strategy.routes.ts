import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as strategyController from '../controllers/strategy.controller.js'

export async function strategyRoutes(app: FastifyInstance) {
  app.get('/strategies', { preHandler: requireAuth }, strategyController.listStrategies)
  app.get('/strategies/:id', { preHandler: requireAuth }, strategyController.getStrategy)
  app.post('/strategies', { preHandler: requireAuth }, strategyController.createStrategy)
  app.patch('/strategies/:id', { preHandler: requireAuth }, strategyController.updateStrategy)
}
