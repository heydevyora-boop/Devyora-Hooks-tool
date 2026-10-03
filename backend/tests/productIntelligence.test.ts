import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('product intelligence', () => {
  let app: App
  let cookie: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')
  })

  afterAll(async () => {
    await app.close()
  })

  it('rolls up real content count, performance, gaps, and strategy relationships for a product', async () => {
    const productResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name: 'Vitest Intelligence Product' },
    })
    const productId = productResponse.json().product.id

    const historyResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/content-history',
      headers: { cookie },
      payload: { title: 'Vitest post', productId, format: 'Reel', date: '2026-01-10', status: 'Published' },
    })
    const historyId = historyResponse.json().item.id

    await app.inject({
      method: 'POST',
      url: `/api/v1/content-history/${historyId}/performance`,
      headers: { cookie },
      payload: { views: 10000, source: 'manual' },
    })

    const strategyResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/strategies',
      headers: { cookie },
      payload: { goal: 'Product intelligence test', durationWeeks: 1, postingFrequency: '1x per week', productIds: [productId] },
    })
    expect(strategyResponse.statusCode).toBe(201)

    const response = await app.inject({ method: 'GET', url: `/api/v1/products/${productId}/intelligence`, headers: { cookie } })
    expect(response.statusCode).toBe(200)
    const { intelligence } = response.json()
    expect(intelligence.contentCount).toBe(1)
    expect(intelligence.lastUsedDate).toBe('2026-01-10')
    expect(intelligence.performance.averageViews).toBe(10000)
    expect(intelligence.strategyRelationships.length).toBeGreaterThanOrEqual(1)
  })

  it('404s for a product in a different workspace scope', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/products/00000000-0000-0000-0000-000000000000/intelligence',
      headers: { cookie },
    })
    expect(response.statusCode).toBe(404)
  })
})
