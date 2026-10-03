import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('content strategy', () => {
  let app: App
  let cookie: string
  let productId: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')

    const productResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name: 'Vitest Strategy Product' },
    })
    productId = productResponse.json().product.id
  })

  afterAll(async () => {
    await app.close()
  })

  it('generates a real sequence from real gap analysis for a product with no content history', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/strategies',
      headers: { cookie },
      payload: {
        goal: 'Grow Q4 awareness',
        objective: 'Increase reach among enterprise buyers',
        durationWeeks: 2,
        postingFrequency: '3x per week',
        productIds: [productId],
      },
    })
    expect(response.statusCode).toBe(201)
    const strategy = response.json().strategy

    expect(strategy.input.productIds).toEqual([productId])
    expect(strategy.contentGaps.some((g: string) => g.includes('No content yet'))).toBe(true)
    expect(strategy.sequence.length).toBe(6) // 2 weeks * 3/week
    expect(strategy.sequence[0].reason).toContain('Fills the content gap')
    expect(strategy.status).toBe('draft')

    const getResponse = await app.inject({ method: 'GET', url: `/api/v1/strategies/${strategy.id}`, headers: { cookie } })
    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json().strategy.id).toBe(strategy.id)

    const listResponse = await app.inject({ method: 'GET', url: '/api/v1/strategies', headers: { cookie } })
    expect(listResponse.json().items.some((s: { id: string }) => s.id === strategy.id)).toBe(true)

    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/strategies/${strategy.id}`,
      headers: { cookie },
      payload: { status: 'active' },
    })
    expect(updateResponse.statusCode).toBe(200)
    expect(updateResponse.json().strategy.status).toBe('active')
  })

  it('rejects a strategy referencing a nonexistent product', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/strategies',
      headers: { cookie },
      payload: {
        goal: 'Bad strategy',
        durationWeeks: 1,
        postingFrequency: '3x per week',
        productIds: ['00000000-0000-0000-0000-000000000000'],
      },
    })
    expect(response.statusCode).toBe(400)
  })
})
