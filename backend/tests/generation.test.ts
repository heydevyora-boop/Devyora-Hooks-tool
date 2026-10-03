import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('AI content generation', () => {
  let app: App
  let cookie: string
  let productId: string
  let productName: string

  beforeAll(async () => {
    app = await buildApp()
    cookie = await loginAs(app, 'admin', 'admin123')

    const productResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: {
        name: 'Vitest TrustEngine',
        benefits: ['Automated compliance evidence'],
        applications: ['SOC2 audits'],
        sellingPoints: ['Pass audits without pulling engineers off the roadmap'],
        contentAngles: ['Contrarian Callout', 'Proof Framework'],
      },
    })
    productId = productResponse.json().product.id
    productName = productResponse.json().product.name
  })

  afterAll(async () => {
    await app.close()
  })

  it('rejects a generation request with neither a topic nor a flowchart node', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/v1/generations', headers: { cookie }, payload: {} })
    expect(response.statusCode).toBe(400)
  })

  it('generates real content from real product context, scores it, and supports the full regenerate/approve/save lifecycle', async () => {
    const generateResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/generations',
      headers: { cookie },
      payload: {
        productId,
        topic: 'Why SOC2 audits fail in week 1',
        platform: 'reels',
        userInstructions: 'Keep it under a minute',
      },
    })
    expect(generateResponse.statusCode).toBe(201)
    const generation = generateResponse.json().generation

    expect(generation.product).toBe(productName)
    expect(generation.stage).toBe('generated')
    expect(generation.status).toBe('draft')
    expect(generation.version).toBe(1)
    expect(generation.contextSourcesUsed).toContain('product')
    expect(generation.contextSourcesUsed).toContain('user_instructions')
    expect(generation.hooks.length).toBeGreaterThan(0)
    expect(generation.scenes.length).toBe(5)
    expect(generation.caption).toContain(productName)

    // get
    const getResponse = await app.inject({ method: 'GET', url: `/api/v1/generations/${generation.id}`, headers: { cookie } })
    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json().generation.id).toBe(generation.id)

    // video blueprint — analytical scoring, never a guarantee
    const blueprintResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/generations/${generation.id}/video-blueprint`,
      headers: { cookie },
    })
    expect(blueprintResponse.statusCode).toBe(200)
    const blueprint = blueprintResponse.json().blueprint
    expect(typeof blueprint.score).toBe('number')
    expect(blueprint.metrics.length).toBe(9)
    expect(blueprint.viralityThresholdLabel).toContain('Organic Views')
    expect(blueprint.diagnosis).toContain('not a guaranteed performance prediction')

    // regenerate the CTA with a typed reason — creates version 2
    const regenerateResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/generations/${generation.id}/regenerate`,
      headers: { cookie },
      payload: { targetLabel: 'CTA', reason: 'Make it more urgent and strong', reasonOrigin: 'text' },
    })
    expect(regenerateResponse.statusCode).toBe(200)
    const regenerated = regenerateResponse.json().generation
    expect(regenerated.version).toBe(2)
    expect(regenerated.cta).toContain('limited spots')
    expect(regenerated.regenerationHistory).toHaveLength(1)
    expect(regenerated.regenerationHistory[0].feedback).toBe('Make it more urgent and strong')

    // versions — both kept, never overwritten
    const versionsResponse = await app.inject({ method: 'GET', url: `/api/v1/generations/${generation.id}/versions`, headers: { cookie } })
    expect(versionsResponse.statusCode).toBe(200)
    const versions = versionsResponse.json().versions
    expect(versions).toHaveLength(2)
    expect(versions[0].version).toBe(1)
    expect(versions[1].version).toBe(2)
    expect(versions[1].parentVersionId).toBe(versions[0].id)
    expect(versions[1].regenerationReasonOrigin).toBe('text')

    // reject -> review, then approve -> approved
    const rejectResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/generations/${generation.id}/reject`,
      headers: { cookie },
      payload: { reason: 'Hook too generic' },
    })
    expect(rejectResponse.statusCode).toBe(200)
    expect(rejectResponse.json().generation.stage).toBe('review')

    const approveResponse = await app.inject({ method: 'POST', url: `/api/v1/generations/${generation.id}/approve`, headers: { cookie } })
    expect(approveResponse.statusCode).toBe(200)
    expect(approveResponse.json().generation.stage).toBe('approved')

    // save -> enters Content Intelligence as real ContentHistory (source=GENERATED)
    const saveResponse = await app.inject({ method: 'POST', url: `/api/v1/generations/${generation.id}/save`, headers: { cookie } })
    expect(saveResponse.statusCode).toBe(200)
    const saved = saveResponse.json().generation
    expect(saved.stage).toBe('published')
    expect(saved.status).toBe('saved')
    expect(saved.contentHistoryId).toBeDefined()

    const historyResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/content-history/${saved.contentHistoryId}`,
      headers: { cookie },
    })
    expect(historyResponse.statusCode).toBe(200)

    // can no longer regenerate or re-save once published
    const regenerateAfterPublish = await app.inject({
      method: 'POST',
      url: `/api/v1/generations/${generation.id}/regenerate`,
      headers: { cookie },
      payload: { targetLabel: 'CTA', reason: 'too late', reasonOrigin: 'text' },
    })
    expect(regenerateAfterPublish.statusCode).toBe(409)

    const saveAgain = await app.inject({ method: 'POST', url: `/api/v1/generations/${generation.id}/save`, headers: { cookie } })
    expect(saveAgain.statusCode).toBe(409)
  })

  it('generates from an approved flowchart node, blocks a duplicate generation, and marks the node done on save', async () => {
    const strategyResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/strategies',
      headers: { cookie },
      payload: { goal: 'Node-based generation test', durationWeeks: 1, postingFrequency: '1x per week', productIds: [productId] },
    })
    const strategyId = strategyResponse.json().strategy.id

    const flowchartResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/strategies/${strategyId}/flowchart`,
      headers: { cookie },
    })
    const flowchart = flowchartResponse.json().flowchart
    const contentNode = flowchart.nodes.find((n: { type: string }) => n.type === 'content')
    expect(contentNode).toBeDefined()

    const generateResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/generations',
      headers: { cookie },
      payload: { flowchartNodeId: contentNode.id },
    })
    expect(generateResponse.statusCode).toBe(201)
    const generation = generateResponse.json().generation
    expect(generation.flowchartNodeId).toBe(contentNode.id)
    expect(generation.strategyId).toBe(strategyId)
    expect(generation.contextSourcesUsed).toContain('flowchart')
    expect(generation.contextSourcesUsed).toContain('content_strategy')

    const duplicateAttempt = await app.inject({
      method: 'POST',
      url: '/api/v1/generations',
      headers: { cookie },
      payload: { flowchartNodeId: contentNode.id },
    })
    expect(duplicateAttempt.statusCode).toBe(409)

    const byNodeResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/generations/by-node/${contentNode.id}`,
      headers: { cookie },
    })
    expect(byNodeResponse.json().generation.id).toBe(generation.id)

    await app.inject({ method: 'POST', url: `/api/v1/generations/${generation.id}/approve`, headers: { cookie } })
    await app.inject({ method: 'POST', url: `/api/v1/generations/${generation.id}/save`, headers: { cookie } })

    const flowchartAfter = await app.inject({ method: 'GET', url: `/api/v1/flowcharts/${flowchart.id}`, headers: { cookie } })
    const updatedNode = flowchartAfter.json().flowchart.nodes.find((n: { id: string }) => n.id === contentNode.id)
    expect(updatedNode.status).toBe('done')
  })
})
