import { prisma } from '../lib/prisma.js'
import type { UpdateViralityConfigInput } from '../validation/virality.schema.js'
import type { ViralityConfig } from '@prisma/client'

/** Matches the frontend's ViralitySettings type exactly. A labeling
 * threshold the admin defines for their team, never a guaranteed
 * prediction of future performance. */
export function toViralityConfigView(config: ViralityConfig) {
  return { metricLabel: config.metricLabel, threshold: config.threshold }
}

const DEFAULTS = { metricLabel: 'Organic Views', threshold: 50000 }

export async function getOrCreateViralityConfig(workspaceId: string): Promise<ViralityConfig> {
  const existing = await prisma.viralityConfig.findUnique({ where: { workspaceId } })
  if (existing) return existing
  return prisma.viralityConfig.create({ data: { workspaceId, ...DEFAULTS } })
}

export async function getViralityConfigView(workspaceId: string) {
  return toViralityConfigView(await getOrCreateViralityConfig(workspaceId))
}

export async function updateViralityConfig(workspaceId: string, updatedBy: string, input: UpdateViralityConfigInput) {
  const config = await prisma.viralityConfig.upsert({
    where: { workspaceId },
    create: { workspaceId, metricLabel: input.metricLabel, threshold: input.threshold, updatedBy },
    update: { metricLabel: input.metricLabel, threshold: input.threshold, updatedBy },
  })
  return toViralityConfigView(config)
}
