import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import {
  contentRuleListQuerySchema,
  createContentRuleSchema,
  updateContentRuleSchema,
} from '../validation/contentRule.schema.js'
import * as contentRuleService from '../services/contentRule.service.js'

export async function listContentRules(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(contentRuleListQuerySchema, request.query)
  const page = await contentRuleService.listContentRules(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function getContentRule(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const rule = await contentRuleService.getContentRule(request.principal!.workspaceId, id)
  return reply.send({ rule })
}

export async function createContentRule(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(createContentRuleSchema, request.body)
  const rule = await contentRuleService.createContentRule(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.status(201).send({ rule })
}

export async function updateContentRule(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(updateContentRuleSchema, request.body)
  const rule = await contentRuleService.updateContentRule(
    request.principal!.workspaceId,
    id,
    request.principal!.role === 'ADMIN',
    input,
  )
  return reply.send({ rule })
}

export async function deleteContentRule(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  await contentRuleService.deleteContentRule(request.principal!.workspaceId, id, request.principal!.role === 'ADMIN')
  return reply.status(204).send()
}
