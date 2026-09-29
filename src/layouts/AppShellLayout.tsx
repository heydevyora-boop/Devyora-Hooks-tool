import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { BottomTabBar } from '../components/layout/BottomTabBar'
import { Sidebar } from '../components/layout/Sidebar'
import { usePersistentState } from '../hooks/usePersistentState'

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/create': 'Create Script',
  '/library': 'Library',
  '/intelligence': 'Intelligence Hub',
  '/settings': 'Settings',
}

export function AppShellLayout() {
  const location = useLocation()
  const pageLabel = PAGE_LABELS[location.pathname] ?? 'Devyora Hooks'
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistentState(
    'devyora-sidebar-collapsed',
    false,
  )

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen lg:flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

      <div className="flex flex-col min-h-screen lg:flex-1 lg:min-w-0 lg:h-screen lg:overflow-hidden">
        <AppHeader pageLabel={pageLabel} />
        <main className="flex-1 w-full bg-surface pt-20 pb-24 lg:pt-0 lg:pb-0 lg:overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <BottomTabBar />
    </div>
  )
}
