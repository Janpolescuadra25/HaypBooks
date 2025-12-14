"use client"
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DashboardTopBar from '@/components/DashboardTopBar'
 

// Lazy widgets
const Widgets = {
  bank: dynamic(() => import('@/components/widgets/BankAccountsWidget'), { ssr: false }),
  invoices: dynamic(() => import('@/components/widgets/InvoicesWidget'), { ssr: false }),
  expenses: dynamic(() => import('@/components/widgets/ExpensesWidget'), { ssr: false }),
  pl: dynamic(() => import('@/components/widgets/ProfitLossWidget'), { ssr: false }),
  sales: dynamic(() => import('@/components/widgets/SalesWidget'), { ssr: false }),
  cashflow: dynamic(() => import('@/components/widgets/CashFlowWidget'), { ssr: false }),
  tasks: dynamic(() => import('@/components/widgets/TasksWidget'), { ssr: false }),
  payroll: dynamic(() => import('@/components/widgets/PayrollWidget'), { ssr: false }),
  time: dynamic(() => import('@/components/widgets/TimeTrackingWidget'), { ssr: false }),
  projects: dynamic(() => import('@/components/widgets/ProjectsWidget'), { ssr: false }),
  inventory: dynamic(() => import('@/components/widgets/InventoryWidget'), { ssr: false }),
  reports: dynamic(() => import('@/components/widgets/ReportsWidget'), { ssr: false })
} as const

type WidgetKey = keyof typeof Widgets
type WidgetSize = 's' | 'm' | 'l'

const DEFAULT_WIDGETS: Record<WidgetKey, { label: string; visible: boolean; size: WidgetSize }> = {
  bank: { label: 'Bank Accounts', visible: true, size: 'm' },
  invoices: { label: 'Invoices', visible: true, size: 's' },
  sales: { label: 'Sales', visible: true, size: 's' },
  expenses: { label: 'Expenses', visible: true, size: 's' },
  pl: { label: 'Profit & Loss', visible: true, size: 's' },
  cashflow: { label: 'Cash Flow', visible: true, size: 's' },
  tasks: { label: 'Tasks / To‑Do', visible: true, size: 's' },
  payroll: { label: 'Payroll', visible: false, size: 's' },
  time: { label: 'Time Tracking', visible: false, size: 's' },
  projects: { label: 'Projects', visible: false, size: 's' },
  inventory: { label: 'Inventory', visible: false, size: 's' },
  reports: { label: 'Reports & Insights', visible: true, size: 's' }
}

function sizeToCols(size: WidgetSize) {
  // 1 col by default; span 2 or 3 on larger screens when requested
  if (size === 'm') return 'lg:col-span-2'
  if (size === 'l') return 'lg:col-span-2 xl:col-span-3'
  return ''
}

const STORAGE_KEY = 'hb.dashboard.widgets.v1'

export default function BusinessOverviewClient() {
  const [config, setConfig] = useState(DEFAULT_WIDGETS)
  const [showPicker, setShowPicker] = useState(false)
  const [showLayout, setShowLayout] = useState(false)
  const [draft, setDraft] = useState(DEFAULT_WIDGETS)
  const [layoutFull, setLayoutFull] = useState(false)
  const [pickerFull, setPickerFull] = useState(false)
  const [filter, setFilter] = useState('')
  const layoutModalRef = useRef<HTMLDivElement|null>(null)
  const triggerRef = useRef<HTMLButtonElement|null>(null)
 

  // Lock background scroll when layout editor open
  useEffect(() => {
    const shouldLock = showLayout || showPicker
    if (!shouldLock) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [showLayout, showPicker])

  // Load persisted config
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setConfig((prev) => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [])

  // Prepare visible list
  const visibleOrder = useMemo(() => {
    return (Object.keys(config) as WidgetKey[]).filter((k) => config[k].visible)
  }, [config])

  function openPicker() {
    setDraft(config)
    // Restore picker fullscreen preference
    try {
      const pref = localStorage.getItem('hb.dashboard.picker.fullscreen')
      if (pref === 'true') setPickerFull(true)
    } catch {}
    setShowPicker(true)
  }
  function openLayout() {
    triggerRef.current = document.activeElement as HTMLButtonElement | null
    setDraft(config)
    // Restore fullscreen preference
    try {
      const pref = localStorage.getItem('hb.dashboard.layout.fullscreen')
      if (pref === 'true') setLayoutFull(true)
    } catch {}
    setShowLayout(true)
  }
  const dirtyLayout = useMemo(() => JSON.stringify(draft) !== JSON.stringify(config), [draft, config])
  function cancelModals() {
    // Guard unsaved changes for layout editor only
    if (showLayout && dirtyLayout) {
      const ok = window.confirm('Discard unsaved layout changes?')
      if (!ok) return
    }
    setShowPicker(false)
    setShowLayout(false)
    setLayoutFull(false)
    setPickerFull(false)
    // Restore focus to trigger
    setTimeout(()=> { triggerRef.current?.focus() }, 0)
  }
  function saveDraft() {
    setConfig(draft)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)) } catch {}
    cancelModals()
  }
  // Close helpers for individual modals
  function closePicker() {
    setShowPicker(false)
    setPickerFull(false)
    setTimeout(()=> { triggerRef.current?.focus() }, 0)
  }
  function closeLayout() {
    if (dirtyLayout) {
      const ok = window.confirm('Discard unsaved layout changes?')
      if (!ok) return
    }
    setShowLayout(false)
    setLayoutFull(false)
    setTimeout(()=> { triggerRef.current?.focus() }, 0)
  }

  // Persist fullscreen preference when toggled
  useEffect(() => {
    try { localStorage.setItem('hb.dashboard.layout.fullscreen', layoutFull ? 'true':'false') } catch {}
  }, [layoutFull])
  useEffect(() => {
    try { localStorage.setItem('hb.dashboard.picker.fullscreen', pickerFull ? 'true':'false') } catch {}
  }, [pickerFull])

  // Focus trap + Escape close for layout modal (scoped to dialog only)
  const onDialogKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelModals()
      return
    }
    if (e.key === 'Tab') {
      const root = e.currentTarget
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ))
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }, [cancelModals])

  // Minimize feature removed: no floating controls or restore listeners

  const rightActions = (
    <>
      <button onClick={openLayout} ref={triggerRef} className="btn-secondary btn-xs whitespace-nowrap">Edit layout</button>
      <button onClick={openPicker} className="btn-secondary btn-xs whitespace-nowrap">Add/Remove widgets</button>
    </>
  )

  

  return (
    <div className="space-y-2 dashboard-page">
      <div className="glass-card print:hidden px-3 md:px-4 py-1.5 md:py-2">
        <DashboardTopBar rightActions={rightActions} />
      </div>

      <div className="glass-card p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleOrder.map((key) => {
            const Comp = Widgets[key]
            const cls = sizeToCols(config[key].size)
            return (
              <div key={key} className={cls}>
                <Comp />
              </div>
            )
          })}
        </div>
      </div>

      {/* Add/Remove Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent" onClick={cancelModals} />
          <div
            role="dialog"
            aria-modal="true"
            onKeyDown={onDialogKeyDown}
            className={
              `relative flex flex-col !bg-white rounded-2xl border border-slate-200/60 p-4 md:p-6 transition-all duration-300 ` +
              `shadow-[0_12px_24px_rgba(15,23,42,0.22),_0_36px_72px_rgba(15,23,42,0.28),_0_72px_144px_rgba(15,23,42,0.24)] ` +
              `animate-[hb-border-sheen_7.5s_ease-in-out_infinite] ` +
              (pickerFull
                ? 'inset-0 m-2 md:m-4 w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] h-[calc(100%-1rem)] md:h-[calc(100%-2rem)]'
                : 'w-[min(92vw,38rem)] max-h-[85vh]')
            }
          >
            <div className="flex items-center justify-between mb-3 shrink-0 bg-white border-b border-slate-200 pb-2">
              <h3 className="text-lg font-semibold text-slate-900">Add/Remove Widgets</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPickerFull(f => !f)}
                  aria-label={pickerFull ? 'Exit fullscreen' : 'Enter fullscreen'}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100"
                >{pickerFull ? '🡼' : '⛶'}</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(draft) as WidgetKey[]).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={draft[k].visible}
                    onChange={(e) => setDraft({ ...draft, [k]: { ...draft[k], visible: e.target.checked } })}
                  />
                  <span>{draft[k].label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t bg-white">
              <button onClick={cancelModals} className="btn-secondary btn-xs">Cancel</button>
              <button onClick={saveDraft} className="btn-primary btn-xs">Save</button>
            </div>
          </div>
        </div>
      )}
      
      {showLayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent" onClick={cancelModals} />
          <div
            ref={layoutModalRef}
            role="dialog"
            aria-modal="true"
            className={
              `relative flex flex-col !bg-white rounded-2xl border border-slate-200/60 p-4 md:p-6 transition-all duration-300 ` +
              `shadow-[0_12px_24px_rgba(15,23,42,0.22),_0_36px_72px_rgba(15,23,42,0.28),_0_72px_144px_rgba(15,23,42,0.24)] ` +
              `animate-[hb-border-sheen_7.5s_ease-in-out_infinite] ` +
              (layoutFull
                ? 'inset-0 m-2 md:m-4 w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] h-[calc(100%-1rem)] md:h-[calc(100%-2rem)]'
                : 'w-[clamp(640px,88vw,1400px)] h-[clamp(480px,80vh,900px)]')
            }
            onKeyDown={onDialogKeyDown}
          >
            <div className="flex items-center justify-between mb-3 shrink-0 bg-white border-b border-slate-200 pb-2">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-slate-900">Edit Layout</h3>
                <div className="text-xs text-slate-500">{dirtyLayout ? 'Unsaved changes' : 'All changes saved'}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLayoutFull(f => !f)}
                  aria-label={layoutFull ? 'Exit fullscreen' : 'Enter fullscreen'}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100"
                >{layoutFull ? '🡼' : '⛶'}</button>
              </div>
            </div>
            <div className="mb-2 shrink-0 flex items-center gap-2">
              <input
                type="text"
                value={filter}
                onChange={(e)=> setFilter(e.target.value)}
                placeholder="Filter widgets..."
                className="px-2 py-1 text-sm rounded border border-slate-300 w-48 bg-white"
                aria-label="Filter widgets"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setFilter('')}
                className="text-xs text-slate-500 hover:underline"
                disabled={!filter}
              >Clear</button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1" data-focus-cycle="true">
              {(Object.keys(draft) as WidgetKey[])
                .filter((k) => draft[k].visible)
                .filter(k => !filter || draft[k].label.toLowerCase().includes(filter.toLowerCase()))
                .map((k) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-800">{draft[k].label}</div>
                    <select
                      aria-label={`Size for ${draft[k].label}`}
                      value={draft[k].size}
                      onChange={(e) => setDraft({ ...draft, [k]: { ...draft[k], size: e.target.value as WidgetSize } })}
                      className="px-2 py-1 text-sm rounded border border-slate-300 bg-white"
                    >
                      <option value="s">Small (1 column)</option>
                      <option value="m">Medium (2 columns)</option>
                      <option value="l">Large (full row)</option>
                    </select>
                  </div>
                ))}
            </div>
            <div className="pt-3 mt-2 border-t bg-white flex items-center justify-end gap-2 shrink-0">
              <button onClick={cancelModals} className="btn-secondary btn-xs">Cancel</button>
              <button onClick={saveDraft} className="btn-primary btn-xs" disabled={!dirtyLayout}>Save</button>
            </div>
          </div>
        </div>
      )}
      
      

    </div>
  )
}
 
