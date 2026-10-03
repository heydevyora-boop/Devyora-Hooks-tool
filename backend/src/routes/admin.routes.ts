import type { FastifyInstance } from 'fastify'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import * as adminController from '../controllers/admin.controller.js'

/** Every route here is admin-only — user management and the settings
 * aggregator are exactly the kind of workspace-wide controls that must
 * never be reachable by a regular user. */
export async function adminRoutes(app: FastifyInstance) {
  const adminOnly = [requireAuth, requireRole('ADMIN')]
  app.get('/admin/users', { preHandler: adminOnly }, adminController.listUsers)
  app.post('/admin/users', { preHandler: adminOnly }, adminController.createUser)
  app.patch('/admin/users/:id/role', { preHandler: adminOnly }, adminController.updateUserRole)
  app.get('/admin/settings', { preHandler: adminOnly }, adminController.getAdminSettings)
}
