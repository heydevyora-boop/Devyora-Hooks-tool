import { createContext } from 'react'
import type { AuthUser } from '../types'

type AuthStatus = 'idle' | 'loading' | 'error'

export interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
