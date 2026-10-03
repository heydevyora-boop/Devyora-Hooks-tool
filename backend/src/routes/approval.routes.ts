import type { FastifyInstance } from 'fastify'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import * as approvalController from '../controllers/approval.controller.js'

/** Admin-only end to end — resolving a deletion request is exactly the
 * kind of action the approval queue exists to gate. */
export async function approvalRoutes(app: FastifyInstance) {
  app.get('/approvals', { preHandler: [requireAuth, requireRole('ADMIN')] }, approvalController.listApprovals)
  app.post('/approvals/:id/approve', { preHandler: [requireAuth, requireRole('ADMIN')] }, approvalController.approve)
  app.post('/approvals/:id/reject', { preHandler: [requireAuth, requireRole('ADMIN')] }, approvalController.reject)
}
