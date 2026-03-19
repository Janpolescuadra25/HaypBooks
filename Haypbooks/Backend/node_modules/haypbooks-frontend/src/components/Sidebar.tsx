'use client'
import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'
import useUI from '@/stores/ui'
import type React from 'react'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { hasPermission, type Permission } from '@/lib/rbac-shared'

function isItemActive(itemHref: string, path: string) {
  return path === itemHref || path.startsWith(itemHref + '/')
}

// Owner books sidebar — intentionally empty during redesign.
// Add new navigation items here when the redesign is complete.
const items: Array<{ href: string; label: string; perm?: Permission }> = [
  { href: '/dashboard', label: 'Dashboard' },
]

function iconFor(href: string) {
  if (href === '/dashboard') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8"/></svg>
  )
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
