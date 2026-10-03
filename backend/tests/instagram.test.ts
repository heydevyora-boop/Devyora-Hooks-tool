import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('instagram integration', () => {
  let app: App
  let cookie: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')
  })

  afterAll(async () => {
    await app.close()
  })

  it('reports not_connected with no prior connection', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/integrations/instagram/status',
      headers: { cookie },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().connection).toEqual({ status: 'not_connected' })
  })

  it('honestly reports not configured rather than fabricating a connection, when connecting with no app credentials set', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/integrations/instagram/connect',
      headers: { cookie },
    })
    expect(response.statusCode).toBe(501)
    expect(response.json().error.code).toBe('NOT_CONFIGURED')
  })

  it('disconnect is a no-op when nothing is connected', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/integrations/instagram',
      headers: { cookie },
    })
    expect(response.statusCode).toBe(204)
  })

  it('rejects sync when Instagram is not connected', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/integrations/instagram/sync',
      headers: { cookie },
    })
    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe('CONFLICT')
  })

  it('requires auth on every route', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/integrations/instagram/status' })
    expect(response.statusCode).toBe(401)
  })
})
