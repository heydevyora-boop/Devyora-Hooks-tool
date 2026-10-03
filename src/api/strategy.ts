import { api } from './client'
import type { ContentStrategyPlan } from '../types'

export interface CreateStrategyRequest {
  goal: string
  objective?: string
  durationWeeks: number
  postingFrequency: string
  productIds: string[]
  audience?: string
  gridTemplateId?: string
}

export function listStrategies(): Promise<ContentStrategyPlan[]> {
  return api.get<{ items: ContentStrategyPlan[] }>('/strategies?limit=100').then((r) => r.items)
}

export function createStrategy(input: CreateStrategyRequest): Promise<ContentStrategyPlan> {
  return api.post<{ strategy: ContentStrategyPlan }>('/strategies', input).then((r) => r.strategy)
}

export function getStrategy(id: string): Promise<ContentStrategyPlan> {
  return api.get<{ strategy: ContentStrategyPlan }>(`/strategies/${id}`).then((r) => r.strategy)
}

export function updateStrategyStatus(id: string, status: 'draft' | 'active' | 'completed' | 'archived'): Promise<ContentStrategyPlan> {
  return api.patch<{ strategy: ContentStrategyPlan }>(`/strategies/${id}`, { status }).then((r) => r.strategy)
}
