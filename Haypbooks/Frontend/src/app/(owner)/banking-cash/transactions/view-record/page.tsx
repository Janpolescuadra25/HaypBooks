'use client'

import { Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, GitMerge, FileText, Loader2 } from 'lucide-react'
import {
  mockJEs,
  mockStore,
  matchTransaction as glMatch,
  type MockJournalEntry,
} from '../mockGLState'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Math.abs(n))
}

function fmtDate(d: string) {
  try { return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) }
  catch { return d }
}

// ─── Inner view (uses useSearchParams — must be inside Suspense) ──────────────

function ViewRecordInner() {
  const router      = useRouter()
  const params      = useSearchParams()
  const jeId        = params.get('id')    ?? ''
  const txnId       = params.get('txnId') ?? ''
  const paramType   = params.get('type')  ?? ''   // 'bill' | 'invoice'

  const je = mockJEs.find(j => j.id === jeId)
  const tx = mockStore.items.find(m => m.id === txnId)

  const handleBack = useCallback(() => {
    router.push('/banking-cash/transactions')
  }, [router])

  const handleMatch = useCallback(() => {
    if (!tx || !je) return
    const matchType: 'Bank Payment' | 'Bank Receipt' = (tx.amount < 0) ? 'Bank Payment' : 'Bank Receipt'
    const updated = glMatch(tx, je.id, matchType)
    mockStore.items = mockStore.items.map(m => m.id === tx.id ? updated : m)
    router.push('/banking-cash/transactions')
  }, [tx, je, router])

  // ─── Not found ──────────────────────────────────────────────────────────────
  if (!je) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
          <button onClick={handleBack} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft size={16} /> Back to Bank Feed
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <FileText size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Record not found</p>
            <p className="text-sm mt-1">The document you&#39;re looking for could not be located.</p>
          </div>
        </div>
      </div>
    )
  }

  const ref = je.referenceNo ?? je.id.slice(0, 8).toUpperCase()

  const typeLabel =
    je.type === 'Bill'    ? 'Bill' :
    je.type === 'Invoice' ? 'Invoice' :
    'Journal Entry'

  const typeColor =
    je.type === 'Bill'    ? 'text-red-700 bg-red-50 border-red-200' :
    je.type === 'Invoice' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    'text-blue-700 bg-blue-50 border-blue-200'

  const accentColor =
    je.type === 'Bill'    ? 'border-red-500' :
    je.type === 'Invoice' ? 'border-emerald-500' :
    'border-blue-500'

  const canMatch = !!tx && tx.status === 'PENDING'

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 shrink-0"
          >
            <ArrowLeft size={16} /> Back to Bank Feed
          </button>
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeColor}`}>
            {typeLabel}
          </span>
          <h1 className="text-base font-semibold text-slate-800 truncate">
            {ref} · {je.contactName ?? je.description}
          </h1>
        </div>
        {canMatch && (
          <button
            onClick={handleMatch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
          >
            <GitMerge size={15} /> Match This Transaction
          </button>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Match banner */}
        {tx && (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            <GitMerge size={15} className="shrink-0" />
            <span>
              Matching against bank transaction:{' '}
              <span className="font-semibold">{tx.description}</span>{' '}
              <span className="font-mono font-semibold">
                {tx.amount < 0 ? '-' : '+'}{fmt(tx.amount)}
              </span>
              {' '}on {fmtDate(tx.date)}
            </span>
          </div>
        )}

        {/* Document card */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 ${accentColor}`}>

          {/* Document header */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${typeColor}`}>{typeLabel}</span>
                  <span className="font-mono text-sm font-semibold text-slate-700">{ref}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                    je.status === 'POSTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>{je.status}</span>
                </div>
                {je.contactName && (
                  <p className="text-lg font-semibold text-slate-900">{je.contactName}</p>
                )}
                <p className="text-sm text-slate-500">{je.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400 mb-0.5">Date</p>
                <p className="text-sm font-medium text-slate-700">{fmtDate(je.date)}</p>
              </div>
            </div>
          </div>

          {/* Summary amount */}
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">Total Amount</span>
              <span className={`text-xl font-bold font-mono ${
                je.type === 'Bill' ? 'text-red-600' : 'text-emerald-700'
              }`}>
                {fmt(je.totalAmount)}
              </span>
            </div>
          </div>

          {/* Journal Entry Lines table */}
          <div className="px-6 py-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Journal Entry Lines</p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Account</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide text-right">Debit (DR)</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide text-right">Credit (CR)</th>
                    <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Memo</th>
                  </tr>
                </thead>
                <tbody>
                  {je.lines.map((line, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-800 font-medium">{line.accountName}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        {line.debit > 0 ? fmt(line.debit) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        {line.credit > 0 ? fmt(line.credit) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs italic">
                        {line.memo ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase">Total</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-700">
                      {fmt(je.lines.reduce((s, l) => s + l.debit, 0))}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-700">
                      {fmt(je.lines.reduce((s, l) => s + l.credit, 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>

        {/* Match / Back actions */}
        <div className="flex items-center gap-3 pb-8">
          {canMatch && (
            <button
              onClick={handleMatch}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <GitMerge size={15} /> Match This Transaction
            </button>
          )}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 text-slate-600 text-sm rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={14} /> Back without matching
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ViewRecordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    }>
      <ViewRecordInner />
    </Suspense>
  )
}
