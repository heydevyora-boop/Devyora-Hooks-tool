import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('knowledge base', () => {
  let app: App
  let cookie: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')
  })

  afterAll(async () => {
    await app.close()
  })

  it('reports real counts across every knowledge domain', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name: 'Vitest Knowledge Base Product' },
    })

    const response = await app.inject({ method: 'GET', url: '/api/v1/knowledge-base/overview', headers: { cookie } })
    expect(response.statusCode).toBe(200)
    const overview = response.json().overview
    expect(overview.products.count).toBeGreaterThanOrEqual(1)
    expect(overview.instagram.connected).toBe(false)
    expect(typeof overview.contentRules.count).toBe('number')
    expect(typeof overview.performanceIntelligence.snapshotCount).toBe('number')
  })

  it('finds a product by a substring search across the knowledge base', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name: 'Vitest Searchable Widget', description: 'unique-search-marker' },
    })
    const productId = createResponse.json().product.id

    const searchResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/knowledge-base/search?q=unique-search-marker',
      headers: { cookie },
    })
    expect(searchResponse.statusCode).toBe(200)
    const { products } = searchResponse.json().results
    expect(products.some((p: { item: { id: string } }) => p.item.id === productId)).toBe(true)
  })

  it('rejects an empty search query', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/knowledge-base/search?q=', headers: { cookie } })
    expect(response.statusCode).toBe(400)
  })
})
