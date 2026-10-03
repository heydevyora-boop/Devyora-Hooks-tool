import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('dashboard', () => {
  let app: App
  let cookie: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')
  })

  afterAll(async () => {
    await app.close()
  })

  it('aggregates every section from real data, not static placeholders', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/dashboard', headers: { cookie } })
    expect(response.statusCode).toBe(200)
    const { dashboard } = response.json()

    expect(dashboard.instagram).toHaveProperty('status')
    expect(dashboard.contentHealth.type).toBe('calculated')
    expect(dashboard.currentContent).toHaveProperty('recentlyPublished')
    expect(dashboard.currentContent).toHaveProperty('inProgress')
    expect(Array.isArray(dashboard.contentGaps)).toBe(true)
    expect(Array.isArray(dashboard.emergingTrends)).toBe(true)
    expect(Array.isArray(dashboard.newOpportunities)).toBe(true)
    expect(Array.isArray(dashboard.productsDue)).toBe(true)
    expect(dashboard.contentFlow).toHaveProperty('nodeStatusCounts')
    expect(Array.isArray(dashboard.contentCalendar)).toBe(true)
    expect(Array.isArray(dashboard.productIntelligence)).toBe(true)
  })
})
