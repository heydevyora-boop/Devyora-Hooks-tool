import type { FastifyReply, FastifyRequest } from 'fastify'
import { parseOrThrow } from '../lib/validate.js'
import { instagramCallbackQuerySchema } from '../validation/instagram.schema.js'
import * as instagramService from '../services/instagram.service.js'
import { env } from '../config/env.js'

export async function getStatus(request: FastifyRequest, reply: FastifyReply) {
  const connection = await instagramService.getStatus(request.principal!.workspaceId)
  return reply.send({ connection })
}

export async function connect(request: FastifyRequest, reply: FastifyReply) {
  const result = await instagramService.startConnect(request.principal!.workspaceId, request.principal!.userId)
  return reply.send(result)
}

/**
 * Hit by Instagram's own redirect after the user approves/denies consent
 * — a top-level browser navigation, not an API call from the frontend.
 * Redirects back into the app rather than returning raw JSON, since
 * nothing is listening for a JSON response at this URL.
 */
export async function callback(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(instagramCallbackQuerySchema, request.query)
  const redirectBase = env.corsOrigins[0] ?? '/'

  try {
    await instagramService.completeConnect(request.principal!.workspaceId, query)
    return reply.redirect(`${redirectBase}/hub?instagram=connected`)
  } catch {
    return reply.redirect(`${redirectBase}/hub?instagram=error`)
  }
}

export async function sync(request: FastifyRequest, reply: FastifyReply) {
  const connection = await instagramService.sync(request.principal!.workspaceId)
  return reply.send({ connection })
}

export async function disconnect(request: FastifyRequest, reply: FastifyReply) {
  await instagramService.disconnect(request.principal!.workspaceId)
  return reply.status(204).send()
}
