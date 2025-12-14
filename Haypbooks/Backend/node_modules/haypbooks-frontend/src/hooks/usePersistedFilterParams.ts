"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Route } from 'next'
import { syncFiltersToUrl } from '@/lib/urlFilterSync'
import { useReportFilters } from '@/stores/reportFilters'

export interface FilterSpecItem {
  key: string        // key in persisted filters
  param?: string     // URL search param name (defaults to key)
  normalize?: (v: string) => string // optional normalization
}

export interface UsePersistedFilterParamsOptions {
  reportKey: string
  specs: FilterSpecItem[]
  mode?: 'replace' | 'push'
  autoHydrate?: boolean // whether to perform initial merge on mount (default true)
}

interface Result<T extends Record<string,string>> {
  values: T
  setValues: React.Dispatch<React.SetStateAction<T>>
  apply: () => void
  clear: () => void
  status: string
  error?: string
  updatedAt?: string
}

// Utility: build empty values object from specs
function buildInitial<T extends Record<string,string>>(specs: FilterSpecItem[]): T {
  const base: Record<string,string> = {}
  specs.forEach(s => { base[s.key] = '' })
  return base as T
}

export function usePersistedFilterParams<T extends Record<string,string>>(opts: UsePersistedFilterParamsOptions): Result<T> {
  const { reportKey, specs, mode = 'replace', autoHydrate = true } = opts
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const { filters, update, load, register, unregister, status, error, updatedAt } = useReportFilters(reportKey)
  const [values, setValues] = useState<T>(() => buildInitial<T>(specs))
  const hydratedRef = useRef(false)

  // Register & load once
  useEffect(() => { register(); return () => unregister() }, [register, unregister])
  useEffect(() => { load() }, [load])

  // Initial hydration: merge stored with URL if URL missing pieces
  useEffect(() => {
    if (!autoHydrate || hydratedRef.current) return
    const map: Record<string,string> = {}
    specs.forEach(s => {
      const urlVal = sp.get(s.param || s.key) || ''
      const persistedVal = (filters as any)[s.key] || ''
      map[s.key] = s.normalize ? s.normalize(urlVal || persistedVal || '') : (urlVal || persistedVal || '')
    })
    // detect if we need to push values to URL
    const needsNav = specs.some(s => {
      const urlVal = sp.get(s.param || s.key) || ''
      return !urlVal && map[s.key]
    })
    setValues(map as T)
    if (needsNav) {
      const next = new URLSearchParams(sp.toString())
      specs.forEach(s => {
        const v = map[s.key]
        if (v) next.set(s.param || s.key, v); else next.delete(s.param || s.key)
      })
      router[mode](`${pathname}${next.toString() ? `?${next.toString()}` : ''}` as Route)
    }
    hydratedRef.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const apply = useCallback(() => {
    const next = new URLSearchParams(sp.toString())
    specs.forEach(s => {
      const v = values[s.key] || ''
      if (v) next.set(s.param || s.key, v); else next.delete(s.param || s.key)
    })
    update(values)
    router[mode](`${pathname}${next.toString() ? `?${next.toString()}` : ''}` as Route)
  }, [values, specs, update, router, pathname, sp, mode])

  const clear = useCallback(() => {
    const empty: Record<string,string> = {}
    specs.forEach(s => { empty[s.key] = '' })
    setValues(empty as T)
    const next = new URLSearchParams(sp.toString())
    specs.forEach(s => next.delete(s.param || s.key))
    update(empty)
    router[mode](`${pathname}${next.toString() ? `?${next.toString()}` : ''}` as Route)
  }, [specs, update, router, pathname, sp, mode])

  return useMemo(() => ({ values, setValues, apply, clear, status, error, updatedAt }), [values, apply, clear, status, error, updatedAt])
}

export default usePersistedFilterParams
