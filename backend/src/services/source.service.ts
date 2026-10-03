import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { NotFoundError } from '../lib/errors.js'
import type { CreateSourceInput } from '../validation/source.schema.js'
import type { ContentSource, ContentSourceType, ContentSourceStatus, MediaKind } from '@prisma/client'

function detectUrlType(url: string): Extract<ContentSourceType, 'INSTAGRAM_URL' | 'YOUTUBE_URL' | 'WEBSITE_URL' | 'OTHER_URL'> {
  if (/instagram\.com/i.test(url)) return 'INSTAGRAM_URL'
  if (/youtube\.com|youtu\.be/i.test(url)) return 'YOUTUBE_URL'
  if (/^https?:\/\//i.test(url)) return 'WEBSITE_URL'
  return 'OTHER_URL'
}

/** Maps an uploaded file's kind to the closest ContentSourceType bucket —
 * mirrors the frontend's own classifyFile(), whose `else` branch already
 * folds every non-image/video file into one bucket rather than
 * distinguishing document/pdf/audio at the source-type level. */
function sourceTypeForMediaKind(kind: MediaKind): ContentSourceType {
  switch (kind) {
    case 'IMAGE':
      return 'IMAGE'
    case 'SCREENSHOT':
      return 'SCREENSHOT'
    case 'VIDEO':
      return 'VIDEO'
    default:
      return 'PDF'
  }
}

/**
 * Best-effort, synchronous, short-timeout title fetch for URL sources —
 * deliberately NOT full scraping/extraction (that's real backend AI/ETL
 * work, explicitly out of scope this chunk per "do not implement advanced
 * AI generation yet"). Any failure here is expected and non-fatal: the
 * source is still valid with the URL itself as its title.
 */
async function fetchUrlTitle(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    const response = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    clearTimeout(timeout)
    if (!response.ok) return null

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) return null

    // Only read enough of the body to find <title> — never buffer a whole
    // page into memory for what is, today, a cosmetic title lookup.
    const reader = response.body?.getReader()
    if (!reader) return null
    let html = ''
    while (html.length < 8192) {
      const { done, value } = await reader.read()
      if (done) break
      html += Buffer.from(value).toString('utf-8')
    }
    await reader.cancel().catch(() => {})

    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    return match?.[1]?.trim().slice(0, 200) || null
  } catch {
    return null
  }
}

function defaultTitleFromUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').slice(0, 60)
}

export function toSourceView(source: ContentSource) {
  return {
    id: source.id,
    type: source.type.toLowerCase(),
    title: source.title,
    value: source.value,
    mediaAssetId: source.mediaAssetId,
    status: source.status.toLowerCase(),
    extractedContent: source.extractedContent,
    metadata: source.metadata,
    processingError: source.processingError,
    addedAt: source.addedAt.toISOString(),
  }
}

export async function listSources(
  workspaceId: string,
  opts: { limit: number; cursor?: string; type?: string; status?: string },
) {
  const rows = await prisma.contentSource.findMany({
    where: {
      workspaceId,
      ...(opts.type ? { type: opts.type.toUpperCase() as ContentSourceType } : {}),
      ...(opts.status ? { status: opts.status.toUpperCase() as ContentSourceStatus } : {}),
    },
    orderBy: { addedAt: 'desc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })

  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toSourceView), nextCursor }
}

export async function getSource(workspaceId: string, id: string) {
  const source = await prisma.contentSource.findFirst({ where: { id, workspaceId } })
  if (!source) throw new NotFoundError('Source not found')
  return toSourceView(source)
}

export async function createSource(workspaceId: string, addedBy: string, input: CreateSourceInput) {
  if (input.kind === 'url') {
    const type = detectUrlType(input.value)
    const title = (await fetchUrlTitle(input.value)) ?? defaultTitleFromUrl(input.value)
    const source = await prisma.contentSource.create({
      data: { workspaceId, addedBy, type, title, value: input.value, status: 'READY' },
    })
    return toSourceView(source)
  }

  if (input.kind === 'text') {
    const type: ContentSourceType = input.origin === 'speech' ? 'SPEECH' : 'TEXT'
    const title = input.value.length > 60 ? `${input.value.slice(0, 60)}…` : input.value
    const source = await prisma.contentSource.create({
      data: { workspaceId, addedBy, type, title, value: input.value, status: 'READY' },
    })
    return toSourceView(source)
  }

  // kind === 'file'
  const asset = await prisma.mediaAsset.findFirst({ where: { id: input.mediaAssetId, workspaceId } })
  if (!asset) throw new NotFoundError('Uploaded file not found')

  const source = await prisma.contentSource.create({
    data: {
      workspaceId,
      addedBy,
      type: sourceTypeForMediaKind(asset.kind),
      title: asset.originalFilename,
      value: asset.originalFilename,
      mediaAssetId: asset.id,
      // Images/video/pdf extraction (OCR/transcription) is real AI/ETL work,
      // deferred per this chunk's explicit scope — stays READY with no
      // extractedContent until that pipeline exists.
      status: 'READY',
    },
  })
  return toSourceView(source)
}

export async function deleteSource(workspaceId: string, id: string) {
  const existing = await prisma.contentSource.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('Source not found')
  await prisma.contentSource.delete({ where: { id } })
}
