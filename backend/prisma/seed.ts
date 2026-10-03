import { PrismaClient, type GridSlotContentType } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

/**
 * Seeds exactly the two demo accounts the existing frontend's
 * authService.ts already hardcodes (admin/admin123, user/user123) so the
 * real login UI can authenticate against this backend with zero frontend
 * changes. Idempotent — safe to re-run.
 */
async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Devyora Hooks',
      plan: 'pro',
      seatLimit: 5,
    },
  })

  const adminPasswordHash = await argon2.hash('admin123', { type: argon2.argon2id })
  const userPasswordHash = await argon2.hash('user123', { type: argon2.argon2id })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@devyora.local' },
    update: {},
    create: {
      workspaceId: workspace.id,
      email: 'admin@devyora.local',
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'user@devyora.local' },
    update: {},
    create: {
      workspaceId: workspace.id,
      email: 'user@devyora.local',
      username: 'user',
      passwordHash: userPasswordHash,
      role: 'USER',
    },
  })

  await prisma.brandProfile.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: {
      workspaceId: workspace.id,
      brandName: 'Devyora Hooks',
      voiceDescription: 'Direct, visceral, no corporate fluff. High conviction delivery.',
      bannedPhrases: ['Game changer', 'Fast-paced world', 'Unlock', 'Next-gen'],
    },
  })

  // Matches the frontend's existing mockKnowledge.ts seed product exactly,
  // so a freshly-connected frontend sees the same starting state it did
  // when it was reading from localStorage.
  await prisma.product.upsert({
    where: { id: '10000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000001',
      workspaceId: workspace.id,
      name: 'Devyora TrustEngine v2',
      description:
        'Continuous SOC2 compliance automation that maps AWS, GCP, and GitHub to controls and collects audit evidence daily.',
      features: ['1-click cloud sync', 'Continuous evidence collection', 'Auditor-ready exports'],
      benefits: ['Cuts SOC2 prep from months to weeks', 'Removes manual evidence hunting'],
      applications: ['Enterprise sales readiness', 'Series A/B fundraising diligence'],
      sellingPoints: ['9.8x ROAS on top-performing scripts', 'Zero-Knowledge verification'],
      targetAudience: 'Series A/B CTOs & SecOps Leads',
      limitations: ['Requires AWS/GCP/GitHub admin access to auto-map controls'],
      contentAngles: ['Contrarian Callout', 'Fear of Audit Failure', 'Proof Framework'],
      createdBy: admin.id,
    },
  })

  // Matches the frontend's existing mockGrid.ts presetGridTemplates
  // exactly, so "Predefined grids" keeps working once Content Grid reads
  // from the real backend instead of that local mock.
  const presetGrids: { id: string; name: string; description: string; slots: { position: number; contentType: GridSlotContentType; label?: string }[] }[] = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      name: '3-2-1 Rotation',
      description: 'Two Reels for reach, then a Carousel, then a Static post — repeat.',
      slots: (['REEL', 'REEL', 'CAROUSEL', 'STATIC', 'REEL', 'REEL', 'CAROUSEL', 'STATIC', 'REEL'] as GridSlotContentType[]).map(
        (contentType, position) => ({ position, contentType }),
      ),
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      name: 'Product Spotlight',
      description: 'Cycles evenly through your products so no single product dominates the grid.',
      slots: (
        [
          ['REEL', 'Product A'],
          ['CAROUSEL', 'Product B'],
          ['STATIC', 'Product C'],
          ['REEL', 'Product A'],
          ['CAROUSEL', 'Product B'],
          ['STATIC', 'Product C'],
          ['REEL', 'Product A'],
          ['CAROUSEL', 'Product B'],
          ['STATIC', 'Product C'],
        ] as [GridSlotContentType, string][]
      ).map(([contentType, label], position) => ({ position, contentType, label })),
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      name: 'Balanced Mix',
      description: 'An even split of Reels, Carousels, and Static posts across the grid.',
      slots: (['REEL', 'CAROUSEL', 'STATIC', 'CAROUSEL', 'STATIC', 'REEL', 'STATIC', 'REEL', 'CAROUSEL'] as GridSlotContentType[]).map(
        (contentType, position) => ({ position, contentType }),
      ),
    },
  ]

  for (const preset of presetGrids) {
    await prisma.gridTemplate.upsert({
      where: { id: preset.id },
      update: {},
      create: {
        id: preset.id,
        workspaceId: workspace.id,
        name: preset.name,
        description: preset.description,
        isPreset: true,
        createdBy: admin.id,
        slots: {
          create: preset.slots.map((slot) => ({
            position: slot.position,
            contentType: slot.contentType,
            label: slot.label,
          })),
        },
      },
    })
  }

  console.log('Seed complete:')
  console.log('  admin / admin123  (role: admin)')
  console.log('  user  / user123   (role: user)')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
