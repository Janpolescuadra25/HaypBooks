"use client"
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

type Widgets = Record<string, boolean>

const DEFAULT_WIDGETS: Widgets = {
  kpiStrip: true,
  metricsBar: true,
  cashFlow: true,
  cashFlowForecast: true,
  businessInsights: true,
  kpis: true,
  financialHealth: true,
  collections: true,
  recentTransactions: true,
  quickActions: true,
  arapSnapshot: true,
  // profile is intentionally excluded from customization UI and always shown
  profile: true,
}

const STORAGE_KEY = 'dashboard.widgets'

export default function DashboardCustomize({ variant = 'inline' }: { variant?: 'inline' | 'fab' }) {
  const [open, setOpen] = useState(false)
  const [widgets, setWidgets] = useState<Widgets>(DEFAULT_WIDGETS)

  // load persisted preferences
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // ensure profile is always enabled and not stored as false
        if ('profile' in parsed) delete parsed.profile
        setWidgets({ ...DEFAULT_WIDGETS, ...parsed })
      }
    } catch {}
  }, [])

  // apply visibility on mount and when changed
  useEffect(() => {
    const apply = (state: Widgets) => {
      Object.entries(state).forEach(([key, show]) => {
        document.querySelectorAll<HTMLElement>(`[data-widget="${key}"]`).forEach(el => {
          if (show) el.classList.remove('hidden')
          else el.classList.add('hidden')
        })
      })
    }
  // force show profile regardless of state
  document.querySelectorAll<HTMLElement>('[data-widget="profile"]').forEach(el=>el.classList.remove('hidden'))
  apply(widgets)
    const handler = (e: any) => apply((e?.detail as Widgets) || widgets)
    window.addEventListener('dashboard-widgets-changed', handler as any)
    return () => window.removeEventListener('dashboard-widgets-changed', handler as any)
  }, [widgets])

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets)) } catch {}
    const evt = new CustomEvent('dashboard-widgets-changed', { detail: widgets })
    window.dispatchEvent(evt)
    setOpen(false)
  }

  function resetToDefaults() {
    const next = { ...DEFAULT_WIDGETS }
    setWidgets(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
    const evt = new CustomEvent('dashboard-widgets-changed', { detail: next })
    window.dispatchEvent(evt)
    setOpen(false)
  }

  function setAll(value: boolean) {
    setWidgets(Object.fromEntries(Object.keys(DEFAULT_WIDGETS).map(k => [k, value])) as Widgets)
  }

  const items = useMemo(() => ([
    { key: 'kpiStrip', label: 'KPI strip' },
    { key: 'metricsBar', label: 'Key metrics' },
    { key: 'cashFlow', label: 'Cash Flow' },
    { key: 'cashFlowForecast', label: 'Cash Flow Forecast' },
    { key: 'businessInsights', label: 'Business Insights' },
    { key: 'kpis', label: 'KPIs' },
    { key: 'financialHealth', label: 'Financial Health' },
    { key: 'collections', label: 'Collections Attention' },
    { key: 'recentTransactions', label: 'Recent Transactions' },
    { key: 'quickActions', label: 'Quick Actions' },
    { key: 'arapSnapshot', label: 'A/R & A/P Snapshot' },
    // Profile (Your Company) is fixed and not customizable
  ]), [])

  return (
    <>
      {variant === 'fab' ? (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[60] rounded-full bg-emerald-600 text-white px-4 py-3 shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Customize dashboard"
        >
          Customize
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="rounded border px-3 py-1.5 text-sm bg-white hover:bg-slate-50">Customize</button>
      )}
      {open && createPortal(
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[360px] rounded-xl border bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <button onClick={() => setAll(true)} className="underline hover:no-underline">Select all</button>
                <span aria-hidden>•</span>
                <button onClick={() => setAll(false)} className="underline hover:no-underline">Hide all</button>
              </div>
              <button onClick={resetToDefaults} className="text-xs text-slate-600 underline hover:no-underline">Reset to defaults</button>
            </div>
            <h3 className="text-base font-semibold mb-2">Customize your dashboard</h3>
            <p className="text-xs text-slate-600 mb-3">Select the widgets you want and deselect the ones you don’t.</p>
            <div className="max-h-[300px] overflow-auto space-y-2">
              {items.map(it => (
                <label key={it.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!widgets[it.key]}
                    onChange={e => setWidgets(prev => ({ ...prev, [it.key]: e.target.checked }))}
                  />
                  <span>{it.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded border px-3 py-1.5 text-sm bg-white hover:bg-slate-50">Cancel</button>
              <button onClick={save} className="rounded bg-emerald-600 text-white px-3 py-1.5 text-sm hover:bg-emerald-700">Save</button>
            </div>
          </div>
        </div>, document.body)
      }
    </>
  )
}
