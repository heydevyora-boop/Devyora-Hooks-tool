import { useEffect, useState } from 'react'
import { getViralityConfig, updateViralityConfig } from '../api/virality'
import { defaultViralitySettings } from '../data/mockSettings'
import type { ViralitySettings } from '../types'

/**
 * Reads the real, admin-configurable virality threshold from the backend
 * (Chunk 5) — every "Virality Potential" label in the app reads from this
 * single source instead of a per-page local copy. Falls back to the
 * documented default while loading or if the backend can't be reached, so
 * the UI never looks broken offline.
 */
export function useViralityConfig() {
  const [settings, setSettings] = useState<ViralitySettings>(defaultViralitySettings)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    getViralityConfig()
      .then((config) => {
        if (!cancelled) setSettings(config)
      })
      .catch(() => {
        // Keep the default — the admin can still set a real one once reachable.
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const save = async (next: ViralitySettings) => {
    setSettings(next)
    try {
      const saved = await updateViralityConfig(next)
      setSettings(saved)
    } catch {
      // Optimistic local update stands; the next successful save reconciles it.
    }
  }

  return { settings, loaded, save }
}
