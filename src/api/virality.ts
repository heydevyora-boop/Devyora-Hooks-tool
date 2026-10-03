import { api } from './client'
import type { ViralitySettings } from '../types'

export function getViralityConfig(): Promise<ViralitySettings> {
  return api.get<{ config: ViralitySettings }>('/virality-config').then((r) => r.config)
}

export function updateViralityConfig(input: ViralitySettings): Promise<ViralitySettings> {
  return api.patch<{ config: ViralitySettings }>('/virality-config', input).then((r) => r.config)
}
