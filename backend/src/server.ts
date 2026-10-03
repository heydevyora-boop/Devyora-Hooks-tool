import { buildApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'

async function main() {
  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    logger.info(`API listening on :${env.PORT} (cors: ${env.corsOrigins.join(', ')})`)
  } catch (error) {
    logger.error(error, 'Failed to start server')
    process.exit(1)
  }

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down...`)
    await app.close()
    process.exit(0)
  }
  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

void main()
