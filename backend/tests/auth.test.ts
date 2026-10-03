import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('auth', () => {
  let app: App

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('rejects a wrong password with a generic message', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { username: 'admin', password: 'definitely-wrong' },
    })

    expect(response.statusCode).toBe(401)
    const body = response.json()
    expect(body.error.code).toBe('UNAUTHENTICATED')
    expect(body.error.message).toBe('Invalid username or password.')
  })

  it('rejects a wrong username the same way as a wrong password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { username: 'does-not-exist', password: 'whatever' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().error.message).toBe('Invalid username or password.')
  })

  it('logs the seeded admin in and returns a session cookie', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { username: 'admin', password: 'admin123' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().user).toMatchObject({ username: 'admin', role: 'admin' })
    expect(response.headers['set-cookie']).toBeDefined()
  })

  it('rejects /auth/me without a session', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/auth/me' })
    expect(response.statusCode).toBe(401)
  })

  it('resolves /auth/me with a valid session cookie', async () => {
    const cookie = await loginAs(app, 'admin', 'admin123')
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { cookie },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().user.username).toBe('admin')
  })

  it('invalidates the session on logout', async () => {
    const cookie = await loginAs(app, 'user', 'user123')

    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: { cookie },
    })
    expect(logoutResponse.statusCode).toBe(204)

    const meResponse = await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie } })
    expect(meResponse.statusCode).toBe(401)
  })

  it('rejects any request to a protected route with a garbage cookie', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { cookie: 'devyora_session=not-a-real-session' },
    })
    expect(response.statusCode).toBe(401)
  })
})
