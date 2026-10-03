import type { DirectorSceneOutput, HookVariationOutput } from './generationContent.builder.js'

/**
 * Applies a single piece of typed or dictated feedback to an
 * already-generated version — a direct backend port of the frontend's
 * regenerateWithFeedback. Keyword-matched against the feedback text —
 * genuinely reads it rather than ignoring it, while staying honest about
 * being rule-based rather than a real language model.
 */

function applySceneFeedback(scene: DirectorSceneOutput, lowerFeedback: string, productName: string): DirectorSceneOutput {
  if (lowerFeedback.includes('product')) {
    return { ...scene, visual: `${scene.visual ?? ''} Keep ${productName} clearly in frame throughout.`.trim() }
  }
  if (lowerFeedback.includes('shoot') || lowerFeedback.includes('easier')) {
    return { ...scene, camera: scene.camera ? `${scene.camera} (single static setup)` : 'Single static setup' }
  }
  if (lowerFeedback.includes('similar') || lowerFeedback.includes('different')) {
    return { ...scene, dialogue: `${scene.dialogue} (Reworded for a fresh angle.)` }
  }
  return scene
}

function rebuildDerived(scenes: DirectorSceneOutput[]) {
  return {
    scenes,
    visualDirection: scenes.filter((s) => s.visual).map((s) => ({ sceneNumber: s.id, description: s.visual! })),
    brollPlan: scenes.filter((s) => s.broll).map((s) => ({ sceneNumber: s.id, description: s.broll! })),
    onScreenText: scenes.filter((s) => s.overlay).map((s) => s.overlay!),
  }
}

export interface RegenerationResult {
  hooks?: HookVariationOutput[]
  scenes?: DirectorSceneOutput[]
  visualDirection?: { sceneNumber: number; description: string }[]
  brollPlan?: { sceneNumber: number; description: string }[]
  onScreenText?: string[]
  caption?: string
  cta?: string
}

export function applyRegenerationFeedback(
  current: { hooks: HookVariationOutput[]; scenes: DirectorSceneOutput[]; caption: string; cta: string },
  productName: string,
  targetLabel: string,
  feedback: string,
): RegenerationResult {
  const lower = feedback.toLowerCase()

  if (targetLabel.startsWith('Hook')) {
    if (current.hooks.length <= 1) return {}
    const [first, ...rest] = current.hooks
    const hooks = lower.includes('generic')
      ? [{ ...rest[0]!, selected: true, label: 'Hook #1 Selected' }, { ...first!, selected: false, label: 'Hook #2' }, ...rest.slice(1)]
      : [...current.hooks].reverse().map((hook, index) => ({
          ...hook,
          selected: index === 0,
          label: index === 0 ? 'Hook #1 Selected' : `Hook #${index + 1}`,
        }))
    return { hooks }
  }

  if (targetLabel.startsWith('Scene')) {
    const sceneNumber = Number(targetLabel.replace('Scene ', ''))
    const scenes = current.scenes.map((scene) => (scene.id === sceneNumber ? applySceneFeedback(scene, lower, productName) : scene))
    return rebuildDerived(scenes)
  }

  if (targetLabel === 'Visual Direction' || targetLabel === 'B-Roll Plan') {
    const scenes = current.scenes.map((scene) => applySceneFeedback(scene, lower, productName))
    return rebuildDerived(scenes)
  }

  if (targetLabel === 'Caption') {
    return {
      caption: lower.includes('short') ? current.caption.split('\n\n')[0]! : `${current.caption}\n\n(Regenerated per feedback: "${feedback}")`,
    }
  }

  if (targetLabel === 'CTA') {
    return {
      cta:
        lower.includes('urgent') || lower.includes('strong')
          ? `${current.cta} — limited spots this week`
          : current.cta.replace(/ — .*/, ''),
    }
  }

  return {}
}
