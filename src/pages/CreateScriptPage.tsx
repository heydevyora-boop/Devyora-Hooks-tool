import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { Toggle } from '../components/ui/Toggle'
import { PageContainer } from '../components/layout/PageContainer'
import { ScoreCard } from '../components/shared/ScoreCard'
import { HookVariationCard } from '../components/shared/HookVariationCard'
import { SceneCard } from '../components/shared/SceneCard'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { useViralityConfig } from '../hooks/useViralityConfig'
import { platforms, scriptPresets, brainIntegrations } from '../data/mockCreateScript'
import {
  generateContent,
  getVideoBlueprint,
  regenerateContent,
  approveGeneration,
  saveGeneration,
  type GeneratedContentView,
  type VideoBlueprintView,
} from '../api/generation'
import { findProductIdByName } from '../api/products'
import { ApiError } from '../api/client'

type CreateScriptTab = 'studio' | 'blueprint'

export function CreateScriptPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab: CreateScriptTab = searchParams.get('tab') === 'blueprint' ? 'blueprint' : 'studio'
  const [activeTab, setActiveTab] = useState<CreateScriptTab>(initialTab)
  const changeTab = (tab: CreateScriptTab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'studio' ? {} : { tab })
  }

  // Script Studio state
  const [topic, setTopic] = useState('Why 90% of SOC2 compliance audits fail in week 1')
  const [productName, setProductName] = useState('Devyora TrustEngine v2')
  const [audience, setAudience] = useState('Series A/B CTOs & SecOps Leads')
  const [selectedPlatform, setSelectedPlatform] = useState('reels')
  const [selectedPreset, setSelectedPreset] = useState('problem-solution')
  const [integrations, setIntegrations] = useState(() =>
    Object.fromEntries(brainIntegrations.map((item) => [item.id, item.enabled])),
  )

  // Video Blueprint state — real backend generation, not a static preview.
  const { settings: viralitySettings } = useViralityConfig()
  const viralityThresholdLabel = `${viralitySettings.metricLabel} ≥ ${viralitySettings.threshold.toLocaleString()}`
  const [generation, setGeneration] = useState<GeneratedContentView | null>(null)
  const [blueprint, setBlueprint] = useState<VideoBlueprintView | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [savedToIntelligence, setSavedToIntelligence] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { copied, copy } = useCopyToClipboard()

  function describeError(err: unknown): string {
    return err instanceof ApiError ? err.message : "Couldn't reach the server — try again in a moment."
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Add a video topic first.')
      return
    }
    setIsGenerating(true)
    setError(null)
    setSavedToIntelligence(false)
    try {
      const productId = await findProductIdByName(productName)
      const result = await generateContent({
        productId,
        topic: topic.trim(),
        platform: selectedPlatform,
        userInstructions: audience.trim() ? `Target audience: ${audience.trim()}` : undefined,
      })
      setGeneration(result)
      setBlueprint(await getVideoBlueprint(result.id))
      changeTab('blueprint')
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerate = async (targetLabel: string, reason: string) => {
    if (!generation) return
    setIsWorking(true)
    setError(null)
    try {
      const updated = await regenerateContent(generation.id, { targetLabel, reason, reasonOrigin: 'text' })
      setGeneration(updated)
      setBlueprint(await getVideoBlueprint(generation.id))
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsWorking(false)
    }
  }

  const handleSaveToIntelligence = async () => {
    if (!generation) return
    setIsWorking(true)
    setError(null)
    try {
      const approved = generation.status === 'approved' ? generation : await approveGeneration(generation.id)
      const saved = await saveGeneration(approved.id)
      setGeneration(saved)
      setSavedToIntelligence(true)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsWorking(false)
    }
  }

  const captionText = generation?.caption ?? ''

  return (
    <PageContainer
      narrow
      className={`flex flex-col py-space-md lg:py-8 ${
        activeTab === 'blueprint' ? 'pb-32 lg:pb-12' : 'pb-space-lg lg:pb-12'
      }`}
    >
      {/* Internal tabs — same pattern as Plan's Strategy/Flowchart tabs */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container-high font-label-md text-label-md select-none">
        <button
          onClick={() => changeTab('studio')}
          className={`py-2 text-center rounded-lg transition-all ${
            activeTab === 'studio'
              ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Script Studio
        </button>
        <button
          onClick={() => changeTab('blueprint')}
          className={`py-2 text-center rounded-lg transition-all ${
            activeTab === 'blueprint'
              ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Video Blueprint
        </button>
      </div>

      {error && (
        <div className="mt-space-sm bg-error-container text-on-error-container rounded-lg p-3 flex items-start gap-2">
          <Icon name="error" className="text-[18px] mt-0.5" />
          <p className="font-body-sm text-body-sm">{error}</p>
        </div>
      )}

      {activeTab === 'studio' && (
        <>
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
                  </label>
                  <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
                    <Icon name="topic" className="text-primary text-[18px]" />
                    <input
                      className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none font-medium"
                      type="text"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
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
                        value={productName}
                        onChange={(event) => setProductName(event.target.value)}
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
                        value={audience}
                        onChange={(event) => setAudience(event.target.value)}
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
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-4 rounded-xl bg-tertiary-container text-on-tertiary font-title text-title flex items-center justify-center gap-2 shadow-lg shadow-tertiary-container/25 active:scale-[0.99] lg:hover:bg-tertiary transition-transform disabled:opacity-50"
                >
                  <Icon name="auto_awesome" className={`text-[20px] ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Synthesizing…' : '✨ Generate Script (Leveraging The Brain)'}</span>
                </button>
                <p className="font-label-sm text-[11px] text-on-surface-variant text-center px-1">
                  Rule-based generation from real product and brand context — not a language
                  model. The Video Blueprint score is an analytical estimate, never a guarantee.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'blueprint' && (
        <>
          {!generation || !blueprint ? (
            <section className="mt-space-md bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center gap-3 text-center">
              <Icon name="auto_awesome" className="text-on-surface-variant text-[28px]" />
              <h2 className="font-title text-title text-on-surface">No blueprint yet</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Generate a script in Script Studio first — the blueprint is scored from that real
                output, never shown ahead of it.
              </p>
              <button
                type="button"
                onClick={() => changeTab('studio')}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold"
              >
                Go to Script Studio
              </button>
            </section>
          ) : (
            <section className="flex flex-col gap-space-md lg:gap-4 mt-space-md lg:mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Icon name="verified" className="text-[20px]" />
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm text-emerald-600 uppercase font-bold tracking-wider">
                      Engine Generated
                    </span>
                    <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface leading-tight">
                      Optimized Video Blueprint
                    </h2>
                  </div>
                </div>
                <span className="font-code text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                  v{generation.version}
                </span>
              </div>

              <div className="hidden lg:flex items-center justify-between gap-2 rounded-xl bg-surface-container-lowest shadow-sm p-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Download Options"
                    className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name="download" className="text-[20px]" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isWorking || savedToIntelligence}
                    onClick={handleSaveToIntelligence}
                    className="px-3 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1 hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                  >
                    <Icon name={savedToIntelligence ? 'check' : 'folder'} className="text-[16px]" />
                    <span>{savedToIntelligence ? 'Saved' : 'Save'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(captionText)}
                    className={`px-4 py-2 rounded-xl font-title text-title font-semibold flex items-center gap-1.5 shadow-md shadow-primary/30 active:scale-95 transition-transform ${
                      copied ? 'bg-emerald-600 text-on-primary' : 'bg-primary text-on-primary hover:bg-primary/90'
                    }`}
                  >
                    <Icon name={copied ? 'check' : 'file_copy'} className="text-[18px]" />
                    <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>
              </div>

              <ScoreCard
                score={blueprint.score}
                tierLabel={blueprint.tierLabel}
                tierBadge={blueprint.tierBadge}
                diagnosis={blueprint.diagnosis}
                metrics={blueprint.metrics}
                viralityThresholdLabel={viralityThresholdLabel}
              />

              {generation.similarityWarnings.length > 0 && (
                <div className="bg-surface-container-high/60 rounded-lg p-2.5 flex items-start gap-2">
                  <Icon name="warning" className="text-tertiary-container text-[18px] mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                      Similar to past content
                    </span>
                    {generation.similarityWarnings.map((warning, index) => (
                      <p key={index} className="font-body-sm text-body-sm text-on-surface-variant">
                        {warning.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-title text-title text-on-surface flex items-center gap-1.5">
                    <Icon name="flare" className="text-tertiary-container text-[20px]" />
                    Hook Variations ({generation.hooks.length} options)
                  </h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Tap to swap
                  </span>
                </div>
                <div className="flex flex-col gap-2 lg:grid lg:grid-cols-1 xl:grid-cols-3 xl:gap-3">
                  {generation.hooks.map((hook) => (
                    <HookVariationCard key={hook.id} hook={hook} />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon name="movie" className="text-primary text-[22px]" />
                    <h3 className="font-title text-title text-on-surface">
                      Director Cues &amp; Multi-Track Script
                    </h3>
                  </div>
                  <span className="font-code text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded font-semibold">
                    {generation.scenes.length} SCENES
                  </span>
                </div>
                <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:gap-3">
                  {generation.scenes.map((scene) => (
                    <SceneCard key={scene.id} scene={scene} />
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-title text-title text-on-surface flex items-center gap-1.5">
                    <Icon name="content_copy" className="text-primary text-[20px]" />
                    Caption &amp; Publishing Package
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(captionText)}
                    className="text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 bg-surface-container px-2 py-1 rounded hover:bg-surface-container-high transition-colors"
                  >
                    <Icon name={copied ? 'check' : 'copy_all'} className="text-[14px]" />
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg font-code text-body-sm text-on-surface whitespace-pre-line leading-relaxed">
                  {captionText}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => regenerate('Scene 1', 'Make the opening sharper and more specific')}
                  className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Icon name="auto_fix_high" className="text-[18px] text-primary" />
                  <span>Improve Script</span>
                </button>
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => regenerate('Hook #1', 'Give me different hook angles')}
                  className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Icon name="refresh" className="text-[18px] text-tertiary-container" />
                  <span>Regenerate Hooks</span>
                </button>
              </div>
            </section>
          )}

          {/* Mobile-only floating action dock */}
          {generation && blueprint && (
            <aside className="lg:hidden fixed bottom-16 inset-x-0 z-40 px-gutter-mobile py-2 bg-surface/90 backdrop-blur-md shadow-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="Download Options"
                  className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center shadow-sm"
                >
                  <Icon name="download" className="text-[20px]" />
                </button>
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <button
                  type="button"
                  disabled={isWorking || savedToIntelligence}
                  onClick={handleSaveToIntelligence}
                  className="px-3 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1 shadow-sm disabled:opacity-50"
                >
                  <Icon name={savedToIntelligence ? 'check' : 'folder'} className="text-[16px]" />
                  <span>{savedToIntelligence ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => copy(captionText)}
                  className={`px-4 py-2 rounded-xl font-title text-title font-semibold flex items-center gap-1.5 shadow-md shadow-primary/30 active:scale-95 transition-transform ${
                    copied ? 'bg-emerald-600 text-on-primary' : 'bg-primary text-on-primary'
                  }`}
                >
                  <Icon name={copied ? 'check' : 'file_copy'} className="text-[18px]" />
                  <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
            </aside>
          )}
        </>
      )}
    </PageContainer>
  )
}
