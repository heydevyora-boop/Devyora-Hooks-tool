import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('content gap engine', () => {
  let app: App
  let cookie: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')
  })

  afterAll(async () => {
    await app.close()
  })

  it('flags a product with zero historical content as a real gap', async () => {
    const productResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name: 'Vitest Gap Product (No Content)' },
    })
    const productId = productResponse.json().product.id

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/gap-analysis?productIds=${productId}`,
      headers: { cookie },
    })
    expect(response.statusCode).toBe(200)
    const { gaps } = response.json()
    expect(gaps).toHaveLength(1)
    expect(gaps[0].type).toBe('no_content')
    expect(gaps[0].productId).toBe(productId)
  })

  it('reports no gap for a product with recent published content', async () => {
    const productResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name: 'Vitest Gap Product (Has Content)' },
    })
    const productId = productResponse.json().product.id

    await app.inject({
      method: 'POST',
      url: '/api/v1/content-history',
      headers: { cookie },
      payload: {
        title: 'Recent post',
        productId,
        format: 'Reel',
        date: new Date().toISOString().slice(0, 10),
        status: 'Published',
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/gap-analysis?productIds=${productId}`,
      headers: { cookie },
    })
    expect(response.statusCode).toBe(200)
    expect(response.json().gaps).toHaveLength(0)
  })
})
