import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as inspirationController from '../controllers/inspiration.controller.js'

export async function inspirationRoutes(app: FastifyInstance) {
  app.get('/inspiration', { preHandler: requireAuth }, inspirationController.listInspiration)
  app.get('/inspiration/:id', { preHandler: requireAuth }, inspirationController.getInspiration)
  app.post('/inspiration', { preHandler: requireAuth }, inspirationController.createInspiration)
  app.patch('/inspiration/:id', { preHandler: requireAuth }, inspirationController.updateInspiration)
  app.delete('/inspiration/:id', { preHandler: requireAuth }, inspirationController.requestDeleteInspiration)
}
