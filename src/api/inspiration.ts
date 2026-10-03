import { api } from './client'
import type { InspirationItem, InspirationPattern } from '../types'
import type { ApprovalView } from './products'

export function listInspiration(): Promise<InspirationItem[]> {
  return api.get<{ items: InspirationItem[] }>('/inspiration?limit=100').then((r) => r.items)
}

export function createInspiration(contentSourceId: string, pattern: InspirationPattern, notes?: string): Promise<InspirationItem> {
  return api.post<{ item: InspirationItem }>('/inspiration', { contentSourceId, pattern, notes }).then((r) => r.item)
}

export function updateInspiration(id: string, input: { pattern?: Partial<InspirationPattern>; notes?: string }): Promise<InspirationItem> {
  return api.patch<{ item: InspirationItem }>(`/inspiration/${id}`, input).then((r) => r.item)
}

export function requestDeleteInspiration(id: string): Promise<ApprovalView> {
  return api.delete<{ approval: ApprovalView }>(`/inspiration/${id}`).then((r) => r.approval)
}
