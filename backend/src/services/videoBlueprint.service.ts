/**
 * Deterministic, rule-based scoring over real, inspectable signals in the
 * generated text itself — never a call to a real model, and never
 * presented as a guaranteed prediction of future performance. See the
 * Chunk 5 instruction: "These are analytical assessments, NOT guaranteed
 * future performance."
 */

const GENERIC_AI_PHRASES = [
  'game changer', 'game-changer', 'unlock', 'next-gen', 'next gen', "today's fast-paced world",
  'revolutionize', 'seamless', 'dive into', 'navigate the landscape', 'unparalleled',
  'elevate your', 'in conclusion', "it's important to note", "whether you're", 'look no further',
  'the world of', 'cutting-edge', 'leverage the power of', 'take your', 'to the next level',
  'in today\'s world', 'delve into', 'at the end of the day', 'game-changing',
]

const CTA_ACTION_VERBS = ['book', 'link in bio', 'comment', 'dm', 'sign up', 'download', 'shop now', 'learn more', 'try', 'get', 'join', 'swipe up', 'save this', 'share this']

export interface BlueprintCandidate {
  hook: string
  angle: string
  script: string
  caption: string
  cta: string
  sceneCount: number
  visualDirectionCount: number
  brollPlanCount: number
  bannedPhrases: string[]
}

export interface VideoBlueprintResult {
  viralityPotential: number
  tierLabel: string
  tierBadge: string
  diagnosis: string
  hookStrength: number
  retentionPotential: number
  specificity: number
  authority: number
  brandFit: number
  naturalSpeech: number
  ctaClarity: number
  visualPotential: number
  genericAiScore: number
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function countOccurrences(haystack: string, needles: string[]): number {
  const lower = haystack.toLowerCase()
  return needles.reduce((count, needle) => (lower.includes(needle.toLowerCase()) ? count + 1 : count), 0)
}

function scoreHookStrength(hook: string): number {
  let score = 55
  const words = hook.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 8 && words.length <= 28) score += 15
  if (/\d/.test(hook)) score += 10
  if (/\?/.test(hook)) score += 5
  if (/most people|actually|here's what|stop |nobody tells you/i.test(hook)) score += 15
  return clamp(score)
}

function scoreRetentionPotential(sceneCount: number, scriptWordCount: number): number {
  let score = 50
  if (sceneCount >= 4) score += 20
  if (sceneCount >= 5) score += 5
  if (scriptWordCount >= 60 && scriptWordCount <= 220) score += 15
  if (scriptWordCount > 320) score -= 10
  return clamp(score)
}

function scoreSpecificity(script: string, caption: string): number {
  const text = `${script} ${caption}`
  const words = text.split(/\s+/).filter(Boolean)
  const numberHits = (text.match(/\d+(\.\d+)?%?/g) ?? []).length
  const properNounHits = (text.match(/\b[A-Z][a-z]{2,}\b/g) ?? []).length
  const density = words.length === 0 ? 0 : (numberHits * 3 + properNounHits) / words.length
  return clamp(50 + density * 400)
}

function scoreAuthority(script: string, caption: string, sellingPointCount: number, benefitCount: number): number {
  const text = `${script} ${caption}`
  let score = 50 + sellingPointCount * 5 + benefitCount * 5
  score += countOccurrences(text, ['case study', 'data', 'results', 'customers', 'proven', 'research']) * 6
  return clamp(score)
}

function scoreBrandFit(script: string, caption: string, hook: string, bannedPhrases: string[]): number {
  if (bannedPhrases.length === 0) return 95
  const hits = countOccurrences(`${script} ${caption} ${hook}`, bannedPhrases)
  return clamp(100 - hits * 20)
}

function scoreNaturalSpeech(script: string): number {
  const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  if (sentences.length === 0) return 70
  const avgWordsPerSentence = script.split(/\s+/).filter(Boolean).length / sentences.length
  let score = 90
  if (avgWordsPerSentence > 25) score -= 20
  else if (avgWordsPerSentence > 18) score -= 8
  score -= countOccurrences(script, GENERIC_AI_PHRASES) * 10
  return clamp(score)
}

function scoreCtaClarity(cta: string): number {
  if (!cta.trim()) return 20
  let score = 60
  if (countOccurrences(cta, CTA_ACTION_VERBS) > 0) score += 25
  const words = cta.trim().split(/\s+/).filter(Boolean).length
  if (words >= 3 && words <= 14) score += 15
  return clamp(score)
}

function scoreVisualPotential(sceneCount: number, visualDirectionCount: number, brollPlanCount: number): number {
  if (sceneCount === 0) return 40
  const coverage = (visualDirectionCount + brollPlanCount) / (sceneCount * 2)
  return clamp(40 + coverage * 60)
}

function scoreGenericAi(script: string, caption: string, hook: string): number {
  const hits = countOccurrences(`${script} ${caption} ${hook}`, GENERIC_AI_PHRASES)
  return clamp(100 - hits * 15)
}

function tierFor(score: number): { tierLabel: string; tierBadge: string } {
  if (score >= 90) return { tierLabel: 'High Authority Tier', tierBadge: 'Tier 1 Elite' }
  if (score >= 75) return { tierLabel: 'Strong Retention Tier', tierBadge: 'Tier 2 Strong' }
  if (score >= 55) return { tierLabel: 'Developing Tier', tierBadge: 'Tier 3 Developing' }
  return { tierLabel: 'Needs Revision Tier', tierBadge: 'Tier 4 Needs Work' }
}

function buildDiagnosis(metrics: Record<string, number>, genericHitCount: number): string {
  const entries = Object.entries(metrics)
  const [topLabel, topValue] = entries.reduce((best, entry) => (entry[1] > best[1] ? entry : best))
  const [bottomLabel, bottomValue] = entries.reduce((worst, entry) => (entry[1] < worst[1] ? entry : worst))

  const genericNote =
    genericHitCount > 0
      ? ` Found ${genericHitCount} generic AI-sounding phrase${genericHitCount > 1 ? 's' : ''} worth rewriting.`
      : ' No generic AI-sounding phrasing detected.'

  return (
    `Strongest signal: ${topLabel} (${topValue}%). Primary area to improve: ${bottomLabel} (${bottomValue}%).` +
    `${genericNote} This is an analytical estimate from the script's own text, not a guaranteed performance prediction.`
  )
}

export function computeVideoBlueprintScore(input: BlueprintCandidate, sellingPointCount: number, benefitCount: number): VideoBlueprintResult {
  const scriptWordCount = input.script.split(/\s+/).filter(Boolean).length
  const genericHitCount = countOccurrences(`${input.script} ${input.caption} ${input.hook}`, GENERIC_AI_PHRASES)

  const hookStrength = scoreHookStrength(input.hook)
  const retentionPotential = scoreRetentionPotential(input.sceneCount, scriptWordCount)
  const specificity = scoreSpecificity(input.script, input.caption)
  const authority = scoreAuthority(input.script, input.caption, sellingPointCount, benefitCount)
  const brandFit = scoreBrandFit(input.script, input.caption, input.hook, input.bannedPhrases)
  const naturalSpeech = scoreNaturalSpeech(input.script)
  const ctaClarity = scoreCtaClarity(input.cta)
  const visualPotential = scoreVisualPotential(input.sceneCount, input.visualDirectionCount, input.brollPlanCount)
  const genericAiScore = scoreGenericAi(input.script, input.caption, input.hook)

  const viralityPotential = clamp(
    hookStrength * 0.25 +
      retentionPotential * 0.2 +
      specificity * 0.1 +
      authority * 0.1 +
      brandFit * 0.1 +
      ctaClarity * 0.1 +
      visualPotential * 0.1 +
      genericAiScore * 0.05,
  )

  const diagnosis = buildDiagnosis(
    {
      'Hook Strength': hookStrength,
      'Retention Potential': retentionPotential,
      Specificity: specificity,
      Authority: authority,
      'Brand Fit': brandFit,
      'Natural Speech': naturalSpeech,
      'CTA Clarity': ctaClarity,
      'Visual Potential': visualPotential,
    },
    genericHitCount,
  )

  return {
    viralityPotential,
    ...tierFor(viralityPotential),
    diagnosis,
    hookStrength,
    retentionPotential,
    specificity,
    authority,
    brandFit,
    naturalSpeech,
    ctaClarity,
    visualPotential,
    genericAiScore,
  }
}
