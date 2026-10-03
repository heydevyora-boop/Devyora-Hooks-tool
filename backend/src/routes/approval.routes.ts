import type { FastifyInstance } from 'fastify'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import * as approvalController from '../controllers/approval.controller.js'

/** Resolving a deletion request is admin-only — exactly the kind of
 * action the approval queue exists to gate. Listing is open to any
 * authenticated user: whoever requested a deletion (or anyone else
 * viewing that product/grid/inspiration item) needs to see that it's
 * pending, not just admins. */
export async function approvalRoutes(app: FastifyInstance) {
  app.get('/approvals', { preHandler: requireAuth }, approvalController.listApprovals)
  app.post('/approvals/:id/approve', { preHandler: [requireAuth, requireRole('ADMIN')] }, approvalController.approve)
  app.post('/approvals/:id/reject', { preHandler: [requireAuth, requireRole('ADMIN')] }, approvalController.reject)
}
