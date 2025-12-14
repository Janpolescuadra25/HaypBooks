// Utility to merge persisted filters with current URL parameters and optionally push/replace the URL.
// Returns an object with the merged filters and a boolean indicating if a navigation occurred.
import type { Route } from 'next'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export interface SyncOptions<T extends Record<string, string>> {
  router: AppRouterInstance
  pathname: string
  searchParams: URLSearchParams
  stored: Partial<T>
  keys: (keyof T)[]
  mode?: 'replace' | 'push'
}

export function syncFiltersToUrl<T extends Record<string,string>>(opts: SyncOptions<T>): { merged: T; navigated: boolean } {
  const { router, pathname, searchParams, stored, keys, mode = 'replace' } = opts
  const merged = {} as T
  let changed = false
  keys.forEach((k) => {
    const urlVal = searchParams.get(String(k)) || ''
    const storedVal = (stored?.[k] as string) || ''
    const finalVal = urlVal || storedVal || ''
    ;(merged as any)[k] = finalVal
    if (!urlVal && storedVal) changed = true
  })
  if (changed) {
    const next = new URLSearchParams(searchParams.toString())
    keys.forEach((k) => {
      const v = (merged as any)[k]
      if (v) next.set(String(k), v); else next.delete(String(k))
    })
    const href = `${pathname}${next.toString() ? `?${next.toString()}` : ''}` as Route
    mode === 'replace' ? router.replace(href) : router.push(href)
  }
  return { merged, navigated: changed }
}