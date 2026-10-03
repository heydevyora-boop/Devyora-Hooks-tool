import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as brandController from '../controllers/brand.controller.js'

export async function brandRoutes(app: FastifyInstance) {
  app.get('/brand', { preHandler: requireAuth }, brandController.getBrand)
  app.patch('/brand', { preHandler: requireAuth }, brandController.updateBrand)
}
