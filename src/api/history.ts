import { api } from './client'
import type { ContentHistoryItem } from '../types'

export function listContentHistory(): Promise<ContentHistoryItem[]> {
  return api.get<{ items: ContentHistoryItem[] }>('/content-history?limit=100').then((r) => r.items)
}

export interface PerformanceSnapshot {
  id: string
  capturedAt: string
  views?: number
  likes?: number
  shares?: number
  comments?: number
  saves?: number
  engagementRate?: number
  holdRate3s?: number
  source: string
}
