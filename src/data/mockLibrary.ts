import type { LibraryScript, HookTemplate, ScriptVersion } from '../types'

export const libraryScripts: LibraryScript[] = [
  {
    id: 'lib-1',
    format: 'Reel',
    formatColorClass: 'bg-primary/10 text-primary',
    formatIcon: 'play_circle',
    preset: 'Problem → Solution',
    duration: '58s',
    iq: 94,
    iqStatus: 'elite',
    title: '5 SOC2 Mistakes That Kill Enterprise Deals',
    hookRetention: 74,
    views: '1.2M',
    shares: '8.4k',
    demos: '420',
  },
  {
    id: 'lib-2',
    format: 'Shorts',
    formatColorClass: 'bg-error-container text-on-error-container',
    formatIcon: 'smart_display',
    preset: 'Contrarian Breakdown',
    iq: 91,
    iqStatus: 'good',
    title: 'GRC Cracks: Why Manual Audits Fail Fast',
    views: '850k',
    algorithmScore: 'A+',
    threeSecondHold: '71%',
    holdDelta: '+18% vs avg',
  },
  {
    id: 'lib-3',
    format: 'Founder POV',
    formatColorClass: 'bg-surface-container text-on-surface-variant',
    formatIcon: 'record_voice_over',
    preset: 'Founder POV',
    iq: 62,
    iqStatus: 'weak',
    title: 'Why We Replaced Our Internal Security Team',
    flagMessage: 'Flagged: Jargon overload in first 1.5s — 28% drop-off at 0:02',
    lifetimeViews: '42k',
    retentionCliff: 'Severe',
  },
]

export const hookTemplates: HookTemplate[] = [
  {
    id: 'ht-1',
    label: 'Curiosity Gap',
    labelColorClass: 'text-primary',
    text: '"Everyone thinks SOC2 takes 6 months. Here is what Vanta didn\'t tell you..."',
    hold: '79%',
  },
  {
    id: 'ht-2',
    label: 'The Negative Hook',
    labelColorClass: 'text-tertiary',
    text: '"Do not buy an AI agent until your compliance team signs off on this one clause."',
    hold: '83%',
  },
]

export const scriptVersions: ScriptVersion[] = [
  {
    id: 'v-1',
    version: 'v4.2-final',
    title: '5 SOC2 Mistakes That Kill Deals',
    note: '',
    status: 'Deployed',
    statusColorClass: 'text-emerald-800 bg-emerald-500/10',
  },
  {
    id: 'v-2',
    version: 'v4.1-draft',
    title: '',
    note: 'Removed 2 jargon terms from hook',
    status: 'Merged',
    statusColorClass: 'text-on-surface-variant',
  },
]

export const topHooksTelemetry = [
  {
    id: 'tele-1',
    text: '"Stop paying $50k for compliance until you watch this"',
    usedIn: 9,
    avgHold: '76% avg hold',
    extra: '+3.2x rewatch',
    extraColorClass: 'text-tertiary-container',
  },
  {
    id: 'tele-2',
    text: '"The 3-second code review trick senior architects never share"',
    usedIn: 14,
    avgHold: '82% avg hold',
    extra: 'Tier 1 Viral',
    extraColorClass: 'text-primary',
  },
]

export const filterPills = [
  { id: 'all', label: 'All (142)' },
  { id: 'high', label: 'Top 10%', dotColorClass: 'bg-emerald-500' },
  { id: 'average', label: 'Average' },
  { id: 'weak', label: 'Weak', dotColorClass: 'bg-error' },
  { id: 'soc2', label: 'SOC2 Product' },
  { id: 'reels', label: 'Reels' },
  { id: 'shorts', label: 'Shorts' },
]
