import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as gridController from '../controllers/grid.controller.js'

export async function gridRoutes(app: FastifyInstance) {
  app.get('/grids', { preHandler: requireAuth }, gridController.listGridTemplates)
  app.post('/grids', { preHandler: requireAuth }, gridController.createGridTemplate)
  app.get('/grids/active', { preHandler: requireAuth }, gridController.getActiveGrid)
  app.delete('/grids/active', { preHandler: requireAuth }, gridController.deactivateGrid)
  app.get('/grids/:id', { preHandler: requireAuth }, gridController.getGridTemplate)
  app.patch('/grids/:id', { preHandler: requireAuth }, gridController.updateGridTemplate)
  app.delete('/grids/:id', { preHandler: requireAuth }, gridController.requestDeleteGridTemplate)
  app.post('/grids/:id/duplicate', { preHandler: requireAuth }, gridController.duplicateGridTemplate)
  app.post('/grids/:id/activate', { preHandler: requireAuth }, gridController.activateGrid)
}
