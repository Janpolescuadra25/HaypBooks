"use client"
import { ReactNode, useEffect } from 'react'
import AppShellHeader from '@/components/AppShellHeader'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import CommandPalette from '@/components/CommandPalette'
import { useCommandPalette } from '@/stores/commandPalette'
import useUI from '@/stores/ui'

const MockInit = dynamic(() => import('@/components/MockInit'), { ssr: false })

export default function ClientRoot({ children }: { children: ReactNode }) {
  const { openPalette } = useCommandPalette()
  const { setSidebarCollapsed } = useUI()
  const prevCollapsedRef = (require('react') as typeof import('react')).useRef<boolean | null>(null)
  const compactActiveRef = (require('react') as typeof import('react')).useRef<boolean>(false)
  const expandedActiveRef = (require('react') as typeof import('react')).useRef<boolean>(false)
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
  // Keep any public auth/marketing pages out of the app chrome
  const PUBLIC_PATHS = [
    '/landing',
    '/login',
    '/signup',
    '/pricing',
    '/forgot-password',
    '/verify-otp',
    '/reset-password',
    '/onboarding',
    '/onboarding/business'
  ]
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  return (
    <>
      {process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' && <MockInit />}
      {/* Early return for public pages to avoid rendering the app chrome */}
      {isPublic ? (
        <main id="main">{children}</main>
      ) : (
        <>
          <a
            href="#main"
            className="absolute left-[-999px] top-2 z-[70] focus:left-2 inline-flex items-center rounded-xl bg-white px-3 py-2 text-slate-800 shadow-glass border border-slate-200"
          >
            Skip to content
          </a>
          <AppShellHeader />
          <div className="layout-shell w-full mt-0 grid gap-4 md:[grid-template-columns:auto_minmax(0,1fr)]">
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <main id="main">{children}</main>
          </div>
          <footer className="w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] mx-auto p-6 text-center text-slate-600 site-footer">
            © {new Date().getFullYear()} HaypBooks
          </footer>
          <CommandPalette />
        </>
      )}
      
    </>
  )
}
