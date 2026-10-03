import { api } from './client'
import type { GridSlotDefinition, GridTemplate } from '../types'
import type { ApprovalView } from './products'

function toSlotInput(slots: GridSlotDefinition[]) {
  return slots.map((slot) => ({
    position: slot.position,
    contentType: slot.contentType,
    productRef: slot.productRef || undefined,
    label: slot.label || undefined,
  }))
}

export function listGridTemplates(): Promise<GridTemplate[]> {
  return api.get<{ items: GridTemplate[] }>('/grids?limit=100').then((r) => r.items)
}

export function createGridTemplate(template: Omit<GridTemplate, 'id' | 'isPreset' | 'createdAt' | 'updatedAt'>): Promise<GridTemplate> {
  return api
    .post<{ grid: GridTemplate }>('/grids', { name: template.name, description: template.description, slots: toSlotInput(template.slots) })
    .then((r) => r.grid)
}

export function updateGridTemplate(id: string, template: Pick<GridTemplate, 'name' | 'description' | 'slots'>): Promise<GridTemplate> {
  return api
    .patch<{ grid: GridTemplate }>(`/grids/${id}`, { name: template.name, description: template.description, slots: toSlotInput(template.slots) })
    .then((r) => r.grid)
}

export function activateGridTemplate(id: string): Promise<GridTemplate> {
  return api.post<{ grid: GridTemplate }>(`/grids/${id}/activate`).then((r) => r.grid)
}

export function getActiveGridTemplate(): Promise<GridTemplate | null> {
  return api.get<{ grid: GridTemplate | null }>('/grids/active').then((r) => r.grid)
}

export function requestDeleteGridTemplate(id: string): Promise<ApprovalView> {
  return api.delete<{ approval: ApprovalView }>(`/grids/${id}`).then((r) => r.approval)
}
