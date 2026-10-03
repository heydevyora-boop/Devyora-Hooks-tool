/**
 * Thin fetch wrapper for the real backend (Chunks 3–5). `credentials:
 * 'include'` is required on every call — the backend's session is an
 * httpOnly cookie, and the frontend/backend are different ports (same
 * site, different origin), so fetch won't send it otherwise.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

/**
 * Registered by AuthProvider so any API call, anywhere in the app, that
 * comes back 401 (session expired/invalid) clears the stale client-side
 * session and lets ProtectedRoute's redirect-to-login take over — rather
 * than every page having to special-case an expired session itself.
 */
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fields?: Record<string, string>

  constructor(status: number, message: string, code?: string, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.()
    const error = body?.error
    throw new ApiError(response.status, error?.message ?? 'Request failed', error?.code, error?.fields)
  }

  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, payload?: unknown) =>
    request<T>(path, { method: 'POST', body: payload !== undefined ? JSON.stringify(payload) : undefined }),
  patch: <T>(path: string, payload?: unknown) =>
    request<T>(path, { method: 'PATCH', body: payload !== undefined ? JSON.stringify(payload) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
