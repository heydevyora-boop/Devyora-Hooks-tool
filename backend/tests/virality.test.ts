import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('virality config', () => {
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

  it('is readable by any authenticated user, and reflects whatever was last configured', async () => {
    // Reset to the documented default first — this workspace's config is a
    // singleton row that earlier test runs may have left changed, so this
    // test asserts real read/write behavior rather than a pristine-DB
    // assumption.
    await app.inject({
      method: 'PATCH',
      url: '/api/v1/virality-config',
      headers: { cookie: adminCookie },
      payload: { metricLabel: 'Organic Views', threshold: 50000 },
    })

    const response = await app.inject({ method: 'GET', url: '/api/v1/virality-config', headers: { cookie: userCookie } })
    expect(response.statusCode).toBe(200)
    expect(response.json().config).toEqual({ metricLabel: 'Organic Views', threshold: 50000 })
  })

  it('rejects a non-admin update', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/virality-config',
      headers: { cookie: userCookie },
      payload: { metricLabel: 'Organic Views', threshold: 75000 },
    })
    expect(response.statusCode).toBe(403)
  })

  it('lets an admin update the threshold, and the new value is visible to everyone', async () => {
    const updateResponse = await app.inject({
      method: 'PATCH',
      url: '/api/v1/virality-config',
      headers: { cookie: adminCookie },
      payload: { metricLabel: 'Organic Views', threshold: 75000 },
    })
    expect(updateResponse.statusCode).toBe(200)
    expect(updateResponse.json().config.threshold).toBe(75000)

    const getResponse = await app.inject({ method: 'GET', url: '/api/v1/virality-config', headers: { cookie: userCookie } })
    expect(getResponse.json().config.threshold).toBe(75000)
  })
})
