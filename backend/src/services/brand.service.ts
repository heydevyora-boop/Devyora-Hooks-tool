import { prisma } from '../lib/prisma.js'
import type { BrandUpdateInput } from '../validation/brand.schema.js'
import type { BrandProfile } from '@prisma/client'

function toBrandInfo(profile: BrandProfile) {
  return {
    brandName: profile.brandName ?? '',
    voiceDescription: profile.voiceDescription ?? '',
    toneNotes: profile.toneNotes ?? '',
    bannedPhrases: profile.bannedPhrases as string[],
    updatedAt: profile.updatedAt.toISOString(),
  }
}

/** One row per workspace, created lazily on first read/write rather than
 * at workspace-creation time — avoids a second place workspace setup logic
 * has to remember to touch. */
export async function getOrCreateBrandProfile(workspaceId: string) {
  const existing = await prisma.brandProfile.findUnique({ where: { workspaceId } })
  if (existing) return toBrandInfo(existing)

  const created = await prisma.brandProfile.create({ data: { workspaceId } })
  return toBrandInfo(created)
}

export async function updateBrandProfile(workspaceId: string, updatedBy: string, input: BrandUpdateInput) {
  const profile = await prisma.brandProfile.upsert({
    where: { workspaceId },
    update: { ...input, updatedBy },
    create: { workspaceId, ...input, updatedBy },
  })
  return toBrandInfo(profile)
}
