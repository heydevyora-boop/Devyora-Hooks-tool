import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { updateViralityConfigSchema } from '../validation/virality.schema.js'
import * as viralityService from '../services/virality.service.js'

export async function getViralityConfig(request: FastifyRequest, reply: FastifyReply) {
  const config = await viralityService.getViralityConfigView(request.principal!.workspaceId)
  return reply.send({ config })
}

export async function updateViralityConfig(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(updateViralityConfigSchema, request.body)
  const config = await viralityService.updateViralityConfig(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.send({ config })
}
