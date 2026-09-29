import type { ScorecardMetric, HookVariation, DirectorScene } from '../types'

export const platforms = [
  { id: 'reels', label: 'Instagram Reels', icon: 'play_circle' },
  { id: 'shorts', label: 'YouTube Shorts', icon: 'smart_display' },
  { id: 'tiktok', label: 'TikTok', icon: 'music_note' },
  { id: 'linkedin', label: 'LinkedIn Video', icon: 'business_center' },
]

export const scriptPresets = [
  { id: 'problem-solution', label: 'Problem → Solution', icon: 'bolt' },
  { id: 'educational', label: 'Educational Reel' },
  { id: 'founder-pov', label: 'Founder POV' },
  { id: 'product-demo', label: 'Product Demo' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'myth-busting', label: 'Myth Busting' },
  { id: 'case-study', label: 'Case Study' },
  { id: 'lead-gen', label: 'Lead Generation Ad' },
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'testimonial', label: 'Testimonial' },
  { id: 'authority', label: 'Authority Building' },
  { id: 'faq', label: 'FAQ' },
]

export const brainIntegrations = [
  {
    id: 'knowledge-base',
    label: 'Use Knowledge Base',
    detail: '142 company scripts + USP vault',
    dotColorClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    enabled: true,
  },
  {
    id: 'past-performance',
    label: 'Use Past Performance Data',
    detail: 'Dialed to top 5% retention tier',
    dotColorClass: 'bg-secondary-container shadow-[0_0_8px_rgba(96,99,238,0.8)]',
    enabled: true,
  },
  {
    id: 'brand-rules',
    label: 'Use Brand Rules',
    detail: 'Hinglish: Low • Zero corporate fluff',
    dotColorClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    enabled: true,
  },
]

export const scorecardMetrics: ScorecardMetric[] = [
  { label: 'Hook Strength', value: '96%', colorClass: 'text-primary' },
  { label: 'Retention Pot.', value: '92%', colorClass: 'text-secondary' },
  { label: 'Specificity', value: '95%', colorClass: 'text-emerald-600' },
  { label: 'Authority', value: '98%', colorClass: 'text-on-surface' },
  { label: 'Brand Fit', value: '100%', colorClass: 'text-primary' },
  { label: 'Natural Speech', value: '91%', colorClass: 'text-secondary' },
  { label: 'CTA Clarity', value: '94%', colorClass: 'text-tertiary-container' },
  { label: 'Visual Pot.', value: '89%', colorClass: 'text-on-surface' },
  {
    label: 'Generic AI',
    value: '0% Clean',
    colorClass: 'text-emerald-700',
    highlight: true,
  },
]

export const hookVariations: HookVariation[] = [
  {
    id: 'hook-1',
    label: 'Hook #1 Selected',
    iq: 96,
    angleLabel: 'Contrarian Callout',
    patternName: 'Cognitive dissonance',
    patternIcon: 'psychology',
    text: '"Most CTOs think SOC2 is a security check. It is actually an enterprise sales roadblock that burns $40,000 in dev payroll."',
    selected: true,
  },
  {
    id: 'hook-2',
    label: 'Hook #2',
    iq: 91,
    angleLabel: 'Fear of Audit Failure',
    patternName: 'Loss aversion',
    patternIcon: 'warning_amber',
    text: '"If you are preparing for SOC2 on Google Sheets, stop scrolling before your lead investor sees this."',
  },
  {
    id: 'hook-3',
    label: 'Hook #3',
    iq: 88,
    angleLabel: 'Proof Framework',
    patternName: 'Case study intrigue',
    patternIcon: 'verified_user',
    text: '"The exact 3-step compliance framework that closed our $1.2M seed round without hiring a consultant."',
  },
]

export const directorScenes: DirectorScene[] = [
  {
    id: 1,
    title: 'Scene 1: The Hook Interrupt',
    timeRange: '0:00 - 0:03',
    colorClass: 'bg-tertiary-container text-on-tertiary',
    camera: 'High-contrast punch-in (45mm close-up)',
    visual: 'Founder pointing directly, flashing red alert',
    dialogue:
      "“Most CTOs think SOC2 is a security check. It's actually an enterprise sales roadblock burning $40k/month.”",
    broll: 'Fast cuts of Jira backlog & rejected enterprise sales email',
    overlay: '“THE $40,000 SOC2 TRAP 🚨”',
    transition: 'Whip pan right + bass drop cue',
  },
  {
    id: 2,
    title: 'Scene 2: Agitate the Hidden Friction',
    timeRange: '0:03 - 0:18',
    colorClass: 'bg-primary-container text-on-primary',
    camera: 'Dynamic tracking hand-held',
    visual: 'Split screen: manual spreadsheets vs Devyora auto-evidence',
    dialogue:
      "“Here's what happens: Auditors ask for AWS IAM logs, your engineers spend 3 weeks manual tagging, and enterprise deals stall in procurement limbo.”",
    broll: 'Animated screen recording of TrustEngine 1-click sync',
    overlay: '“Week 1: Stalled Deals 📉”',
    transition: 'Quick zoom punch',
  },
  {
    id: 3,
    title: 'Scene 3: The 90-Second Mechanism',
    timeRange: '0:18 - 0:45',
    colorClass: 'bg-secondary text-on-secondary',
    dialogue:
      '“Step 1: Auto-map AWS, GCP, and GitHub to controls in 90 seconds. Step 2: Continuous compliance evidence automatically collected daily so auditors pass you without a single dev ticket.”',
    directorNote: 'Fast tempo, screen overlays floating next to speaker',
  },
  {
    id: 4,
    title: 'Scene 4: High-Conversion CTA & Loop',
    timeRange: '0:45 - 0:60',
    colorClass: 'bg-tertiary-container text-on-tertiary',
    dialogue:
      "“Don't burn another dev sprint. Get the free SOC2 Readiness Checklist linked in bio. And if you think your audit is ready...”",
    loopNote: 'Seamless audio match cuts directly into Scene 1 Hook',
  },
]

export const captionPackage = `Stop losing $40k/mo to manual SOC2 evidence hunting.

Here is the exact automated workflow modern CTOs use to pass enterprise security audits in week 1 without pulling engineers off the roadmap.

👉 Grab the 15-min SOC2 Risk Checklist linked in our bio.

#SOC2 #DevSecOps #FounderTips #CyberSecurity #B2BSaaS #TechLeadership`
