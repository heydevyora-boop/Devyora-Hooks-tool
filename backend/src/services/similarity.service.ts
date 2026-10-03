import { prisma } from '../lib/prisma.js'

export interface SimilarityWarning {
  field: 'topic' | 'hook' | 'angle' | 'script' | 'product' | 'format'
  similarTo: { type: 'content_history' | 'generated_content'; id: string; label: string }
  similarityScore: number
  message: string
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with', 'is', 'are', 'this', 'that',
  'it', 'as', 'at', 'by', 'be', 'your', 'you', 'how', 'what', 'why', 'here', 'our', 'we', 'their',
])

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  )
}

/** Jaccard similarity over normalized word sets — simple, deterministic,
 * and inspectable. Not a semantic/ML comparison, so it will miss
 * paraphrases and can false-flag coincidental word overlap; that's an
 * honest limitation, not hidden from callers (see message copy). */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const word of a) if (b.has(word)) intersection += 1
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

const WARNING_THRESHOLD = 0.45

function formatsMatch(historyFormat: string, candidateFormat: string): boolean {
  return historyFormat.toLowerCase() === candidateFormat.toLowerCase()
}

/**
 * Compares a candidate generation against this workspace's real Historical
 * Content and previously-generated content to flag repetitive topics,
 * hooks, angles, scripts, products, and formats — a reduction aid, never
 * a uniqueness guarantee. See the Chunk 5 instruction: "Do not claim
 * guaranteed uniqueness."
 */
export async function findSimilarityWarnings(
  workspaceId: string,
  candidate: { topic: string; hook: string; angle: string; script: string; productName?: string; format?: string },
  excludeGeneratedContentId?: string,
): Promise<SimilarityWarning[]> {
  const warnings: SimilarityWarning[] = []

  const [historyRows, generatedRows] = await Promise.all([
    prisma.contentHistory.findMany({
      where: { workspaceId },
      include: { product: true },
      orderBy: { publishedDate: 'desc' },
      take: 50,
    }),
    prisma.generatedContent.findMany({
      where: { workspaceId, ...(excludeGeneratedContentId ? { id: { not: excludeGeneratedContentId } } : {}) },
      include: { product: true, versions: { orderBy: { version: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const topicTokens = tokenize(candidate.topic)
  const hookAngleTokens = tokenize(`${candidate.hook} ${candidate.angle}`)
  const scriptTokens = tokenize(candidate.script)

  for (const row of historyRows) {
    const label = row.title

    const topicScore = jaccard(topicTokens, tokenize(`${row.title} ${row.topic}`))
    if (topicScore >= WARNING_THRESHOLD) {
      warnings.push({
        field: 'topic',
        similarTo: { type: 'content_history', id: row.id, label },
        similarityScore: Math.round(topicScore * 100) / 100,
        message: `This topic overlaps ${Math.round(topicScore * 100)}% with "${label}" in your Historical Content — consider a different angle.`,
      })
    }

    if (row.hook) {
      const hookScore = jaccard(hookAngleTokens, tokenize(row.hook))
      if (hookScore >= WARNING_THRESHOLD) {
        warnings.push({
          field: 'hook',
          similarTo: { type: 'content_history', id: row.id, label },
          similarityScore: Math.round(hookScore * 100) / 100,
          message: `This hook overlaps ${Math.round(hookScore * 100)}% with the hook used in "${label}".`,
        })
      }
    }

    if (candidate.productName && row.product?.name === candidate.productName && candidate.format && formatsMatch(row.format, candidate.format)) {
      warnings.push({
        field: 'product',
        similarTo: { type: 'content_history', id: row.id, label },
        similarityScore: 1,
        message: `Same product ("${candidate.productName}") and format ("${candidate.format}") as "${label}" — consider varying one of them.`,
      })
    }
  }

  for (const row of generatedRows) {
    const latest = row.versions[0]
    if (!latest) continue
    const label = row.topic

    const topicScore = jaccard(topicTokens, tokenize(row.topic))
    if (topicScore >= WARNING_THRESHOLD) {
      warnings.push({
        field: 'topic',
        similarTo: { type: 'generated_content', id: row.id, label },
        similarityScore: Math.round(topicScore * 100) / 100,
        message: `This topic overlaps ${Math.round(topicScore * 100)}% with a previously generated piece: "${label}".`,
      })
    }

    const scriptScore = jaccard(scriptTokens, tokenize(latest.script))
    if (scriptScore >= WARNING_THRESHOLD) {
      warnings.push({
        field: 'script',
        similarTo: { type: 'generated_content', id: row.id, label },
        similarityScore: Math.round(scriptScore * 100) / 100,
        message: `This script overlaps ${Math.round(scriptScore * 100)}% with a previously generated script for "${label}".`,
      })
    }
  }

  return warnings
}
