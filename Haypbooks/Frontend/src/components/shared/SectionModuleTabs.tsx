'use client'

import { usePathname } from 'next/navigation'
import ModuleTabs from '@/components/shared/ModuleTabs'

interface Tab {
  label: string
  value: string
  path?: string
}

interface Props {
  tabs: Tab[]
  basePath: string
}

/**
 * Same as ModuleTabs but automatically hides on creation / detail sub-routes.
 * Tabs are shown only when the current pathname is an exact match for the
 * basePath or one of the tab hrefs (i.e. a "listing" page).
 * Any deeper path (e.g. /invoices/new, /products-services/[id]) gets no tabs.
 */
export default function SectionModuleTabs({ tabs, basePath }: Props) {
  const pathname = usePathname()

  const listingPaths = [
    basePath,
    ...tabs.map((tab) => tab.path ?? `${basePath}/${tab.value}`),
  ]

  if (!listingPaths.includes(pathname)) return null

  return <ModuleTabs tabs={tabs} basePath={basePath} />
}
