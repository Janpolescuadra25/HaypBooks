import { LayoutDashboard } from 'lucide-react'

export interface NavTab {
  label: string
  value: string
  status: 'existing' | 'ghost-fix' | 'coming-soon'
}

export interface NavItem {
  title: string
  /** Display label (alias for title used by slug pages) */
  label?: string
  path?: string
  /** href alias for path used by slug/router pages */
  href?: string
  items?: NavItem[]
  /** Tabs shown in ModuleTabs bar when this group is active */
  tabs?: NavTab[]
  isEnterprise?: boolean
  /** When true, render as a visual section divider (not clickable) */
  isSectionLabel?: boolean
  /** Restrict visibility to specific country codes (ISO2) */
  countries?: string[]
}

export interface NavGroup {
  title?: string
  icon?: any
  items: NavItem[]
  /** Restrict visibility to specific country codes (ISO2) */
  countries?: string[]
}

export interface NavSection {
  title: string
  /** Short label shown in the primary rail button (max ~8 chars). Falls back to first word of title. */
  label?: string
  /** Section identifier used by [[...slug]] routing pages */
  id?: string
  icon: any
  items?: NavItem[]
  /** Grouped navigation items used by [[...slug]] routing pages */
  groups?: NavGroup[]
  isEnterprise?: boolean
  /** Restrict visibility to specific country codes (ISO2) */
  countries?: string[]
}

export const practiceHubNavigation: NavSection[] = [
  {
    title: 'DASHBOARD',
    label: 'DASHBOARD',
    id: 'dashboard',
    icon: LayoutDashboard,
    groups: [
      {
        title: 'Overview',
        icon: LayoutDashboard,
        items: [
          {
            title: 'Practice Dashboard',
            path: '/practice-hub',
          },
        ],
      },
    ],
  },
]
