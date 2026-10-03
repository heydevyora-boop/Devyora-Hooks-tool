import type { SessionPrincipal } from '../services/auth.service.js'

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by the auth middleware once a valid session cookie resolves. Undefined on public routes or unauthenticated requests. */
    principal?: SessionPrincipal
  }
}
