'use client'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import useUI from '@/stores/ui'
import type React from 'react'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { hasPermission, type Permission } from '@/lib/rbac-shared'

function isItemActive(itemHref: string, path: string) {
  if (itemHref === '/sales') {
    return (
      path === '/sales' ||
      path.startsWith('/sales/') ||
      path === '/invoices' || path.startsWith('/invoices/') ||
      path === '/sales-receipts' || path.startsWith('/sales-receipts/')
    )
  }
  if (itemHref === '/expenses') {
    return (
      path === '/expenses' || path.startsWith('/expenses/') ||
      path === '/bills' || path.startsWith('/bills/') ||
      path === '/purchase-orders' || path.startsWith('/purchase-orders/') ||
      path === '/bill-payments' || path.startsWith('/bill-payments/') ||
      path === '/vendors' || path.startsWith('/vendors/') ||
      path === '/contractors' || path.startsWith('/contractors/') ||
      path === '/mileage' || path.startsWith('/mileage/') ||
      path === '/1099-filings' || path.startsWith('/1099-filings/')
    )
  }
  if (itemHref === '/reports') {
    return path === '/reports' || path.startsWith('/reports/')
  }
  if (itemHref === '/bank-transactions') {
    return path === '/bank-transactions' || path.startsWith('/bank-transactions/') || path.startsWith('/transactions/')
  }
  if (itemHref === '/payroll') {
    return path === '/payroll' || path.startsWith('/payroll/')
  }
  if (itemHref === '/time') {
    return path === '/time' || path.startsWith('/time/')
  }
  if (itemHref === '/inventory') {
    return path === '/inventory' || path.startsWith('/inventory/')
  }
  if (itemHref === '/taxes') {
    return path === '/taxes' || path.startsWith('/taxes/')
  }
  if (itemHref === '/commerce') {
    return path === '/commerce' || path.startsWith('/commerce/')
  }
  if (itemHref === '/customer-hub') {
    return (
      path === '/customer-hub' || path.startsWith('/customer-hub/') ||
      path === '/customers' || path.startsWith('/customers/') ||
      path === '/leads' || path.startsWith('/leads/') ||
      path === '/appointments' || path.startsWith('/appointments/') ||
      path === '/reviews' || path.startsWith('/reviews/')
    )
  }
  return path === itemHref || path.startsWith(itemHref + '/')
}

const items: Array<{ href: string; label: string; perm?: Permission }> = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/sales', label: 'Sales', perm: 'invoices:read' },
  { href: '/customer-hub', label: 'Customer Hub', perm: 'customers:read' },
  // Route Expenses to the Expenses hub (not Bills) so the Expenses subnav and header appear
  { href: '/expenses', label: 'Expenses & Bills', perm: 'bills:read' },
  // Bank Transactions primary entry (formerly Transactions)
  { href: '/bank-transactions', label: 'Transactions', perm: 'journal:read' },
    { href: '/reports', label: 'Reports', perm: 'reports:read' },
    { href: '/payroll', label: 'Payroll', perm: 'journal:read' },
    { href: '/time', label: 'Time', perm: 'journal:read' },
    { href: '/inventory', label: 'Inventory', perm: 'journal:read' },
    { href: '/projects', label: 'Projects', perm: 'journal:read' },
    { href: '/budgets', label: 'Budgets', perm: 'journal:read' },
    { href: '/tasks', label: 'Tasks', perm: 'journal:read' },
    { href: '/books-review', label: 'Books review', perm: 'journal:read' },
    { href: '/client-overview', label: 'Client overview', perm: 'journal:read' },
    { href: '/my-accountant', label: 'My accountant', perm: 'journal:read' },
    { href: '/apps', label: 'Apps', perm: 'journal:read' },
    { href: '/taxes', label: 'Taxes', perm: 'journal:read' },
    { href: '/commerce', label: 'Commerce', perm: 'journal:read' },
]

function iconFor(href: string) {
  // Simple inline SVGs; replace with your icon set when available
  switch (href) {
    case '/':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>
      )
    case '/dashboard':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>
      )
    case '/sales':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v4H3z"/><path d="M7 13h10M7 17h10M7 9h10"/></svg>
      )
    case '/customer-hub':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
      )
    case '/expenses':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22"/><path d="M5 6h8a4 4 0 110 8H7a4 4 0 100 8h10"/></svg>
      )
    case '/bank-transactions':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10l9-6 9 6v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>
      )
    case '/reports':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z"/><path d="M7 17V7M12 17V11M17 17V13"/></svg>
      )
    case '/payroll':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0113 0"/></svg>
      )
    case '/time':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></svg>
      )
    case '/inventory':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 17l9 4 9-4"/><path d="M3 12l9 4 9-4"/></svg>
      )
    case '/taxes':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v6H4z"/><path d="M4 14h16v6H4z"/></svg>
      )
    case '/commerce':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6h15l-1.5 9h-13z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
      )
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8"/></svg>
      )
  }
}

export default function Sidebar() {
  const pathname = usePathname() ?? ''
  const { sidebarOpen, closeSidebar, sidebarCollapsed, toggleSidebarCollapsed } = useUI()
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null)
  const lastLinkRef = useRef<HTMLAnchorElement | null>(null)
  const [isCompact, setIsCompact] = useState(false)
  // After mount, derive deny-list based on role cookie to avoid hydration mismatches
  const [deny, setDeny] = useState<Set<string>>(new Set())
  useEffect(() => {
    try {
      const m = document.cookie.match(/(?:^|; )role=([^;]+)/)
      const role = m ? (decodeURIComponent(m[1]) as any) : 'admin'
      const hidden = new Set<string>()
      items.forEach((it) => {
        if (it.perm && !hasPermission(role, it.perm)) hidden.add(it.href)
      })
      setDeny(hidden)
    } catch {
      setDeny(new Set())
    }
  }, [])
  // Track zoom-compact to reflect auto-collapse state in the UI (hide/disable toggle)
  useEffect(() => {
    const update = () => {
      try {
        const root = document.documentElement
        setIsCompact(root.classList.contains('zoom-compact'))
      } catch { setIsCompact(false) }
    }
    update()
    const vv = (window as any).visualViewport as VisualViewport | undefined
    if (vv && typeof vv.addEventListener === 'function') {
      vv.addEventListener('resize', update)
      return () => vv.removeEventListener('resize', update)
    } else {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSidebar()
    }
    if (sidebarOpen) {
      document.addEventListener('keydown', onKey)
      setTimeout(() => firstLinkRef.current?.focus(), 0)
    }
    // Defensive: hide any stray "Page actions" labels accidentally rendered in the sidebar by legacy code
    try {
      const scrub = () => {
        const sidebars = document.querySelectorAll('.glass-sidebar')
        sidebars.forEach((sb) => {
          const els = sb.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span,p,legend,label')
          els.forEach((el) => {
            const text = (el.textContent || '').trim().toLowerCase()
            if (text === 'page actions') {
              ;(el as HTMLElement).style.display = 'none'
            }
          })
        })
      }
      scrub()
    } catch {}
    return () => document.removeEventListener('keydown', onKey)
  }, [sidebarOpen, closeSidebar])
  // Also run once on mount to ensure desktop sidebar gets scrubbed
  useEffect(() => {
    try {
      const sidebars = document.querySelectorAll('.glass-sidebar')
      sidebars.forEach((sb) => {
        const els = sb.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span,p,legend,label')
        els.forEach((el) => {
          const text = (el.textContent || '').trim().toLowerCase()
          if (text === 'page actions') {
            ;(el as HTMLElement).style.display = 'none'
          }
        })
      })
    } catch {}
  }, [])
  function onKeyDownTrap(e: React.KeyboardEvent) {
    if (e.key !== 'Tab') return
    const first = firstLinkRef.current
    const last = lastLinkRef.current
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function onKeyDownDesktopNav(e: React.KeyboardEvent<HTMLDivElement>) {
    const key = e.key
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return
    const container = e.currentTarget
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a.nav-link:not(.hidden)'))
    if (!links.length) return
    const activeEl = document.activeElement as HTMLElement | null
    const idx = activeEl ? links.findIndex((el) => el === activeEl) : -1
    let nextIdx = idx
    if (key === 'ArrowDown') nextIdx = Math.min(links.length - 1, idx + 1)
    if (key === 'ArrowUp') nextIdx = Math.max(0, idx - 1)
    if (key === 'Home') nextIdx = 0
    if (key === 'End') nextIdx = links.length - 1
    if (nextIdx !== idx) {
      e.preventDefault()
      links[nextIdx]?.focus()
    }
  }

  // Collapsed state persistence is handled in the UI store via zustand persist
  if (pathname === '/login') return null
  return (
    <>
  <aside
    data-collapsed={sidebarCollapsed ? 'true' : 'false'}
    className={`glass-sidebar hidden md:block overflow-hidden !h-[calc(100dvh-6rem)] transition-[width] duration-200 ease-out`}
  >
  <div className={`h-full overflow-y-auto sidebar-scroll-left ${sidebarCollapsed ? (isCompact ? 'pl-0' : 'pl-1.5') : 'pl-3'}`}>
        <div className="dir-ltr h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isCompact && (
              <span className="mx-0 my-1 text-[11px] text-slate-500" aria-live="polite">
                Auto-compact
              </span>
            )}
          </div>
          <button
            className={`${sidebarCollapsed ? 'mx-auto' : 'ml-auto'} my-1 inline-flex items-center justify-center size-6 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 transition-colors`}
            onClick={toggleSidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {sidebarCollapsed ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>
            )}
          </button>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Primary" onKeyDown={onKeyDownDesktopNav}>
          {items.map((it) => {
            const active = isItemActive(it.href, pathname)
            const hidden = deny.has(it.href)
            return (
              <Link
                key={it.href}
                href={it.href as Route}
                className={`nav-link ${active ? 'nav-link-active' : ''} ${hidden ? 'hidden' : ''} ${sidebarCollapsed ? 'justify-center group relative' : ''}`}
                aria-current={active ? 'page' : undefined}
                title={sidebarCollapsed ? it.label : undefined}
                aria-label={sidebarCollapsed ? it.label : undefined}
              >
                <span className={`shrink-0 inline-flex items-center justify-center rounded-md ${sidebarCollapsed ? 'size-6' : 'size-5'}`} aria-hidden="true">
                  {iconFor(it.href)}
                </span>
                {!sidebarCollapsed && <span>{it.label}</span>}
                {sidebarCollapsed && <span className="sr-only">{it.label}</span>}
                {sidebarCollapsed && (
                  <span
                    role="tooltip"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-white/95 text-slate-800 text-xs font-medium shadow-glass border border-slate-200 px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity z-[70]"
                  >
                    {it.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        </div>
      </div>
      </aside>

      {sidebarOpen && (
        <MobileSidebar
          items={items}
          pathname={pathname}
          deny={deny}
          firstLinkRef={firstLinkRef}
          lastLinkRef={lastLinkRef}
          closeSidebar={closeSidebar}
          onKeyDownTrap={onKeyDownTrap}
        />
      )}
    </>
  )
}

function MobileSidebar({
  items,
  pathname,
  deny,
  firstLinkRef,
  lastLinkRef,
  closeSidebar,
  onKeyDownTrap,
}: {
  items: Array<{ href: string; label: string; perm?: Permission }>
  pathname: string
  deny: Set<string>
  firstLinkRef: RefObject<HTMLAnchorElement>
  lastLinkRef: RefObject<HTMLAnchorElement>
  closeSidebar: () => void
  onKeyDownTrap: (e: React.KeyboardEvent) => void
}) {
  const [animOpen, setAnimOpen] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimOpen(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const visibleItems = items.filter((it) => !deny.has(it.href))

  return (
    <div className="fixed inset-0 z-[60] md:hidden" onClick={closeSidebar} role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ease-out ${animOpen ? 'opacity-100' : 'opacity-0'}`} />
      <aside
        className={`absolute left-3 right-12 top-24 glass-sidebar !h-[calc(100dvh-7.5rem)] overflow-hidden transform transition-all duration-200 ease-out ${animOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDownTrap}
      >
  <div className="h-full overflow-y-auto sidebar-scroll-left pl-2.5">
        <div className="dir-ltr h-full">
        <nav className="flex flex-col gap-1" aria-label="Primary">
          {visibleItems.map((it, idx) => {
            const active = isItemActive(it.href, pathname)
            return (
              <Link
                key={it.href}
                href={it.href as Route}
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
                onClick={closeSidebar}
                ref={idx === 0 ? firstLinkRef : idx === visibleItems.length - 1 ? lastLinkRef : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <span className="shrink-0 inline-flex items-center justify-center rounded-md size-5" aria-hidden="true">{iconFor(it.href)}</span>
                <span>{it.label}</span>
              </Link>
            )
          })}
        </nav>
        </div>
        </div>
      </aside>
    </div>
  )
}
