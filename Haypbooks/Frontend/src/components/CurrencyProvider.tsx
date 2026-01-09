"use client"
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { formatCurrency as fmtCurrency, formatNumber as fmtNumber } from '@/lib/format'

type CurrencyCtx = {
  baseCurrency: string
  setBaseCurrency: (c: string) => void
  formatCurrency: (v: number | null | undefined) => string
  formatNumber: (v: number | null | undefined, opts?: Intl.NumberFormatOptions) => string
  ready: boolean
}

const Ctx = createContext<CurrencyCtx | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [baseCurrency, setBaseCurrency] = useState<string>('USD')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        const j = await res.json()
        if (!alive) return
        if (j?.settings?.baseCurrency) setBaseCurrency(j.settings.baseCurrency)
      } finally {
        if (alive) setReady(true)
      }
    })()
    return () => { alive = false }
  }, [])

  const value = useMemo<CurrencyCtx>(() => ({
    baseCurrency,
    setBaseCurrency,
    ready,
    formatCurrency: (v) => fmtCurrency(v as any, baseCurrency),
    formatNumber: (v, opts) => fmtNumber(v as any, opts),
  }), [baseCurrency, ready])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCurrency() {
  // Early return during SSR to avoid invoking React hooks in a non-react render context
  if (typeof window === 'undefined') {
    const base = 'USD'
    return {
      baseCurrency: base,
      setBaseCurrency: () => {},
      ready: true,
      formatCurrency: (v: number | null | undefined) => fmtCurrency(v as any, base),
      formatNumber: (v: number | null | undefined, opts?: Intl.NumberFormatOptions) => fmtNumber(v as any, opts),
    }
  }

  try {
    const ctx = useContext(Ctx)
    if (ctx) return ctx
  } catch (e) {
    // Defensive fallback if useContext is unavailable during server prerender
  }
  // Safe fallback when a Provider isn't mounted (e.g., isolated tests or other render paths)
  const base = 'USD'
  return {
    baseCurrency: base,
    setBaseCurrency: () => {},
    ready: true,
    formatCurrency: (v: number | null | undefined) => fmtCurrency(v as any, base),
    formatNumber: (v: number | null | undefined, opts?: Intl.NumberFormatOptions) => fmtNumber(v as any, opts),
  }
}
