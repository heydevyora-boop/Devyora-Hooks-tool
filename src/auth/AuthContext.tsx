import { useEffect, useState, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { authenticate, endSession } from './authService'
import { setUnauthorizedHandler } from '../api/client'
import { AuthContext, type AuthContextValue } from './authContext'
import type { AuthUser } from '../types'

type AuthStatus = AuthContextValue['status']

/**
 * The real session lives in the backend's httpOnly cookie (Chunk 3's
 * /auth/login + /auth/logout). This localStorage-backed `user` is only a
 * client-side cache of who's logged in, so the UI doesn't flash a logged-
 * out state on reload before any request round-trips — it carries no
 * authority of its own and is kept in sync with the real session by the
 * 401 handler below.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = usePersistentState<AuthUser | null>('devyora-auth-session', null)
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // A 401 means the real (cookie) session is already gone server-side —
    // just drop the stale client-side cache, no need to also call
    // /auth/logout (which would itself 401 and could loop).
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (username: string, password: string) => {
    setStatus('loading')
    setError(null)
    try {
      const result = await authenticate(username, password)
      if (result) {
        setUser(result)
        setStatus('idle')
        return true
      }
      // Deliberately generic — never reveal whether the username or the
      // password was the part that was wrong.
      setError('Invalid username or password.')
      setStatus('error')
      return false
    } catch {
      setError("Couldn't reach the server — try again in a moment.")
      setStatus('error')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setStatus('idle')
    setError(null)
    void endSession()
  }

  return (
    <AuthContext.Provider value={{ user, status, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
