import type { KnowledgeModule, RulebookEntry } from '../types'

export const intelligenceCategories = [
  { id: 'knowledge-base', label: 'Knowledge Base', icon: 'database', active: true },
  { id: 'references', label: 'References', icon: 'bookmarks' },
  { id: 'performance', label: 'Performance Data', icon: 'monitoring' },
  { id: 'rules', label: 'Script Rules', icon: 'gavel' },
  { id: 'failures', label: 'Failure Analysis', icon: 'troubleshoot' },
]

export const knowledgeModules: KnowledgeModule[] = [
  {
    id: 'km-1',
    icon: 'stars',
    iconColorClass: 'bg-surface-container-high text-primary',
    title: 'Best Performing Scripts',
    badge: 'Gold Tier',
    badgeColorClass: 'bg-surface-container text-primary',
    description: '38 gold-standard blueprints with >64% 3-second hold rates.',
    meta: ['Hold: 71.4%', 'Conv: 4.8%', '9.8x ROAS'],
    metaVariant: 'inline',
  },
  {
    id: 'km-2',
    icon: 'auto_fix_high',
    iconColorClass: 'bg-surface-container text-error',
    title: 'Average & Worst Scripts',
    badge: 'Anti-Patterns',
    badgeColorClass: 'bg-error-container text-on-error-container',
    description: 'Cataloged fatigue points, silent audience loss, and weak anchors.',
    meta: ['24 Discarded Templates'],
    metaColorClass: 'text-error',
    metaVariant: 'warning',
  },
  {
    id: 'km-3',
    icon: 'verified_user',
    iconColorClass: 'bg-surface-container-high text-secondary',
    title: 'Product USPs & Architecture',
    description: 'Devyora TrustEngine specs, Zero-Knowledge verification, telemetry.',
    meta: ['TrustEngine™', 'SOC2 Auto-Attest'],
    metaVariant: 'pills',
  },
  {
    id: 'km-4',
    icon: 'payments',
    iconColorClass: 'bg-surface-container text-tertiary',
    title: 'Pricing & Offer Rules',
    description: 'Enterprise seat math, $15k ACV sweet spot, procurement logic.',
    meta: ['Rule: Never pitch price before value anchor'],
    metaColorClass: 'text-tertiary',
    metaVariant: 'inline',
  },
  {
    id: 'km-5',
    icon: 'record_voice_over',
    iconColorClass: 'bg-surface-container-high text-primary',
    title: 'Brand Voice & Cadence',
    description: 'Direct, visceral, no corporate fluff. High conviction delivery.',
    meta: ['145 WPM', 'Authoritative Contrarian'],
    metaVariant: 'inline',
  },
  {
    id: 'km-6',
    icon: 'compare',
    iconColorClass: 'bg-surface-container-high text-tertiary-container',
    title: 'Competitor Teardowns',
    description: 'Real-time vulnerability mapping vs Vanta, Drata messaging.',
    meta: ['Vanta: Bloatware', 'Drata: Manual Audit Gap'],
    metaVariant: 'pills',
  },
]

export const microModules = [
  {
    id: 'mm-1',
    icon: 'group',
    iconColorClass: 'bg-surface-container text-primary',
    title: 'Personas',
    description: 'CTOs, DevSecOps, Compliance leads.',
    meta: '3 ICP Models',
    metaColorClass: 'text-primary',
  },
  {
    id: 'mm-2',
    icon: 'quiz',
    iconColorClass: 'bg-surface-container text-secondary',
    title: 'Objection Vault',
    description: 'Audit velocity & SOC2 Type II counter-frames.',
    meta: '22 Scenarios',
    metaColorClass: 'text-secondary',
  },
]

export const rulebookEntries: RulebookEntry[] = [
  {
    id: 'rule-1',
    category: 'Linguistic Guardrail',
    categoryColorClass: 'text-tertiary',
    title: 'Strict English Vernacular (Zero Hinglish)',
    description:
      'Enforce deep engineering idioms. Discard casual slang, broken code words, or localized Hinglish dialect entirely.',
  },
  {
    id: 'rule-2',
    category: 'Banned Jargon Filter',
    categoryColorClass: 'text-error',
    title: 'Words to Avoid',
    tags: ['"Game changer"', '"Fast-paced world"', '"Unlock"', '"Next-gen"'],
  },
  {
    id: 'rule-3',
    category: 'Pattern Disruption',
    categoryColorClass: 'text-primary',
    title: 'Hook Constraint: Sub-2.1s Trigger',
    description:
      'Script opener must challenge conventional dogma or deploy visual mismatch before second 2.1.',
    showDisruptionMeter: true,
  },
  {
    id: 'rule-4',
    category: 'Conversion Architecture',
    categoryColorClass: 'text-secondary',
    title: 'Single CTA Mandate',
    description:
      'Absolute zero double-CTAs. Never combine "Save this" with "Click bio". One directive only.',
  },
]
