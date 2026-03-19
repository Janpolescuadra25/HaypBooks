'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { formatCurrency } from '@/lib/format'

// ── Types ────────────────────────────────────────────────────────────────────
type WidgetId =
  | 'stats'
  | 'cashflow'
  | 'customers'
  | 'quickactions'
  | 'recenttx'
  | 'expenses'

interface Widget {
  id: WidgetId
  label: string
  description: string
}

const ALL_WIDGETS: Widget[] = [
  { id: 'stats',       label: 'KPI Summary',       description: 'Revenue, profit and key metrics' },
  { id: 'cashflow',    label: 'Cash Flow',          description: 'Inflow vs outflow chart' },
  { id: 'customers',  label: 'Top Customers',      description: 'Highest revenue customers' },
  { id: 'quickactions',label: 'Quick Actions',     description: 'Shortcut action buttons' },
  { id: 'recenttx',   label: 'Recent Transactions',description: 'Latest transaction feed' },
  { id: 'expenses',   label: 'Expense Breakdown',  description: 'Spending by category' },
]

const DEFAULT_LAYOUT: WidgetId[] = ['stats', 'cashflow', 'customers', 'quickactions']


// ── SVG Cash Flow Chart ───────────────────────────────────────────────────────
const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const INFLOW  = [52000, 68000, 75000, 61000, 89000, 95000]
const OUTFLOW = [44000, 55000, 62000, 58000, 70000, 78000]

function CashFlowChart() {
  const W = 1000; const H = 200; const PAD = 30
  const max = Math.max(...INFLOW, ...OUTFLOW) * 1.1
  const pts = (data: number[]) =>
    data.map((v, i) => {
      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
      const y = H - PAD - (v / max) * (H - PAD * 2)
      return `${x},${y}`
    }).join(' ')
  const area = (data: number[], color: string) => {
    const xs = data.map((_, i) => PAD + (i / (data.length - 1)) * (W - PAD * 2))
    const ys = data.map(v => H - PAD - (v / max) * (H - PAD * 2))
    const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
    const close = `L${xs[xs.length-1]},${H - PAD} L${xs[0]},${H - PAD} Z`
    return <path d={`${path} ${close}`} fill={color} opacity=".08" />
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px]" aria-label="Cash flow chart">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(t => (
        <line key={t} x1={PAD} y1={H - PAD - t * (H - PAD * 2)} x2={W - PAD} y2={H - PAD - t * (H - PAD * 2)}
          stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
      ))}
      {/* Area fills */}
      {area(INFLOW,  '#10b981')}
      {area(OUTFLOW, '#94a3b8')}
      {/* Lines */}
      <polyline points={pts(INFLOW)}  fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={pts(OUTFLOW)} fill="none" stroke="#94a3b8" strokeWidth="2"   strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots — inflow */}
      {INFLOW.map((v, i) => {
        const x = PAD + (i / (INFLOW.length - 1)) * (W - PAD * 2)
        const y = H - PAD - (v / max) * (H - PAD * 2)
        return <circle key={i} cx={x} cy={y} r="4" fill="#10b981" stroke="#fff" strokeWidth="2" />
      })}
      {/* Dots — outflow */}
      {OUTFLOW.map((v, i) => {
        const x = PAD + (i / (OUTFLOW.length - 1)) * (W - PAD * 2)
        const y = H - PAD - (v / max) * (H - PAD * 2)
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#94a3b8" stroke="#fff" strokeWidth="2" />
      })}
      {/* X labels */}
      {MONTHS.map((m, i) => {
        const x = PAD + (i / (MONTHS.length - 1)) * (W - PAD * 2)
        return <text key={i} x={x} y={H - 6} textAnchor="middle" fontSize="13" fill="#94a3b8">{m}</text>
      })}
    </svg>
  )
}

// ── Expense Donut Chart ───────────────────────────────────────────────────────
const EXPENSE_CATS = [
  { label: 'Payroll',    pct: 40, color: '#10b981', dotCls: 'bg-emerald-400' },
  { label: 'Operations', pct: 25, color: '#6366f1', dotCls: 'bg-indigo-400' },
  { label: 'Marketing',  pct: 18, color: '#f59e0b', dotCls: 'bg-amber-400' },
  { label: 'Software',   pct: 10, color: '#06b6d4', dotCls: 'bg-cyan-400' },
  { label: 'Other',      pct:  7, color: '#e2e8f0', dotCls: 'bg-slate-200' },
]
function ExpenseDonut() {
  const R = 60; const cx = 90; const cy = 75; const stroke = 28
  let angle = -90
  const arcs = EXPENSE_CATS.map(cat => {
    const a = (cat.pct / 100) * 360
    const s = angle; angle += a
    const r2d = Math.PI / 180
    const x1 = cx + R * Math.cos(s * r2d)
    const y1 = cy + R * Math.sin(s * r2d)
    const x2 = cx + R * Math.cos((s + a) * r2d)
    const y2 = cy + R * Math.sin((s + a) * r2d)
    const large = a > 180 ? 1 : 0
    return { ...cat, d: `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z` }
  })
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 180 150" className="shrink-0 w-[140px]">
        {arcs.map((arc, i) => <path key={i} d={arc.d} fill={arc.color} />)}
        <circle cx={cx} cy={cy} r={R - stroke} fill="white" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">Total</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="13" fill="#1e293b" fontWeight="800">$284K</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {EXPENSE_CATS.map(c => (
          <div key={c.label} className="flex items-center gap-2 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dotCls}`} />
            <span className="text-slate-600 w-20">{c.label}</span>
            <span className="font-semibold text-slate-800">{c.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Widget wrapper with drag support ─────────────────────────────────────────
function WidgetCard({
  id, customizing, onRemove, onDragStart, onDragOver, onDrop,
  fullWidth = false, children
}: {
  id: string
  customizing: boolean
  onRemove: (id: string) => void
  onDragStart: (id: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (id: string) => void
  fullWidth?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      draggable={customizing}
      onDragStart={() => onDragStart(id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(id)}
      className={`relative bg-white rounded-2xl border transition-all
        ${customizing
          ? 'border-emerald-200 shadow-md ring-[1.5px] ring-emerald-100 cursor-grab active:cursor-grabbing active:opacity-60 active:scale-[.98]'
          : 'border-slate-100 shadow-sm hover:shadow-md'
        }
        ${fullWidth ? 'col-span-full' : ''}
      `}
    >
      {/* Customize chrome */}
      {customizing && (
        <>
          {/* Drag handle */}
          <span className="absolute top-3 left-3 text-slate-300 hover:text-emerald-400 transition-colors select-none text-lg leading-none z-10" title="Drag to reorder">
            ⠿
          </span>
          {/* Remove button */}
          <button
            onClick={() => onRemove(id)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center z-10 transition-colors"
            aria-label="Remove widget"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </>
      )}
      {children}
    </div>
  )
}

// ── Widget Add Modal ──────────────────────────────────────────────────────────
function AddWidgetModal({
  active, onAdd, onClose
}: { active: WidgetId[]; onAdd: (id: WidgetId) => void; onClose: () => void }) {
  const available = ALL_WIDGETS.filter(w => !active.includes(w.id))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-base">Add Widget</h2>
          <button onClick={onClose} aria-label="Close" className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 flex flex-col gap-2 max-h-80 overflow-y-auto">
          {available.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-6">All widgets are already on your dashboard.</p>
          ) : available.map(w => (
            <button key={w.id} onClick={() => { onAdd(w.id); onClose() }}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors text-left group">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </span>
              <div>
                <p className="font-semibold text-slate-800 text-[13px]">{w.label}</p>
                <p className="text-[11px] text-slate-400">{w.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Save Template Modal ───────────────────────────────────────────────────────
function SaveTemplateModal({
  onSave, onClose
}: { onSave: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-base">Save as Template</h2>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <input
            autoFocus
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Template name…"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()) }}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={() => name.trim() && onSave(name.trim())}
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-slate-800 text-white text-[13px] font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in">
      <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      {msg}
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function DashboardClient() {
  const [customizing, setCustomizing] = useState(false)
  const [layout, setLayout] = useState<WidgetId[]>(DEFAULT_LAYOUT)
  const [savedLayout, setSavedLayout] = useState<WidgetId[]>(DEFAULT_LAYOUT)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [templates, setTemplates] = useState<{ name: string; layout: WidgetId[] }[]>([
    { name: 'Default', layout: DEFAULT_LAYOUT },
  ])
  const dragId = useRef<WidgetId | null>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hb-dashboard-layout')
      if (saved) { const p = JSON.parse(saved); setLayout(p); setSavedLayout(p) }
      const savedTpls = localStorage.getItem('hb-dashboard-templates')
      if (savedTpls) setTemplates(JSON.parse(savedTpls))
    } catch {}
  }, [])

  const handleDone = useCallback(() => {
    setSavedLayout(layout)
    localStorage.setItem('hb-dashboard-layout', JSON.stringify(layout))
    setCustomizing(false)
    setToast('Dashboard saved!')
  }, [layout])

  const handleReset = useCallback(() => {
    setLayout(DEFAULT_LAYOUT)
  }, [])

  const handleRemove = useCallback((id: string) => {
    setLayout(prev => prev.filter(w => w !== id))
  }, [])

  const handleAddWidget = useCallback((id: WidgetId) => {
    setLayout(prev => [...prev, id])
  }, [])

  const handleSaveTemplate = useCallback((name: string) => {
    const tpl = { name, layout: [...layout] }
    setTemplates(prev => {
      const next = [...prev.filter(t => t.name !== name), tpl]
      localStorage.setItem('hb-dashboard-templates', JSON.stringify(next))
      return next
    })
    setShowSaveTemplate(false)
    setToast(`Template "${name}" saved!`)
  }, [layout])

  const applyTemplate = useCallback((tpl: { name: string; layout: WidgetId[] }) => {
    setLayout([...tpl.layout])
    setShowTemplates(false)
    setToast(`Template "${tpl.name}" applied`)
  }, [])

  // Drag-and-drop
  const handleDragStart = useCallback((id: string) => { dragId.current = id as WidgetId }, [])
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault() }, [])
  const handleDrop = useCallback((targetId: string) => {
    if (!dragId.current || dragId.current === targetId) return
    setLayout(prev => {
      const next = [...prev]
      const from = next.indexOf(dragId.current!)
      const to   = next.indexOf(targetId as WidgetId)
      if (from < 0 || to < 0) return prev
      next.splice(from, 1)
      next.splice(to, 0, dragId.current!)
      return next
    })
    dragId.current = null
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Page header */}
      <div className="px-6 pt-8 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {customizing
              ? 'Drag widgets to reorder, or click × to remove them.'
              : 'Your business at a glance.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {customizing ? (
            <>
              <button onClick={() => setCustomizing(false)} className="px-3.5 py-2 text-[12.5px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Add Widget
              </button>
              <button onClick={() => setShowSaveTemplate(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                Save Template
              </button>
              <button onClick={() => setShowTemplates(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 9h16M4 13h10" /></svg>
                Templates
              </button>
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></svg>
                Reset
              </button>
              <button onClick={handleDone}
                className="flex items-center gap-1.5 px-4 py-2 text-[12.5px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Done
              </button>
            </>
          ) : (
            <button onClick={() => { setCustomizing(true); setLayout(savedLayout) }}
              className="flex items-center gap-1.5 px-4 py-2 text-[12.5px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 rounded-xl shadow-sm transition-colors">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Customize
            </button>
          )}
        </div>
      </div>

      {/* Widget grid */}
      <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {layout.map(id => {
          const props = {
            id, customizing,
            onRemove: handleRemove,
            onDragStart: handleDragStart,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
          }
          if (id === 'stats')        return <WidgetCard key={id} {...props} fullWidth><StatsWidget customizing={customizing} /></WidgetCard>
          if (id === 'cashflow')     return <WidgetCard key={id} {...props} fullWidth><CashFlowWidget customizing={customizing} /></WidgetCard>
          if (id === 'customers')    return <WidgetCard key={id} {...props}><TopCustomersWidget customizing={customizing} /></WidgetCard>
          if (id === 'quickactions') return <WidgetCard key={id} {...props}><QuickActionsWidget customizing={customizing} /></WidgetCard>
          if (id === 'recenttx')     return <WidgetCard key={id} {...props}><RecentTransactionsWidget customizing={customizing} /></WidgetCard>
          if (id === 'expenses')     return <WidgetCard key={id} {...props}><ExpenseWidget customizing={customizing} /></WidgetCard>
          return null
        })}

        {layout.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">📊</span>
            <h3 className="font-bold text-slate-700 text-lg mb-2">Empty dashboard</h3>
            <p className="text-slate-400 text-sm mb-5">Add widgets to see your business data here.</p>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Add Widget
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal     && <AddWidgetModal      active={layout} onAdd={handleAddWidget} onClose={() => setShowAddModal(false)} />}
      {showSaveTemplate && <SaveTemplateModal   onSave={handleSaveTemplate}             onClose={() => setShowSaveTemplate(false)} />}
      {showTemplates    && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTemplates(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-base">Saved Templates</h2>
              <button onClick={() => setShowTemplates(false)} aria-label="Close" className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 flex flex-col gap-2 max-h-72 overflow-y-auto">
              {templates.map(tpl => (
                <button key={tpl.name} onClick={() => applyTemplate(tpl)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors text-left">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 text-sm shrink-0">📋</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-[13px]">{tpl.name}</p>
                    <p className="text-[11px] text-slate-400">{tpl.layout.length} widgets</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Individual widgets
// ═══════════════════════════════════════════════════════════════════════════

// ── KPI Stats ────────────────────────────────────────────────────────────────
const STATS = [
  {
    label: 'Total Revenue', value: 847293, change: 12.5, up: true,
    sub: 'vs last month',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    label: 'Net Profit', value: 127482, change: 8.3, up: true,
    sub: '15.1% margin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    ),
  },
  {
    label: 'Outstanding A/R', value: 234891, change: -5.2, up: false,
    sub: '42 invoices pending',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    ),
  },
  {
    label: 'Cash Balance', value: 562103, change: 3.1, up: true,
    sub: 'Across 8 accounts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
  },
]

function StatsWidget({ customizing }: { customizing: boolean }) {
  return (
    <div className={`p-5 grid grid-cols-2 xl:grid-cols-4 gap-4 ${customizing ? 'pt-10' : ''}`}>
      {STATS.map(s => (
        <div key={s.label} className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {s.icon}
            </span>
            <span className={`flex items-center gap-0.5 text-[12px] font-semibold ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {s.up
                ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              }
              {Math.abs(s.change)}%
            </span>
          </div>
          <div>
            <p className="text-[11.5px] text-slate-400">{s.sub}</p>
            <p className="text-[22px] font-extrabold text-slate-900 leading-tight">{formatCurrency(s.value)}</p>
            <p className="text-[11.5px] text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Cash Flow ─────────────────────────────────────────────────────────────────
function CashFlowWidget({ customizing }: { customizing: boolean }) {
  return (
    <div className={`p-5 ${customizing ? 'pt-10' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-slate-900">Cash Flow</p>
          <p className="text-[12px] text-slate-400">Inflow vs Outflow — Last 6 months</p>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />Inflow
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-400">
            <span className="w-3 h-3 rounded-full bg-slate-300" />Outflow
          </span>
        </div>
      </div>
      <CashFlowChart />
    </div>
  )
}

// ── Top Customers ─────────────────────────────────────────────────────────────
const CUSTOMERS = [
  { name: 'Acme Corporation',   amount: 124500, change: 15,   colorCls: 'bg-emerald-500' },
  { name: 'TechStart Inc.',     amount:  98200, change:  8,   colorCls: 'bg-blue-500' },
  { name: 'Global Retail Co.',  amount:  87400, change: -3,   colorCls: 'bg-violet-500' },
  { name: 'Metro Services',     amount:  65100, change: 22,   colorCls: 'bg-amber-500' },
  { name: 'Pinnacle Solutions', amount:  54800, change:  5,   colorCls: 'bg-rose-500' },
]

function TopCustomersWidget({ customizing }: { customizing: boolean }) {
  return (
    <div className={`p-5 flex flex-col ${customizing ? 'pt-10' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-slate-900">Top Customers</p>
        <Link href="/sales/customers" className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
          View all
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" /></svg>
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {CUSTOMERS.map((c, i) => (
          <div key={c.name} className="flex items-center gap-3">
            <span className="text-[12px] font-bold text-slate-300 w-4 shrink-0">{i + 1}</span>
            <span className={`w-8 h-8 rounded-full ${c.colorCls} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}>
              {c.name.charAt(0)}
            </span>
            <span className="flex-1 text-[13px] font-medium text-slate-700 truncate">{c.name}</span>
            <div className="text-right shrink-0">
              <p className="text-[13px] font-bold text-slate-800">{formatCurrency(c.amount)}</p>
              <p className={`text-[11px] font-semibold ${c.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {c.change >= 0 ? '+' : ''}{c.change}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Quick Actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'New Invoice',      href: '/sales/invoices/new',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { label: 'Record Payment',   href: '/sales/payments/new',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  { label: 'Create Bill',      href: '/expenses/bills/new',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { label: 'Add Customer',     href: '/sales/customers/new',   icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> },
]

function QuickActionsWidget({ customizing }: { customizing: boolean }) {
  return (
    <div className={`p-5 flex flex-col ${customizing ? 'pt-10' : ''}`}>
      <p className="font-bold text-slate-900 mb-4">Quick Actions</p>
      <div className="grid grid-cols-2 gap-2.5">
        {QUICK_ACTIONS.map(a => (
          <Link key={a.label} href={a.href as Route}
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[13px] transition-colors group">
            <span className="text-emerald-600 group-hover:text-emerald-700 shrink-0">{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Recent Transactions ───────────────────────────────────────────────────────
const RECENT_TX = [
  { name: 'Acme Corp — INV-2024-089',    date: 'Feb 28',   amount: 12500,  type: 'invoice',  status: 'Paid' },
  { name: 'AWS Cloud Services',           date: 'Feb 27',   amount: -2340,  type: 'expense',  status: 'Posted' },
  { name: 'TechStart — Payment',          date: 'Feb 26',   amount: 8000,   type: 'payment',  status: 'Cleared' },
  { name: 'Office Supplies',              date: 'Feb 25',   amount: -450,   type: 'expense',  status: 'Posted' },
  { name: 'Metro Services — INV-088',    date: 'Feb 24',   amount: 5100,   type: 'invoice',  status: 'Sent' },
]

const TX_COLORS: Record<string, string> = {
  invoice: 'bg-blue-50 text-blue-600',
  expense: 'bg-red-50 text-red-600',
  payment: 'bg-emerald-50 text-emerald-600',
}

function RecentTransactionsWidget({ customizing }: { customizing: boolean }) {
  return (
    <div className={`p-5 flex flex-col ${customizing ? 'pt-10' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-slate-900">Recent Transactions</p>
        <Link href="/accounting" className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
          View all<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" /></svg>
        </Link>
      </div>
      <div className="flex flex-col gap-0 divide-y divide-slate-50">
        {RECENT_TX.map(t => (
          <div key={t.name} className="flex items-center gap-3 py-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide shrink-0 ${TX_COLORS[t.type]}`}>{t.type}</span>
            <span className="flex-1 text-[12.5px] text-slate-700 truncate">{t.name}</span>
            <span className="text-[11px] text-slate-400 shrink-0">{t.date}</span>
            <span className={`font-bold text-[13px] shrink-0 ${t.amount >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
              {t.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Expense Breakdown ─────────────────────────────────────────────────────────
function ExpenseWidget({ customizing }: { customizing: boolean }) {
  return (
    <div className={`p-5 flex flex-col ${customizing ? 'pt-10' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-slate-900">Expense Breakdown</p>
        <Link href="/expenses" className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
          View all<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" /></svg>
        </Link>
      </div>
      <ExpenseDonut />
    </div>
  )
}
