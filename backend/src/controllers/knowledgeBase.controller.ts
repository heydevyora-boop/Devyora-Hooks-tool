import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { knowledgeSearchQuerySchema } from '../validation/knowledgeBase.schema.js'
import * as knowledgeBaseService from '../services/knowledgeBase.service.js'

export async function getOverview(request: FastifyRequest, reply: FastifyReply) {
  const overview = await knowledgeBaseService.getOverview(request.principal!.workspaceId)
  return reply.send({ overview })
}

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(knowledgeSearchQuerySchema, request.query)
  const results = await knowledgeBaseService.search(request.principal!.workspaceId, query.q, query.limit)
  return reply.send({ results })
}
