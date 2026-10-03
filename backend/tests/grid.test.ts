import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('content grid', () => {
  let app: App
  let cookie: string
  let productName: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')

    const productResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name: 'Vitest Grid Product' },
    })
    productName = productResponse.json().product.name
  })

  afterAll(async () => {
    await app.close()
  })

  it('creates a grid with slots, assigns a product by name, and reads it back', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/grids',
      headers: { cookie },
      payload: {
        name: 'Vitest 3x3 Grid',
        description: 'A nine-slot content grid',
        slots: [
          { position: 0, contentType: 'reel', productRef: productName, label: 'Hook of the week' },
          { position: 1, contentType: 'carousel' },
          { position: 2, contentType: 'empty' },
        ],
      },
    })
    expect(createResponse.statusCode).toBe(201)
    const grid = createResponse.json().grid
    expect(grid.slots).toHaveLength(3)
    expect(grid.slots[0].productRef).toBe(productName)
    expect(grid.slots[0].contentType).toBe('reel')

    const getResponse = await app.inject({ method: 'GET', url: `/api/v1/grids/${grid.id}`, headers: { cookie } })
    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json().grid.slots).toHaveLength(3)

    const duplicateResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/grids/${grid.id}/duplicate`,
      headers: { cookie },
    })
    expect(duplicateResponse.statusCode).toBe(201)
    expect(duplicateResponse.json().grid.name).toBe('Vitest 3x3 Grid (Copy)')
    expect(duplicateResponse.json().grid.slots).toHaveLength(3)

    const activateResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/grids/${grid.id}/activate`,
      headers: { cookie },
    })
    expect(activateResponse.statusCode).toBe(200)
    expect(activateResponse.json().grid.id).toBe(grid.id)

    const activeResponse = await app.inject({ method: 'GET', url: '/api/v1/grids/active', headers: { cookie } })
    expect(activeResponse.statusCode).toBe(200)
    expect(activeResponse.json().grid.id).toBe(grid.id)

    const deactivateResponse = await app.inject({ method: 'DELETE', url: '/api/v1/grids/active', headers: { cookie } })
    expect(deactivateResponse.statusCode).toBe(204)

    const afterDeactivate = await app.inject({ method: 'GET', url: '/api/v1/grids/active', headers: { cookie } })
    expect(afterDeactivate.json().grid).toBeNull()
  })

  it('rejects a slot referencing an unknown product rather than fabricating an association', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/grids',
      headers: { cookie },
      payload: { name: 'Bad grid', slots: [{ position: 0, contentType: 'reel', productRef: 'Does Not Exist' }] },
    })
    expect(response.statusCode).toBe(400)
  })

  it('rejects duplicate slot positions', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/grids',
      headers: { cookie },
      payload: {
        name: 'Dupe positions',
        slots: [
          { position: 0, contentType: 'reel' },
          { position: 0, contentType: 'carousel' },
        ],
      },
    })
    expect(response.statusCode).toBe(400)
  })

  it('replaces slots wholesale on update', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/grids',
      headers: { cookie },
      payload: { name: 'Editable grid', slots: [{ position: 0, contentType: 'reel' }] },
    })
    const gridId = createResponse.json().grid.id

    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/grids/${gridId}`,
      headers: { cookie },
      payload: { slots: [{ position: 0, contentType: 'story' }, { position: 1, contentType: 'static' }] },
    })
    expect(updateResponse.statusCode).toBe(200)
    expect(updateResponse.json().grid.slots).toHaveLength(2)
    expect(updateResponse.json().grid.slots[0].contentType).toBe('story')
  })
})
