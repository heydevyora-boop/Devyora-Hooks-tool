import { Icon } from '../ui/Icon'
import { ProgressBar } from '../ui/ProgressBar'
import type { LibraryScript } from '../../types'

const IQ_BADGE_CLASSES: Record<LibraryScript['iqStatus'], string> = {
  elite: 'bg-emerald-500/10 text-emerald-800',
  good: 'bg-emerald-500/10 text-emerald-800',
  weak: 'bg-error-container text-on-error-container',
}

interface LibraryScriptCardProps {
  script: LibraryScript
}

export function LibraryScriptCard({ script }: LibraryScriptCardProps) {
  const iqIcon = script.iqStatus === 'weak' ? 'warning' : 'auto_awesome'

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm relative overflow-hidden transition-all duration-300">
      {script.iqStatus === 'elite' && (
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-primary-fixed/20 to-transparent rounded-bl-full pointer-events-none" />
      )}
      <div className="flex items-start justify-between gap-space-sm mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 ${script.formatColorClass}`}
          >
            <Icon name={script.formatIcon} className="text-[13px]" />
            {script.format}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
            {script.preset}
          </span>
          {script.duration && (
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-code text-code">
              {script.duration}
            </span>
          )}
          {script.iqStatus === 'weak' && (
            <span className="px-2 py-0.5 rounded-full bg-error/10 text-error font-label-sm text-label-sm font-semibold">
              Underperforming
            </span>
          )}
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg font-label-sm text-label-sm font-semibold shrink-0 ${IQ_BADGE_CLASSES[script.iqStatus]}`}
        >
          <Icon name={iqIcon} className="text-[14px]" />
          <span>IQ {script.iq}/100</span>
        </div>
      </div>

      <h3 className="font-title text-title text-on-surface font-semibold mb-2">{script.title}</h3>

      {script.hookRetention !== undefined && (
        <div className="p-2.5 rounded-lg bg-surface-container-low mb-3">
          <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-primary">
              <Icon name="psychology" className="text-[14px]" />
              Audience 3s Hook Retention
            </span>
            <span className="font-code text-code text-on-surface">{script.hookRetention}%</span>
          </div>
          <ProgressBar value={script.hookRetention} />
        </div>
      )}

      {script.views && script.shares && script.demos && (
        <div className="grid grid-cols-3 gap-2 py-2 mb-3 bg-surface-container-low/50 rounded-lg px-2">
          <div className="flex flex-col items-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Views</span>
            <span className="font-code text-code text-on-surface font-semibold">
              {script.views}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Shares</span>
            <span className="font-code text-code text-on-surface font-semibold">
              {script.shares}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Demos</span>
            <span className="font-code text-code text-tertiary-container font-semibold">
              {script.demos}
            </span>
          </div>
        </div>
      )}

      {script.algorithmScore && (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-code text-code">
              <Icon name="trending_up" className="text-[16px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-code text-code text-on-surface font-semibold">
                {script.views} Views
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                YouTube Algorithm Score: {script.algorithmScore}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-code text-code text-primary font-semibold">
              {script.threeSecondHold} 3s Hold
            </span>
            <span className="block font-label-sm text-label-sm text-on-surface-variant">
              {script.holdDelta}
            </span>
          </div>
        </div>
      )}

      {script.flagMessage && (
        <>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-error-container/40 text-on-error-container mb-3">
            <Icon name="error_outline" className="text-[18px] text-error shrink-0" />
            <span className="font-body-sm text-body-sm leading-tight">{script.flagMessage}</span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-3 px-1">
            <span>
              Lifetime Views:{' '}
              <strong className="text-on-surface font-code">{script.lifetimeViews}</strong>
            </span>
            <span>
              Retention Cliff:{' '}
              <strong className="text-error font-code">{script.retentionCliff}</strong>
            </span>
          </div>
          <button className="w-full py-2.5 rounded-lg bg-surface-container-high text-primary hover:bg-surface-container-highest font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform">
            <Icon name="troubleshoot" className="text-[16px]" />
            Analyze Failure &amp; Learn
          </button>
        </>
      )}

      {script.iqStatus === 'elite' && (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <button
              title="View Full Script"
              className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center active:scale-90 transition-transform"
            >
              <Icon name="article" className="text-[18px]" />
            </button>
            <button
              title="Duplicate Script"
              className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center active:scale-90 transition-transform"
            >
              <Icon name="content_copy" className="text-[18px]" />
            </button>
            <button
              title="Inspect Failures"
              className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center active:scale-90 transition-transform"
            >
              <Icon name="query_stats" className="text-[18px]" />
            </button>
          </div>
          <button className="px-3.5 py-1.5 rounded-lg bg-tertiary-container text-on-tertiary font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform">
            <Icon name="bolt" className="text-[16px]" />
            Improve Script
          </button>
        </div>
      )}

      {script.iqStatus === 'good' && (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <button className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center active:scale-90 transition-transform">
              <Icon name="article" className="text-[18px]" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center active:scale-90 transition-transform">
              <Icon name="share" className="text-[18px]" />
            </button>
          </div>
          <button className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1 active:scale-95 transition-transform">
            <Icon name="edit_note" className="text-[15px]" />
            Open Script Engine
          </button>
        </div>
      )}
    </div>
  )
}
