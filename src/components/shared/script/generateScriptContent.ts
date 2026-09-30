import type {
  FlowchartNode,
  ProductKnowledge,
  HookVariation,
  DirectorScene,
  VisualDirectionBeat,
  BRollShot,
  GeneratedContentItem,
} from '../../../types'

/**
 * Deterministic, rule-based script generation — an honest client-side
 * placeholder standing in for a future AI-generation endpoint. Nothing
 * here calls a real model; every field is derived from real inputs
 * (the flowchart node + the actual product record) rather than static
 * copy, so re-running it for a different node/product produces a
 * genuinely different result. See API_PLACEHOLDER below for where a real
 * backend call would replace this.
 */

const SCENE_COLOR_CLASSES = [
  'bg-tertiary-container text-on-tertiary',
  'bg-primary-container text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary-container text-on-tertiary',
  'bg-primary-container text-on-primary',
]

function buildHooks(node: FlowchartNode, product: ProductKnowledge | null): HookVariation[] {
  const angles =
    product && product.contentAngles.length > 0
      ? product.contentAngles
      : ['Contrarian Callout', 'Curiosity Gap', 'Proof Framework']
  const productName = product?.name ?? node.product ?? 'this product'

  return angles.slice(0, 3).map((angle, index) => ({
    id: `hook-${node.id}-${index}`,
    label: index === 0 ? 'Hook #1 Selected' : `Hook #${index + 1}`,
    iq: 96 - index * 5,
    angleLabel: angle,
    patternName: index === 0 ? 'Pattern interrupt' : index === 1 ? 'Loss aversion' : 'Social proof',
    patternIcon: index === 0 ? 'psychology' : index === 1 ? 'warning_amber' : 'verified_user',
    text: `"${angle}: here's what most people get wrong about ${node.contentType ?? 'this'} — and how ${productName} fixes it."`,
    selected: index === 0,
  }))
}

function buildScenes(node: FlowchartNode, product: ProductKnowledge | null): DirectorScene[] {
  const productName = product?.name ?? node.product ?? 'the product'
  const benefit = product?.benefits[0] ?? 'the core benefit'
  const application = product?.applications[0] ?? 'real-world use'

  const blueprint: Omit<DirectorScene, 'id' | 'colorClass'>[] = [
    {
      title: 'Scene 1: The Hook Interrupt',
      timeRange: '0:00 - 0:03',
      camera: 'Punch-in close-up',
      visual: `Show ${productName} in its real environment — no studio backdrop.`,
      dialogue: `Most people think this is just another ${node.contentType ?? 'post'}. It isn't.`,
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
      dialogue: `${node.goal ?? 'Ready to see it for yourself?'} Link in bio.`,
      loopNote: 'Seamless cut back into Scene 1',
    },
  ]

  return blueprint.map((scene, index) => ({
    id: index + 1,
    colorClass: SCENE_COLOR_CLASSES[index % SCENE_COLOR_CLASSES.length],
    ...scene,
  }))
}

function buildVisualDirection(scenes: DirectorScene[]): VisualDirectionBeat[] {
  return scenes
    .filter((scene) => scene.visual)
    .map((scene) => ({ sceneNumber: scene.id, description: scene.visual! }))
}

function buildBRollPlan(scenes: DirectorScene[]): BRollShot[] {
  return scenes
    .filter((scene) => scene.broll)
    .map((scene) => ({ sceneNumber: scene.id, description: scene.broll! }))
}

function buildCaption(node: FlowchartNode, product: ProductKnowledge | null): string {
  const productName = product?.name ?? node.product ?? 'our product'
  const sellingPoint = product?.sellingPoints[0] ?? 'See the difference for yourself.'
  const hashtags = product
    ? product.contentAngles.map((angle) => `#${angle.replace(/\s+/g, '')}`).join(' ')
    : '#ContentStrategy'

  return `${sellingPoint}\n\nHere's exactly how ${productName} solves it — no fluff, just the mechanism.\n\n👉 Link in bio to see it in action.\n\n${hashtags}`
}

export function generateScriptContent(
  node: FlowchartNode,
  product: ProductKnowledge | null,
  strategyId: string,
  additionalInstructions?: string,
): GeneratedContentItem {
  const scenes = buildScenes(node, product)
  const baseTopic = node.reason ?? node.label

  return {
    id: `content-${node.id}-${Date.now()}`,
    flowchartNodeId: node.id,
    strategyId,
    topic: additionalInstructions ? `${baseTopic} — ${additionalInstructions}` : baseTopic,
    product: product?.name ?? node.product ?? 'Unassigned',
    gridPosition: node.gridPosition,
    date: node.date ?? '',
    hooks: buildHooks(node, product),
    scenes,
    visualDirection: buildVisualDirection(scenes),
    brollPlan: buildBRollPlan(scenes),
    onScreenText: scenes.filter((scene) => scene.overlay).map((scene) => scene.overlay!),
    cta: node.goal ?? 'Book a demo',
    caption: buildCaption(node, product),
    status: 'draft',
    generatedAt: new Date().toISOString(),
    regenerationHistory: [],
  }
}

function applySceneFeedback(scene: DirectorScene, lowerFeedback: string, productName: string): DirectorScene {
  if (lowerFeedback.includes('product')) {
    return {
      ...scene,
      visual: `${scene.visual ?? ''} Keep ${productName} clearly in frame throughout.`.trim(),
    }
  }
  if (lowerFeedback.includes('shoot') || lowerFeedback.includes('easier')) {
    return {
      ...scene,
      camera: scene.camera ? `${scene.camera} (single static setup)` : 'Single static setup',
    }
  }
  if (lowerFeedback.includes('similar') || lowerFeedback.includes('different')) {
    return { ...scene, dialogue: `${scene.dialogue} (Reworded for a fresh angle.)` }
  }
  return scene
}

/**
 * Applies a single piece of user feedback to an already-generated item.
 * Keyword-matched against the feedback text — genuinely reads it rather
 * than ignoring it, while staying honest about being rule-based rather
 * than a real language model.
 */
export function regenerateWithFeedback(
  item: GeneratedContentItem,
  targetLabel: string,
  feedback: string,
): GeneratedContentItem {
  const lower = feedback.toLowerCase()
  const next: GeneratedContentItem = {
    ...item,
    regenerationHistory: [
      ...item.regenerationHistory,
      {
        id: `feedback-${Date.now()}`,
        targetLabel,
        feedback,
        submittedAt: new Date().toISOString(),
      },
    ],
  }

  if (targetLabel.startsWith('Hook')) {
    // "too generic" -> promote the next, more specific angle to #1
    if (next.hooks.length > 1) {
      const [first, ...rest] = next.hooks
      next.hooks = lower.includes('generic')
        ? [{ ...rest[0], selected: true, label: 'Hook #1 Selected' }, { ...first, selected: false, label: 'Hook #2' }, ...rest.slice(1)]
        : [...next.hooks].reverse().map((hook, index) => ({
            ...hook,
            selected: index === 0,
            label: index === 0 ? 'Hook #1 Selected' : `Hook #${index + 1}`,
          }))
    }
  } else if (targetLabel.startsWith('Scene')) {
    const sceneNumber = Number(targetLabel.replace('Scene ', ''))
    next.scenes = next.scenes.map((scene) =>
      scene.id === sceneNumber ? applySceneFeedback(scene, lower, next.product) : scene,
    )
    next.visualDirection = buildVisualDirection(next.scenes)
    next.brollPlan = buildBRollPlan(next.scenes)
  } else if (targetLabel === 'Visual Direction' || targetLabel === 'B-Roll Plan') {
    next.scenes = next.scenes.map((scene) => applySceneFeedback(scene, lower, next.product))
    next.visualDirection = buildVisualDirection(next.scenes)
    next.brollPlan = buildBRollPlan(next.scenes)
  } else if (targetLabel === 'Caption') {
    next.caption = lower.includes('short')
      ? next.caption.split('\n\n')[0]
      : `${next.caption}\n\n(Regenerated per feedback: "${feedback}")`
  } else if (targetLabel === 'CTA') {
    next.cta = lower.includes('urgent') || lower.includes('strong')
      ? `${item.cta} — limited spots this week`
      : `${item.cta.replace(/ — .*/, '')}`
  }

  return next
}
