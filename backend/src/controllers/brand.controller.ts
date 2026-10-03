import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { brandUpdateSchema } from '../validation/brand.schema.js'
import * as brandService from '../services/brand.service.js'

export async function getBrand(request: FastifyRequest, reply: FastifyReply) {
  const brand = await brandService.getOrCreateBrandProfile(request.principal!.workspaceId)
  return reply.send({ brand })
}

export async function updateBrand(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(brandUpdateSchema, request.body)
  const brand = await brandService.updateBrandProfile(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.send({ brand })
}
