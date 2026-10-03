import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { ConflictError, NotFoundError } from '../lib/errors.js'
import type { ApprovalTargetType, PendingApproval } from '@prisma/client'

/** Matches the frontend's PendingApproval shape exactly; resolution/
 * resolvedAt are extra, additive fields for the admin's own approvals
 * list, which the frontend's strict type simply ignores. */
export function toApprovalView(approval: PendingApproval) {
  return {
    id: approval.id,
    targetType: approval.targetType.toLowerCase() as 'product' | 'grid_template' | 'inspiration',
    targetId: approval.targetId,
    targetLabel: approval.targetLabel,
    requestedAt: approval.requestedAt.toISOString(),
    resolution: approval.resolution.toLowerCase(),
    resolvedAt: approval.resolvedAt?.toISOString(),
  }
}

export async function listApprovals(
  workspaceId: string,
  opts: { limit: number; cursor?: string; resolution?: 'pending' | 'approved' | 'rejected' },
) {
  const rows = await prisma.pendingApproval.findMany({
    where: {
      workspaceId,
      ...(opts.resolution ? { resolution: opts.resolution.toUpperCase() as PendingApproval['resolution'] } : {}),
    },
    orderBy: { requestedAt: 'desc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })

  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toApprovalView), nextCursor }
}

/**
 * Queues a deletion request rather than deleting immediately — per the
 * explicit Chunk 4 instruction, "important knowledge" deletion/removal
 * (Products, Grid Templates, Inspiration) always goes through admin
 * approval. Idempotent: re-requesting while one is already pending just
 * returns the existing row rather than creating a duplicate.
 */
export async function requestDeletion(
  workspaceId: string,
  requestedBy: string,
  targetType: ApprovalTargetType,
  targetId: string,
  targetLabel: string,
) {
  const existing = await prisma.pendingApproval.findFirst({
    where: { workspaceId, targetType, targetId, resolution: 'PENDING' },
  })
  if (existing) return toApprovalView(existing)

  const approval = await prisma.pendingApproval.create({
    data: { workspaceId, targetType, targetId, targetLabel, requestedBy },
  })
  return toApprovalView(approval)
}

async function deleteTarget(workspaceId: string, targetType: ApprovalTargetType, targetId: string) {
  switch (targetType) {
    case 'PRODUCT':
      await prisma.product.deleteMany({ where: { id: targetId, workspaceId } })
      return
    case 'GRID_TEMPLATE':
      await prisma.gridTemplate.deleteMany({ where: { id: targetId, workspaceId } })
      return
    case 'INSPIRATION':
      await prisma.inspirationItem.deleteMany({ where: { id: targetId, workspaceId } })
      return
  }
}

export async function approveDeletion(workspaceId: string, id: string, resolvedBy: string) {
  const approval = await prisma.pendingApproval.findFirst({ where: { id, workspaceId } })
  if (!approval) throw new NotFoundError('Approval request not found')
  if (approval.resolution !== 'PENDING') throw new ConflictError('This request was already resolved')

  await deleteTarget(workspaceId, approval.targetType, approval.targetId)

  const resolved = await prisma.pendingApproval.update({
    where: { id },
    data: { resolution: 'APPROVED', resolvedBy, resolvedAt: new Date() },
  })
  return toApprovalView(resolved)
}

export async function rejectDeletion(workspaceId: string, id: string, resolvedBy: string) {
  const approval = await prisma.pendingApproval.findFirst({ where: { id, workspaceId } })
  if (!approval) throw new NotFoundError('Approval request not found')
  if (approval.resolution !== 'PENDING') throw new ConflictError('This request was already resolved')

  const resolved = await prisma.pendingApproval.update({
    where: { id },
    data: { resolution: 'REJECTED', resolvedBy, resolvedAt: new Date() },
  })
  return toApprovalView(resolved)
}
