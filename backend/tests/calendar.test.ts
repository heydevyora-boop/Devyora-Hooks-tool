import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('content calendar', () => {
  let app: App
  let cookie: string
  let productId: string
  let productName: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')

    const productResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name: 'Vitest Calendar Product' },
    })
    productId = productResponse.json().product.id
    productName = productResponse.json().product.name
  })

  afterAll(async () => {
    await app.close()
  })

  it('creates, reads, updates, reschedules, filters, and searches calendar entries', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/calendar',
      headers: { cookie },
      payload: { title: 'Vitest launch reel', date: '2026-02-10', productId, contentType: 'reel', platform: 'reels' },
    })
    expect(createResponse.statusCode).toBe(201)
    const entry = createResponse.json().entry
    expect(entry.product).toBe(productName)
    expect(entry.status).toBe('planned')
    expect(entry.date).toBe('2026-02-10')

    const getResponse = await app.inject({ method: 'GET', url: `/api/v1/calendar/${entry.id}`, headers: { cookie } })
    expect(getResponse.statusCode).toBe(200)

    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/calendar/${entry.id}`,
      headers: { cookie },
      payload: { status: 'published', notes: 'Went out on schedule' },
    })
    expect(updateResponse.statusCode).toBe(200)
    expect(updateResponse.json().entry.status).toBe('published')

    const rescheduleResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/calendar/${entry.id}/reschedule`,
      headers: { cookie },
      payload: { date: '2026-02-17' },
    })
    expect(rescheduleResponse.statusCode).toBe(200)
    expect(rescheduleResponse.json().entry.date).toBe('2026-02-17')

    const filterResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/calendar?productId=${productId}&from=2026-02-01&to=2026-02-28`,
      headers: { cookie },
    })
    expect(filterResponse.statusCode).toBe(200)
    expect(filterResponse.json().items.some((i: { id: string }) => i.id === entry.id)).toBe(true)

    const searchResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/calendar?q=launch%20reel',
      headers: { cookie },
    })
    expect(searchResponse.json().items.some((i: { id: string }) => i.id === entry.id)).toBe(true)
  })

  it('rejects a calendar entry referencing a nonexistent product', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/calendar',
      headers: { cookie },
      payload: { title: 'Bad entry', date: '2026-02-10', productId: '00000000-0000-0000-0000-000000000000' },
    })
    expect(response.statusCode).toBe(400)
  })
})
