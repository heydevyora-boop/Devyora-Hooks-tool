import type {
  ContentStrategyInput,
  ContentStrategyPlan,
  ContentHistoryItem,
  ProductKnowledge,
  GridTemplate,
  StrategyContentSlot,
  GridSlotContentType,
} from '../../../types'

function parseFrequencyPerWeek(frequency: string): number {
  const match = frequency.match(/(\d+)/)
  return match ? Number(match[1]) : 3
}

const FALLBACK_ROTATION: GridSlotContentType[] = ['reel', 'carousel', 'static']

/**
 * Deterministic, rule-based plan generation — an honest client-side
 * placeholder standing in for a future AI-generation endpoint (none of
 * this app's "Generate" actions call a real backend yet). It is
 * genuinely a function of real data (selected products, history, and the
 * active grid), not a static mock.
 */
export function generateContentStrategy(
  input: ContentStrategyInput,
  products: ProductKnowledge[],
  history: ContentHistoryItem[],
  activeGrid: GridTemplate | null,
  startOffset = 0,
): ContentStrategyPlan {
  const selectedProducts = products.filter((product) => input.productIds.includes(product.id))
  const productNames = selectedProducts.map((product) => product.name)

  const contentGaps: string[] = []
  for (const product of selectedProducts) {
    const hasHistory = history.some((item) => item.product === product.name)
    if (!hasHistory) {
      contentGaps.push(`No content yet for ${product.name}`)
    }
  }
  if (contentGaps.length === 0 && selectedProducts.length > 0) {
    contentGaps.push('No major gaps detected — every selected product already has content history.')
  }

  const opportunities: string[] = []
  if (activeGrid) {
    opportunities.push(`Sequence aligns with your "${activeGrid.name}" grid structure.`)
  } else {
    opportunities.push('Select a grid in Content Hub to align this plan to your publishing structure.')
  }
  if (input.objective) {
    opportunities.push(`Plan is oriented around: ${input.objective}.`)
  }

  const frequencyPerWeek = parseFrequencyPerWeek(input.postingFrequency)
  const totalSlots = Math.min(Math.max(input.durationWeeks * frequencyPerWeek, 1), 20)
  const rotation: GridSlotContentType[] =
    activeGrid && activeGrid.slots.length > 0
      ? activeGrid.slots.map((slot) => slot.contentType).filter((type) => type !== 'empty')
      : FALLBACK_ROTATION
  const effectiveRotation = rotation.length > 0 ? rotation : FALLBACK_ROTATION

  const sequence: StrategyContentSlot[] = []
  for (let i = 0; i < totalSlots; i += 1) {
    const week = Math.floor(i / frequencyPerWeek) + 1
    const product =
      productNames.length > 0
        ? productNames[(i + startOffset) % productNames.length]
        : 'Unassigned'
    const contentType = effectiveRotation[(i + startOffset) % effectiveRotation.length]
    sequence.push({
      id: `slot-${Date.now()}-${i}`,
      weekLabel: `Week ${week}`,
      product,
      contentType,
      reason:
        contentGaps.some((gap) => gap.includes(product))
          ? `Fills the content gap for ${product}`
          : `Keeps ${product} in rotation per your ${input.postingFrequency} cadence`,
    })
  }

  return {
    id: `strategy-${Date.now()}`,
    input,
    contentGaps,
    opportunities,
    sequence,
    generatedAt: new Date().toISOString(),
  }
}
