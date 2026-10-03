import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { updateFlowchartNodeSchema } from '../validation/flowchart.schema.js'
import * as flowchartService from '../services/flowchart.service.js'

export async function generateFlowchart(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const flowchart = await flowchartService.generateFlowchart(request.principal!.workspaceId, id)
  return reply.status(201).send({ flowchart })
}

export async function getFlowchartByStrategy(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const flowchart = await flowchartService.getFlowchartByStrategy(request.principal!.workspaceId, id)
  return reply.send({ flowchart })
}

export async function getFlowchart(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const flowchart = await flowchartService.getFlowchart(request.principal!.workspaceId, id)
  return reply.send({ flowchart })
}

export async function updateNode(request: FastifyRequest, reply: FastifyReply) {
  const { id, nodeId } = request.params as { id: string; nodeId: string }
  const input = parseOrThrow(updateFlowchartNodeSchema, request.body)
  const flowchart = await flowchartService.updateNode(request.principal!.workspaceId, id, nodeId, input)
  return reply.send({ flowchart })
}

export async function approveFlowchart(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const flowchart = await flowchartService.approveFlowchart(request.principal!.workspaceId, id, request.principal!.userId)
  return reply.send({ flowchart })
}
