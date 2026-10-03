import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('content flowchart (content plan)', () => {
  let app: App
  let cookie: string
  let strategyId: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')

    const productResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name: 'Vitest Flowchart Product' },
    })
    const productId = productResponse.json().product.id

    const strategyResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/strategies',
      headers: { cookie },
      payload: {
        goal: 'Grow reel reach',
        durationWeeks: 1,
        postingFrequency: '2x per week',
        productIds: [productId],
      },
    })
    strategyId = strategyResponse.json().strategy.id
  })

  afterAll(async () => {
    await app.close()
  })

  it('generates a start-to-end chain of nodes/edges from the strategy, with a real balance decision', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/api/v1/strategies/${strategyId}/flowchart`,
      headers: { cookie },
    })
    expect(response.statusCode).toBe(201)
    const flowchart = response.json().flowchart

    expect(flowchart.strategyId).toBe(strategyId)
    expect(flowchart.nodes[0].type).toBe('start')
    expect(flowchart.nodes[0].status).toBe('done')
    expect(flowchart.nodes.some((n: { type: string }) => n.type === 'decision')).toBe(true)
    expect(flowchart.nodes.some((n: { type: string }) => n.type === 'content')).toBe(true)
    // One product only → perfectly balanced → ends at a "Final Plan" END node.
    expect(flowchart.nodes.at(-1).type).toBe('end')
    expect(flowchart.nodes.at(-1).branch).toBe('yes')
    expect(flowchart.edges.length).toBe(flowchart.nodes.length - 1)

    // Regenerating while one already exists is a conflict, not a silent duplicate.
    const regenerateAttempt = await app.inject({
      method: 'POST',
      url: `/api/v1/strategies/${strategyId}/flowchart`,
      headers: { cookie },
    })
    expect(regenerateAttempt.statusCode).toBe(409)

    const byStrategy = await app.inject({ method: 'GET', url: `/api/v1/strategies/${strategyId}/flowchart`, headers: { cookie } })
    expect(byStrategy.statusCode).toBe(200)
    expect(byStrategy.json().flowchart.id).toBe(flowchart.id)

    const contentNode = flowchart.nodes.find((n: { type: string }) => n.type === 'content')
    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/flowcharts/${flowchart.id}/nodes/${contentNode.id}`,
      headers: { cookie },
      payload: { status: 'done' },
    })
    expect(updateResponse.statusCode).toBe(200)
    const updatedNode = updateResponse.json().flowchart.nodes.find((n: { id: string }) => n.id === contentNode.id)
    expect(updatedNode.status).toBe('done')

    const approveResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/flowcharts/${flowchart.id}/approve`,
      headers: { cookie },
    })
    expect(approveResponse.statusCode).toBe(200)
    expect(approveResponse.json().flowchart.approvedAt).toBeDefined()

    const doubleApprove = await app.inject({
      method: 'POST',
      url: `/api/v1/flowcharts/${flowchart.id}/approve`,
      headers: { cookie },
    })
    expect(doubleApprove.statusCode).toBe(409)
  })
})
