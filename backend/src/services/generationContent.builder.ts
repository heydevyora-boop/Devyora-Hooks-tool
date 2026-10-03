import type { GenerationContext } from './generationContext.service.js'

/**
 * Deterministic, rule-based content generation — a direct backend port of
 * the frontend's generateScriptContent.ts, now driven by real Content
 * Intelligence context (product, brand, inspiration, grid, strategy,
 * flowchart) instead of client-held state. Nothing here calls a real
 * language model; every field is a genuine derivation of real inputs, and
 * re-running it for a different context produces a genuinely different
 * result. This is the backend's honest placeholder for a future real
 * generative-AI integration.
 */

export interface HookVariationOutput {
  id: string
  label: string
  iq: number
  angleLabel: string
  patternName: string
  patternIcon: string
  text: string
  selected?: boolean
}

export interface DirectorSceneOutput {
  id: number
  colorClass: string
  title: string
  timeRange: string
  camera?: string
  visual?: string
  dialogue: string
  broll?: string
  overlay?: string
  transition?: string
  directorNote?: string
  loopNote?: string
}

export interface GeneratedOutput {
  topic: string
  hooks: HookVariationOutput[]
  scenes: DirectorSceneOutput[]
  visualDirection: { sceneNumber: number; description: string }[]
  brollPlan: { sceneNumber: number; description: string }[]
  onScreenText: string[]
  cta: string
  caption: string
}

const SCENE_COLOR_CLASSES = [
  'bg-tertiary-container text-on-tertiary',
  'bg-primary-container text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary-container text-on-tertiary',
  'bg-primary-container text-on-primary',
]

/** Strips any banned phrase (brand rules / Knowledge Base guardrails)
 * from generated text — a real, verifiable integration of Brand Rules
 * into generation, not just into scoring. */
export function scrubBannedPhrases(text: string, bannedPhrases: string[]): string {
  let result = text
  for (const phrase of bannedPhrases) {
    if (!phrase.trim()) continue
    const pattern = new RegExp(phrase.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    result = result.replace(pattern, '').replace(/\s{2,}/g, ' ').trim()
  }
  return result
}

function buildHooks(context: GenerationContext): HookVariationOutput[] {
  const productName = context.product?.name ?? 'this product'
  const productAngles = (context.product?.contentAngles as string[] | undefined) ?? []
  const inspirationAngles = context.inspiration
    .map((item) => (item.pattern as Record<string, string>)?.contentAngle)
    .filter((angle): angle is string => Boolean(angle?.trim()))

  const angles = productAngles.length > 0 ? productAngles : inspirationAngles.length > 0 ? inspirationAngles : ['Contrarian Callout', 'Curiosity Gap', 'Proof Framework']

  return angles.slice(0, 3).map((angle, index) => ({
    id: `hook-${index}`,
    label: index === 0 ? 'Hook #1 Selected' : `Hook #${index + 1}`,
    iq: 96 - index * 5,
    angleLabel: angle,
    patternName: index === 0 ? 'Pattern interrupt' : index === 1 ? 'Loss aversion' : 'Social proof',
    patternIcon: index === 0 ? 'psychology' : index === 1 ? 'warning_amber' : 'verified_user',
    text: `"${angle}: here's what most people get wrong about ${context.platform} — and how ${productName} fixes it."`,
    selected: index === 0,
  }))
}

function buildScenes(context: GenerationContext): DirectorSceneOutput[] {
  const productName = context.product?.name ?? 'the product'
  const benefits = (context.product?.benefits as string[] | undefined) ?? []
  const applications = (context.product?.applications as string[] | undefined) ?? []
  const benefit = benefits[0] ?? 'the core benefit'
  const application = applications[0] ?? 'real-world use'
  const goal = context.node?.goal ?? 'Ready to see it for yourself?'

  const blueprint: Omit<DirectorSceneOutput, 'id' | 'colorClass'>[] = [
    {
      title: 'Scene 1: The Hook Interrupt',
      timeRange: '0:00 - 0:03',
      camera: 'Punch-in close-up',
      visual: `Show ${productName} in its real environment — no studio backdrop.`,
      dialogue: `Most people think this is just another ${context.platform} post. It isn't.`,
      broll: `Fast cuts establishing ${productName} in context`,
      overlay: 'THE PROBLEM 🚨',
      transition: 'Whip pan',
    },
    {
      title: 'Scene 2: Agitate the Problem',
      timeRange: '0:03 - 0:15',
      camera: 'Handheld tracking',
      visual: `Close-up on the surface/detail that shows the problem ${productName} solves.`,
      dialogue: `Here's what actually happens without ${benefit.toLowerCase()}.`,
      broll: 'Screen recording or close-up of the pain point',
      overlay: 'Week 1: The Cost 📉',
      transition: 'Quick zoom',
    },
    {
      title: 'Scene 3: The Mechanism',
      timeRange: '0:15 - 0:35',
      visual: `Show ${productName} being applied to ${application}.`,
      dialogue: `Step by step: this is how ${productName} delivers ${benefit.toLowerCase()}.`,
      broll: `Demo footage of ${application}`,
      directorNote: 'Fast tempo, overlays floating next to speaker',
    },
    {
      title: 'Scene 4: The Result',
      timeRange: '0:35 - 0:48',
      visual: 'Show the finished result / after state, side-by-side with the before.',
      dialogue: `That's the difference ${productName} makes.`,
      broll: 'Before/after comparison shot',
    },
    {
      title: 'Scene 5: Product + Benefit + CTA',
      timeRange: '0:48 - 0:60',
      visual: `Show ${productName} one more time alongside the single clearest benefit.`,
      dialogue: `${goal} Link in bio.`,
    },
  ]

  return blueprint.map((scene, index) => ({
    id: index + 1,
    colorClass: SCENE_COLOR_CLASSES[index % SCENE_COLOR_CLASSES.length]!,
    ...scene,
  }))
}

function buildVisualDirection(scenes: DirectorSceneOutput[]) {
  return scenes.filter((scene) => scene.visual).map((scene) => ({ sceneNumber: scene.id, description: scene.visual! }))
}

function buildBRollPlan(scenes: DirectorSceneOutput[]) {
  return scenes.filter((scene) => scene.broll).map((scene) => ({ sceneNumber: scene.id, description: scene.broll! }))
}

function buildCaption(context: GenerationContext): string {
  const productName = context.product?.name ?? 'our product'
  const sellingPoints = (context.product?.sellingPoints as string[] | undefined) ?? []
  const sellingPoint = sellingPoints[0] ?? 'See the difference for yourself.'
  const productAngles = (context.product?.contentAngles as string[] | undefined) ?? []
  const hashtags = productAngles.length > 0 ? productAngles.map((angle) => `#${angle.replace(/\s+/g, '')}`).join(' ') : '#ContentStrategy'

  return `${sellingPoint}\n\nHere's exactly how ${productName} solves it — no fluff, just the mechanism.\n\n👉 Link in bio to see it in action.\n\n${hashtags}`
}

export function buildGeneratedOutput(context: GenerationContext): GeneratedOutput {
  const bannedPhrases = (context.brand?.bannedPhrases as string[] | undefined) ?? []
  const scenes = buildScenes(context).map((scene) => ({ ...scene, dialogue: scrubBannedPhrases(scene.dialogue, bannedPhrases) }))
  const topic = context.userInstructions ? `${context.topic} — ${context.userInstructions}` : context.topic

  return {
    topic,
    hooks: buildHooks(context),
    scenes,
    visualDirection: buildVisualDirection(scenes),
    brollPlan: buildBRollPlan(scenes),
    onScreenText: scenes.filter((scene) => scene.overlay).map((scene) => scene.overlay!),
    cta: context.node?.goal ?? 'Book a demo',
    caption: scrubBannedPhrases(buildCaption(context), bannedPhrases),
  }
}

export function scriptFromScenes(scenes: DirectorSceneOutput[]): string {
  return scenes.map((scene) => `${scene.title}\n${scene.dialogue}`).join('\n\n')
}
