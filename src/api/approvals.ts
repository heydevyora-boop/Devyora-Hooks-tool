import { api } from './client'
import type { ApprovalView } from './products'

export function listApprovals(resolution?: 'pending' | 'approved' | 'rejected'): Promise<ApprovalView[]> {
  const params = new URLSearchParams({ limit: '100' })
  if (resolution) params.set('resolution', resolution)
  return api.get<{ items: ApprovalView[] }>(`/approvals?${params}`).then((r) => r.items)
}

export function approveApproval(id: string): Promise<ApprovalView> {
  return api.post<{ approval: ApprovalView }>(`/approvals/${id}/approve`).then((r) => r.approval)
}

export function rejectApproval(id: string): Promise<ApprovalView> {
  return api.post<{ approval: ApprovalView }>(`/approvals/${id}/reject`).then((r) => r.approval)
}
