import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as flowchartController from '../controllers/flowchart.controller.js'

/** The flowchart ("Content Plan") belongs to exactly one strategy — see
 * ContentFlowchart.strategyId (unique) in the schema — so generation and
 * lookup-by-strategy are nested under /strategies/:id, while everything
 * that operates on an already-generated flowchart addresses it directly
 * by its own id. */
export async function flowchartRoutes(app: FastifyInstance) {
  app.post('/strategies/:id/flowchart', { preHandler: requireAuth }, flowchartController.generateFlowchart)
  app.get('/strategies/:id/flowchart', { preHandler: requireAuth }, flowchartController.getFlowchartByStrategy)
  app.get('/flowcharts/:id', { preHandler: requireAuth }, flowchartController.getFlowchart)
  app.patch('/flowcharts/:id/nodes/:nodeId', { preHandler: requireAuth }, flowchartController.updateNode)
  app.post('/flowcharts/:id/approve', { preHandler: requireAuth }, flowchartController.approveFlowchart)
}
