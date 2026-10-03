import { useState, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { authenticate, endSession } from './authService'
import { AuthContext, type AuthContextValue } from './authContext'
import type { AuthUser } from '../types'

type AuthStatus = AuthContextValue['status']

/**
 * Session state lives in the same localStorage-backed persistence every
 * other piece of this app's state uses (usePersistentState) — this is a
 * frontend session only, not a secure/signed token, matching authService's
 * "not production security" placeholder status.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = usePersistentState<AuthUser | null>('devyora-auth-session', null)
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [error, setError] = useState<string | null>(null)

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
