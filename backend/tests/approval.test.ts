import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { App } from './helpers.js'
import { buildApp, loginAs } from './helpers.js'

describe('approvals (gated deletion of important knowledge)', () => {
  let app: App
  let adminCookie: string
  let userCookie: string

  beforeAll(async () => {
    app = await buildApp()
    adminCookie = await loginAs(app, 'admin', 'admin123')
    userCookie = await loginAs(app, 'user', 'user123')
  })

  afterAll(async () => {
    await app.close()
  })

  async function createProduct(cookie: string, name: string) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: { cookie },
      payload: { name },
    })
    return response.json().product.id as string
  }

  it('queues a deletion request instead of deleting immediately, and a non-admin cannot resolve it', async () => {
    const productId = await createProduct(userCookie, 'Vitest Approval Product A')

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/products/${productId}`,
      headers: { cookie: userCookie },
    })
    expect(deleteResponse.statusCode).toBe(202)
    const approval = deleteResponse.json().approval
    expect(approval.targetType).toBe('product')
    expect(approval.resolution).toBe('pending')

    // The product is still there — nothing was actually deleted yet.
    const stillThere = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${productId}`,
      headers: { cookie: userCookie },
    })
    expect(stillThere.statusCode).toBe(200)

    // Listing is open to any authenticated user — whoever requested a
    // deletion needs to see it's pending — only resolving it is admin-only.
    const nonAdminList = await app.inject({ method: 'GET', url: '/api/v1/approvals', headers: { cookie: userCookie } })
    expect(nonAdminList.statusCode).toBe(200)
    expect(nonAdminList.json().items.some((a: { id: string }) => a.id === approval.id)).toBe(true)

    const nonAdminApprove = await app.inject({
      method: 'POST',
      url: `/api/v1/approvals/${approval.id}/approve`,
      headers: { cookie: userCookie },
    })
    expect(nonAdminApprove.statusCode).toBe(403)
  })

  it('actually deletes the target once an admin approves', async () => {
    const productId = await createProduct(userCookie, 'Vitest Approval Product B')
    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/products/${productId}`,
      headers: { cookie: userCookie },
    })
    const approvalId = deleteResponse.json().approval.id

    const approveResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/approvals/${approvalId}/approve`,
      headers: { cookie: adminCookie },
    })
    expect(approveResponse.statusCode).toBe(200)
    expect(approveResponse.json().approval.resolution).toBe('approved')

    const afterApprove = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${productId}`,
      headers: { cookie: userCookie },
    })
    expect(afterApprove.statusCode).toBe(404)

    // Already resolved — resolving again is a conflict, not silently repeated.
    const doubleApprove = await app.inject({
      method: 'POST',
      url: `/api/v1/approvals/${approvalId}/approve`,
      headers: { cookie: adminCookie },
    })
    expect(doubleApprove.statusCode).toBe(409)
  })

  it('leaves the target untouched when an admin rejects the request', async () => {
    const productId = await createProduct(userCookie, 'Vitest Approval Product C')
    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/products/${productId}`,
      headers: { cookie: userCookie },
    })
    const approvalId = deleteResponse.json().approval.id

    const rejectResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/approvals/${approvalId}/reject`,
      headers: { cookie: adminCookie },
    })
    expect(rejectResponse.statusCode).toBe(200)
    expect(rejectResponse.json().approval.resolution).toBe('rejected')

    const stillThere = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${productId}`,
      headers: { cookie: userCookie },
    })
    expect(stillThere.statusCode).toBe(200)
  })

  it('is idempotent — re-requesting deletion while one is already pending returns the same request', async () => {
    const productId = await createProduct(userCookie, 'Vitest Approval Product D')
    const first = await app.inject({ method: 'DELETE', url: `/api/v1/products/${productId}`, headers: { cookie: userCookie } })
    const second = await app.inject({ method: 'DELETE', url: `/api/v1/products/${productId}`, headers: { cookie: userCookie } })
    expect(first.json().approval.id).toBe(second.json().approval.id)
  })
})
