import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import {
  contentHistoryInputSchema,
  contentHistoryListQuerySchema,
  contentHistoryUpdateSchema,
  performanceSnapshotSchema,
} from '../validation/contentHistory.schema.js'
import * as historyService from '../services/contentHistory.service.js'

export async function listContentHistory(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(contentHistoryListQuerySchema, request.query)
  const page = await historyService.listContentHistory(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function getContentHistory(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const item = await historyService.getContentHistory(request.principal!.workspaceId, id)
  return reply.send({ item })
}

export async function createContentHistory(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(contentHistoryInputSchema, request.body)
  const item = await historyService.createContentHistory(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.status(201).send({ item })
}

export async function updateContentHistory(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(contentHistoryUpdateSchema, request.body)
  const item = await historyService.updateContentHistory(request.principal!.workspaceId, id, input)
  return reply.send({ item })
}

export async function addPerformanceSnapshot(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(performanceSnapshotSchema, request.body)
  const snapshot = await historyService.addPerformanceSnapshot(request.principal!.workspaceId, id, input)
  return reply.status(201).send({ snapshot })
}

export async function listPerformanceSnapshots(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const snapshots = await historyService.listPerformanceSnapshots(request.principal!.workspaceId, id)
  return reply.send({ snapshots })
}
