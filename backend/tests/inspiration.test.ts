import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('inspiration', () => {
  let app: App
  let cookie: string
  let sourceId: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')

    const sourceResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/sources',
      headers: { cookie },
      payload: { kind: 'url', value: 'https://www.instagram.com/p/vitest-inspo/' },
    })
    sourceId = sourceResponse.json().source.id
  })

  afterAll(async () => {
    await app.close()
  })

  it('saves a derived pattern analysis, never the raw source content, and lists it back', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/inspiration',
      headers: { cookie },
      payload: {
        contentSourceId: sourceId,
        pattern: {
          hookPattern: 'Pattern interrupt question',
          topic: 'onboarding friction',
          format: 'Reel',
          narrativeStructure: 'problem-agitate-solve',
          visualPattern: 'talking head + text overlay',
          ctaPattern: 'comment to get the guide',
          contentAngle: 'contrarian take',
        },
        notes: 'Good structure to borrow for Q3',
      },
    })
    expect(createResponse.statusCode).toBe(201)
    const item = createResponse.json().item
    expect(item.pattern.hookPattern).toBe('Pattern interrupt question')
    expect(item.source.id).toBe(sourceId)

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/inspiration',
      headers: { cookie },
    })
    expect(listResponse.statusCode).toBe(200)
    expect(listResponse.json().items.some((i: { id: string }) => i.id === item.id)).toBe(true)

    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/inspiration/${item.id}`,
      headers: { cookie },
      payload: { notes: 'Updated note', pattern: { topic: 'retention' } },
    })
    expect(updateResponse.statusCode).toBe(200)
    expect(updateResponse.json().item.notes).toBe('Updated note')
    expect(updateResponse.json().item.pattern.topic).toBe('retention')
    // Untouched pattern fields are preserved, not wiped by the partial update.
    expect(updateResponse.json().item.pattern.hookPattern).toBe('Pattern interrupt question')
  })

  it('rejects an inspiration item pointing at a nonexistent source', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/inspiration',
      headers: { cookie },
      payload: {
        contentSourceId: '00000000-0000-0000-0000-000000000000',
        pattern: { hookPattern: 'x', topic: 'x', format: 'x', narrativeStructure: 'x', visualPattern: 'x', ctaPattern: 'x', contentAngle: 'x' },
      },
    })
    expect(response.statusCode).toBe(404)
  })
})
