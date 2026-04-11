'use client'

import { Suspense, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Check, Loader2, Plus, Scissors, X,
} from 'lucide-react'
import {
  MOCK_COA_ACCOUNTS, mockStore, splitTransaction,
  type MockCOAAccount,
} from '../mockGLState'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n)

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

let _lineId = 0
const newLineId = () => ++_lineId

interface SplitLine {
  id: number
  accountId: string
  amount: string
  memo: string
}

// ─── Inner Component (uses useSearchParams) ───────────────────────────────────

function SplitPageInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const txnId        = searchParams.get('txnId') ?? ''

  const tx = mockStore.items.find(m => m.id === txnId)
  const absAmt = Math.abs(tx?.amount ?? 0)

  const [lines,  setLines]  = useState<SplitLine[]>([
    { id: newLineId(), accountId: '', amount: '', memo: '' },
    { id: newLineId(), accountId: '', amount: '', memo: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const allocated = useMemo(
    () => lines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0),
    [lines],
  )
  const remaining = absAmt - allocated
  const isBalanced = Math.abs(remaining) < 0.01

  const addLine = () =>
    setLines(prev => [...prev, { id: newLineId(), accountId: '', amount: '', memo: '' }])

  const removeLine = (id: number) =>
    setLines(prev => prev.filter(l => l.id !== id))

  const updateLine = (id: number, field: keyof SplitLine, value: string) =>
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))

  const autoFillRemaining = (id: number) => {
    const otherAllocated = lines
      .filter(l => l.id !== id)
      .reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
    const rem = absAmt - otherAllocated
    if (rem > 0) updateLine(id, 'amount', rem.toFixed(2))
  }

  const handleSave = async () => {
    setError('')
    const incomplete = lines.some(l => !l.accountId || !(parseFloat(l.amount) > 0))
    if (incomplete) { setError('All lines must have an account and a positive amount.'); return }
    if (!isBalanced) { setError(`Total must equal ${fmt(absAmt)}. Currently ${fmt(allocated)}.`); return }
    if (!tx) return

    setSaving(true)
    await new Promise(r => setTimeout(r, 600))

    const splits = lines.map(l => {
      const acc = MOCK_COA_ACCOUNTS.find(a => a.id === l.accountId)!
      return {
        accountId:   l.accountId,
        accountName: acc.name,
        amount:      parseFloat(l.amount),
        memo:        l.memo || undefined,
      }
    })

    const updated = splitTransaction(tx, splits)
    const idx = mockStore.items.findIndex(m => m.id === tx.id)
    if (idx >= 0) mockStore.items[idx] = updated

    setSaving(false)
    router.push('/banking-cash/transactions')
  }

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

  const coaByType = MOCK_COA_ACCOUNTS.reduce<Record<string, MockCOAAccount[]>>(
    (acc, a) => { (acc[a.type] = acc[a.type] ?? []).push(a); return acc },
    {},
  )

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
            <h1 className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
              <Scissors size={13} className="text-purple-600" /> Split: {tx.description}
            </h1>
            <p className="text-xs text-slate-500">{fmtDate(tx.date)}</p>
          </div>
          <div className={`text-base font-bold font-mono ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            {fmt(tx.amount)}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-5">

        {/* ── Balance indicator ── */}
        <div className={`rounded-xl border p-4 ${
          isBalanced
            ? 'bg-emerald-50 border-emerald-300'
            : remaining > 0
              ? 'bg-amber-50 border-amber-300'
              : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <div className="space-y-0.5">
              <div className="flex items-center gap-4">
                <div><span className="text-slate-500 text-xs">Total</span><span className="ml-2 font-mono font-semibold text-slate-800">{fmt(absAmt)}</span></div>
                <div><span className="text-slate-500 text-xs">Allocated</span><span className="ml-2 font-mono font-semibold text-slate-800">{fmt(allocated)}</span></div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">Remaining</p>
              <p className={`text-lg font-bold font-mono ${
                isBalanced ? 'text-emerald-700' : remaining > 0 ? 'text-amber-700' : 'text-red-700'
              }`}>{fmt(Math.abs(remaining))}{!isBalanced && (remaining < 0 ? ' over' : ' left')}</p>
            </div>
          </div>
        </div>

        {/* ── Split Lines ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-sm font-bold text-slate-800 mb-3">Split Lines</h2>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_140px_160px_32px] gap-2 mb-1.5 text-xs font-medium text-slate-400 px-0.5">
              <span>Account</span>
              <span className="text-right">Amount (₱)</span>
              <span>Memo (optional)</span>
              <span />
            </div>

            {/* Lines */}
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={line.id} className="grid grid-cols-[1fr_140px_160px_32px] gap-2 items-center">
                  {/* Account select */}
                  <select
                    value={line.accountId}
                    onChange={e => updateLine(line.id, 'accountId', e.target.value)}
                    className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  >
                    <option value="">Select account…</option>
                    {Object.entries(coaByType).map(([type, accounts]) => (
                      <optgroup key={type} label={type}>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.code} {a.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  {/* Amount input */}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.amount}
                    onChange={e => updateLine(line.id, 'amount', e.target.value)}
                    onFocus={() => { if (!line.amount) autoFillRemaining(line.id) }}
                    placeholder="0.00"
                    className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-right font-mono"
                  />

                  {/* Memo */}
                  <input
                    value={line.memo}
                    onChange={e => updateLine(line.id, 'memo', e.target.value)}
                    placeholder="Memo…"
                    className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />

                  {/* Remove */}
                  <button
                    onClick={() => removeLine(line.id)}
                    disabled={lines.length <= 2}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-red-50"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add line */}
          <div className="px-4 py-3 border-t border-slate-100">
            <button
              onClick={addLine}
              className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              <Plus size={14} /> Add line
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <X size={14} /> {error}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pb-6">
          <button
            onClick={handleSave}
            disabled={saving || !isBalanced || lines.some(l => !l.accountId)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save Split
          </button>
          <button
            onClick={() => router.push('/banking-cash/transactions')}
            className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-white"
          >
            Cancel
          </button>
          {!isBalanced && (
            <span className="text-xs text-slate-500">
              {remaining > 0 ? `${fmt(remaining)} still to allocate` : `${fmt(Math.abs(remaining))} over-allocated`}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── Page Export (Suspense boundary for useSearchParams) ─────────────────────

export default function SplitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    }>
      <SplitPageInner />
    </Suspense>
  )
}
