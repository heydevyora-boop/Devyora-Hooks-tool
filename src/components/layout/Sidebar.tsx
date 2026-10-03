import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { navItems } from '../../data/navigation'
import { LOGO_URL, AVATAR_URL } from '../../data/brand'
import { useAuth } from '../../hooks/useAuth'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const primaryAction = navItems.find((item) => item.isPrimaryAction)
  const restItems = navItems.filter((item) => !item.isPrimaryAction)

  return (
    <aside
      className={`hidden lg:flex lg:flex-col lg:h-screen lg:sticky lg:top-0 lg:shrink-0 border-r border-outline-variant/40 bg-surface-container-low/60 transition-[width] duration-200 ease-out ${
        collapsed ? 'lg:w-[76px]' : 'lg:w-[260px]'
      }`}
    >
      <div className={`flex items-center h-16 px-4 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
        <img alt="Devyora Hooks logo" className="h-7 w-auto object-contain shrink-0" src={LOGO_URL} />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-title text-title text-on-surface tracking-tight truncate">
              Devyora Hooks
            </span>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wide">
              Script Intel
            </span>
          </div>
        )}
      </div>

      <div className="px-3 pt-1 pb-3">
        {primaryAction && (
          <NavLink
            to={primaryAction.path}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl bg-tertiary-container text-on-tertiary shadow-sm shadow-tertiary-container/30 font-title text-title font-semibold transition-colors hover:bg-tertiary ${
                collapsed ? 'justify-center h-11 w-11 mx-auto' : 'px-3.5 py-2.5'
              } ${isActive ? 'ring-2 ring-tertiary-container/40 ring-offset-2 ring-offset-surface-container-low' : ''}`
            }
            title={primaryAction.sidebarLabel ?? primaryAction.label}
          >
            <Icon name={primaryAction.icon} className="text-[20px]" />
            {!collapsed && <span>{primaryAction.sidebarLabel ?? primaryAction.label}</span>}
          </NavLink>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-1">
        {restItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            title={item.sidebarLabel ?? item.label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg font-label-md text-label-md font-medium transition-colors relative ${
                collapsed ? 'justify-center h-11 w-11 mx-auto' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`
            }
          >
            <span className="relative shrink-0">
              <Icon name={item.icon} className="text-[20px]" />
              {item.path === '/intelligence' && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-tertiary-container animate-ping" />
              )}
            </span>
            {!collapsed && <span className="truncate">{item.sidebarLabel ?? item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-outline-variant/40 flex flex-col gap-2">
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center gap-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-label-sm text-label-sm ${
            collapsed ? 'justify-center h-9 w-9 mx-auto' : 'px-3 py-2'
          }`}
        >
          <Icon name={collapsed ? 'chevron_right' : 'chevron_left'} className="text-[18px]" />
          {!collapsed && <span>Collapse</span>}
        </button>

        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : 'px-1'}`}>
          <div className="relative shrink-0">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-surface"
              src={AVATAR_URL}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-surface" />
          </div>
          {!collapsed && (
            <>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  {user?.username ?? 'Guest'}
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wide truncate">
                  {user?.role ?? '—'}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="shrink-0 w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center"
              >
                <Icon name="logout" className="text-[16px]" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
