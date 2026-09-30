import { useEffect, useRef } from 'react'
import { Icon } from '../../ui/Icon'
import type { InstagramConnection } from '../../../types'

interface InstagramConnectionCardProps {
  connection: InstagramConnection
  onChange: (next: InstagramConnection) => void
}

const DEMO_CONNECTED_DATA: Partial<InstagramConnection> = {
  handle: '@devyorahooks',
  followers: 18400,
  posts: 214,
  reels: 96,
  postingFrequency: '4x / week',
  topPerformingContent: [
    { id: 'ig-1', title: '5 SOC2 Mistakes That Kill Enterprise Deals', format: 'Reel', date: '12 Aug', engagement: '1.2M views' },
    { id: 'ig-2', title: 'GRC Cracks: Why Manual Audits Fail Fast', format: 'Reel', date: '27 Aug', engagement: '850k views' },
  ],
}

function formatCount(value?: number) {
  if (value === undefined) return '—'
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)
}

export function InstagramConnectionCard({ connection, onChange }: InstagramConnectionCardProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const handleConnect = () => {
    onChange({ status: 'connecting' })
    timeoutRef.current = setTimeout(() => {
      onChange({
        status: 'connected',
        ...DEMO_CONNECTED_DATA,
        lastSyncedAt: new Date().toISOString(),
      })
    }, 1400)
  }

  const handleSync = () => {
    onChange({ ...connection, status: 'syncing' })
    timeoutRef.current = setTimeout(() => {
      onChange({ ...connection, status: 'connected', lastSyncedAt: new Date().toISOString() })
    }, 1200)
  }

  const handleDisconnect = () => {
    onChange({ status: 'not_connected' })
  }

  if (connection.status === 'not_connected' || connection.status === 'connecting') {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <Icon name="photo_camera" className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-title text-title text-on-surface">Connect Instagram</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Not Connected
            </span>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Once connected, we'll show followers, posts, reels, posting frequency, content history,
          and top-performing content — pulled through Instagram's official Graph API.
        </p>
        <div className="bg-surface-container-low rounded-lg p-2.5 flex items-start gap-2">
          <Icon name="info" className="text-primary text-[16px] mt-0.5" />
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Official Instagram integration requires a <strong>Business or Creator account</strong>{' '}
            linked to a Facebook Page. Personal accounts aren't supported by Instagram's API.
          </p>
        </div>
        <button
          type="button"
          onClick={handleConnect}
          disabled={connection.status === 'connecting'}
          className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-title text-[14px] flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
        >
          {connection.status === 'connecting' ? (
            <>
              <Icon name="progress_activity" className="text-[18px] animate-spin" />
              <span>Connecting…</span>
            </>
          ) : (
            <>
              <Icon name="link" className="text-[18px]" />
              <span>Connect Instagram</span>
            </>
          )}
        </button>
      </div>
    )
  }

  const isSyncing = connection.status === 'syncing'

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <Icon name="photo_camera" className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-title text-title text-on-surface">{connection.handle}</span>
            <span className="font-label-sm text-label-sm text-emerald-700 flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isSyncing ? 'animate-pulse' : ''}`}
              />
              {isSyncing ? 'Syncing…' : 'Connected'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDisconnect}
          className="font-label-sm text-label-sm text-error font-medium"
        >
          Disconnect
        </button>
      </div>

      <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-lg p-2.5 flex items-start gap-2">
        <Icon name="warning" className="text-[16px] mt-0.5" />
        <p className="font-label-sm text-label-sm">
          Demo data — this preview isn't live yet. Real numbers will sync once the Instagram Graph
          API connection is wired up on the backend.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Followers</span>
          <span className="font-code text-title font-semibold text-on-surface">
            {formatCount(connection.followers)}
          </span>
        </div>
        <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Posts</span>
          <span className="font-code text-title font-semibold text-on-surface">
            {connection.posts ?? '—'}
          </span>
        </div>
        <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Reels</span>
          <span className="font-code text-title font-semibold text-on-surface">
            {connection.reels ?? '—'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant px-1">
        <span>Posting frequency: {connection.postingFrequency ?? '—'}</span>
        <span>
          Last synced:{' '}
          {connection.lastSyncedAt
            ? new Date(connection.lastSyncedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—'}
        </span>
      </div>

      {connection.topPerformingContent && connection.topPerformingContent.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Top Performing Content
          </span>
          {connection.topPerformingContent.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-surface-container-low rounded-lg p-2.5"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                  {item.title}
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant">
                  {item.format} · {item.date}
                </span>
              </div>
              <span className="font-code text-label-sm text-primary font-semibold shrink-0 ml-2">
                {item.engagement}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60"
      >
        <Icon
          name="sync"
          className={`text-[16px] ${isSyncing ? 'animate-spin' : ''}`}
        />
        {isSyncing ? 'Syncing…' : 'Sync Now'}
      </button>
    </div>
  )
}
