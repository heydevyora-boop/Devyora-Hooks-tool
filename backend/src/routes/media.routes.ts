import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as mediaController from '../controllers/media.controller.js'

export async function mediaRoutes(app: FastifyInstance) {
  app.post('/media/upload', { preHandler: requireAuth }, mediaController.uploadMedia)
  app.get('/media/:id/file', { preHandler: requireAuth }, mediaController.downloadMedia)
}
