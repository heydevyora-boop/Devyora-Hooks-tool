import { api, ApiError } from '../api/client'
import type { AuthUser } from '../types'

/**
 * Real backend auth (Chunk 3's /auth/login + /auth/logout) — the session
 * itself is an httpOnly cookie the backend sets; nothing here stores a
 * token. `authenticate` returning null means "invalid credentials" to the
 * caller; any other failure (network, 5xx) is rethrown so the UI can show
 * a real error instead of silently treating it as a bad password.
 */
export async function authenticate(username: string, password: string): Promise<AuthUser | null> {
  try {
    const { user } = await api.post<{ user: { username: string; role: AuthUser['role'] } }>('/auth/login', {
      username,
      password,
    })
    return { username: user.username, role: user.role }
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export async function endSession(): Promise<void> {
  await api.post('/auth/logout').catch(() => {
    // Best-effort — the frontend clears its own session state regardless.
  })
}
