import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as sourceController from '../controllers/source.controller.js'

export async function sourceRoutes(app: FastifyInstance) {
  app.get('/sources', { preHandler: requireAuth }, sourceController.listSources)
  app.get('/sources/:id', { preHandler: requireAuth }, sourceController.getSource)
  app.post('/sources', { preHandler: requireAuth }, sourceController.createSource)
  app.delete('/sources/:id', { preHandler: requireAuth }, sourceController.deleteSource)
}
