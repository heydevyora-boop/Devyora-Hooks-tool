import { useEffect, useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { Tooltip } from '../components/ui/Tooltip'
import { PageContainer } from '../components/layout/PageContainer'
import { SettingsToggleRow } from '../components/shared/SettingsToggleRow'
import { useAuth } from '../hooks/useAuth'
import { useViralityConfig } from '../hooks/useViralityConfig'
import { ApiError } from '../api/client'
import { listUsers, createUser, updateUserRole, getAdminSettings, type AdminUserView, type AdminSettingsView } from '../api/admin'
import { notificationSettings, brandRuleSettings, integrationSettings, workspaceInfo } from '../data/mockSettings'

function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return "Couldn't reach the server — try again in a moment."
}

/**
 * The Stitch export did not include a Settings screen (only the bottom-nav
 * link to it). This page is designed to match the existing design system
 * tokens/components 1:1 rather than converted from Stitch markup.
 */
export function SettingsPage() {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [notifications, setNotifications] = useState(() =>
    Object.fromEntries(notificationSettings.map((item) => [item.id, item.enabled])),
  )
  const [brandRules, setBrandRules] = useState(() =>
    Object.fromEntries(brandRuleSettings.map((item) => [item.id, item.enabled])),
  )
  const { settings: viralitySettings, save: saveViralitySettings } = useViralityConfig()

  const [adminSettings, setAdminSettings] = useState<AdminSettingsView | null>(null)
  const [users, setUsers] = useState<AdminUserView[]>([])
  const [adminError, setAdminError] = useState<string | null>(null)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' as 'user' | 'admin' })

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    Promise.all([getAdminSettings(), listUsers()])
      .then(([settingsResult, usersResult]) => {
        if (cancelled) return
        setAdminSettings(settingsResult)
        setUsers(usersResult)
      })
      .catch((err) => {
        if (!cancelled) setAdminError(describeError(err))
      })
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const handleToggleRole = async (targetUser: AdminUserView) => {
    setAdminError(null)
    try {
      const nextRole = targetUser.role === 'admin' ? 'user' : 'admin'
      const updated = await updateUserRole(targetUser.id, nextRole)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setAdminError(describeError(err))
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.username.trim() || !newUser.email.trim() || !newUser.password.trim()) return
    setAdminError(null)
    try {
      const created = await createUser(newUser)
      setUsers((prev) => [...prev, created])
      setNewUser({ username: '', email: '', password: '', role: 'user' })
      setIsAddingUser(false)
    } catch (err) {
      setAdminError(describeError(err))
    }
  }

  return (
    <PageContainer narrow className="flex flex-col space-y-space-md lg:space-y-6 pb-space-lg lg:pb-12 py-space-md lg:py-8">
      <section className="flex flex-col space-y-1 pt-space-xs">
        <span className="font-headline-lg-mobile text-headline-lg-mobile lg:text-headline-lg lg:font-headline-lg text-on-surface tracking-tight">
          Settings
        </span>
        <p className="font-body-sm text-body-sm lg:text-body-md lg:font-body-md text-on-surface-variant">
          Workspace, notifications, brand rules &amp; connected platforms.
        </p>
      </section>

      <section className="bg-surface-container-lowest rounded-xl p-space-md lg:p-6 shadow-sm flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-semibold shrink-0 uppercase">
          {(user?.username ?? workspaceInfo.name).charAt(0)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-title text-title text-on-surface truncate capitalize">
            {user?.username ?? workspaceInfo.name}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
            {adminSettings?.workspace.name ?? workspaceInfo.email}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold uppercase">
              {user?.role ?? workspaceInfo.plan}
            </span>
            {adminSettings && (
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {adminSettings.workspace.plan} · seat limit {adminSettings.workspace.seatLimit}
              </span>
            )}
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

      {isAdmin && (
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <Icon name="admin_panel_settings" className="text-[18px] text-primary" />
          <h2 className="font-title text-title text-on-surface">Admin</h2>
        </div>

        {adminError && (
          <div className="bg-error-container rounded-lg p-2.5 flex items-start gap-2">
            <Icon name="error" className="text-error text-[16px] mt-0.5" />
            <p className="font-label-sm text-label-sm text-on-error-container">{adminError}</p>
          </div>
        )}

        <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Virality Threshold
            </span>
            <Tooltip text="Defines what counts as 'viral' for your team. Every Virality Potential score in the app is measured against this — it's an estimate, not a guarantee of future views." />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Content is considered viral once it reaches this many organic views.
          </p>
          <div className="flex items-center gap-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant shrink-0">
              {viralitySettings.metricLabel} ≥
            </span>
            <input
              type="number"
              min={0}
              step={1000}
              value={viralitySettings.threshold}
              onChange={(event) =>
                saveViralitySettings({
                  ...viralitySettings,
                  threshold: Math.max(0, Number(event.target.value) || 0),
                })
              }
              className="w-full bg-surface-container-lowest rounded-lg p-2 font-code text-label-md text-on-surface outline-none"
            />
          </div>
          <p className="font-label-sm text-[11px] text-on-surface-variant">
            This is a labeling threshold your team defines, not a performance guarantee — every
            Virality Potential score in the app is measured against it.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Workspace Users
            </span>
            <button
              type="button"
              onClick={() => setIsAddingUser((prev) => !prev)}
              className="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1"
            >
              <Icon name={isAddingUser ? 'close' : 'add'} className="text-[14px]" />
              {isAddingUser ? 'Cancel' : 'Add User'}
            </button>
          </div>

          {isAddingUser && (
            <div className="bg-surface-container-lowest rounded-lg p-2.5 flex flex-col gap-2">
              <input
                className="w-full bg-surface-container rounded-lg p-2 font-body-sm text-body-sm text-on-surface outline-none"
                placeholder="Username"
                value={newUser.username}
                onChange={(event) => setNewUser((prev) => ({ ...prev, username: event.target.value }))}
              />
              <input
                className="w-full bg-surface-container rounded-lg p-2 font-body-sm text-body-sm text-on-surface outline-none"
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
              />
              <input
                className="w-full bg-surface-container rounded-lg p-2 font-body-sm text-body-sm text-on-surface outline-none"
                placeholder="Temporary password"
                type="password"
                value={newUser.password}
                onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
              />
              <select
                className="w-full bg-surface-container rounded-lg p-2 font-body-sm text-body-sm text-on-surface outline-none"
                value={newUser.role}
                onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value as 'user' | 'admin' }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="button"
                onClick={handleCreateUser}
                className="w-full py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold"
              >
                Create User
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            {users.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between bg-surface-container-lowest rounded-lg p-2.5"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                    {member.username}
                  </span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant truncate">
                    {member.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleRole(member)}
                  disabled={member.username === user?.username}
                  className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold uppercase shrink-0 disabled:opacity-60"
                >
                  {member.role}
                </button>
              </div>
            ))}
            {users.length === 0 && (
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-2">
                No other users yet.
              </p>
            )}
          </div>
        </div>
      </section>
      )}

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
        <button
          type="button"
          onClick={logout}
          className="w-full py-3 px-4 rounded-xl bg-error-container text-on-error-container font-title text-[14px] flex items-center justify-center gap-2"
        >
          <Icon name="logout" className="text-[18px]" />
          <span>Sign Out</span>
        </button>
      </section>
    </PageContainer>
  )
}
