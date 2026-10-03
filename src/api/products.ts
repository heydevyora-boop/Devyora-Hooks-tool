import { api } from './client'
import type { ProductKnowledge } from '../types'

export function listProducts(q?: string): Promise<ProductKnowledge[]> {
  return api.get<{ items: ProductKnowledge[] }>(`/products${q ? `?q=${encodeURIComponent(q)}` : ''}`).then((r) => r.items)
}

export type ProductInput = Omit<ProductKnowledge, 'id' | 'createdAt' | 'updatedAt'>

export function createProduct(input: ProductInput): Promise<ProductKnowledge> {
  return api.post<{ product: ProductKnowledge }>('/products', input).then((r) => r.product)
}

export function updateProduct(id: string, input: Partial<ProductInput>): Promise<ProductKnowledge> {
  return api.patch<{ product: ProductKnowledge }>(`/products/${id}`, input).then((r) => r.product)
}

export interface ApprovalView {
  id: string
  targetType: 'product' | 'grid_template' | 'inspiration'
  targetId: string
  targetLabel: string
  requestedAt: string
  resolution: string
}

export function requestDeleteProduct(id: string): Promise<ApprovalView> {
  return api.delete<{ approval: ApprovalView }>(`/products/${id}`).then((r) => r.approval)
}

export interface ProductIntelligenceView {
  productId: string
  productName: string
  contentCount: number
  lastUsedDate: string | null
  plannedContent: { id: string; title: string; date: string }[]
  upcomingContent: { id: string; title: string; date: string }[]
  performance: { averageViews: number | null; averageEngagementRate: number | null; snapshotCount: number }
  coverageGaps: { type: string; message: string; priority: string }[]
  inspirationRelationships: { id: string; savedAt: string }[]
  strategyRelationships: { id: string; goal: string; status: string }[]
}

export function getProductIntelligence(id: string): Promise<ProductIntelligenceView> {
  return api.get<{ intelligence: ProductIntelligenceView }>(`/products/${id}/intelligence`).then((r) => r.intelligence)
}

/**
 * Best-effort bridge from a locally-known product *name* (Content Hub's
 * Product Knowledge isn't wired to the backend yet — out of scope for
 * this chunk) to a real backend Product id, so a generation request can
 * still pull real Product Knowledge context when one genuinely exists.
 * Returns null rather than guessing when no exact match is found —
 * generation then just proceeds without that context source.
 */
export async function findProductIdByName(name: string): Promise<string | undefined> {
  if (!name.trim()) return undefined
  try {
    const { items } = await api.get<{ items: { id: string; name: string }[] }>(
      `/products?q=${encodeURIComponent(name)}&limit=5`,
    )
    return items.find((item) => item.name.toLowerCase() === name.toLowerCase())?.id
  } catch {
    return undefined
  }
}
