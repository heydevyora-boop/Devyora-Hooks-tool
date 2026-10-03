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
  { path: '/plan', label: 'Plan', sidebarLabel: 'Plan', icon: 'account_tree' },
  { path: '/intelligence', label: 'Intel', sidebarLabel: 'Intelligence', icon: 'psychology' },
  { path: '/video-blueprint', label: 'Blueprint', sidebarLabel: 'Video Blueprint', icon: 'video_settings' },
  { path: '/settings', label: 'Settings', icon: 'tune' },
]
