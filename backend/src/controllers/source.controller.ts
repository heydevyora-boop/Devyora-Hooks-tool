import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { createSourceSchema, sourceListQuerySchema } from '../validation/source.schema.js'
import * as sourceService from '../services/source.service.js'

export async function listSources(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(sourceListQuerySchema, request.query)
  const page = await sourceService.listSources(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function getSource(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const source = await sourceService.getSource(request.principal!.workspaceId, id)
  return reply.send({ source })
}

export async function createSource(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(createSourceSchema, request.body)
  const source = await sourceService.createSource(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.status(201).send({ source })
}

export async function deleteSource(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  await sourceService.deleteSource(request.principal!.workspaceId, id)
  return reply.status(204).send()
}
