import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import {
  generateContentSchema,
  generationListQuerySchema,
  regenerateSchema,
  rejectSchema,
} from '../validation/generation.schema.js'
import * as generationService from '../services/generation.service.js'

export async function listGenerations(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(generationListQuerySchema, request.query)
  const page = await generationService.listGenerations(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function getGeneration(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const generation = await generationService.getGeneration(request.principal!.workspaceId, id)
  return reply.send({ generation })
}

export async function getGenerationByFlowchartNode(request: FastifyRequest, reply: FastifyReply) {
  const { nodeId } = request.params as { nodeId: string }
  const generation = await generationService.getGenerationByFlowchartNode(request.principal!.workspaceId, nodeId)
  return reply.send({ generation })
}

export async function generate(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(generateContentSchema, request.body)
  const generation = await generationService.generate(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.status(201).send({ generation })
}

export async function regenerate(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(regenerateSchema, request.body)
  const generation = await generationService.regenerate(request.principal!.workspaceId, request.principal!.userId, id, input)
  return reply.send({ generation })
}

export async function listVersions(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const versions = await generationService.listVersions(request.principal!.workspaceId, id)
  return reply.send({ versions })
}

export async function getVideoBlueprint(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const blueprint = await generationService.getVideoBlueprint(request.principal!.workspaceId, id)
  return reply.send({ blueprint })
}

export async function approve(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const generation = await generationService.approve(request.principal!.workspaceId, request.principal!.userId, id)
  return reply.send({ generation })
}

export async function reject(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(rejectSchema, request.body)
  const generation = await generationService.reject(request.principal!.workspaceId, request.principal!.userId, id, input)
  return reply.send({ generation })
}

export async function save(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const generation = await generationService.save(request.principal!.workspaceId, request.principal!.userId, id)
  return reply.send({ generation })
}
