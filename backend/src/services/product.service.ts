import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { NotFoundError } from '../lib/errors.js'
import type { ProductInput, ProductUpdateInput } from '../validation/product.schema.js'
import type { Product } from '@prisma/client'

/**
 * Maps the Prisma row onto the exact shape of the frontend's
 * `ProductKnowledge` type (Chunk 2 blueprint §10 — frontend types are the
 * contract source of truth), so the frontend's data-fetching layer needs
 * no translation beyond swapping its storage call for a fetch call.
 */
export function toProductKnowledge(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    features: product.features as string[],
    benefits: product.benefits as string[],
    applications: product.applications as string[],
    sellingPoints: product.sellingPoints as string[],
    targetAudience: product.targetAudience,
    limitations: product.limitations as string[],
    contentAngles: product.contentAngles as string[],
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

export async function listProducts(workspaceId: string, opts: { limit: number; cursor?: string; q?: string }) {
  const rows = await prisma.product.findMany({
    where: {
      workspaceId,
      ...(opts.q
        ? {
            OR: [
              { name: { contains: opts.q, mode: 'insensitive' } },
              { description: { contains: opts.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })

  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toProductKnowledge), nextCursor }
}

export async function getProduct(workspaceId: string, id: string) {
  const product = await prisma.product.findFirst({ where: { id, workspaceId } })
  // 404, not 403, if it belongs to another workspace — never confirm it exists.
  if (!product) throw new NotFoundError('Product not found')
  return toProductKnowledge(product)
}

export async function createProduct(workspaceId: string, createdBy: string, input: ProductInput) {
  const product = await prisma.product.create({
    data: { workspaceId, createdBy, ...input },
  })
  return toProductKnowledge(product)
}

export async function updateProduct(workspaceId: string, id: string, input: ProductUpdateInput) {
  const existing = await prisma.product.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('Product not found')

  const product = await prisma.product.update({ where: { id }, data: input })
  return toProductKnowledge(product)
}
