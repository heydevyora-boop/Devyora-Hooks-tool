import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { Pill } from '../components/ui/Pill'
import { LibraryScriptCard } from '../components/shared/LibraryScriptCard'
import { HooksVaultView } from '../components/shared/HooksVaultView'
import { VersionsView } from '../components/shared/VersionsView'
import { libraryScripts, topHooksTelemetry, filterPills } from '../data/mockLibrary'

type MainTab = 'scripts' | 'hooks' | 'versions'

const TABS: { id: MainTab; label: string }[] = [
  { id: 'scripts', label: 'All Scripts' },
  { id: 'hooks', label: 'Hooks Vault' },
  { id: 'versions', label: 'Versions (24)' },
]

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('scripts')
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  return (
    <div className="flex flex-col w-full px-gutter-mobile space-y-space-md">
      <div className="flex items-center justify-between pt-space-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight">
              Script Vault
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm shadow-sm">
              142 Cached
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Neural telemetry &amp; script retention analytics
          </span>
        </div>
        <button
          aria-label="Sort & Batch Options"
          className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary active:scale-95 transition-transform"
        >
          <Icon name="tune" className="text-[20px]" />
        </button>
      </div>

      <div className="relative w-full">
        <div className="relative flex items-center w-full rounded-xl bg-surface-container-low shadow-sm">
          <Icon name="manage_search" className="text-primary ml-3.5 text-[22px]" />
          <input
            className="w-full h-11 pl-2.5 pr-10 bg-transparent text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none"
            placeholder='Search scripts, e.g. "GRC cracks वाली scripts", SOC2, or Founder POV...'
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 w-6 h-6 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center active:scale-90 transition-transform"
              onClick={() => setSearch('')}
            >
              <Icon name="close" className="text-[14px]" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
          {filterPills.map((pill) => (
            <Pill
              key={pill.id}
              active={activeFilter === pill.id}
              onClick={() => setActiveFilter(pill.id)}
            >
              {pill.dotColorClass && (
                <span className={`w-1.5 h-1.5 rounded-full ${pill.dotColorClass}`} />
              )}
              {pill.label}
            </Pill>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 p-1 rounded-xl bg-surface-container-high text-on-surface-variant font-label-md text-label-md select-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === tab.id
                ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>{tab.label}</span>
            {tab.id === 'hooks' && (
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse" />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-space-md">
        {activeTab === 'scripts' && (
          <>
            {libraryScripts.map((script) => (
              <LibraryScriptCard key={script.id} script={script} />
            ))}

            <div className="mt-4 rounded-xl bg-surface-container p-space-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="psychology_alt" className="text-tertiary-container text-[22px]" />
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Top Hooks Telemetry
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('hooks')}
                  className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-0.5 active:translate-x-0.5 transition-transform"
                >
                  Explore 84
                  <Icon name="arrow_forward" className="text-[14px]" />
                </button>
              </div>
              <div className="space-y-2.5">
                {topHooksTelemetry.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-2"
                  >
                    <p className="font-body-sm text-body-sm text-on-surface font-medium italic">
                      {item.text}
                    </p>
                    <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                      <span className="flex items-center gap-1">
                        <Icon name="sync" className="text-[14px] text-primary" />
                        Used in {item.usedIn} scripts
                      </span>
                      <span className="flex items-center gap-1 font-code text-code text-emerald-800 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {item.avgHold}
                      </span>
                      <span className={`font-code text-code font-semibold ${item.extraColorClass}`}>
                        {item.extra}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'hooks' && <HooksVaultView />}
        {activeTab === 'versions' && <VersionsView />}
      </div>

      <Link
        to="/create"
        className="fixed bottom-20 right-4 z-40 h-12 px-4 rounded-full bg-tertiary-container text-on-tertiary font-label-md text-label-md font-semibold shadow-lg shadow-tertiary-container/40 flex items-center gap-2 active:scale-95 transition-all"
      >
        <Icon name="add" className="text-[20px]" />
        <span>New Script</span>
      </Link>
    </div>
  )
}
