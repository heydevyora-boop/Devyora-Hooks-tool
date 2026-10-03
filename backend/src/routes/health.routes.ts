import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    return reply.send({ status: 'ok' })
  })

  app.get('/health/db', async (_request, reply) => {
    await prisma.$queryRaw`SELECT 1`
    return reply.send({ status: 'ok', database: 'connected' })
  })
}
