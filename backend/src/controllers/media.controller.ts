import type { FastifyReply, FastifyRequest } from 'fastify'
import { ValidationError } from '../lib/errors.js'
import { storage } from '../services/storage.service.js'
import * as mediaService from '../services/media.service.js'

export async function uploadMedia(request: FastifyRequest, reply: FastifyReply) {
  const file = await request.file()
  if (!file) {
    throw new ValidationError('No file provided', { file: 'required' })
  }

  // `?kind=screenshot` lets the client tag an image upload's provenance
  // (screenshot vs. regular image) — everything else is inferred from
  // mime type server-side regardless of what's passed here.
  const { kind: kindHint } = request.query as { kind?: string }

  const asset = await mediaService.uploadMediaAsset({
    workspaceId: request.principal!.workspaceId,
    uploadedBy: request.principal!.userId,
    filename: file.filename,
    mimeType: file.mimetype,
    kindHint,
    stream: file.file,
  })

  return reply.status(201).send({ asset })
}

export async function downloadMedia(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const asset = await mediaService.getMediaAssetForDownload(request.principal!.workspaceId, id)

  // `originalFilename` is user-supplied and stored verbatim — escape it
  // for safe use inside a quoted Content-Disposition value rather than
  // trusting it to never contain a `"` or `\`.
  const safeFilename = asset.originalFilename.replace(/[\\"]/g, '\\$&')
  reply.header('Content-Type', asset.mimeType)
  reply.header('Content-Disposition', `inline; filename="${safeFilename}"`)
  return reply.send(storage.readStream(asset.storageKey))
}
