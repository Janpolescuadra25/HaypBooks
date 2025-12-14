import { create } from 'zustand'
import { getReportFilters, setReportFilters } from '@/lib/preferences'
import { useCallback } from 'react'

export interface ReportFilterState {
  entities: Record<string, { filters: Record<string,string>; updatedAt: string; status: 'idle'|'loading'|'saving'|'error'; error?: string }>
  activeKeys: Set<string>
  load: (reportKey: string) => Promise<void>
  update: (reportKey: string, patch: Record<string,string>) => void
  reset: (reportKey: string) => void
  register: (reportKey: string) => void
  unregister: (reportKey: string) => void
  resetAll: () => void
}

type SaveQueue = { timer: any; pending: Record<string,string> } | undefined

const saveTimers: Record<string, SaveQueue> = {}

export const useReportFilterStore = create<ReportFilterState>((set, get) => ({
  entities: {},
  activeKeys: new Set<string>(),
  async load(reportKey) {
    const cur = get().entities[reportKey]
    if (cur && cur.status === 'loading') return
    set((s) => ({ entities: { ...s.entities, [reportKey]: { filters: cur?.filters || {}, updatedAt: cur?.updatedAt || '', status: 'loading' } }}))
    try {
      const pref = await getReportFilters(reportKey)
      set((s) => ({ entities: { ...s.entities, [reportKey]: { filters: pref.filters, updatedAt: pref.updatedAt, status: 'idle' } }}))
    } catch (e: any) {
      set((s) => ({ entities: { ...s.entities, [reportKey]: { filters: cur?.filters || {}, updatedAt: cur?.updatedAt || '', status: 'error', error: String(e?.message || e) } }}))
    }
  },
  update(reportKey, patch) {
    const cur = get().entities[reportKey] || { filters: {}, updatedAt: '', status: 'idle' as const }
    const merged = { ...cur.filters, ...patch }
    set((s) => ({ entities: { ...s.entities, [reportKey]: { ...cur, filters: merged } }}))
    // Debounce save
    const existing = saveTimers[reportKey]
    if (existing?.timer) clearTimeout(existing.timer)
    const pending = { ...(existing?.pending || {}), ...patch }
    saveTimers[reportKey] = { pending, timer: setTimeout(async () => {
      set((s) => ({ entities: { ...s.entities, [reportKey]: { ...s.entities[reportKey], status: 'saving' } }}))
      try {
        const pref = await setReportFilters(reportKey, get().entities[reportKey].filters)
        set((s) => ({ entities: { ...s.entities, [reportKey]: { filters: pref.filters, updatedAt: pref.updatedAt, status: 'idle' } }}))
      } catch (e: any) {
        set((s) => ({ entities: { ...s.entities, [reportKey]: { ...s.entities[reportKey], status: 'error', error: String(e?.message || e) } }}))
      }
      saveTimers[reportKey] = undefined
    }, 500) }
  },
  reset(reportKey) {
    set((s) => ({ entities: { ...s.entities, [reportKey]: { filters: {}, updatedAt: '', status: 'idle' } }}))
  }
  ,register(reportKey) {
    set((s) => {
      if (s.activeKeys.has(reportKey)) return s // idempotent
      return { activeKeys: new Set([...s.activeKeys, reportKey]) }
    })
  }
  ,unregister(reportKey) {
    set((s) => {
      if (!s.activeKeys.has(reportKey)) return s // nothing to do
      const next = new Set(s.activeKeys)
      next.delete(reportKey)
      return { activeKeys: next }
    })
  }
  ,resetAll() {
    const cleared: Record<string, { filters: Record<string,string>; updatedAt: string; status: 'idle' }> = {}
    Object.keys(get().entities).forEach(k => { cleared[k] = { filters: {}, updatedAt: '', status: 'idle' } })
    set({ entities: cleared })
  }
}))

export function useReportFilters(reportKey: string) {
  // Subscribe only to the specific entity slice to avoid unrelated store changes causing new fn identities
  const entry = useReportFilterStore(s => s.entities[reportKey])
  const loadBase = useReportFilterStore(s => s.load)
  const updateBase = useReportFilterStore(s => s.update)
  const resetBase = useReportFilterStore(s => s.reset)
  const registerBase = useReportFilterStore(s => s.register)
  const unregisterBase = useReportFilterStore(s => s.unregister)

  const load = useCallback(() => loadBase(reportKey), [loadBase, reportKey])
  const update = useCallback((patch: Record<string,string>) => updateBase(reportKey, patch), [updateBase, reportKey])
  const reset = useCallback(() => resetBase(reportKey), [resetBase, reportKey])
  const register = useCallback(() => registerBase(reportKey), [registerBase, reportKey])
  const unregister = useCallback(() => unregisterBase(reportKey), [unregisterBase, reportKey])

  return {
    filters: entry?.filters || {},
    status: entry?.status || 'idle',
    error: entry?.error,
    updatedAt: entry?.updatedAt || '',
    load,
    update,
    reset,
    register,
    unregister,
  }
}

export function useAllFilterKeys() {
  const store = useReportFilterStore()
  return Array.from(store.activeKeys)
}

export function useResetAllFilters() {
  const store = useReportFilterStore()
  return store.resetAll
}
