import { api } from './client'
import type { GeneratedContentItem, ScorecardMetric } from '../types'

/**
 * The real backend's generation view carries everything the frontend's
 * strict GeneratedContentItem type needs, plus additive fields the
 * backend tracks that the original mock never had — none of this is
 * fabricated, it's real stored state (see generation.service.ts).
 */
export interface SimilarityWarning {
  field: 'topic' | 'hook' | 'angle' | 'script' | 'product' | 'format'
  similarTo: { type: 'content_history' | 'generated_content'; id: string; label: string }
  similarityScore: number
  message: string
}

export interface GeneratedContentView extends GeneratedContentItem {
  stage: 'draft' | 'generated' | 'review' | 'approved' | 'published' | 'archived'
  version: number
  platform: string
  similarityWarnings: SimilarityWarning[]
  userInstructions?: string
  contextSourcesUsed: string[]
  rejectionReason?: string
  approvedAt?: string
  publishedAt?: string
  contentHistoryId?: string
  updatedAt: string
}

export interface VideoBlueprintView {
  score: number
  tierLabel: string
  tierBadge: string
  diagnosis: string
  metrics: ScorecardMetric[]
  viralityThresholdLabel: string
}

export interface GenerateContentRequest {
  flowchartNodeId?: string
  productId?: string
  topic?: string
  platform?: string
  userInstructions?: string
}

export function generateContent(input: GenerateContentRequest): Promise<GeneratedContentView> {
  return api.post<{ generation: GeneratedContentView }>('/generations', input).then((r) => r.generation)
}

export function getGeneration(id: string): Promise<GeneratedContentView> {
  return api.get<{ generation: GeneratedContentView }>(`/generations/${id}`).then((r) => r.generation)
}

export function getGenerationByFlowchartNode(nodeId: string): Promise<GeneratedContentView | null> {
  return api.get<{ generation: GeneratedContentView | null }>(`/generations/by-node/${nodeId}`).then((r) => r.generation)
}

export interface RegenerateRequest {
  targetLabel: string
  reason: string
  reasonOrigin: 'text' | 'speech'
}

export function regenerateContent(id: string, input: RegenerateRequest): Promise<GeneratedContentView> {
  return api.post<{ generation: GeneratedContentView }>(`/generations/${id}/regenerate`, input).then((r) => r.generation)
}

export function getVideoBlueprint(id: string): Promise<VideoBlueprintView> {
  return api.get<{ blueprint: VideoBlueprintView }>(`/generations/${id}/video-blueprint`).then((r) => r.blueprint)
}

export function approveGeneration(id: string): Promise<GeneratedContentView> {
  return api.post<{ generation: GeneratedContentView }>(`/generations/${id}/approve`).then((r) => r.generation)
}

export function rejectGeneration(id: string, reason?: string): Promise<GeneratedContentView> {
  return api.post<{ generation: GeneratedContentView }>(`/generations/${id}/reject`, { reason }).then((r) => r.generation)
}

export function saveGeneration(id: string): Promise<GeneratedContentView> {
  return api.post<{ generation: GeneratedContentView }>(`/generations/${id}/save`).then((r) => r.generation)
}
