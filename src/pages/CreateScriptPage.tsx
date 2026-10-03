import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { Toggle } from '../components/ui/Toggle'
import { PageContainer } from '../components/layout/PageContainer'
import { platforms, scriptPresets, brainIntegrations } from '../data/mockCreateScript'

export function CreateScriptPage() {
  const navigate = useNavigate()
  const [selectedPlatform, setSelectedPlatform] = useState('reels')
  const [selectedPreset, setSelectedPreset] = useState('problem-solution')
  const [integrations, setIntegrations] = useState(() =>
    Object.fromEntries(brainIntegrations.map((item) => [item.id, item.enabled])),
  )

  return (
    <PageContainer narrow className="flex flex-col pb-space-lg lg:pb-12 py-space-md lg:py-8">
      <div className="pt-3 pb-2 lg:pb-4 flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-code text-label-sm text-primary uppercase tracking-wider">
            Brain Engine v4.2 Active
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
          Project: B2B Growth #84
        </span>
      </div>

      {/* Script brief inputs — previously the left column of a two-column
          layout; the output/blueprint column now lives on its own page
          (Video Blueprint) so this page stays focused on the brief. */}
      <section className="flex flex-col gap-space-md">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-sm">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary-container/10 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-tertiary-container">
              <Icon name="psychology" className="text-[18px]" />
              <span className="font-label-sm text-label-sm uppercase tracking-wide font-semibold">
                Script Studio Intelligence
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile lg:text-headline-md lg:font-headline-md text-on-surface tracking-tight">
              Create High-Retention Script
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Synthesizing audience hooks, retention psychometrics, and multi-track director
              cues.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-space-xs">
              <Icon name="edit_note" className="text-primary text-[20px]" />
              <span className="font-title text-title text-on-surface">
                1. Script Brief Specifications
              </span>
            </div>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
              Step 1 of 2
            </span>
          </div>

          <div className="flex flex-col gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                <span>Video Topic &amp; Angle</span>
                <span className="font-code text-label-sm text-primary">Viral Pattern #14</span>
              </label>
              <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
                <Icon name="topic" className="text-primary text-[18px]" />
                <input
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none font-medium"
                  type="text"
                  defaultValue="Why 90% of SOC2 compliance audits fail in week 1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-space-sm">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                  Product / Offering
                </label>
                <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
                  <Icon name="shield" className="text-on-surface-variant text-[18px]" />
                  <input
                    className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
                    type="text"
                    defaultValue="Devyora TrustEngine v2"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                  Target ICP Audience
                </label>
                <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
                  <Icon name="group" className="text-on-surface-variant text-[18px]" />
                  <input
                    className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
                    type="text"
                    defaultValue="Series A/B CTOs & SecOps Leads"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Distribution Platform
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                      selectedPlatform === platform.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <Icon name={platform.icon} className="text-[16px]" />
                    <span>{platform.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-sm pt-1">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Duration Target
                </label>
                <div className="bg-surface-container-low rounded-lg p-2 flex items-center justify-between">
                  <span className="font-code text-label-sm text-on-surface font-semibold">
                    60s (~150w)
                  </span>
                  <Icon name="timer" className="text-primary text-[16px]" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Goal Metric
                </label>
                <div className="bg-surface-container-low rounded-lg p-2 flex items-center justify-between">
                  <span className="font-code text-label-sm text-on-surface font-semibold truncate">
                    Demo Bookings
                  </span>
                  <Icon name="trending_up" className="text-secondary text-[16px]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Primary Call To Action (CTA)
              </label>
              <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
                <Icon name="ads_click" className="text-tertiary-container text-[18px]" />
                <input
                  className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
                  type="text"
                  defaultValue="Book 15-min Risk Audit in Bio"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Script Architecture Preset
              </label>
              <span className="font-label-sm text-label-sm text-primary font-medium">
                11 frameworks
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
              {scriptPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1 transition-colors ${
                    selectedPreset === preset.id
                      ? 'bg-secondary-container text-on-secondary-container shadow-sm font-semibold'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {preset.icon && <Icon name={preset.icon} className="text-[14px]" />}
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 bg-surface-container-low rounded-xl p-3">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Active Brain Integrations
            </span>
            {brainIntegrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${integration.dotColorClass}`} />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {integration.label}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {integration.detail}
                    </span>
                  </div>
                </div>
                <Toggle
                  enabled={integrations[integration.id]}
                  onChange={(next) =>
                    setIntegrations((prev) => ({ ...prev, [integration.id]: next }))
                  }
                />
              </div>
            ))}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary-container shadow-[0_0_8px_rgba(170,59,0,0.8)]" />
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Attached References
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    2 case study transcripts attached
                  </span>
                </div>
              </div>
              <span className="font-code text-label-sm text-tertiary-container font-semibold px-2 py-0.5 bg-surface-container rounded">
                LOCKED
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => navigate('/video-blueprint')}
              className="w-full py-3.5 px-4 rounded-xl bg-tertiary-container text-on-tertiary font-title text-title flex items-center justify-center gap-2 shadow-lg shadow-tertiary-container/25 active:scale-[0.99] lg:hover:bg-tertiary transition-transform"
            >
              <Icon name="auto_awesome" className="text-[20px] animate-spin" />
              <span>✨ Generate Script (Leveraging The Brain)</span>
            </button>
            <div className="flex flex-col gap-1 px-1">
              <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                <span className="font-code text-primary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  Synthesizing 8 retention rules...
                </span>
                <span className="font-code text-on-surface-variant">100% Synced</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-primary to-tertiary-container rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  )
}
