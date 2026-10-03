import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as contentRuleController from '../controllers/contentRule.controller.js'

export async function contentRuleRoutes(app: FastifyInstance) {
  app.get('/content-rules', { preHandler: requireAuth }, contentRuleController.listContentRules)
  app.get('/content-rules/:id', { preHandler: requireAuth }, contentRuleController.getContentRule)
  app.post('/content-rules', { preHandler: requireAuth }, contentRuleController.createContentRule)
  app.patch('/content-rules/:id', { preHandler: requireAuth }, contentRuleController.updateContentRule)
  app.delete('/content-rules/:id', { preHandler: requireAuth }, contentRuleController.deleteContentRule)
}
