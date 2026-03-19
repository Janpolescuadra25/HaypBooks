"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import TopBarActions from '@/components/practice-hub/TopBarActions'
import PageLayoutDefaults from '@/components/practice-hub/PageLayoutDefaults'
import RightGapAdjuster from '@/components/practice-hub/RightGapAdjuster'

export default function PracticeHeader() {
  const pathname = usePathname() ?? ''
  const [closedThrough, setClosedThrough] = useState<string | null>(null)

  // derive the current page name for the secondary bar (friendly mapping)
  const pageLabel = (() => {
    if (!pathname.startsWith('/practice-hub/')) return ''
    const seg = pathname.replace('/practice-hub/', '').split('/')[0]
    // default to Home when at root or on dashboard
    if (!seg || seg === 'dashboard') return 'Home'
    const map: Record<string, string> = {
      clients: 'Clients',
      tasks: 'Tasks',
      'client-connect': 'Client Portal',
      workpapers: 'Workpapers',
      team: 'Team',
      reports: 'Reports',
      settings: 'Settings',
    }
    return map[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)
  })()

  useEffect(() => {
    let alive = true
    async function loadClosed() {
      try {
        const res = await fetch('/api/periods', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (alive) setClosedThrough(data?.closedThrough || null)
      } catch {}
    }
    loadClosed()
  }, [pathname])

  return (
    <>
      {/* combined fixed container for both bars */}
      <div className="topbar-floating fixed left-0 right-0 hidden md:flex flex-col items-center" style={{ top: 'var(--hb-topbar-top)', zIndex: 70 }}>
        {/* primary bar */}
        <div
          className="w-full flex"
          style={{ minHeight: 'var(--hb-topbar-height-sm, var(--hb-topbar-height))' }}
        >
          <div className="w-full px-4 flex items-center gap-3 justify-between bg-white rounded-2xl shadow" style={{ marginLeft: 'var(--ph-pbar-ml, 0px)', marginRight: 'var(--ph-pbar-mr, 0px)' }}>
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">HB</div>
                <div className="hidden sm:block leading-4">
                  <div className="text-sm font-semibold">HaypBooks</div>
                  <div className="text-xs text-emerald-600">Practice Hub</div>
                </div>
              </div>
              <div className="hidden sm:block h-5 w-px bg-slate-200 mr-2" aria-hidden />
              <input
                type="search"
                placeholder="Search clients, work, messages"
                className="h-6 w-full sm:w-[320px] rounded-full border border-slate-200 bg-white px-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 ml-4">
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-1 px-2 h-6 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs">+ Invite</button>
                <button className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-xs">New Work</button>
              </div>

              <div className="h-6 w-px bg-slate-200 mx-3" aria-hidden />

              <div className="flex items-center gap-3">
                <button aria-label="Help" className="inline-flex items-center gap-1 px-2 h-6 rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs">
                  <svg className="h-4 w-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.5 9a2.5 2.5 0 115 0c0 1.75-2 2.25-2 3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden sm:inline">Help</span>
                </button>

                <button aria-label="Notifications" className="notification-btn relative inline-flex items-center justify-center px-2 h-6 rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs">
                  <svg className="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="notification-badge inline-flex items-center justify-center bg-emerald-600 text-white">3</span>
                </button>

                <TopBarActions />
                <RightGapAdjuster />

                {/* Apply per-page layout defaults (invisible) */}
                <PageLayoutDefaults />
              </div>
            </div>
          </div>
        </div>

        {/* secondary bar with current page label */}
        <div className="w-full flex" style={{ minHeight: 'var(--hb-topbar-height-sm, var(--hb-topbar-height))', zIndex: 60 }}>
          <div className="w-full px-4 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm py-1" style={{ marginLeft: 'var(--ph-sbar-ml, 0px)', marginRight: 'var(--ph-sbar-mr, 0px)' }}>
            <div className="text-base font-semibold text-slate-900">{pageLabel}</div>
          </div>
        </div>
      </div>
    </>
  )
}
