import type { Readable } from 'node:stream'
import { prisma } from '../lib/prisma.js'
import { storage } from './storage.service.js'
import { ValidationError, NotFoundError } from '../lib/errors.js'
import { env } from '../config/env.js'
import type { MediaKind } from '@prisma/client'

const DOCUMENT_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

/**
 * Server-side mime-type allowlist — the frontend's FileDropzone `accept`
 * string is a UX hint only, never trusted (Chunk 2 blueprint §2.4). The
 * caller can request `screenshot` explicitly (an image, just tagged by
 * provenance) via `kindHint`; everything else is inferred from mime type.
 */
export function resolveMediaKind(mimeType: string, kindHint?: string): MediaKind {
  if (mimeType === 'application/pdf') return 'PDF'
  if (DOCUMENT_MIME_TYPES.has(mimeType)) return 'DOCUMENT'
  if (mimeType.startsWith('video/')) return 'VIDEO'
  if (mimeType.startsWith('audio/')) return 'AUDIO'
  if (mimeType.startsWith('image/')) return kindHint === 'screenshot' ? 'SCREENSHOT' : 'IMAGE'
  throw new ValidationError('Unsupported file type', { mimeType: 'must be an image, video, audio, PDF, or document' })
}

export function toMediaAssetView(asset: { id: string; mimeType: string; kind: string; fileSizeBytes: number; originalFilename: string; createdAt: Date }) {
  return {
    id: asset.id,
    mimeType: asset.mimeType,
    kind: asset.kind,
    fileSizeBytes: asset.fileSizeBytes,
    filename: asset.originalFilename,
    url: `/api/v1/media/${asset.id}/file`,
    createdAt: asset.createdAt.toISOString(),
  }
}

export async function uploadMediaAsset(params: {
  workspaceId: string
  uploadedBy: string
  filename: string
  mimeType: string
  kindHint?: string
  stream: Readable
}) {
  const kind = resolveMediaKind(params.mimeType, params.kindHint)

  const { storageKey, fileSizeBytes } = await storage.saveStream({
    workspaceId: params.workspaceId,
    filename: params.filename,
    stream: params.stream,
  })

  if (fileSizeBytes > env.MAX_UPLOAD_BYTES) {
    await storage.delete(storageKey)
    throw new ValidationError('File exceeds the maximum upload size')
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      workspaceId: params.workspaceId,
      uploadedBy: params.uploadedBy,
      storageKey,
      mimeType: params.mimeType,
      kind,
      fileSizeBytes,
      originalFilename: params.filename,
    },
  })

  return toMediaAssetView(asset)
}

export async function getMediaAssetForDownload(workspaceId: string, id: string) {
  const asset = await prisma.mediaAsset.findFirst({ where: { id, workspaceId } })
  if (!asset) throw new NotFoundError('File not found')
  return asset
}
