import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { NotFoundError, ValidationError } from '../lib/errors.js'
import { analyzeContentGaps } from './gapEngine.service.js'
import type { CreateStrategyInput, UpdateStrategyInput } from '../validation/strategy.schema.js'
import type { ContentStrategy, GridSlot, Product, StrategySequenceSlot, StrategyStatus } from '@prisma/client'

type StrategyWithRelations = ContentStrategy & {
  products: { productId: string }[]
  sequence: (StrategySequenceSlot & { product: Product | null })[]
}

const STATUS_TO_DB: Record<string, StrategyStatus> = {
  draft: 'DRAFT',
  active: 'ACTIVE',
  completed: 'COMPLETED',
  archived: 'ARCHIVED',
}
const STATUS_FROM_DB: Record<StrategyStatus, string> = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
}

const CONTENT_TYPE_FROM_DB: Record<GridSlot['contentType'], string> = {
  REEL: 'reel',
  CAROUSEL: 'carousel',
  STATIC: 'static',
  STORY: 'story',
  EMPTY: 'empty',
}

/** Matches the frontend's ContentStrategyPlan exactly — `input` is
 * reconstructed from the persisted row rather than stored verbatim, so it
 * always reflects the strategy's real current product list. */
export function toStrategyView(strategy: StrategyWithRelations) {
  return {
    id: strategy.id,
    input: {
      goal: strategy.goal,
      durationWeeks: strategy.durationWeeks,
      postingFrequency: strategy.postingFrequency,
      productIds: strategy.products.map((p) => p.productId),
      objective: strategy.objective ?? '',
    },
    contentGaps: strategy.contentGaps as string[],
    opportunities: strategy.opportunitiesSummary as string[],
    sequence: strategy.sequence
      .sort((a, b) => a.position - b.position)
      .map((slot) => ({
        id: slot.id,
        weekLabel: slot.weekLabel,
        product: slot.product?.name ?? 'Unassigned',
        contentType: CONTENT_TYPE_FROM_DB[slot.contentType],
        reason: slot.reason,
      })),
    generatedAt: strategy.generatedAt.toISOString(),
    // Extra fields beyond the frontend's strict type — additive only.
    status: STATUS_FROM_DB[strategy.status],
    audience: strategy.audience ?? undefined,
    gridTemplateId: strategy.gridTemplateId ?? undefined,
    startDate: strategy.startDate.toISOString().slice(0, 10),
    endDate: strategy.endDate.toISOString().slice(0, 10),
  }
}

const includeRelations = {
  products: { select: { productId: true } },
  sequence: { include: { product: true } },
} as const

function parseFrequencyPerWeek(frequency: string): number {
  const match = frequency.match(/(\d+)/)
  return match ? Number(match[1]) : 3
}

const FALLBACK_ROTATION: GridSlot['contentType'][] = ['REEL', 'CAROUSEL', 'STATIC']

export async function listStrategies(
  workspaceId: string,
  opts: { limit: number; cursor?: string; status?: string },
) {
  const rows = await prisma.contentStrategy.findMany({
    where: { workspaceId, ...(opts.status ? { status: STATUS_TO_DB[opts.status] } : {}) },
    include: includeRelations,
    orderBy: { generatedAt: 'desc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })

  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toStrategyView), nextCursor }
}

export async function getStrategy(workspaceId: string, id: string) {
  const strategy = await prisma.contentStrategy.findFirst({ where: { id, workspaceId }, include: includeRelations })
  if (!strategy) throw new NotFoundError('Content strategy not found')
  return toStrategyView(strategy)
}

/**
 * Deterministic, rule-based strategy generation — a direct backend port
 * of the frontend's generateStrategy.ts, now driven by real stored
 * products/history/grid data instead of client-held state. Real gaps come
 * from the Gap Engine; nothing here is fabricated.
 */
export async function createStrategy(workspaceId: string, generatedBy: string, input: CreateStrategyInput) {
  const products = await prisma.product.findMany({ where: { workspaceId, id: { in: input.productIds } } })
  if (products.length !== input.productIds.length) {
    throw new ValidationError('Validation failed', { productIds: 'One or more products were not found' })
  }

  const gridTemplate = input.gridTemplateId
    ? await prisma.gridTemplate.findFirst({
        where: { id: input.gridTemplateId, workspaceId },
        include: { slots: true },
      })
    : await prisma.workspaceActiveGrid
        .findUnique({ where: { workspaceId }, include: { gridTemplate: { include: { slots: true } } } })
        .then((active) => active?.gridTemplate ?? null)
  if (input.gridTemplateId && !gridTemplate) {
    throw new ValidationError('Validation failed', { gridTemplateId: 'Grid template not found' })
  }

  const gaps = await analyzeContentGaps(workspaceId, input.productIds)
  const contentGaps =
    gaps.length > 0
      ? gaps.map((gap) => gap.message)
      : ['No major gaps detected — every selected product already has content history.']

  const opportunities: string[] = []
  opportunities.push(
    gridTemplate
      ? `Sequence aligns with your "${gridTemplate.name}" grid structure.`
      : 'Select a grid in Content Hub to align this plan to your publishing structure.',
  )
  if (input.objective) opportunities.push(`Plan is oriented around: ${input.objective}.`)

  const frequencyPerWeek = parseFrequencyPerWeek(input.postingFrequency)
  const totalSlots = Math.min(Math.max(input.durationWeeks * frequencyPerWeek, 1), 20)
  const gridRotation = (gridTemplate?.slots ?? [])
    .sort((a, b) => a.position - b.position)
    .map((slot) => slot.contentType)
    .filter((type) => type !== 'EMPTY')
  const rotation = gridRotation.length > 0 ? gridRotation : FALLBACK_ROTATION

  const sequenceData = Array.from({ length: totalSlots }, (_, i) => {
    const week = Math.floor(i / frequencyPerWeek) + 1
    const product = products[i % products.length]!
    const contentType = rotation[i % rotation.length]!
    const reason = contentGaps.some((gap) => gap.includes(product.name))
      ? `Fills the content gap for ${product.name}`
      : `Keeps ${product.name} in rotation per your ${input.postingFrequency} cadence`
    return { position: i, weekLabel: `Week ${week}`, productId: product.id, contentType, reason }
  })

  const startDate = input.startDate ?? new Date()
  const endDate = new Date(startDate.getTime() + input.durationWeeks * 7 * 86_400_000)
  const contentTypes = Array.from(new Set(sequenceData.map((s) => s.contentType)))

  const strategy = await prisma.contentStrategy.create({
    data: {
      workspaceId,
      goal: input.goal,
      objective: input.objective,
      durationWeeks: input.durationWeeks,
      postingFrequency: input.postingFrequency,
      audience: input.audience,
      contentTypes,
      gridTemplateId: gridTemplate?.id,
      startDate,
      endDate,
      contentGaps,
      opportunitiesSummary: opportunities,
      generatedBy,
      products: { create: products.map((p) => ({ productId: p.id })) },
      sequence: { create: sequenceData },
    },
    include: includeRelations,
  })
  return toStrategyView(strategy)
}

export async function updateStrategy(workspaceId: string, id: string, input: UpdateStrategyInput) {
  const existing = await prisma.contentStrategy.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('Content strategy not found')

  const strategy = await prisma.contentStrategy.update({
    where: { id },
    data: { ...(input.status !== undefined ? { status: STATUS_TO_DB[input.status] } : {}) },
    include: includeRelations,
  })
  return toStrategyView(strategy)
}
