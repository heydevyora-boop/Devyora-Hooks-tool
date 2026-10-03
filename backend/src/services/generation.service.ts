import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { ConflictError, NotFoundError } from '../lib/errors.js'
import { buildGenerationContext } from './generationContext.service.js'
import { buildGeneratedOutput, scriptFromScenes, type DirectorSceneOutput, type HookVariationOutput } from './generationContent.builder.js'
import { applyRegenerationFeedback } from './generationRegenerate.builder.js'
import { findSimilarityWarnings } from './similarity.service.js'
import { computeVideoBlueprintScore } from './videoBlueprint.service.js'
import { getOrCreateViralityConfig } from './virality.service.js'
import type { GenerateContentInput, RegenerateInput, RejectInput } from '../validation/generation.schema.js'
import { Prisma } from '@prisma/client'
import type {
  ApprovalStage,
  ContentHistoryFormat,
  GeneratedContent,
  GeneratedContentVersion,
  GridSlotContentType,
  Product,
  RegenerationReasonOrigin,
  VideoBlueprintScore,
} from '@prisma/client'

type ContentWithRelations = GeneratedContent & {
  product: Product | null
  versions: (GeneratedContentVersion & { blueprintScore: VideoBlueprintScore | null })[]
}

const STAGE_FROM_DB: Record<ApprovalStage, string> = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  REVIEW: 'review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
}

/** The frontend's GeneratedContentStatus only has three values — collapse
 * the fuller backend lifecycle onto it for exact type compatibility; the
 * real stage is also exposed separately (see `stage` below). */
const LEGACY_STATUS: Record<ApprovalStage, 'draft' | 'approved' | 'saved'> = {
  DRAFT: 'draft',
  GENERATED: 'draft',
  REVIEW: 'draft',
  APPROVED: 'approved',
  PUBLISHED: 'saved',
  ARCHIVED: 'saved',
}

const includeRelations = {
  product: true,
  versions: { orderBy: { version: 'asc' }, include: { blueprintScore: true } },
} satisfies Prisma.GeneratedContentInclude

/** Matches the frontend's GeneratedContentItem shape exactly, plus extra
 * additive fields (stage, similarityWarnings, contextSourcesUsed, …) that
 * a strict consumer simply ignores. */
export function toGeneratedContentView(content: ContentWithRelations) {
  const latest = content.versions[content.versions.length - 1]!
  const regenerationHistory = content.versions
    .filter((v) => v.version > 1)
    .map((v) => ({
      id: v.id,
      targetLabel: v.regenerationTarget ?? 'Full Script',
      feedback: v.regenerationReason ?? '',
      submittedAt: v.createdAt.toISOString(),
    }))

  return {
    id: content.id,
    flowchartNodeId: content.flowchartNodeId ?? '',
    strategyId: content.strategyId ?? '',
    topic: content.topic,
    product: content.product?.name ?? 'Unassigned',
    gridPosition: content.gridPosition ?? undefined,
    date: content.dateLabel ?? '',
    hooks: latest.hooks,
    scenes: latest.scenes,
    visualDirection: latest.visualDirection,
    brollPlan: latest.brollPlan,
    onScreenText: latest.onScreenText,
    cta: latest.cta,
    caption: latest.caption,
    status: LEGACY_STATUS[content.stage],
    generatedAt: content.createdAt.toISOString(),
    regenerationHistory,
    // --- extra fields beyond the frontend's strict type ---
    stage: STAGE_FROM_DB[content.stage],
    version: latest.version,
    platform: content.platform,
    similarityWarnings: latest.similarityWarnings,
    userInstructions: content.userInstructions ?? undefined,
    contextSourcesUsed: content.contextSourcesUsed,
    rejectionReason: content.rejectionReason ?? undefined,
    approvedAt: content.approvedAt?.toISOString(),
    publishedAt: content.publishedAt?.toISOString(),
    contentHistoryId: content.contentHistoryId ?? undefined,
    updatedAt: content.updatedAt.toISOString(),
  }
}

function colorClassFor(value: number): string {
  if (value >= 85) return 'text-emerald-600'
  if (value >= 70) return 'text-primary'
  if (value >= 50) return 'text-secondary'
  return 'text-error'
}

/** Matches the frontend ScoreCard component's props shape exactly. */
export function toBlueprintView(score: VideoBlueprintScore) {
  const genericDisplay = 100 - score.genericAiScore
  const metrics = [
    { label: 'Hook Strength', value: `${score.hookStrength}%`, colorClass: colorClassFor(score.hookStrength) },
    { label: 'Retention Pot.', value: `${score.retentionPotential}%`, colorClass: colorClassFor(score.retentionPotential) },
    { label: 'Specificity', value: `${score.specificity}%`, colorClass: colorClassFor(score.specificity) },
    { label: 'Authority', value: `${score.authority}%`, colorClass: colorClassFor(score.authority) },
    { label: 'Brand Fit', value: `${score.brandFit}%`, colorClass: colorClassFor(score.brandFit) },
    { label: 'Natural Speech', value: `${score.naturalSpeech}%`, colorClass: colorClassFor(score.naturalSpeech) },
    { label: 'CTA Clarity', value: `${score.ctaClarity}%`, colorClass: colorClassFor(score.ctaClarity) },
    { label: 'Visual Pot.', value: `${score.visualPotential}%`, colorClass: colorClassFor(score.visualPotential) },
    {
      label: 'Generic AI',
      value: `${genericDisplay}% Clean`,
      colorClass: genericDisplay <= 30 ? 'text-emerald-700' : colorClassFor(score.genericAiScore),
      highlight: genericDisplay <= 30,
    },
  ]

  return {
    score: score.viralityPotential,
    tierLabel: score.tierLabel,
    tierBadge: score.tierBadge,
    diagnosis: score.diagnosis,
    metrics,
    viralityThresholdLabel: `${score.viralityMetricLabel} ≥ ${score.viralityThreshold.toLocaleString()}`,
  }
}

const GRID_CONTENT_TYPE_TO_HISTORY_FORMAT: Record<GridSlotContentType, ContentHistoryFormat> = {
  REEL: 'REEL',
  CAROUSEL: 'CAROUSEL',
  STATIC: 'STATIC',
  STORY: 'STORY',
  EMPTY: 'STATIC',
}
const PLATFORM_TO_HISTORY_FORMAT: Record<string, ContentHistoryFormat> = {
  reels: 'REEL',
  shorts: 'REEL',
  tiktok: 'REEL',
  linkedin: 'VIDEO',
  instagram: 'REEL',
}

function contentTypeToHistoryFormat(gridContentType: GridSlotContentType | null, platform: string): ContentHistoryFormat {
  if (gridContentType) return GRID_CONTENT_TYPE_TO_HISTORY_FORMAT[gridContentType]
  return PLATFORM_TO_HISTORY_FORMAT[platform.toLowerCase()] ?? 'STATIC'
}

export async function listGenerations(workspaceId: string, opts: { limit: number; cursor?: string; stage?: string }) {
  const rows = await prisma.generatedContent.findMany({
    where: { workspaceId, ...(opts.stage ? { stage: opts.stage.toUpperCase() as ApprovalStage } : {}) },
    include: includeRelations,
    orderBy: { createdAt: 'desc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })
  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toGeneratedContentView), nextCursor }
}

export async function getGeneration(workspaceId: string, id: string) {
  const content = await prisma.generatedContent.findFirst({ where: { id, workspaceId }, include: includeRelations })
  if (!content) throw new NotFoundError('Generated content not found')
  return toGeneratedContentView(content)
}

export async function getGenerationByFlowchartNode(workspaceId: string, flowchartNodeId: string) {
  const content = await prisma.generatedContent.findFirst({ where: { flowchartNodeId, workspaceId }, include: includeRelations })
  return content ? toGeneratedContentView(content) : null
}

export async function listVersions(workspaceId: string, id: string) {
  const content = await prisma.generatedContent.findFirst({ where: { id, workspaceId } })
  if (!content) throw new NotFoundError('Generated content not found')

  const versions = await prisma.generatedContentVersion.findMany({
    where: { generatedContentId: id },
    include: { blueprintScore: true },
    orderBy: { version: 'asc' },
  })

  return versions.map((v) => ({
    id: v.id,
    version: v.version,
    parentVersionId: v.parentVersionId ?? undefined,
    hook: v.hook,
    angle: v.angle,
    script: v.script,
    hooks: v.hooks,
    scenes: v.scenes,
    visualDirection: v.visualDirection,
    brollPlan: v.brollPlan,
    onScreenText: v.onScreenText,
    cta: v.cta,
    caption: v.caption,
    similarityWarnings: v.similarityWarnings,
    regenerationReason: v.regenerationReason ?? undefined,
    regenerationReasonOrigin: v.regenerationReasonOrigin?.toLowerCase(),
    regenerationTarget: v.regenerationTarget ?? undefined,
    createdBy: v.createdBy ?? undefined,
    createdAt: v.createdAt.toISOString(),
    blueprintScore: v.blueprintScore ? toBlueprintView(v.blueprintScore) : undefined,
  }))
}

export async function generate(workspaceId: string, userId: string, input: GenerateContentInput) {
  const context = await buildGenerationContext(workspaceId, input)

  if (context.node) {
    const existing = await prisma.generatedContent.findUnique({ where: { flowchartNodeId: context.node.id } })
    if (existing) throw new ConflictError('This flowchart node already has generated content — use regenerate instead')
  }

  const output = buildGeneratedOutput(context)
  const script = scriptFromScenes(output.scenes)
  const selectedHook = output.hooks.find((h) => h.selected) ?? output.hooks[0]
  const format = contentTypeToHistoryFormat(context.node?.contentType ?? null, context.platform)

  const similarityWarnings = await findSimilarityWarnings(workspaceId, {
    topic: output.topic,
    hook: selectedHook?.text ?? '',
    angle: selectedHook?.angleLabel ?? '',
    script,
    productName: context.product?.name,
    format,
  })

  const viralityConfig = await getOrCreateViralityConfig(workspaceId)
  const bannedPhrases = (context.brand?.bannedPhrases as string[] | undefined) ?? []
  const blueprint = computeVideoBlueprintScore(
    {
      hook: selectedHook?.text ?? '',
      angle: selectedHook?.angleLabel ?? '',
      script,
      caption: output.caption,
      cta: output.cta,
      sceneCount: output.scenes.length,
      visualDirectionCount: output.visualDirection.length,
      brollPlanCount: output.brollPlan.length,
      bannedPhrases,
    },
    ((context.product?.sellingPoints as string[] | undefined) ?? []).length,
    ((context.product?.benefits as string[] | undefined) ?? []).length,
  )

  const created = await prisma.generatedContent.create({
    data: {
      workspaceId,
      flowchartNodeId: context.node?.id,
      strategyId: context.strategyIdResolved,
      productId: context.productIdResolved,
      platform: context.platform,
      topic: output.topic,
      gridPosition: context.gridPosition,
      dateLabel: context.dateLabel,
      userInstructions: context.userInstructions,
      contextSourcesUsed: context.contextSourcesUsed,
      generatedBy: userId,
      versions: {
        create: {
          version: 1,
          hook: selectedHook?.text ?? '',
          angle: selectedHook?.angleLabel ?? '',
          script,
          hooks: output.hooks as unknown as Prisma.InputJsonValue,
          scenes: output.scenes as unknown as Prisma.InputJsonValue,
          visualDirection: output.visualDirection as unknown as Prisma.InputJsonValue,
          brollPlan: output.brollPlan as unknown as Prisma.InputJsonValue,
          onScreenText: output.onScreenText as unknown as Prisma.InputJsonValue,
          cta: output.cta,
          caption: output.caption,
          similarityWarnings: similarityWarnings as unknown as Prisma.InputJsonValue,
          createdBy: userId,
          blueprintScore: {
            create: {
              viralityPotential: blueprint.viralityPotential,
              tierLabel: blueprint.tierLabel,
              tierBadge: blueprint.tierBadge,
              diagnosis: blueprint.diagnosis,
              hookStrength: blueprint.hookStrength,
              retentionPotential: blueprint.retentionPotential,
              specificity: blueprint.specificity,
              authority: blueprint.authority,
              brandFit: blueprint.brandFit,
              naturalSpeech: blueprint.naturalSpeech,
              ctaClarity: blueprint.ctaClarity,
              visualPotential: blueprint.visualPotential,
              genericAiScore: blueprint.genericAiScore,
              viralityMetricLabel: viralityConfig.metricLabel,
              viralityThreshold: viralityConfig.threshold,
            },
          },
        },
      },
    },
    include: includeRelations,
  })

  return toGeneratedContentView(created)
}

export async function regenerate(workspaceId: string, userId: string, id: string, input: RegenerateInput) {
  const content = await prisma.generatedContent.findFirst({
    where: { id, workspaceId },
    include: { product: true, versions: { orderBy: { version: 'desc' }, take: 1 } },
  })
  if (!content) throw new NotFoundError('Generated content not found')
  if (content.stage === 'PUBLISHED' || content.stage === 'ARCHIVED') {
    throw new ConflictError(`Cannot regenerate content that is already ${content.stage.toLowerCase()}`)
  }
  const latest = content.versions[0]!

  const result = applyRegenerationFeedback(
    {
      hooks: latest.hooks as unknown as HookVariationOutput[],
      scenes: latest.scenes as unknown as DirectorSceneOutput[],
      caption: latest.caption,
      cta: latest.cta,
    },
    content.product?.name ?? 'Unassigned',
    input.targetLabel,
    input.reason,
  )

  const nextHooks = result.hooks ?? (latest.hooks as unknown as HookVariationOutput[])
  const nextScenes = result.scenes ?? (latest.scenes as unknown as DirectorSceneOutput[])
  const nextVisualDirection = result.visualDirection ?? (latest.visualDirection as unknown as { sceneNumber: number; description: string }[])
  const nextBrollPlan = result.brollPlan ?? (latest.brollPlan as unknown as { sceneNumber: number; description: string }[])
  const nextOnScreenText = result.onScreenText ?? (latest.onScreenText as unknown as string[])
  const nextCaption = result.caption ?? latest.caption
  const nextCta = result.cta ?? latest.cta
  const nextScript = result.scenes ? scriptFromScenes(result.scenes) : latest.script
  const selectedHook = nextHooks.find((h) => h.selected) ?? nextHooks[0]
  const format = contentTypeToHistoryFormat(null, content.platform)

  const similarityWarnings = await findSimilarityWarnings(
    workspaceId,
    {
      topic: content.topic,
      hook: selectedHook?.text ?? '',
      angle: selectedHook?.angleLabel ?? '',
      script: nextScript,
      productName: content.product?.name,
      format,
    },
    content.id,
  )

  const [viralityConfig, brand] = await Promise.all([
    getOrCreateViralityConfig(workspaceId),
    prisma.brandProfile.findUnique({ where: { workspaceId } }),
  ])
  const bannedPhrases = (brand?.bannedPhrases as string[] | undefined) ?? []
  const blueprint = computeVideoBlueprintScore(
    {
      hook: selectedHook?.text ?? '',
      angle: selectedHook?.angleLabel ?? '',
      script: nextScript,
      caption: nextCaption,
      cta: nextCta,
      sceneCount: nextScenes.length,
      visualDirectionCount: nextVisualDirection.length,
      brollPlanCount: nextBrollPlan.length,
      bannedPhrases,
    },
    ((content.product?.sellingPoints as string[] | undefined) ?? []).length,
    ((content.product?.benefits as string[] | undefined) ?? []).length,
  )

  const updated = await prisma.$transaction(async (tx) => {
    const version = await tx.generatedContentVersion.create({
      data: {
        generatedContentId: content.id,
        version: latest.version + 1,
        parentVersionId: latest.id,
        hook: selectedHook?.text ?? '',
        angle: selectedHook?.angleLabel ?? '',
        script: nextScript,
        hooks: nextHooks as unknown as Prisma.InputJsonValue,
        scenes: nextScenes as unknown as Prisma.InputJsonValue,
        visualDirection: nextVisualDirection as unknown as Prisma.InputJsonValue,
        brollPlan: nextBrollPlan as unknown as Prisma.InputJsonValue,
        onScreenText: nextOnScreenText as unknown as Prisma.InputJsonValue,
        cta: nextCta,
        caption: nextCaption,
        similarityWarnings: similarityWarnings as unknown as Prisma.InputJsonValue,
        regenerationReason: input.reason,
        regenerationReasonOrigin: input.reasonOrigin.toUpperCase() as RegenerationReasonOrigin,
        regenerationTarget: input.targetLabel,
        createdBy: userId,
      },
    })
    await tx.videoBlueprintScore.create({
      data: {
        generatedContentVersionId: version.id,
        viralityPotential: blueprint.viralityPotential,
        tierLabel: blueprint.tierLabel,
        tierBadge: blueprint.tierBadge,
        diagnosis: blueprint.diagnosis,
        hookStrength: blueprint.hookStrength,
        retentionPotential: blueprint.retentionPotential,
        specificity: blueprint.specificity,
        authority: blueprint.authority,
        brandFit: blueprint.brandFit,
        naturalSpeech: blueprint.naturalSpeech,
        ctaClarity: blueprint.ctaClarity,
        visualPotential: blueprint.visualPotential,
        genericAiScore: blueprint.genericAiScore,
        viralityMetricLabel: viralityConfig.metricLabel,
        viralityThreshold: viralityConfig.threshold,
      },
    })
    return tx.generatedContent.update({
      where: { id: content.id },
      data: { stage: 'GENERATED' },
      include: includeRelations,
    })
  })

  return toGeneratedContentView(updated)
}

export async function approve(workspaceId: string, userId: string, id: string) {
  const content = await prisma.generatedContent.findFirst({ where: { id, workspaceId } })
  if (!content) throw new NotFoundError('Generated content not found')
  if (content.stage !== 'GENERATED' && content.stage !== 'REVIEW') {
    throw new ConflictError(`Cannot approve content in the "${content.stage.toLowerCase()}" stage`)
  }

  const updated = await prisma.generatedContent.update({
    where: { id },
    data: {
      stage: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
      rejectionReason: null,
      rejectedBy: null,
      rejectedAt: null,
    },
    include: includeRelations,
  })
  return toGeneratedContentView(updated)
}

export async function reject(workspaceId: string, userId: string, id: string, input: RejectInput) {
  const content = await prisma.generatedContent.findFirst({ where: { id, workspaceId } })
  if (!content) throw new NotFoundError('Generated content not found')
  if (content.stage === 'PUBLISHED' || content.stage === 'ARCHIVED') {
    throw new ConflictError(`Cannot reject content in the "${content.stage.toLowerCase()}" stage`)
  }

  const updated = await prisma.generatedContent.update({
    where: { id },
    data: { stage: 'REVIEW', rejectedBy: userId, rejectedAt: new Date(), rejectionReason: input.reason },
    include: includeRelations,
  })
  return toGeneratedContentView(updated)
}

/**
 * "Save to Content Intelligence" — the explicit instruction "Approved
 * content should enter historical Content Intelligence" happens here: a
 * real ContentHistory row (source=GENERATED) is created, and the
 * originating flowchart node (if any) is marked done.
 */
export async function save(workspaceId: string, userId: string, id: string) {
  const content = await prisma.generatedContent.findFirst({
    where: { id, workspaceId },
    include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
  })
  if (!content) throw new NotFoundError('Generated content not found')
  if (content.stage !== 'APPROVED') {
    throw new ConflictError('Only approved content can be saved to Content Intelligence')
  }
  const latest = content.versions[0]!
  const format = contentTypeToHistoryFormat(null, content.platform)

  const updated = await prisma.$transaction(async (tx) => {
    const history = await tx.contentHistory.create({
      data: {
        workspaceId,
        productId: content.productId,
        title: content.topic,
        topic: content.topic,
        format,
        platform: content.platform,
        publishedDate: new Date(),
        hook: latest.hook,
        status: 'PUBLISHED',
        source: 'GENERATED',
        createdBy: userId,
      },
    })

    if (content.flowchartNodeId) {
      await tx.flowchartNode.update({ where: { id: content.flowchartNodeId }, data: { status: 'DONE' } })
    }

    return tx.generatedContent.update({
      where: { id },
      data: { stage: 'PUBLISHED', publishedBy: userId, publishedAt: new Date(), contentHistoryId: history.id },
      include: includeRelations,
    })
  })

  return toGeneratedContentView(updated)
}

export async function getVideoBlueprint(workspaceId: string, id: string) {
  const content = await prisma.generatedContent.findFirst({
    where: { id, workspaceId },
    include: { versions: { orderBy: { version: 'desc' }, take: 1, include: { blueprintScore: true } } },
  })
  if (!content) throw new NotFoundError('Generated content not found')
  const latest = content.versions[0]
  if (!latest?.blueprintScore) throw new NotFoundError('No video blueprint score available yet')
  return toBlueprintView(latest.blueprintScore)
}
