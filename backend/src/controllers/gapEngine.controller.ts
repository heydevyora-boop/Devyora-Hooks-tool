import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { gapAnalysisQuerySchema } from '../validation/gapEngine.schema.js'
import * as gapEngineService from '../services/gapEngine.service.js'

export async function getGapAnalysis(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(gapAnalysisQuerySchema, request.query)
  const gaps = await gapEngineService.analyzeContentGaps(request.principal!.workspaceId, query.productIds)
  return reply.send({ gaps })
}
