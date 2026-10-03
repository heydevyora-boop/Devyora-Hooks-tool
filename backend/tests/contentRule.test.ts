import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('content rules', () => {
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

  it('creates, lists, and updates an unlocked rule as a regular user', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/content-rules',
      headers: { cookie: userCookie },
      payload: { category: 'Linguistic Guardrail', title: 'Never say "guaranteed"', tags: ['compliance'] },
    })
    expect(createResponse.statusCode).toBe(201)
    const rule = createResponse.json().rule
    expect(rule.isLocked).toBe(false)

    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/content-rules/${rule.id}`,
      headers: { cookie: userCookie },
      payload: { title: 'Never say "guaranteed results"' },
    })
    expect(updateResponse.statusCode).toBe(200)
    expect(updateResponse.json().rule.title).toBe('Never say "guaranteed results"')
  })

  it('only an admin can lock a rule, and a locked rule blocks non-admin edits and deletes', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/content-rules',
      headers: { cookie: adminCookie },
      payload: { category: 'Banned Jargon Filter', title: 'No buzzwords' },
    })
    const rule = createResponse.json().rule

    const userLockAttempt = await app.inject({
      method: 'PATCH',
      url: `/api/v1/content-rules/${rule.id}`,
      headers: { cookie: userCookie },
      payload: { isLocked: true },
    })
    expect(userLockAttempt.statusCode).toBe(403)

    const adminLock = await app.inject({
      method: 'PATCH',
      url: `/api/v1/content-rules/${rule.id}`,
      headers: { cookie: adminCookie },
      payload: { isLocked: true },
    })
    expect(adminLock.statusCode).toBe(200)
    expect(adminLock.json().rule.isLocked).toBe(true)

    const userEditAttempt = await app.inject({
      method: 'PATCH',
      url: `/api/v1/content-rules/${rule.id}`,
      headers: { cookie: userCookie },
      payload: { title: 'Trying to sneak an edit in' },
    })
    expect(userEditAttempt.statusCode).toBe(403)

    const userDeleteAttempt = await app.inject({
      method: 'DELETE',
      url: `/api/v1/content-rules/${rule.id}`,
      headers: { cookie: userCookie },
    })
    expect(userDeleteAttempt.statusCode).toBe(403)

    const adminDelete = await app.inject({
      method: 'DELETE',
      url: `/api/v1/content-rules/${rule.id}`,
      headers: { cookie: adminCookie },
    })
    expect(adminDelete.statusCode).toBe(204)
  })
})
