import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { BottomTabBar } from '../components/layout/BottomTabBar'

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/create': 'Create Hook',
  '/library': 'Library',
  '/intelligence': 'Intelligence Hub',
  '/settings': 'Settings',
}

export function AppShellLayout() {
  const location = useLocation()
  const pageLabel = PAGE_LABELS[location.pathname] ?? 'Devyora Hooks'

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md flex flex-col min-h-screen">
      <AppHeader pageLabel={pageLabel} />
      <main className="flex-1 w-full bg-surface pt-20 pb-24">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
