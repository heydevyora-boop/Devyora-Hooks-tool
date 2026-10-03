import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('trends & opportunities', () => {
  let app: App
  let cookie: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')
  })

  afterAll(async () => {
    await app.close()
  })

  it('surfaces a real low-coverage trend for a product with no content, never a fabricated one', async () => {
    const productResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name: 'Vitest Trends Product' },
    })
    const productId = productResponse.json().product.id

    const response = await app.inject({ method: 'GET', url: '/api/v1/trends', headers: { cookie } })
    expect(response.statusCode).toBe(200)
    const { trends } = response.json()
    expect(Array.isArray(trends)).toBe(true)
    const match = trends.find((t: { relatedEntity?: { id: string } }) => t.relatedEntity?.id === productId)
    expect(match).toBeDefined()
    expect(match.type).toBe('low_coverage')
  })
})
