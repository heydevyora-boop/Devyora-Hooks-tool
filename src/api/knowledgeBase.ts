import { api } from './client'

export interface KnowledgeBaseOverview {
  products: { count: number }
  brand: { configured: boolean }
  historicalContent: { count: number; approved: number }
  inspiration: { count: number }
  contentGrids: { count: number; activeGridId: string | null }
  contentRules: { count: number; locked: number }
  performanceIntelligence: { snapshotCount: number }
  pendingApprovals: { count: number }
  instagram: { connected: boolean }
}

export function getKnowledgeBaseOverview(): Promise<KnowledgeBaseOverview> {
  return api.get<{ overview: KnowledgeBaseOverview }>('/knowledge-base/overview').then((r) => r.overview)
}

export interface KnowledgeSearchResults {
  products: { type: string; item: unknown }[]
  historicalContent: { type: string; item: unknown }[]
  inspiration: { type: string; item: unknown }[]
  contentGrids: { type: string; item: unknown }[]
  contentRules: { type: string; item: unknown }[]
  sources: { type: string; item: unknown }[]
}

export function searchKnowledgeBase(q: string): Promise<KnowledgeSearchResults> {
  return api.get<{ results: KnowledgeSearchResults }>(`/knowledge-base/search?q=${encodeURIComponent(q)}`).then((r) => r.results)
}
