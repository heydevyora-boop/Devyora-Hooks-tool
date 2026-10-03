import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('products', () => {
  let app: App
  let cookie: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')
  })

  afterAll(async () => {
    await app.close()
  })

  it('rejects unauthenticated access', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/products' })
    expect(response.statusCode).toBe(401)
  })

  it('rejects creating a product with no name', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { description: 'missing a name' },
    })
    expect(response.statusCode).toBe(400)
    expect(response.json().error.code).toBe('VALIDATION_ERROR')
    expect(response.json().error.fields.name).toBeDefined()
  })

  it('creates, reads, searches, and updates a product end to end', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: {
        name: 'Vitest Widget 9000',
        description: 'A product created by the automated test suite.',
        features: ['Durable', 'Shiny'],
      },
    })
    expect(createResponse.statusCode).toBe(201)
    const created = createResponse.json().product
    expect(created.id).toBeDefined()
    expect(created.features).toEqual(['Durable', 'Shiny'])
    expect(created.benefits).toEqual([]) // defaults applied for omitted arrays

    const getResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${created.id}`,
      headers: { cookie },
    })
    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json().product.name).toBe('Vitest Widget 9000')

    const searchResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/products?q=Vitest%20Widget',
      headers: { cookie },
    })
    expect(searchResponse.statusCode).toBe(200)
    expect(searchResponse.json().items.some((p: { id: string }) => p.id === created.id)).toBe(true)

    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/products/${created.id}`,
      headers: { cookie },
      payload: { name: 'Vitest Widget 9001' },
    })
    expect(updateResponse.statusCode).toBe(200)
    expect(updateResponse.json().product.name).toBe('Vitest Widget 9001')
    // Fields not sent in the PATCH are preserved, not wiped.
    expect(updateResponse.json().product.features).toEqual(['Durable', 'Shiny'])
  })

  it('returns 404, not a leaked 403, for a product in a different/non-existent id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/products/00000000-0000-0000-0000-000000000000',
      headers: { cookie },
    })
    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe('NOT_FOUND')
  })
})
