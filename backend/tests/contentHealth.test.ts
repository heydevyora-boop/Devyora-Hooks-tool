import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('content health', () => {
  let app: App
  let cookie: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')
  })

  afterAll(async () => {
    await app.close()
  })

  it('is explicitly labeled calculated, and reflects real counts', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/content-history',
      headers: { cookie },
      payload: { title: 'Vitest health post', format: 'Reel', date: new Date().toISOString().slice(0, 10), status: 'Published' },
    })

    const response = await app.inject({ method: 'GET', url: '/api/v1/content-health', headers: { cookie } })
    expect(response.statusCode).toBe(200)
    const { health } = response.json()
    expect(health.type).toBe('calculated')
    expect(health.plannedVsPublished.published).toBeGreaterThanOrEqual(1)
    expect(health.contentTypeDistribution).toHaveProperty('reel')
    expect(typeof health.productCoverage.totalProducts).toBe('number')
  })
})
