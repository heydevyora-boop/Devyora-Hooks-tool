import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as generationController from '../controllers/generation.controller.js'

export async function generationRoutes(app: FastifyInstance) {
  app.get('/generations', { preHandler: requireAuth }, generationController.listGenerations)
  app.post('/generations', { preHandler: requireAuth }, generationController.generate)
  app.get('/generations/by-node/:nodeId', { preHandler: requireAuth }, generationController.getGenerationByFlowchartNode)
  app.get('/generations/:id', { preHandler: requireAuth }, generationController.getGeneration)
  app.post('/generations/:id/regenerate', { preHandler: requireAuth }, generationController.regenerate)
  app.get('/generations/:id/versions', { preHandler: requireAuth }, generationController.listVersions)
  app.get('/generations/:id/video-blueprint', { preHandler: requireAuth }, generationController.getVideoBlueprint)
  app.post('/generations/:id/approve', { preHandler: requireAuth }, generationController.approve)
  app.post('/generations/:id/reject', { preHandler: requireAuth }, generationController.reject)
  app.post('/generations/:id/save', { preHandler: requireAuth }, generationController.save)
}
