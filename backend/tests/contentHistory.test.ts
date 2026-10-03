import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('content history', () => {
  let app: App
  let cookie: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')
  })

  afterAll(async () => {
    await app.close()
  })

  it('creates an item, records a performance snapshot, and lists both back', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/content-history',
      headers: { cookie },
      payload: {
        title: 'Vitest Test Reel',
        topic: 'automated testing',
        format: 'Reel',
        date: '2026-01-15',
        status: 'Published',
      },
    })
    expect(createResponse.statusCode).toBe(201)
    const item = createResponse.json().item
    expect(item.format).toBe('Reel')
    expect(item.date).toBe('2026-01-15')

    const perfResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/content-history/${item.id}/performance`,
      headers: { cookie },
      payload: { views: 5000, likes: 400, source: 'manual' },
    })
    expect(perfResponse.statusCode).toBe(201)
    expect(perfResponse.json().snapshot.views).toBe(5000)

    const listResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/content-history/${item.id}/performance`,
      headers: { cookie },
    })
    expect(listResponse.statusCode).toBe(200)
    expect(listResponse.json().snapshots).toHaveLength(1)
  })

  it('filters by format and status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/content-history?format=Reel&status=Published',
      headers: { cookie },
    })
    expect(response.statusCode).toBe(200)
    for (const item of response.json().items) {
      expect(item.format).toBe('Reel')
      expect(item.status).toBe('Published')
    }
  })

  it('rejects an invalid format value', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/content-history',
      headers: { cookie },
      payload: { title: 'Bad format', format: 'NotARealFormat', date: '2026-01-01' },
    })
    expect(response.statusCode).toBe(400)
  })
})
