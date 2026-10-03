import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { productInputSchema, productListQuerySchema, productUpdateSchema } from '../validation/product.schema.js'
import * as productService from '../services/product.service.js'

export async function listProducts(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(productListQuerySchema, request.query)
  const page = await productService.listProducts(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function getProduct(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const product = await productService.getProduct(request.principal!.workspaceId, id)
  return reply.send({ product })
}

export async function createProduct(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(productInputSchema, request.body)
  const product = await productService.createProduct(request.principal!.workspaceId, request.principal!.userId, input)
  return reply.status(201).send({ product })
}

export async function updateProduct(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(productUpdateSchema, request.body)
  const product = await productService.updateProduct(request.principal!.workspaceId, id, input)
  return reply.send({ product })
}
