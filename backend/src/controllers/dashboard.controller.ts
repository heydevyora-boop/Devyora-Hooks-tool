import type { FastifyReply, FastifyRequest } from 'fastify'
import { getDashboard } from '../services/dashboard.service.js'

export async function getDashboardHandler(request: FastifyRequest, reply: FastifyReply) {
  const dashboard = await getDashboard(request.principal!.workspaceId)
  return reply.send({ dashboard })
}
