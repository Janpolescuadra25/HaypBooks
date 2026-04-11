'use client'

import { Suspense, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Check, GitMerge, Loader2, Search, X,
} from 'lucide-react'
import {
  mockJEs, mockStore, detectAutoMatches, matchTransaction,
  type MockJournalEntry,
} from '../mockGLState'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n)

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

// ─── Inner Component (uses useSearchParams) ───────────────────────────────────

function MatchPageInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const txnId        = searchParams.get('txnId') ?? ''

  const tx = mockStore.items.find(m => m.id === txnId)

  // Filters
  type JETypeFilter = 'All' | 'Bills' | 'Invoices' | 'Journal Entries'
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState<JETypeFilter>('All')
  const [selected,   setSelected]   = useState<MockJournalEntry | null>(null)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)

  // Auto-match suggestions for this tx
  const suggestions = useMemo(() => {
    if (!tx) return []
    const all = detectAutoMatches([tx])
    return all[tx.id] ?? []
  }, [tx])

  // All JEs available in manual search
  const manualJEs = useMemo(() => {
    const q = search.toLowerCase()
    return mockJEs.filter(j => {
      const typeOk =
        typeFilter === 'All' ||
        (typeFilter === 'Bills'           && j.type === 'Bill') ||
        (typeFilter === 'Invoices'        && j.type === 'Invoice') ||
        (typeFilter === 'Journal Entries' && j.type !== 'Bill' && j.type !== 'Invoice')
      const searchOk = !q ||
        j.description.toLowerCase().includes(q) ||
        (j.contactName  ?? '').toLowerCase().includes(q) ||
        (j.referenceNo  ?? '').toLowerCase().includes(q)
      return typeOk && searchOk
    })
  }, [search, typeFilter])

  if (!tx) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Transaction not found</p>
          <button onClick={() => router.push('/banking-cash/transactions')}
            className="text-sm text-emerald-600 underline">← Back to transactions</button>
        </div>
      </div>
    )
  }

  const matchType = tx.amount < 0 ? 'Bank Payment' : 'Bank Receipt'

  const confirmMatch = async (je: MockJournalEntry) => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const updated = matchTransaction(tx, je.id, matchType)
    const idx = mockStore.items.findIndex(m => m.id === tx.id)
    if (idx >= 0) mockStore.items[idx] = updated
    setSaving(false)
    setSaved(true)
    setTimeout(() => router.push('/banking-cash/transactions'), 900)
  }

  const JECard = ({ je, highlight }: { je: MockJournalEntry; highlight?: boolean }) => {
    const diff = Math.abs(Math.abs(tx.amount) - je.totalAmount)
    const isExact = diff < 0.01
    const isSelected = selected?.id === je.id
    return (
      <button
        onClick={() => setSelected(je.id === selected?.id ? null : je)}
        className={`w-full text-left rounded-xl border p-3.5 transition-all ${
          isSelected
            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
            : highlight
              ? 'border-blue-300 bg-blue-50/50 hover:border-blue-400'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                je.type === 'Bill'    ? 'bg-orange-100 text-orange-700'  :
                je.type === 'Invoice' ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-600'
              }`}>{je.type}</span>
              {je.referenceNo && <span className="text-xs font-mono text-slate-500">{je.referenceNo}</span>}
              {isExact
                ? <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">✓ Exact match</span>
                : diff <= 5
                  ? <span className="text-[11px] text-amber-600 font-medium bg-amber-50 px-1 rounded">~{fmt(diff)} diff</span>
                  : null
              }
            </div>
            <p className="text-sm font-medium text-slate-800 truncate">{je.description}</p>
            {je.contactName && <p className="text-xs text-slate-500 mt-0.5">{je.contactName}</p>}
            <p className="text-xs text-slate-400 mt-0.5">{fmtDate(je.date)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-slate-800 font-mono">{fmt(je.totalAmount)}</p>
            {isSelected && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-600 font-medium mt-1">
                <Check size={11} /> Selected
              </span>
            )}
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/banking-cash/transactions')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-slate-900 truncate">{tx.description}</h1>
            <p className="text-xs text-slate-500">{fmtDate(tx.date)}</p>
          </div>
          <div className={`text-base font-bold font-mono ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            {fmt(tx.amount)}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">

        {/* ── Success banner ── */}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
            <Check size={16} /> Matched successfully — returning…
          </div>
        )}

        {/* ── Suggested Matches ── */}
        {suggestions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <GitMerge size={15} className="text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Suggested Matches</h2>
              <span className="text-xs text-slate-400">Based on amount</span>
            </div>
            <div className="space-y-2">
              {suggestions.map(s => (
                <JECard key={s.je.id} je={s.je} highlight />
              ))}
            </div>
          </section>
        )}

        {/* ── Confirmation card ── */}
        {selected && (
          <div className="rounded-xl border border-emerald-400 bg-emerald-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-emerald-800">
              Confirm match: <span className="font-normal text-emerald-700">{tx.description} → {selected.type} {selected.referenceNo ?? selected.id.slice(0, 8)}</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div><span className="text-slate-400">Bank tx:</span> {fmt(Math.abs(tx.amount))}</div>
              <div><span className="text-slate-400">JE amount:</span> {fmt(selected.totalAmount)}</div>
              <div><span className="text-slate-400">Match type:</span> {matchType}</div>
              <div><span className="text-slate-400">Party:</span> {selected.contactName ?? '—'}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => confirmMatch(selected)}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Confirm Match
              </button>
              <button onClick={() => setSelected(null)}
                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-white">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Manual Search ── */}
        <section>
          <h2 className="text-sm font-bold text-slate-800 mb-3">All Bills, Invoices & Journal Entries</h2>

          {/* Search + type filter */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by description, contact, or ref…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>
            <div className="flex gap-1 shrink-0">
              {(['All', 'Bills', 'Invoices', 'Journal Entries'] as JETypeFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    typeFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* JE list */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {manualJEs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No records match your search.</div>
            ) : (
              manualJEs.map(je => {
                const isSuggested = suggestions.some(s => s.je.id === je.id)
                return isSuggested ? null : <JECard key={je.id} je={je} />
              })
            )}
          </div>
        </section>

      </div>
    </div>
  )
}

// ─── Page Export (Suspense boundary for useSearchParams) ─────────────────────

export default function MatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    }>
      <MatchPageInner />
    </Suspense>
  )
}
