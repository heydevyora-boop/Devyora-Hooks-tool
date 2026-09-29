import { Link } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { StatCard } from '../components/shared/StatCard'
import { TopScriptCard } from '../components/shared/TopScriptCard'
import { RecentScriptRow } from '../components/shared/RecentScriptRow'
import { statCards, topScripts, recentScripts } from '../data/mockHome'

export function HomePage() {
  return (
    <div className="flex flex-col w-full px-gutter-mobile space-y-space-md">
      <section className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
              Q3 Telemetry Active
            </span>
          </div>
          <span className="text-label-sm font-label-sm text-on-surface-variant font-code">
            SYNCED 10m AGO
          </span>
        </div>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface tracking-tight">
          Good morning, Sarah
        </h1>
        <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
          Script Brain synced with 142 company scripts &amp; Q3 performance telemetry.
        </p>
      </section>

      <section className="flex flex-col space-y-2">
        <Link
          to="/create"
          className="w-full relative overflow-hidden group rounded-xl p-3.5 bg-gradient-to-r from-primary-container via-secondary-container to-tertiary-container shadow-md shadow-primary-container/20 flex items-center justify-between text-on-primary transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center space-x-2.5 z-10">
            <div className="w-8 h-8 rounded-lg bg-surface-container-lowest/20 flex items-center justify-center backdrop-blur-sm">
              <Icon name="auto_awesome" className="text-[18px]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-title text-title leading-tight">Create New Script</span>
              <span className="font-label-sm text-[10px] opacity-80">
                Full telemetry-guided hook synthesis
              </span>
            </div>
          </div>
          <Icon
            name="arrow_forward"
            className="text-[20px] opacity-80 group-hover:translate-x-0.5 transition-transform z-10"
          />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-surface-container-lowest/10 rounded-full blur-xl pointer-events-none" />
        </Link>

        <div className="grid grid-cols-2 gap-2">
          <button className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex items-center space-x-2 text-left active:bg-surface-container-low transition-colors">
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
              <Icon name="bolt" className="text-[16px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface truncate">
                Improve Script
              </span>
              <span className="text-[10px] text-on-surface-variant truncate">
                Upload URL / Draft
              </span>
            </div>
          </button>
          <button className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex items-center space-x-2 text-left active:bg-surface-container-low transition-colors">
            <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
              <Icon name="psychology_alt" className="text-[16px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface truncate">
                Generate 10 Angles
              </span>
              <span className="text-[10px] text-on-surface-variant truncate">
                Curiosity booster
              </span>
            </div>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2.5">
        {statCards.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </section>

      <section className="bg-surface-container-low rounded-xl p-3.5 shadow-sm relative overflow-hidden">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-tertiary-container text-on-tertiary flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="neurology" className="text-[18px]" />
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-tertiary font-semibold uppercase tracking-wider">
                Live Neural Pulse
              </span>
              <span className="font-code text-[10px] text-on-surface-variant">Auto-applied</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-snug">
              <strong className="font-semibold text-on-surface">Drop Alert:</strong> 3s retention
              drops precipitously when technical jargon appears before second 2.4. Permanent
              rulebook updated.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="local_fire_department" className="text-[18px] text-primary" />
            <h2 className="font-title text-title text-on-surface">Top Performing Scripts</h2>
          </div>
          <Link to="/library" className="text-label-sm font-label-sm text-primary font-medium">
            Telemetry view
          </Link>
        </div>
        <div className="flex space-x-3 overflow-x-auto pb-1 -mx-gutter-mobile px-gutter-mobile snap-x scrollbar-none">
          {topScripts.map((script) => (
            <TopScriptCard key={script.id} script={script} />
          ))}
        </div>
      </section>

      <section className="flex flex-col space-y-2.5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="pending_actions" className="text-[18px] text-on-surface-variant" />
            <h2 className="font-title text-title text-on-surface">Recent Scripts in Production</h2>
          </div>
          <Link to="/library" className="text-label-sm font-label-sm text-primary font-medium">
            All (14)
          </Link>
        </div>
        <div className="space-y-2">
          {recentScripts.map((script) => (
            <RecentScriptRow key={script.id} script={script} />
          ))}
        </div>
      </section>
    </div>
  )
}
