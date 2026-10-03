import type { FastifyReply, FastifyRequest } from 'fastify'
import { getTrendsAndOpportunities } from '../services/trends.service.js'

export async function listTrends(request: FastifyRequest, reply: FastifyReply) {
  const trends = await getTrendsAndOpportunities(request.principal!.workspaceId)
  return reply.send({ trends })
}
