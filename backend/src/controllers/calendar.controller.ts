import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import {
  calendarListQuerySchema,
  createCalendarEntrySchema,
  rescheduleCalendarEntrySchema,
  updateCalendarEntrySchema,
} from '../validation/calendar.schema.js'
import * as calendarService from '../services/calendar.service.js'

export async function listCalendarEntries(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(calendarListQuerySchema, request.query)
  const page = await calendarService.listCalendarEntries(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function getCalendarEntry(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const entry = await calendarService.getCalendarEntry(request.principal!.workspaceId, id)
  return reply.send({ entry })
}

export async function createCalendarEntry(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(createCalendarEntrySchema, request.body)
  const entry = await calendarService.createCalendarEntry(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.status(201).send({ entry })
}

export async function updateCalendarEntry(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(updateCalendarEntrySchema, request.body)
  const entry = await calendarService.updateCalendarEntry(request.principal!.workspaceId, id, input)
  return reply.send({ entry })
}

export async function rescheduleCalendarEntry(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(rescheduleCalendarEntrySchema, request.body)
  const entry = await calendarService.rescheduleCalendarEntry(request.principal!.workspaceId, id, input)
  return reply.send({ entry })
}
