import { ApiError } from './client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

export interface MediaAssetView {
  id: string
  mimeType: string
  kind: string
  fileSizeBytes: number
  filename: string
  url: string
  createdAt: string
}

/** Multipart upload — can't go through the shared JSON `api` client. */
export async function uploadMedia(file: File, kindHint?: 'screenshot'): Promise<MediaAssetView> {
  const form = new FormData()
  form.append('file', file)

  const response = await fetch(`${API_BASE_URL}/media/upload${kindHint ? `?kind=${kindHint}` : ''}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(response.status, body?.error?.message ?? 'Upload failed', body?.error?.code, body?.error?.fields)
  }
  return body.asset as MediaAssetView
}
