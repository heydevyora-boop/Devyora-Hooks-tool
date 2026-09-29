import { useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { SettingsToggleRow } from '../components/shared/SettingsToggleRow'
import {
  notificationSettings,
  brandRuleSettings,
  integrationSettings,
  workspaceInfo,
} from '../data/mockSettings'

/**
 * The Stitch export did not include a Settings screen (only the bottom-nav
 * link to it). This page is designed to match the existing design system
 * tokens/components 1:1 rather than converted from Stitch markup.
 */
export function SettingsPage() {
  const [notifications, setNotifications] = useState(() =>
    Object.fromEntries(notificationSettings.map((item) => [item.id, item.enabled])),
  )
  const [brandRules, setBrandRules] = useState(() =>
    Object.fromEntries(brandRuleSettings.map((item) => [item.id, item.enabled])),
  )

  return (
    <div className="flex flex-col w-full px-gutter-mobile space-y-space-md pb-space-lg">
      <section className="flex flex-col space-y-1 pt-space-xs">
        <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight">
          Settings
        </span>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Workspace, notifications, brand rules &amp; connected platforms.
        </p>
      </section>

      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-semibold shrink-0">
          {workspaceInfo.name.charAt(0)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-title text-title text-on-surface truncate">
            {workspaceInfo.name}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
            {workspaceInfo.email}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
              {workspaceInfo.plan}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {workspaceInfo.seats}
            </span>
          </div>
        </div>
        <Icon name="chevron_right" className="text-outline-variant text-[20px] ml-auto shrink-0" />
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <Icon name="notifications" className="text-[18px] text-primary" />
          <h2 className="font-title text-title text-on-surface">Notifications</h2>
        </div>
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2">
          {notificationSettings.map((item) => (
            <SettingsToggleRow
              key={item.id}
              label={item.label}
              detail={item.detail}
              enabled={notifications[item.id]}
              onChange={(next) => setNotifications((prev) => ({ ...prev, [item.id]: next }))}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <Icon name="gavel" className="text-[18px] text-primary" />
          <h2 className="font-title text-title text-on-surface">Brand Rules</h2>
        </div>
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2">
          {brandRuleSettings.map((item) => (
            <SettingsToggleRow
              key={item.id}
              label={item.label}
              detail={item.detail}
              enabled={brandRules[item.id]}
              onChange={(next) => setBrandRules((prev) => ({ ...prev, [item.id]: next }))}
              disabled={item.id === 'hinglish'}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <Icon name="hub" className="text-[18px] text-primary" />
          <h2 className="font-title text-title text-on-surface">Integrations</h2>
        </div>
        <div className="flex flex-col gap-2.5">
          {integrationSettings.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                  <Icon name={item.icon} className="text-[20px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-title text-[15px] text-on-surface">{item.label}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {item.detail}
                  </span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                  item.connected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {item.connected ? 'Connected' : 'Connect'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2.5 pt-space-xs">
        <button className="w-full py-3 px-4 rounded-xl bg-surface-container-high text-on-surface font-title text-[14px] flex items-center justify-center gap-2">
          <Icon name="download" className="text-[18px]" />
          <span>Export Account Data</span>
        </button>
        <button className="w-full py-3 px-4 rounded-xl bg-error-container text-on-error-container font-title text-[14px] flex items-center justify-center gap-2">
          <Icon name="logout" className="text-[18px]" />
          <span>Sign Out</span>
        </button>
      </section>
    </div>
  )
}
