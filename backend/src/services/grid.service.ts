import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { NotFoundError, ValidationError } from '../lib/errors.js'
import type { CreateGridTemplateInput, SlotInput, UpdateGridTemplateInput } from '../validation/grid.schema.js'
import type { GridSlot, GridTemplate, Product } from '@prisma/client'

type SlotWithProduct = GridSlot & { product: Product | null }
type TemplateWithSlots = GridTemplate & { slots: SlotWithProduct[] }

const CONTENT_TYPE_TO_DB: Record<string, GridSlot['contentType']> = {
  reel: 'REEL',
  carousel: 'CAROUSEL',
  static: 'STATIC',
  story: 'STORY',
  empty: 'EMPTY',
}
const CONTENT_TYPE_FROM_DB: Record<GridSlot['contentType'], string> = {
  REEL: 'reel',
  CAROUSEL: 'carousel',
  STATIC: 'static',
  STORY: 'story',
  EMPTY: 'empty',
}

/** Matches the frontend's GridTemplate/GridSlotDefinition shape exactly. */
export function toGridTemplateView(template: TemplateWithSlots) {
  return {
    id: template.id,
    name: template.name,
    description: template.description ?? undefined,
    isPreset: template.isPreset,
    slots: template.slots
      .sort((a, b) => a.position - b.position)
      .map((slot) => ({
        id: slot.id,
        position: slot.position,
        contentType: CONTENT_TYPE_FROM_DB[slot.contentType],
        productRef: slot.product?.name,
        label: slot.label ?? undefined,
      })),
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  }
}

async function resolveProductIdByName(workspaceId: string, name: string): Promise<string> {
  const product = await prisma.product.findFirst({ where: { workspaceId, name: { equals: name, mode: 'insensitive' } } })
  if (!product) throw new ValidationError('Validation failed', { 'slots.productRef': `Unknown product "${name}"` })
  return product.id
}

async function buildSlotCreateData(workspaceId: string, slots: SlotInput[]) {
  return Promise.all(
    slots.map(async (slot) => ({
      position: slot.position,
      contentType: CONTENT_TYPE_TO_DB[slot.contentType]!,
      productId: slot.productRef ? await resolveProductIdByName(workspaceId, slot.productRef) : null,
      label: slot.label,
    })),
  )
}

const includeSlots = { slots: { include: { product: true } } } as const

export async function listGridTemplates(workspaceId: string, opts: { limit: number; cursor?: string }) {
  const rows = await prisma.gridTemplate.findMany({
    where: { workspaceId },
    include: includeSlots,
    orderBy: { createdAt: 'desc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })

  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toGridTemplateView), nextCursor }
}

export async function getGridTemplate(workspaceId: string, id: string) {
  const template = await prisma.gridTemplate.findFirst({ where: { id, workspaceId }, include: includeSlots })
  if (!template) throw new NotFoundError('Grid template not found')
  return toGridTemplateView(template)
}

export async function createGridTemplate(workspaceId: string, createdBy: string, input: CreateGridTemplateInput) {
  const slotData = await buildSlotCreateData(workspaceId, input.slots)
  const template = await prisma.gridTemplate.create({
    data: {
      workspaceId,
      name: input.name,
      description: input.description,
      createdBy,
      slots: { create: slotData },
    },
    include: includeSlots,
  })
  return toGridTemplateView(template)
}

export async function updateGridTemplate(workspaceId: string, id: string, input: UpdateGridTemplateInput) {
  const existing = await prisma.gridTemplate.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('Grid template not found')

  const slotData = input.slots ? await buildSlotCreateData(workspaceId, input.slots) : undefined

  const template = await prisma.$transaction(async (tx) => {
    if (slotData) {
      await tx.gridSlot.deleteMany({ where: { gridTemplateId: id } })
    }
    return tx.gridTemplate.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(slotData ? { slots: { create: slotData } } : {}),
      },
      include: includeSlots,
    })
  })
  return toGridTemplateView(template)
}

export async function duplicateGridTemplate(workspaceId: string, createdBy: string, id: string) {
  const source = await prisma.gridTemplate.findFirst({ where: { id, workspaceId }, include: includeSlots })
  if (!source) throw new NotFoundError('Grid template not found')

  const template = await prisma.gridTemplate.create({
    data: {
      workspaceId,
      name: `${source.name} (Copy)`,
      description: source.description,
      createdBy,
      isPreset: false,
      slots: {
        create: source.slots.map((slot) => ({
          position: slot.position,
          contentType: slot.contentType,
          productId: slot.productId,
          label: slot.label,
        })),
      },
    },
    include: includeSlots,
  })
  return toGridTemplateView(template)
}

export async function getActiveGrid(workspaceId: string) {
  const active = await prisma.workspaceActiveGrid.findUnique({
    where: { workspaceId },
    include: { gridTemplate: { include: includeSlots } },
  })
  return active ? toGridTemplateView(active.gridTemplate) : null
}

export async function activateGrid(workspaceId: string, setBy: string, gridTemplateId: string) {
  const template = await prisma.gridTemplate.findFirst({ where: { id: gridTemplateId, workspaceId } })
  if (!template) throw new NotFoundError('Grid template not found')

  await prisma.workspaceActiveGrid.upsert({
    where: { workspaceId },
    create: { workspaceId, gridTemplateId, setBy },
    update: { gridTemplateId, setBy, setAt: new Date() },
  })
  return getActiveGrid(workspaceId)
}

export async function deactivateGrid(workspaceId: string) {
  await prisma.workspaceActiveGrid.deleteMany({ where: { workspaceId } })
}
