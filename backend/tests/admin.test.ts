import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('admin', () => {
  let app: App
  let adminCookie: string
  let userCookie: string

  beforeAll(async () => {
    app = await buildApp()
    adminCookie = await loginAs(app, 'admin', 'admin123')
    userCookie = await loginAs(app, 'user', 'user123')
  })

  afterAll(async () => {
    await app.close()
  })

  it('rejects non-admin access to every admin route', async () => {
    const list = await app.inject({ method: 'GET', url: '/api/v1/admin/users', headers: { cookie: userCookie } })
    expect(list.statusCode).toBe(403)
    const settings = await app.inject({ method: 'GET', url: '/api/v1/admin/settings', headers: { cookie: userCookie } })
    expect(settings.statusCode).toBe(403)
  })

  it('lets an admin list users, never exposing a password hash', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/admin/users', headers: { cookie: adminCookie } })
    expect(response.statusCode).toBe(200)
    const body = JSON.stringify(response.json())
    expect(body).not.toContain('passwordHash')
    expect(response.json().items.some((u: { username: string }) => u.username === 'admin')).toBe(true)
  })

  it('creates a user and updates their role', async () => {
    // username/email are real unique constraints — randomize so repeated
    // full-suite runs against the same dev DB never collide.
    const unique = Date.now()
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/users',
      headers: { cookie: adminCookie },
      payload: { username: `vitestuser${unique}`, email: `vitestuser${unique}@example.com`, password: 'longenoughpassword', role: 'user' },
    })
    expect(createResponse.statusCode).toBe(201)
    const created = createResponse.json().user
    expect(created.role).toBe('user')
    expect(created).not.toHaveProperty('passwordHash')

    const roleResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/users/${created.id}/role`,
      headers: { cookie: adminCookie },
      payload: { role: 'admin' },
    })
    expect(roleResponse.statusCode).toBe(200)
    expect(roleResponse.json().user.role).toBe('admin')

    // cleanup
    await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/users/${created.id}/role`,
      headers: { cookie: adminCookie },
      payload: { role: 'user' },
    })
  })

  it('rejects creating a duplicate username', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/users',
      headers: { cookie: adminCookie },
      payload: { username: 'admin', email: 'someoneelse@example.com', password: 'longenoughpassword' },
    })
    expect(response.statusCode).toBe(409)
  })

  it('returns a consolidated settings view', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/admin/settings', headers: { cookie: adminCookie } })
    expect(response.statusCode).toBe(200)
    const { settings } = response.json()
    expect(settings).toHaveProperty('workspace')
    expect(settings).toHaveProperty('brand')
    expect(settings).toHaveProperty('virality')
    expect(settings.integrations).toHaveProperty('instagram')
  })
})
