'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { OPERATIONS_NAV } from '@/config/operations-navigation'
import { ContentTabBar } from './ContentTabBar'

interface TabbedSectionLayoutProps {
  /** Matches OperationsSection.id e.g. 'cash-banking', 'sales', 'expenses' */
  sectionKey: string
  children: React.ReactNode
  /** Optional action buttons rendered in the top-right header slot */
  actions?: React.ReactNode
}

export function TabbedSectionLayout({ sectionKey, children, actions }: TabbedSectionLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const section = OPERATIONS_NAV.find((s) => s.id === sectionKey)

  // Scroll to top whenever the tab content changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  if (!section) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Section &quot;{sectionKey}&quot; not found in navigation config.
      </div>
    )
  }

  // ── Parse active subsection + tab from URL ──────────────────────────────
  // Expected URL pattern: /operations/<sectionKey>/<subsectionId>/<tabId>
  const segments = (pathname ?? '').split('/').filter(Boolean)
  const sectionIdx = segments.indexOf(sectionKey)
  const subsectionSlug = sectionIdx >= 0 ? segments[sectionIdx + 1] : undefined
  const tabSlug = sectionIdx >= 0 ? segments[sectionIdx + 2] : undefined

  const activeSubsection =
    section.subsections.find((s) => s.id === subsectionSlug) ?? section.subsections[0]
  const activeTab =
    activeSubsection?.tabs.find((t) => t.id === tabSlug) ?? activeSubsection?.tabs[0]

  // ── Navigation handlers ─────────────────────────────────────────────────
  function handleTabNavigate(tabId: string) {
    const tab = activeSubsection?.tabs.find((t) => t.id === tabId)
    if (tab) {
      router.push(tab.path)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* ── Section header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{section.label}</h1>
          {activeSubsection && (
            <p className="text-xs text-slate-400 mt-0.5">
              {activeSubsection.label}
              {activeTab ? ` › ${activeTab.label}` : ''}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* ── Content tab bar (leaf tabs within current subsection) ──────────── */}
      {activeSubsection && (
        <ContentTabBar
          tabs={activeSubsection.tabs}
          activeId={activeTab?.id ?? ''}
          onNavigate={handleTabNavigate}
        />
      )}

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
