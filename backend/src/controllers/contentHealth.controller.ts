import type { FastifyReply, FastifyRequest } from 'fastify'
import { computeContentHealth } from '../services/contentHealth.service.js'

export async function getContentHealth(request: FastifyRequest, reply: FastifyReply) {
  const health = await computeContentHealth(request.principal!.workspaceId)
  return reply.send({ health })
}
