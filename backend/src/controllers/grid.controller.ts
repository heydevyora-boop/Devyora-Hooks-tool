import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { createGridTemplateSchema, gridListQuerySchema, updateGridTemplateSchema } from '../validation/grid.schema.js'
import * as gridService from '../services/grid.service.js'
import * as approvalService from '../services/approval.service.js'

export async function listGridTemplates(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(gridListQuerySchema, request.query)
  const page = await gridService.listGridTemplates(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function getActiveGrid(request: FastifyRequest, reply: FastifyReply) {
  const grid = await gridService.getActiveGrid(request.principal!.workspaceId)
  return reply.send({ grid })
}

export async function deactivateGrid(request: FastifyRequest, reply: FastifyReply) {
  await gridService.deactivateGrid(request.principal!.workspaceId)
  return reply.status(204).send()
}

export async function getGridTemplate(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const grid = await gridService.getGridTemplate(request.principal!.workspaceId, id)
  return reply.send({ grid })
}

export async function createGridTemplate(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(createGridTemplateSchema, request.body)
  const grid = await gridService.createGridTemplate(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.status(201).send({ grid })
}

export async function updateGridTemplate(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(updateGridTemplateSchema, request.body)
  const grid = await gridService.updateGridTemplate(request.principal!.workspaceId, id, input)
  return reply.send({ grid })
}

export async function duplicateGridTemplate(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const grid = await gridService.duplicateGridTemplate(request.principal!.workspaceId, request.principal!.userId, id)
  return reply.status(201).send({ grid })
}

export async function activateGrid(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const grid = await gridService.activateGrid(request.principal!.workspaceId, request.principal!.userId, id)
  return reply.send({ grid })
}

/** Grid templates are "important knowledge" (Chunk 4 §4) — deletion is
 * never immediate, same as Products and Inspiration. */
export async function requestDeleteGridTemplate(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const grid = await gridService.getGridTemplate(request.principal!.workspaceId, id)
  const approval = await approvalService.requestDeletion(
    request.principal!.workspaceId,
    request.principal!.userId,
    'GRID_TEMPLATE',
    id,
    grid.name,
  )
  return reply.status(202).send({ approval })
}
