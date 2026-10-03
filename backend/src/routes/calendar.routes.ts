import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as calendarController from '../controllers/calendar.controller.js'

export async function calendarRoutes(app: FastifyInstance) {
  app.get('/calendar', { preHandler: requireAuth }, calendarController.listCalendarEntries)
  app.post('/calendar', { preHandler: requireAuth }, calendarController.createCalendarEntry)
  app.get('/calendar/:id', { preHandler: requireAuth }, calendarController.getCalendarEntry)
  app.patch('/calendar/:id', { preHandler: requireAuth }, calendarController.updateCalendarEntry)
  app.post('/calendar/:id/reschedule', { preHandler: requireAuth }, calendarController.rescheduleCalendarEntry)
}
