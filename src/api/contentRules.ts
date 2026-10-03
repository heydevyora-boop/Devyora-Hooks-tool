import { api } from './client'

export interface ContentRuleView {
  id: string
  category: string
  title: string
  description?: string
  tags: string[]
  isLocked: boolean
  createdAt: string
  updatedAt: string
}

export interface ContentRuleInput {
  category: string
  title: string
  description?: string
  tags?: string[]
}

export function listContentRules(): Promise<ContentRuleView[]> {
  return api.get<{ items: ContentRuleView[] }>('/content-rules?limit=100').then((r) => r.items)
}

export function createContentRule(input: ContentRuleInput): Promise<ContentRuleView> {
  return api.post<{ rule: ContentRuleView }>('/content-rules', input).then((r) => r.rule)
}

export function updateContentRule(id: string, input: Partial<ContentRuleInput & { isLocked: boolean }>): Promise<ContentRuleView> {
  return api.patch<{ rule: ContentRuleView }>(`/content-rules/${id}`, input).then((r) => r.rule)
}

export function deleteContentRule(id: string): Promise<void> {
  return api.delete(`/content-rules/${id}`)
}
