import { api } from './client'
import type { InstagramConnection } from '../types'

export function getInstagramStatus(): Promise<InstagramConnection> {
  return api.get<{ connection: InstagramConnection }>('/integrations/instagram/status').then((r) => r.connection)
}

export function connectInstagram(): Promise<{ oauthUrl: string }> {
  return api.post<{ oauthUrl: string }>('/integrations/instagram/connect')
}

export function syncInstagram(): Promise<InstagramConnection> {
  return api.post<{ connection: InstagramConnection }>('/integrations/instagram/sync').then((r) => r.connection)
}

export function disconnectInstagram(): Promise<void> {
  return api.delete('/integrations/instagram')
}
