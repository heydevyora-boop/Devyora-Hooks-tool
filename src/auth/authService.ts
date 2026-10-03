import type { AuthUser } from '../types'

/**
 * There is no backend yet — this is a frontend placeholder standing in for
 * a real authentication API, following the same "clearly marked mock, never
 * presented as live" pattern used for script generation elsewhere in this
 * app (see generateScriptContent.ts).
 *
 * IMPORTANT — NOT PRODUCTION SECURITY:
 * Credentials checked here ship in the client bundle and are trivially
 * readable by anyone. This is fine for wiring up the login UI and the
 * admin/user routing structure, but it must never be mistaken for real
 * authentication. Before production, replace `authenticate` below with a
 * call to a real backend (e.g. POST /api/auth/login) that verifies a
 * hashed password server-side and returns a session token — nothing about
 * the login form, AuthContext, or ProtectedRoute needs to change for that
 * swap, only this function's body.
 */
const DEMO_CREDENTIALS: { username: string; password: string; role: AuthUser['role'] }[] = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' },
]

const MOCK_NETWORK_DELAY_MS = 700

export function authenticate(username: string, password: string): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const match = DEMO_CREDENTIALS.find(
        (credential) => credential.username === username && credential.password === password,
      )
      resolve(match ? { username: match.username, role: match.role } : null)
    }, MOCK_NETWORK_DELAY_MS)
  })
}
