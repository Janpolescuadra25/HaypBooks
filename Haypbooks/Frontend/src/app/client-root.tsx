"use client"
import { ReactNode, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { PUBLIC_PATH_PREFIXES } from '../config/publicPaths'
import PracticeHeader from '@/components/PracticeHeader'
import CommandPalette from '@/components/CommandPalette'
import { useCommandPalette } from '@/stores/commandPalette'
import useUI from '@/stores/ui'
import OwnerTopBar from '@/components/owner/OwnerTopBar'
import OwnerSidebar from '@/components/owner/OwnerSidebar'

const MockInit = dynamic(() => import('@/components/MockInit'), { ssr: false })

export default function ClientRoot({ children }: { children: ReactNode }) {
  const { openPalette } = useCommandPalette()
  const { setSidebarCollapsed } = useUI()
  const prevCollapsedRef = useRef<boolean | null>(null)
  const compactActiveRef = useRef<boolean>(false)
  const expandedActiveRef = useRef<boolean>(false)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = (typeof e.key === 'string' ? e.key : '').toLowerCase()
      const isCmdK = (key === 'k') && (e.ctrlKey || e.metaKey)
      const target = e.target as HTMLElement | null
      const tag = (target && typeof target.tagName === 'string' ? target.tagName : '').toLowerCase()
      const typing = tag === 'input' || tag === 'textarea' || !!(target as any)?.isContentEditable
      if (isCmdK && !typing) {
        e.preventDefault()
        openPalette()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openPalette])

  // Adjust density based on page zoom to avoid "mobile feel" on Windows zoom out
  useEffect(() => {
    const root = document.documentElement
    const apply = (scale: number) => {
      // Hysteresis thresholds to avoid flicker near boundaries
      const enterCompact = scale <= 0.99
      const exitCompact = scale >= 1.005
      const enterExpanded = scale >= 1.08
      const exitExpanded = scale <= 1.02

      // Update compact state with hysteresis
      if (!compactActiveRef.current && enterCompact) {
        // entering compact
        try {
          prevCollapsedRef.current = useUI.getState().sidebarCollapsed
          setSidebarCollapsed(true)
        } catch {}
        compactActiveRef.current = true
      } else if (compactActiveRef.current && exitCompact) {
        // leaving compact
        try {
          if (prevCollapsedRef.current !== null) setSidebarCollapsed(prevCollapsedRef.current)
        } catch {}
        prevCollapsedRef.current = null
        compactActiveRef.current = false
      }

      // Update expanded state with hysteresis
      if (!expandedActiveRef.current && enterExpanded) {
        expandedActiveRef.current = true
      } else if (expandedActiveRef.current && exitExpanded) {
        expandedActiveRef.current = false
      }

      // Reflect states on html element
      root.classList.toggle('zoom-compact', compactActiveRef.current)
      root.classList.toggle('zoom-expanded', expandedActiveRef.current)
      root.setAttribute('data-zoom-scale', String(Math.round(scale * 1000) / 1000))
    }
    const vv = (window as any).visualViewport as VisualViewport | undefined
    if (vv && typeof vv.addEventListener === 'function') {
      apply(vv.scale || 1)
      const onResize = () => apply(vv.scale || 1)
      vv.addEventListener('resize', onResize)
      return () => vv.removeEventListener('resize', onResize)
    } else {
      // Fallback: approximate with devicePixelRatio changes
      apply(window.devicePixelRatio || 1)
      const onChange = () => apply(window.devicePixelRatio || 1)
      window.addEventListener('resize', onChange)
      return () => window.removeEventListener('resize', onChange)
    }
  }, [setSidebarCollapsed, prevCollapsedRef, compactActiveRef, expandedActiveRef])
  // Hide app chrome (header/sidebar/footer) for marketing/auth pages so
  // Landing and login/signup are fully separated from the main app shell.
  // Use Next's usePathname hook so ClientRoot reacts to client-side navigation
  // (window.location won't trigger rerenders when router.push changes the path).
  // Using usePathname makes onboarding -> / navigation immediately re-render
  // and reveal the app chrome without requiring the user to refresh.
  const pathname = usePathname?.() || (typeof window !== 'undefined' ? window.location.pathname : '/')
  // Use centralized public path prefixes so new public pages can be registered
  // in one place and tests / runtime logic stay consistent.
  const isPublic = pathname === '/' || PUBLIC_PATH_PREFIXES.some(p => p !== '/' && pathname.startsWith(p))
  const isPractice = pathname.startsWith('/practice-hub')
  const isFullScreen =
    pathname.includes('/journal-entries/') ||
    pathname.endsWith('/audit-log') ||
    pathname.includes('/invoices/new') ||
    pathname.includes('/banking-cash/transactions/register') ||
    pathname.includes('/banking-cash/transactions/activity') ||
    pathname.includes('/banking-cash/transactions/match') ||
    pathname.includes('/banking-cash/transactions/split') ||
    pathname.includes('/banking-cash/transactions/transfer') ||
    pathname.includes('/banking-cash/transactions/view-record')

  return (
    <>
      {process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' && <MockInit />}
      {/* Early return only for public pages (login, signup, etc.) */}
      {isPublic ? (
        <main id="main" className="h-full overflow-y-auto">{children}</main>
      ) : isPractice || isFullScreen ? (
        // all practice-hub routes and full-screen pages render without any header/sidebar
        <main id="main" className="w-full h-full overflow-y-auto">{children}</main>
      ) : (
        /* Owner accounting app — full layout: green topbar + collapsible sidebar */
        <>
          <div className="h-screen flex flex-col overflow-hidden">
            <OwnerTopBar />
            <div className="flex flex-1 min-h-0 overflow-hidden">
              <OwnerSidebar />
              <main
                id="main"
                className="flex-1 min-w-0 overflow-y-auto bg-slate-50"
              >
                {children}
              </main>
            </div>
          </div>
          <CommandPalette />
        </>
      )}
      
    </>
  )
}
