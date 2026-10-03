import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { createStrategySchema, strategyListQuerySchema, updateStrategySchema } from '../validation/strategy.schema.js'
import * as strategyService from '../services/strategy.service.js'

export async function listStrategies(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(strategyListQuerySchema, request.query)
  const page = await strategyService.listStrategies(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function getStrategy(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const strategy = await strategyService.getStrategy(request.principal!.workspaceId, id)
  return reply.send({ strategy })
}

export async function createStrategy(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(createStrategySchema, request.body)
  const strategy = await strategyService.createStrategy(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.status(201).send({ strategy })
}

export async function updateStrategy(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(updateStrategySchema, request.body)
  const strategy = await strategyService.updateStrategy(request.principal!.workspaceId, id, input)
  return reply.send({ strategy })
}
