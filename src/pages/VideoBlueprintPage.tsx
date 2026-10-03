import { Icon } from '../components/ui/Icon'
import { Tooltip } from '../components/ui/Tooltip'
import { PageContainer } from '../components/layout/PageContainer'
import { ScoreCard } from '../components/shared/ScoreCard'
import { HookVariationCard } from '../components/shared/HookVariationCard'
import { SceneCard } from '../components/shared/SceneCard'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { usePersistentState } from '../hooks/usePersistentState'
import {
  scorecardMetrics,
  hookVariations,
  directorScenes,
  captionPackage,
} from '../data/mockCreateScript'
import { defaultViralitySettings } from '../data/mockSettings'
import type { ViralitySettings } from '../types'

/**
 * This is the complete output/blueprint section that used to live as the
 * right column of Create Script — moved here as-is (same components, same
 * mock data, same functionality) so Create Script can stay focused on the
 * script brief inputs. See CreateScriptPage's "Generate Script" button,
 * which now navigates here.
 */
export function VideoBlueprintPage() {
  const [viralitySettings] = usePersistentState<ViralitySettings>(
    'devyora-virality-settings',
    defaultViralitySettings,
  )
  const viralityThresholdLabel = `${viralitySettings.metricLabel} ≥ ${viralitySettings.threshold.toLocaleString()}`
  const { copied, copy } = useCopyToClipboard()

  return (
    <PageContainer narrow className="flex flex-col pb-32 lg:pb-12 py-space-md lg:py-8">
      <section className="flex flex-col gap-space-md lg:gap-4">
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
            v2.4-final
          </span>
        </div>

        <div className="hidden lg:flex items-center justify-between gap-2 rounded-xl bg-surface-container-lowest shadow-sm p-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title="Save as New Version"
              className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              <Icon name="bookmark_add" className="text-[20px]" />
            </button>
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
              className="px-3 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1 hover:bg-surface-container-highest transition-colors"
            >
              <Icon name="folder" className="text-[16px]" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => copy(captionPackage)}
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
          score={94}
          tierLabel="High Authority Tier"
          tierBadge="Tier 1 Elite"
          diagnosis="High retention velocity. Sharp contrarian pattern interrupt at 0:02 with zero generic AI phrasing."
          metrics={scorecardMetrics}
          viralityThresholdLabel={viralityThresholdLabel}
        />

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Icon name="analytics" className="text-secondary text-[20px]" />
              <span className="font-title text-title text-on-surface">
                Pre-Publish Retention Forecast
              </span>
              <Tooltip text="Estimated ability of the content to keep viewers watching, before you publish it." />
            </div>
            <span className="font-code text-label-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
              34% above benchmark
            </span>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-lg">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Predicted retention
              </span>
              <span className="font-display-mobile text-display-mobile text-primary leading-none">
                78%
              </span>
            </div>
            <div className="w-px self-stretch bg-outline-variant/40" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Benchmark
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface-variant leading-none">
                44%
              </span>
            </div>
          </div>
          <div className="bg-surface-container-high/60 rounded-lg p-2.5 flex items-start gap-2">
            <Icon name="warning" className="text-tertiary-container text-[18px] mt-0.5" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                Identified Risk &amp; Solution
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Slight information density spike at 0:28—addressed via split-screen B-roll cue.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-title text-title text-on-surface flex items-center gap-1.5">
              <Icon name="flare" className="text-tertiary-container text-[20px]" />
              Hook Variations (3 options)
              <Tooltip text="Different hook options for the same content — pick whichever opening line works best." />
            </h3>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Tap to swap
            </span>
          </div>
          <div className="flex flex-col gap-2 lg:grid lg:grid-cols-1 xl:grid-cols-3 xl:gap-3">
            {hookVariations.map((hook) => (
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
              4 SCENES
            </span>
          </div>
          <div className="flex flex-col gap-3 xl:grid xl:grid-cols-2 xl:gap-3">
            {directorScenes.map((scene) => (
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
              onClick={() => copy(captionPackage)}
              className="text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 bg-surface-container px-2 py-1 rounded hover:bg-surface-container-high transition-colors"
            >
              <Icon name={copied ? 'check' : 'copy_all'} className="text-[14px]" />
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg font-code text-body-sm text-on-surface whitespace-pre-line leading-relaxed">
            {captionPackage}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          <button
            type="button"
            className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Icon name="auto_fix_high" className="text-[18px] text-primary" />
            <span>Improve Script</span>
          </button>
          <button
            type="button"
            className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Icon name="refresh" className="text-[18px] text-tertiary-container" />
            <span>Regenerate Hooks</span>
          </button>
        </div>
      </section>

      {/* Mobile-only floating action dock */}
      <aside className="lg:hidden fixed bottom-16 inset-x-0 z-40 px-gutter-mobile py-2 bg-surface/90 backdrop-blur-md shadow-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Save as New Version"
            className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center shadow-sm"
          >
            <Icon name="bookmark_add" className="text-[20px]" />
          </button>
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
            className="px-3 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1 shadow-sm"
          >
            <Icon name="folder" className="text-[16px]" />
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={() => copy(captionPackage)}
            className={`px-4 py-2 rounded-xl font-title text-title font-semibold flex items-center gap-1.5 shadow-md shadow-primary/30 active:scale-95 transition-transform ${
              copied ? 'bg-emerald-600 text-on-primary' : 'bg-primary text-on-primary'
            }`}
          >
            <Icon name={copied ? 'check' : 'file_copy'} className="text-[18px]" />
            <span>{copied ? 'Copied!' : 'Copy Script'}</span>
          </button>
        </div>
      </aside>
    </PageContainer>
  )
}
