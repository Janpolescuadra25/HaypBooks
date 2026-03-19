'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

// ── Mock data ──────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: 'invoice',   label: 'New Invoice',      desc: 'Create a new sales invoice',     pinned: true,  icon: '📄', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'bill',      label: 'New Bill',          desc: 'Record a vendor bill',           pinned: true,  icon: '🧾', color: 'bg-yellow-50 text-yellow-600' },
  { id: 'payment',   label: 'Record Payment',    desc: 'Record a customer payment',      pinned: true,  icon: '💳', color: 'bg-blue-50 text-blue-600' },
  { id: 'customer',  label: 'New Customer',      desc: 'Add a new customer',             pinned: true,  icon: '👤', color: 'bg-teal-50 text-teal-600' },
  { id: 'vendor',    label: 'New Vendor',        desc: 'Add a new vendor',               pinned: false, icon: '🏢', color: 'bg-slate-50 text-slate-600' },
  { id: 'journal',   label: 'Journal Entry',     desc: 'Create a journal entry',         pinned: false, icon: '📖', color: 'bg-purple-50 text-purple-600' },
  { id: 'po',        label: 'Purchase Order',    desc: 'Create a purchase order',        pinned: false, icon: '🛒', color: 'bg-rose-50 text-rose-600' },
  { id: 'project',   label: 'New Project',       desc: 'Start a new project',            pinned: false, icon: '📂', color: 'bg-indigo-50 text-indigo-600' },
  { id: 'payroll',   label: 'Payroll Run',       desc: 'Process payroll',                pinned: false, icon: '🧮', color: 'bg-orange-50 text-orange-600' },
  { id: 'reconcile', label: 'Bank Reconcile',    desc: 'Reconcile bank account',         pinned: false, icon: '🏦', color: 'bg-cyan-50 text-cyan-600' },
  { id: 'report',    label: 'Run Report',        desc: 'Generate financial reports',     pinned: false, icon: '📊', color: 'bg-violet-50 text-violet-600' },
  { id: 'export',    label: 'Export Data',       desc: 'Export data to file',            pinned: false, icon: '📥', color: 'bg-slate-50 text-slate-500' },
]

const FAVORITES = [
  { id: 'pnl',      label: 'Profit & Loss Statement', desc: 'Monthly P&L report',           icon: '📊', color: 'bg-purple-100 text-purple-600' },
  { id: 'bs',       label: 'Balance Sheet',            desc: 'Financial position report',    icon: '📄', color: 'bg-blue-100 text-blue-600' },
  { id: 'inv',      label: 'Invoices',                 desc: 'Manage sales invoices',        icon: '🧾', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'bills',    label: 'Bills',                    desc: 'Manage vendor bills',          icon: '🧾', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'acme',     label: 'Acme Corporation',         desc: 'Top customer – $124,500 revenue', icon: '👤', color: 'bg-teal-100 text-teal-600' },
  { id: 'bank',     label: 'Bank Accounts',            desc: 'Manage bank connections',      icon: '🏦', color: 'bg-cyan-100 text-cyan-600' },
]

const RECENT_ITEMS = [
  { id: 'INV-2024-0891', label: 'Invoice #INV-2024-0891',       sub: 'INV-2024-0891 · $4,250.00',    time: '2 min ago',  icon: '📄', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'CUST-001',      label: 'Acme Corporation',             sub: 'CUST-001',                     time: '15 min ago', icon: '👤', color: 'bg-teal-100 text-teal-600' },
  { id: 'PAY-2024-092',  label: 'Payment from TechStart Inc.',  sub: 'PAY-2024-092 · $12,500.00',   time: '32 min ago', icon: '💳', color: 'bg-blue-100 text-blue-600' },
  { id: 'BL-2024-0445',  label: 'Bill #BL-2024-0445',          sub: 'BL-2024-0445 · $1,890.00',    time: '1 hr ago',   icon: '🧾', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'RPT-BS-001',    label: 'Balance Sheet – Jan 2024',     sub: 'RPT-BS-001',                   time: '2 hrs ago',  icon: '📊', color: 'bg-purple-100 text-purple-600' },
  { id: 'JE-2024-023',   label: 'Journal Entry #JE-2024-023',   sub: 'JE-2024-023 · $5,000.00',     time: '3 hrs ago',  icon: '📖', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'VND-045',       label: 'Tech Supplies Inc.',           sub: 'VND-045',                      time: 'Yesterday',  icon: '🏢', color: 'bg-slate-100 text-slate-600' },
  { id: 'INV-2024-0890', label: 'Invoice #INV-2024-0890',       sub: 'INV-2024-0890 · $8,750.00',   time: 'Yesterday',  icon: '📄', color: 'bg-emerald-100 text-emerald-600' },
]

const KB_SHORTCUTS = [
  { label: 'Open global search',       keys: ['⌘', 'K'] },
  { label: 'Create new invoice',       keys: ['⌘', 'N'] },
  { label: 'Create new bill',          keys: ['⌘', 'B'] },
  { label: 'Record payment',           keys: ['⌘', 'P'] },
  { label: 'Run report',               keys: ['⌘', 'R'] },
  { label: 'Show keyboard shortcuts',  keys: ['⌘', '/'] },
  { label: 'Close modal / dialog',     keys: ['Esc']    },
]

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ count, label, sub, icon, iconBg }: { count: number; label: string; sub: string; icon: string; iconBg: string }) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-3xl font-extrabold text-slate-900">{count}</p>
        <p className="text-sm font-medium text-slate-700 mt-0.5">{label}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${iconBg}`}>{icon}</div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ShortcutsClient() {
  const [query, setQuery] = useState('')
  const [pinned, setPinned] = useState<Set<string>>(new Set(QUICK_ACTIONS.filter(a => a.pinned).map(a => a.id)))
  const [showKb, setShowKb] = useState(false)
  const [customize, setCustomize] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { setShowKb(false); setCustomize(false) } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const togglePin = (id: string) => {
    setPinned(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = query.trim()
    ? QUICK_ACTIONS.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.desc.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_ACTIONS

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Shortcuts</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quick access to your frequently used actions and items</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKb(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
          >
            {/* keyboard icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
            </svg>
            Keyboard
          </button>
          {customize ? (
            <button
              onClick={() => setCustomize(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Done
            </button>
          ) : (
            <button
              onClick={() => setCustomize(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Customize
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* ── Stat cards ── */}
        <div className="flex gap-4 flex-wrap">
          <StatCard count={pinned.size}     label="Pinned Actions"    sub="Actions you've pinned"  icon="📌" iconBg="bg-emerald-50" />
          <StatCard count={FAVORITES.length} label="Favorites"         sub="Starred items"          icon="⭐" iconBg="bg-yellow-50"  />
          <StatCard count={RECENT_ITEMS.length} label="Recent Items"   sub="Recently accessed"      icon="🕐" iconBg="bg-blue-50"   />
          <StatCard count={QUICK_ACTIONS.length} label="Available Actions" sub="All quick actions"  icon="⚡" iconBg="bg-purple-50"  />
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-lg">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search shortcuts, actions, recent items..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* ── Main two-col ── */}
        <div className="flex gap-6 items-start">

          {/* ── Quick Actions ── */}
          <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="text-yellow-500">⚡</span> Quick Actions
              </h2>
              <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">{pinned.size} pinned</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Click an action to quickly access it. Pin your most used actions for easy access.</p>

            <div className="grid grid-cols-3 gap-3">
              {filtered.map(action => (
                <div
                  key={action.id}
                  className="group relative flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 cursor-pointer transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{action.label}</p>
                    <p className="text-xs text-slate-400 truncate">{action.desc}</p>
                  </div>
                  {/* Pin button */}
                  <button
                    onClick={e => { e.stopPropagation(); togglePin(action.id) }}
                    title={pinned.has(action.id) ? 'Unpin' : 'Pin'}
                    className={`absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity ${
                      pinned.has(action.id) ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'
                    }`}
                  >
                    📌
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="w-[300px] shrink-0 flex flex-col gap-5">

            {/* Favorites */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="text-yellow-400">⭐</span> Favorites
                </h2>
                <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Edit</button>
              </div>
              <ul className="space-y-2.5">
                {FAVORITES.map(fav => (
                  <li key={fav.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${fav.color}`}>
                      {fav.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-600 transition-colors truncate">{fav.label}</p>
                      <p className="text-xs text-slate-400 truncate">{fav.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* customize hint banner */}
            {customize && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-700">
                <p className="font-semibold mb-1">Customize mode active</p>
                <p>Drag cards to reorder sections. Click the pin icon on any action to keep it visible. Press <kbd className="bg-white border border-emerald-300 rounded px-1 py-0.5 font-mono">Esc</kbd> or Done to exit.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Keyboard Shortcuts Modal ── */}
        {showKb && typeof window !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowKb(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
                    </svg>
                  </span>
                  Keyboard Shortcuts
                </h2>
                <button onClick={() => setShowKb(false)} aria-label="Close keyboard shortcuts" className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* shortcut list */}
              <ul className="divide-y divide-slate-100">
                {KB_SHORTCUTS.map(kb => (
                  <li key={kb.label} className="flex items-center justify-between px-6 py-3.5">
                    <span className="text-sm text-slate-700">{kb.label}</span>
                    <div className="flex items-center gap-1">
                      {kb.keys.map(k => (
                        <kbd key={k} className="px-2 py-1 text-xs bg-slate-100 rounded border border-slate-300 font-mono text-slate-700">{k}</kbd>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              {/* pro tip */}
              <div className="mx-6 my-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-xs text-emerald-700">
                  <span className="font-semibold">Pro tip:</span> Press{' '}
                  <kbd className="px-1.5 py-0.5 text-[11px] bg-white border border-emerald-300 rounded font-mono">⌘</kbd>
                  {' '}+{' '}
                  <kbd className="px-1.5 py-0.5 text-[11px] bg-white border border-emerald-300 rounded font-mono">K</kbd>
                  {' '}anytime to open the global search and quickly access any feature.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ── Recent Items ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span className="text-blue-500">🕐</span> Recent Items
            </h2>
            <button className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-500 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {RECENT_ITEMS.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate leading-snug">{item.label}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{item.sub}</p>
                  <p className="text-[11px] text-slate-300 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
