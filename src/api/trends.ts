import { api } from './client'

export type TrendType =
  | 'low_coverage'
  | 'content_gap'
  | 'unused_grid_position'
  | 'strategy_requirement'
  | 'performance_pattern'
  | 'inspiration_pattern'

export interface TrendOrOpportunity {
  id: string
  type: TrendType
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  relatedEntity?: { type: string; id: string; label: string }
}

export function getTrendsAndOpportunities(): Promise<TrendOrOpportunity[]> {
  return api.get<{ items: TrendOrOpportunity[] }>('/trends').then((r) => r.items)
}
