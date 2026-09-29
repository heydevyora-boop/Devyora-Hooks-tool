import type { NavItem } from '../types'

export const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/create', label: 'Create', icon: 'add', isPrimaryAction: true },
  { path: '/library', label: 'Library', icon: 'folder' },
  { path: '/intelligence', label: 'Intel', icon: 'psychology' },
  { path: '/settings', label: 'Settings', icon: 'tune' },
]
