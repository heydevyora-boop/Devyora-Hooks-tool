import { api } from './client'

export interface AdminUserView {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  avatarUrl?: string
  lastLoginAt?: string
  createdAt: string
}

export interface CreateUserInput {
  username: string
  email: string
  password: string
  role?: 'admin' | 'user'
}

export interface AdminSettingsView {
  workspace: { id: string; name: string; plan: string; seatLimit: number }
  brand: unknown
  virality: { metricLabel: string; threshold: number }
  integrations: { instagram: { connected: boolean; configured: boolean } & Record<string, unknown> }
}

export function listUsers(): Promise<AdminUserView[]> {
  return api.get<{ items: AdminUserView[] }>('/admin/users?limit=100').then((r) => r.items)
}

export function createUser(input: CreateUserInput): Promise<AdminUserView> {
  return api.post<{ user: AdminUserView }>('/admin/users', input).then((r) => r.user)
}

export function updateUserRole(id: string, role: 'admin' | 'user'): Promise<AdminUserView> {
  return api.patch<{ user: AdminUserView }>(`/admin/users/${id}/role`, { role }).then((r) => r.user)
}

export function getAdminSettings(): Promise<AdminSettingsView> {
  return api.get<{ settings: AdminSettingsView }>('/admin/settings').then((r) => r.settings)
}
