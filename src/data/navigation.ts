import type { NavItem } from '../types'

export const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: 'home' },
  {
    path: '/create',
    label: 'Create',
    sidebarLabel: 'Create Script',
    icon: 'add',
    isPrimaryAction: true,
  },
  { path: '/library', label: 'Library', icon: 'folder' },
  { path: '/hub', label: 'Hub', sidebarLabel: 'Content Hub', icon: 'inventory_2' },
  { path: '/intelligence', label: 'Intel', sidebarLabel: 'Intelligence', icon: 'psychology' },
  { path: '/settings', label: 'Settings', icon: 'tune' },
]
