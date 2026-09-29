export const notificationSettings = [
  {
    id: 'weekly-digest',
    label: 'Weekly Telemetry Digest',
    detail: 'Retention & IQ score summary every Monday',
    enabled: true,
  },
  {
    id: 'failure-alerts',
    label: 'Failure Analysis Alerts',
    detail: 'Instant ping when a script underperforms',
    enabled: true,
  },
  {
    id: 'rulebook-updates',
    label: 'Rulebook Auto-Updates',
    detail: 'Notify when The Brain patches a rule',
    enabled: false,
  },
]

export const brandRuleSettings = [
  {
    id: 'hinglish',
    label: 'Hinglish Tolerance',
    detail: 'Currently locked to Low by Permanent Rulebook',
    enabled: false,
  },
  {
    id: 'corporate-fluff',
    label: 'Block Corporate Fluff Phrases',
    detail: '"Game changer", "Unlock", "Next-gen" filtered',
    enabled: true,
  },
]

export const integrationSettings = [
  { id: 'knowledge-base', label: 'Knowledge Base Sync', detail: '142 scripts indexed', icon: 'database', connected: true },
  { id: 'crm', label: 'CRM Pipeline Sync', detail: 'Not connected', icon: 'hub', connected: false },
  { id: 'analytics', label: 'Platform Analytics', detail: 'Reels, Shorts, TikTok connected', icon: 'monitoring', connected: true },
]

export const workspaceInfo = {
  name: 'Sarah Chen',
  email: 'sarah@devyora.com',
  role: 'Founder / Growth Lead',
  plan: 'Script Intel Pro',
  seats: '3 of 5 seats used',
}
