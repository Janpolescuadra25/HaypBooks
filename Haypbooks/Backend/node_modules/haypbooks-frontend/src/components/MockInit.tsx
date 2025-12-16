"use client"

import { useEffect } from 'react'

declare global {
  interface Window { __MSW_STARTED__?: boolean }
}

export default function MockInit() {
  useEffect(() => {
    const shouldStart = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
    if (!shouldStart) return
    if (typeof window === 'undefined') return
    if (window.__MSW_STARTED__) return
    window.__MSW_STARTED__ = true
    import('@/mocks/browser').then((m) => {
      // Avoid forcing a reload on worker activation — use waitUntilReady:false
      // so the dev tooling doesn't trigger a navigation that could interfere
      // with initial page animations like the intro.
      m.worker.start({ onUnhandledRequest: 'bypass', waitUntilReady: false }).then(() => {
        if (process.env.NODE_ENV === 'development') console.debug('MockInit: msw worker started (no-reload)')
      })
    })
  }, [])
  return null
}
