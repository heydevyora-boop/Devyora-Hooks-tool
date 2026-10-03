import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { approvalListQuerySchema } from '../validation/approval.schema.js'
import * as approvalService from '../services/approval.service.js'

export async function listApprovals(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(approvalListQuerySchema, request.query)
  const page = await approvalService.listApprovals(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function approve(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const approval = await approvalService.approveDeletion(request.principal!.workspaceId, id, request.principal!.userId)
  return reply.send({ approval })
}

export async function reject(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const approval = await approvalService.rejectDeletion(request.principal!.workspaceId, id, request.principal!.userId)
  return reply.send({ approval })
}
