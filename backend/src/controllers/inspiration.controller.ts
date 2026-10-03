import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import {
  createInspirationSchema,
  inspirationListQuerySchema,
  updateInspirationSchema,
} from '../validation/inspiration.schema.js'
import * as inspirationService from '../services/inspiration.service.js'
import * as approvalService from '../services/approval.service.js'

export async function listInspiration(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(inspirationListQuerySchema, request.query)
  const page = await inspirationService.listInspiration(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function getInspiration(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const item = await inspirationService.getInspiration(request.principal!.workspaceId, id)
  return reply.send({ item })
}

export async function createInspiration(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(createInspirationSchema, request.body)
  const item = await inspirationService.createInspiration(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.status(201).send({ item })
}

export async function updateInspiration(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(updateInspirationSchema, request.body)
  const item = await inspirationService.updateInspiration(request.principal!.workspaceId, id, input)
  return reply.send({ item })
}

/** Inspiration items are "important knowledge" (Chunk 4 §4) — deletion is
 * never immediate, same as Products and Grid Templates. */
export async function requestDeleteInspiration(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const item = await inspirationService.getInspiration(request.principal!.workspaceId, id)
  const approval = await approvalService.requestDeletion(
    request.principal!.workspaceId,
    request.principal!.userId,
    'INSPIRATION',
    id,
    item.source.title,
  )
  return reply.status(202).send({ approval })
}
