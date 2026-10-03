import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { createUserSchema, updateUserRoleSchema, userListQuerySchema } from '../validation/admin.schema.js'
import * as adminService from '../services/admin.service.js'

export async function listUsers(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(userListQuerySchema, request.query)
  const page = await adminService.listUsers(request.principal!.workspaceId, query)
  return reply.send(page)
}

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  const input = parseOrThrow(createUserSchema, request.body)
  const user = await adminService.createUser(request.principal!.workspaceId, input)
  return reply.status(201).send({ user })
}

export async function updateUserRole(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const input = parseOrThrow(updateUserRoleSchema, request.body)
  const user = await adminService.updateUserRole(request.principal!.workspaceId, id, input)
  return reply.send({ user })
}

export async function getAdminSettings(request: FastifyRequest, reply: FastifyReply) {
  const settings = await adminService.getAdminSettings(request.principal!.workspaceId)
  return reply.send({ settings })
}
