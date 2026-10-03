import { PrismaClient } from '@prisma/client'
import { env } from '../config/env.js'

/**
 * Single shared Prisma client for the process. Query logging only in
 * development — never logs in production/test (query params can contain
 * user content).
 */
export const prisma = new PrismaClient({
  log: env.isDevelopment ? ['warn', 'error'] : ['error'],
})
