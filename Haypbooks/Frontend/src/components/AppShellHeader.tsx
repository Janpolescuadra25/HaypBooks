'use client'
import { usePathname } from 'next/navigation'
import UserMenu from '@/components/UserMenu'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import NewMenu from '@/components/NewMenu'
import { useEffect, useMemo, useRef, useState } from 'react'
import Popover from '@/components/Popover'
import useUI from '@/stores/ui'
import { getProfileCached } from '@/lib/profile-cache'
import Breadcrumbs from '@/components/Breadcrumbs'
import DashboardBrand from '@/components/DashboardBrand'
import CompanySwitcher from '@/components/CompanySwitcher'
import HubSwitcher from '@/components/HubSwitcher'

export default function AppShellHeader() {
  const pathname = usePathname()
  const { toggleSidebar } = useUI()
  const [perms, setPerms] = useState<string[] | null>(null)
  const [query, setQuery] = useState('')
  const [showGear, setShowGear] = useState(false)
  const [showAcct, setShowAcct] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showNews, setShowNews] = useState(false)
  const [showApps, setShowApps] = useState(false)
  const [features, setFeatures] = useState<{ payments?: boolean } | null>(null)
  const [closedThrough, setClosedThrough] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const appsTriggerRef = useRef<HTMLButtonElement | null>(null)
  const acctTriggerRef = useRef<HTMLButtonElement | null>(null)
  const helpTriggerRef = useRef<HTMLButtonElement | null>(null)
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null)
  const moreTriggerRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    let ok = true
    getProfileCached()
      .then((p) => {
        if (!ok) return
        setPerms(Array.isArray(p?.permissions) ? p.permissions : [])
        setFeatures(p?.features || {})
      })
      .catch(() => setPerms([]))
    return () => {
      ok = false
    }
  }, [])
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
    // Refresh on route change in case close date changes while navigating
  }, [pathname])
  const isAccountant = useMemo(() => perms?.includes('accountant:tools') || false, [perms])
  if (pathname === '/login') return null

  return (
    <>
      <div className="glass-topbar flex items-center gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="md:hidden inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
            onClick={toggleSidebar}
            aria-label="Open navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          {/* HaypBooks logo/brand */}
          {/* Logo navigates to dashboard (not intro) */}
          <a href="/dashboard" className="hidden md:flex items-center gap-2" aria-label="HaypBooks Home" title="Go to Dashboard">
            <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 font-bold text-sm" style={{ color: '#fff' }}>
              H
            </div>
            <span className="text-base font-semibold text-slate-800">HaypBooks</span>
          </a>
          <div className="ml-2">
            <CompanySwitcher />
          </div>
          {/* Hub switcher for users with multiple roles (explicit context switch) */}
          <div className="ml-2 hidden md:flex">
            <HubSwitcher />
          </div>
        </div>

        {/* Center: Global search (grows) */}
        <div className="hidden md:flex items-center gap-2 min-w-0 grow">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, vendors, accounts… (Ctrl/Cmd+K opens command palette)"
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm"
            aria-label="Global search"
            onKeyDown={(e) => {
              if (e.key === 'Enter') window.location.href = `/search?q=${encodeURIComponent(query)}`
            }}
            ref={searchInputRef}
          />
          <button
            className="btn-secondary shrink-0 !px-3 !py-1 text-sm"
            onClick={() => (window.location.href = `/search?q=${encodeURIComponent(query)}`)}
            aria-label="Run search"
          >
            Search
          </button>
        </div>

        {/* Right: primary + condensed icon actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Closed-through pill (visible when set) */}
          {closedThrough && (
            <div className="hidden md:inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700" title={`Closed through ${closedThrough}`}>
              <a href="/reports/closing-date" className="inline-flex items-center gap-1" aria-label={`Closed through ${closedThrough}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 7V3m8 4V3M3 11h18M7 20h10a2 2 0 002-2v-7H5v7a2 2 0 002 2z"/></svg>
                <span>Closed through</span>
                <span className="font-mono">{closedThrough}</span>
              </a>
              {/* Permission-aware quick link to Close Books */}
              {Array.isArray(perms) && perms.includes('journal:write') && (
                <>
                  <span className="mx-1 text-slate-300">|</span>
                  <a href="/settings/close-books" className="text-slate-600 hover:text-slate-800" aria-label="Manage close date">Manage</a>
                </>
              )}
            </div>
          )}
          <NewMenu />
          <div className="hidden md:flex items-center gap-1">
            {/* Activity icon */}
            <a
              href="/activity"
              className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
              title="Activity"
              aria-label="View all recent activity"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h4l3 8 4-16 3 8h4" />
              </svg>
            </a>

            {/* Developers portal */}
            <a
              href="/developers"
              className="hidden md:inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
              title="Developers"
              aria-label="Open developer portal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M16 18l6-6-6-6" />
                <path d="M8 6L2 12l6 6" />
              </svg>
            </a>

            {/* Apps */}
            <div className="relative">
              {showApps ? (
                <button
                    id="apps-menu-button"
                    ref={appsTriggerRef}
                  className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
                  onClick={() => setShowApps(false)}
                  aria-haspopup="true"
                  aria-expanded="true"
                  aria-controls="apps-menu"
                  title="Apps"
                  aria-label="Open apps"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowApps(false)
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
                  </svg>
                </button>
              ) : (
                <button
                  id="apps-menu-button"
                  ref={appsTriggerRef}
                  className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
                  onClick={() => setShowApps(true)}
                  aria-haspopup="true"
                  aria-expanded="false"
                  aria-controls="apps-menu"
                  title="Apps"
                  aria-label="Open apps"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowApps(false)
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
                  </svg>
                </button>
              )}
              {showApps && (
                <Popover
                  open={showApps}
                  anchorRef={appsTriggerRef}
                  onClose={() => { setShowApps(false); appsTriggerRef.current?.blur() }}
                  matchWidth={false}
                  className="right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg text-sm z-20 p-2"
                >
                  <div id="apps-menu" role="menu" aria-labelledby="apps-menu-button">
                  <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/apps">App hub</a>
                  <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/apps/banking">Banking</a>
                  <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/apps/time">Time</a>
                  <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/apps/commerce">Commerce</a>
                  </div>
                </Popover>
              )}
            </div>

            {/* Accountant */}
            <div className="relative">
              {showAcct ? (
                <button
                  id="accountant-menu-button"
                  ref={acctTriggerRef}
                  className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
                  onClick={() => setShowAcct(false)}
                  aria-haspopup="true"
                  aria-expanded="true"
                  aria-controls="accountant-menu"
                  title="Accountant tools"
                  aria-label="Open accountant tools"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowAcct(false)
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7z" />
                  </svg>
                </button>
              ) : (
                <button
                  id="accountant-menu-button"
                  ref={acctTriggerRef}
                  className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
                  onClick={() => setShowAcct(true)}
                  aria-haspopup="true"
                  aria-expanded="false"
                  aria-controls="accountant-menu"
                  title="Accountant tools"
                  aria-label="Open accountant tools"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowAcct(false)
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7z" />
                  </svg>
                </button>
              )}
              {showAcct && (
                <Popover
                  open={showAcct}
                  anchorRef={acctTriggerRef}
                  onClose={() => { setShowAcct(false); acctTriggerRef.current?.blur() }}
                  matchWidth={false}
                  className="right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-lg text-sm z-20"
                >
                  <div id="accountant-menu" role="menu" aria-labelledby="accountant-menu-button">
                  {!isAccountant && <div role="none" className="px-3 py-2 text-slate-500">Accountant tools unavailable for your role.</div>}
                  {isAccountant && (
                    <div role="none" className="py-1">
                      <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50" href="/accountant/reclassify">Reclassify transactions</a>
                      <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50" href="/accountant/write-offs">Write off invoices</a>
                      <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50" href="/settings/close-books">Close books</a>
                      <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50" href="/reports/management">Management reports</a>
                      <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50" href="/transactions/reconcile">Reconciliation</a>
                      <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50" href="/audit-log">Voided/Deleted transactions</a>
                    </div>
                  )}
                  </div>
                </Popover>
              )}
            </div>

            {/* Help (includes What’s new) */}
            <div className="relative">
              {showHelp ? (
                <button
                  id="help-menu-button"
                  ref={helpTriggerRef}
                  className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
                  onClick={() => setShowHelp(false)}
                  aria-haspopup="true"
                  aria-expanded="true"
                  aria-controls="help-menu"
                  title="Help"
                  aria-label="Open help"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowHelp(false)
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 9a3 3 0 116 0c0 2-3 2-3 4M12 17h.01" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </button>
              ) : (
                <button
                  id="help-menu-button"
                  ref={helpTriggerRef}
                  className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
                  onClick={() => setShowHelp(true)}
                  aria-haspopup="true"
                  aria-expanded="false"
                  aria-controls="help-menu"
                  title="Help"
                  aria-label="Open help"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowHelp(false)
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 9a3 3 0 116 0c0 2-3 2-3 4M12 17h.01" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </button>
              )}
              {showHelp && (
                <Popover
                  open={showHelp}
                  anchorRef={helpTriggerRef}
                  onClose={() => { setShowHelp(false); helpTriggerRef.current?.blur() }}
                  matchWidth={false}
                  className="right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-lg text-sm z-20"
                >
                  <div id="help-menu" role="menu" aria-labelledby="help-menu-button">
                  <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50" href="/help">Help center</a>
                  <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50" href="/guides">Guides</a>
                  <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50" href="/contact-support">Contact support</a>
                  <div role="separator" className="border-t border-slate-200 my-1" />
                  <div role="none" className="px-3 py-2 text-slate-700">What’s new</div>
                  <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50" href="/changelog">View changelog</a>
                  </div>
                </Popover>
              )}
            </div>

            {/* Settings (Gear) */}
            <div className="relative">
              {showGear ? (
                <button
                  id="settings-menu-button"
                  ref={settingsTriggerRef}
                  className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
                  onClick={() => setShowGear(false)}
                  aria-haspopup="true"
                  aria-expanded="true"
                  aria-controls="settings-menu"
                  title="Settings"
                  aria-label="Open settings"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowGear(false)
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1 1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06A2 2 0 016.04 3.7l.06.06a1.65 1.65 0 001.82.33H8a1.65 1.65 0 001-1.51V2a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.08a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V8a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                </button>
              ) : (
                <button
                  id="settings-menu-button"
                  ref={settingsTriggerRef}
                  className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
                  onClick={() => setShowGear(true)}
                  aria-haspopup="true"
                  aria-expanded="false"
                  aria-controls="settings-menu"
                  title="Settings"
                  aria-label="Open settings"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowGear(false)
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1 1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h-.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06A2 2 0 016.04 3.7l.06.06a1.65 1.65 0 001.82.33H8a1.65 1.65 0 001-1.51V2a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.08a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V8a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                </button>
              )}
              {showGear && (
                <Popover
                  open={showGear}
                  anchorRef={settingsTriggerRef}
                  onClose={() => { setShowGear(false); settingsTriggerRef.current?.blur() }}
                  matchWidth={false}
                  className="right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg text-sm z-20"
                >
                  <div id="settings-menu" role="menu" aria-labelledby="settings-menu-button">
                  <div role="none" className="px-3 py-2 font-medium text-slate-700">Settings</div>
                  <div role="separator" className="border-t border-slate-200" />
                  <div role="none" className="grid grid-cols-2 gap-1 p-2">
                    <a role="menuitem" className="px-3 py-2 hover:bg-slate-50 rounded" href="/account-and-settings">Account and settings</a>
                    <a role="menuitem" className="px-3 py-2 hover:bg-slate-50 rounded" href="/settings/users">Manage users</a>
                    <a role="menuitem" className="px-3 py-2 hover:bg-slate-50 rounded" href="/settings/lists">All lists</a>
                    <a role="menuitem" className="px-3 py-2 hover:bg-slate-50 rounded" href="/settings/tools">Tools</a>
                    <a role="menuitem" className="px-3 py-2 hover:bg-slate-50 rounded" href="/transactions/chart-of-accounts">Chart of accounts</a>
                    <a role="menuitem" className="px-3 py-2 hover:bg-slate-50 rounded" href="/settings/forms">Custom form styles</a>
                    {features?.payments !== false && (
                      <a role="menuitem" className="px-3 py-2 hover:bg-slate-50 rounded" href="/payments/settings">Haypbooks Payments</a>
                    )}
                    <a role="menuitem" className="px-3 py-2 hover:bg-slate-50 rounded" href="/settings/close-books">Close date</a>
                  </div>
                  </div>
                </Popover>
              )}
            </div>
          </div>

          {/* Compact: group secondary icons under More on small screens */}
          <div className="md:hidden relative">
            {showNews ? (
              <button
                id="more-menu-button"
                className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
                onClick={() => setShowNews(false)}
                aria-haspopup="true"
                aria-expanded="true"
                aria-controls="more-menu"
                title="More"
                aria-label="Open more actions"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowNews(false)
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
            ) : (
              <button
                id="more-menu-button"
                className="inline-flex items-center justify-center size-8 rounded-xl border border-slate-200 bg-white text-slate-700"
                onClick={() => setShowNews(true)}
                aria-haspopup="true"
                aria-expanded="false"
                aria-controls="more-menu"
                title="More"
                aria-label="Open more actions"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowNews(false)
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
            )}
            {showNews && (
              <Popover
                open={showNews}
                anchorRef={moreTriggerRef}
                onClose={() => { setShowNews(false); moreTriggerRef.current?.blur() }}
                matchWidth={false}
                className="right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg text-sm z-20 p-2"
              >
                <div id="more-menu" role="menu" aria-labelledby="more-menu-button">
                <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/activity">Activity</a>
                <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/developers">Developers</a>
                <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/apps">Apps</a>
                {isAccountant && (
                  <>
                    <div role="separator" className="border-t border-slate-200 my-1" />
                    <div role="none" className="px-3 py-1 text-slate-700">Accountant</div>
                    <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/accountant/reclassify">Reclassify</a>
                    <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/settings/close-books">Close books</a>
                  </>
                )}
                <div role="separator" className="border-t border-slate-200 my-1" />
                <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/help">Help</a>
                <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/changelog">What’s new</a>
                <div role="separator" className="border-t border-slate-200 my-1" />
                <a role="menuitem" className="block px-3 py-2 hover:bg-slate-50 rounded" href="/account-and-settings">Settings</a>
                </div>
              </Popover>
            )}
          </div>
          <RoleSwitcher />
          <UserMenu />
        </div>
      </div>

      <header className="glass-header">
        {/* Right-aligned brand inside the second header */}
        <div className="hidden sm:flex items-center absolute right-4 top-1/2 -translate-y-1/2">
          <DashboardBrand />
        </div>
        <div className="text-center">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">
            {(() => {
              // Title rules: use "Overview" for both / and /dashboard
              if (pathname === '/dashboard' || pathname === '/dashboard/overview') return 'Overview'
              if (pathname === '/') return 'Overview'
              if (pathname === '/sales') return 'Overview'
              // Dashboard subroutes
              if (pathname === '/dashboard/cash-flow') return 'Cash Flow'
              if (pathname === '/dashboard/flow') return 'Workflow'
              // For Sales subpages, drop the 'Sales /' prefix in the title
              if (pathname.startsWith('/sales/')) {
                const parts = pathname.split('/').filter(Boolean)
                const last = parts[parts.length - 1]
                return (last?.[0]?.toUpperCase() || '') + (last?.slice(1) || '')
              }
              // For Bank Transactions subpages, drop the prefix
              if (pathname.startsWith('/bank-transactions/')) {
                const parts = pathname.split('/').filter(Boolean)
                const last = parts[parts.length - 1]
                return (last?.[0]?.toUpperCase() || '') + (last?.slice(1) || '')
              }
              // For Reports subpages, drop the 'Reports /' prefix and show only the page name
              if (pathname.startsWith('/reports/')) {
                const parts = pathname.split('/').filter(Boolean)
                // Handle group routes
                if (pathname === '/reports/custom') return 'Custom reports'
                if (pathname === '/reports/management') return 'Management reports'
                if (pathname === '/reports/performance-center') return 'Performance center'
                if (pathname === '/reports') return 'Reports'
                // For dynamic standard or specific reports like /reports/standard/[slug] or /reports/balance-sheet
                const last = parts[parts.length - 1]
                const label = last.split('-').map((p) => (p[0]?.toUpperCase() || '') + p.slice(1)).join(' ')
                return label
              }
              // Default: join parts as 'A / B' but simplify Reports headings
              return pathname
                .split('/')
                .filter(Boolean)
                .map((p) => (p[0]?.toUpperCase() || '') + p.slice(1))
                .join(' / ')
            })()}
          </h1>
          {/* Breadcrumbs below title on larger screens */}
          <div className="hidden md:block mt-1"><Breadcrumbs /></div>
          {/* Optional description tagline (hidden on Sales, Expenses, Transactions) */}
          {/* NOTE: The tagline was removed for clarity across the Overview/Cash flow/Workflow tabs. */}
        </div>
      </header>
    </>
  )
}
