import { api } from './client'

/**
 * Best-effort bridge from a locally-known product *name* (Content Hub's
 * Product Knowledge isn't wired to the backend yet — out of scope for
 * this chunk) to a real backend Product id, so a generation request can
 * still pull real Product Knowledge context when one genuinely exists.
 * Returns null rather than guessing when no exact match is found —
 * generation then just proceeds without that context source.
 */
export async function findProductIdByName(name: string): Promise<string | undefined> {
  if (!name.trim()) return undefined
  try {
    const { items } = await api.get<{ items: { id: string; name: string }[] }>(
      `/products?q=${encodeURIComponent(name)}&limit=5`,
    )
    return items.find((item) => item.name.toLowerCase() === name.toLowerCase())?.id
  } catch {
    return undefined
  }
}
