import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as instagramController from '../controllers/instagram.controller.js'

export async function instagramRoutes(app: FastifyInstance) {
  app.get('/integrations/instagram/status', { preHandler: requireAuth }, instagramController.getStatus)
  app.post('/integrations/instagram/connect', { preHandler: requireAuth }, instagramController.connect)
  app.get('/integrations/instagram/callback', { preHandler: requireAuth }, instagramController.callback)
  app.post('/integrations/instagram/sync', { preHandler: requireAuth }, instagramController.sync)
  app.delete('/integrations/instagram', { preHandler: requireAuth }, instagramController.disconnect)
}
