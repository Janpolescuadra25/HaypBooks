'use client'

import React, { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronLeft,
  ChevronRight, History, Plus, Printer, X,
} from 'lucide-react'
import {
  MOCK_BANK_ACCOUNTS,
  getReconciliationHistory,
  saveReconciliation,
  mockStore,
  type MockBankTransaction,
  type MockReconciliation,
} from '@/app/(owner)/banking-cash/transactions/mockGLState'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  const abs = Math.abs(n)
  const s = abs.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (n < 0 ? '-' : '') + '₱' + s
}

function fmtMonth(d: string): string {
  try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) } catch { return d }
}

function fmtShort(d: string): string {
  try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'history' | 'setup' | 'reconcile'
type TxFilter = 'all' | 'cleared' | 'uncleared'

interface SetupForm {
  bankAccountId: string
  statementDate: string
  statementBalance: string
  serviceCharge: string
  interestIncome: string
}

const PAGE_SIZE = 25

// ─── Component ────────────────────────────────────────────────────────────────

export default function BankReconciliationPage() {
  // ── Navigation ───────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('history')

  // ── Setup form ───────────────────────────────────────────────────────────
  const [form, setForm] = useState<SetupForm>({
    bankAccountId: MOCK_BANK_ACCOUNTS[0]?.id ?? '',
    statementDate: new Date().toISOString().split('T')[0],
    statementBalance: '',
    serviceCharge: '',
    interestIncome: '',
  })
  const [formError, setFormError] = useState('')

  // ── Reconcile step ───────────────────────────────────────────────────────
  // accountTxs: snapshot of all transactions for the selected account (captured on Start)
  const [accountTxs, setAccountTxs] = useState<MockBankTransaction[]>([])
  // prevReconciledIds: txs already reconciled before this session started (disabled)
  const [prevReconciledIds, setPrevReconciledIds] = useState<Set<string>>(new Set())
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [txFilter, setTxFilter] = useState<TxFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)

  // ── Modals ───────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<'none' | 'unbalanced' | 'success'>('none')

  // ── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState('')
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  // ── Derived: reconcile summary ────────────────────────────────────────────
  const account = MOCK_BANK_ACCOUNTS.find(a => a.id === form.bankAccountId)
  const openingBalance = account?.openingBalance ?? 0
  const statementBalance = parseFloat(form.statementBalance) || 0
  const serviceChargeAmt = parseFloat(form.serviceCharge) || 0
  const interestIncomeAmt = parseFloat(form.interestIncome) || 0

  const clearedDeposits = useMemo(
    () => accountTxs.filter(tx => checkedIds.has(tx.id) && tx.amount > 0).reduce((s, tx) => s + tx.amount, 0),
    [accountTxs, checkedIds],
  )
  const clearedWithdrawals = useMemo(
    () => Math.abs(accountTxs.filter(tx => checkedIds.has(tx.id) && tx.amount < 0).reduce((s, tx) => s + tx.amount, 0)),
    [accountTxs, checkedIds],
  )

  const calculatedBalance = Math.round(
    (openingBalance + clearedDeposits - clearedWithdrawals - serviceChargeAmt + interestIncomeAmt) * 100,
  ) / 100
  const difference = Math.round((calculatedBalance - statementBalance) * 100) / 100
  const isBalanced = Math.abs(difference) < 0.005

  const outstandingWithdrawals = useMemo(
    () => accountTxs.filter(tx => !checkedIds.has(tx.id) && tx.amount < 0),
    [accountTxs, checkedIds],
  )
  const outstandingDeposits = useMemo(
    () => accountTxs.filter(tx => !checkedIds.has(tx.id) && tx.amount > 0),
    [accountTxs, checkedIds],
  )

  // Smart highlight: uncleared tx whose amount would close the remaining difference
  const smartHighlightIds = useMemo(() => {
    if (isBalanced) return new Set<string>()
    const s = new Set<string>()
    for (const tx of accountTxs) {
      if (checkedIds.has(tx.id)) continue
      // Checking this tx changes calculatedBalance by tx.amount; that fixes the diff when diff + tx.amount ≈ 0
      if (Math.abs(difference + tx.amount) < 0.01) s.add(tx.id)
    }
    return s
  }, [accountTxs, checkedIds, difference, isBalanced])

  // Filtered + sorted transactions for display
  const visibleTxs = useMemo(() => {
    let txs = accountTxs
    if (txFilter === 'cleared')   txs = txs.filter(tx => checkedIds.has(tx.id))
    if (txFilter === 'uncleared') txs = txs.filter(tx => !checkedIds.has(tx.id))
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      txs = txs.filter(tx => tx.description.toLowerCase().includes(q))
    }
    return [...txs].sort((a, b) => b.date.localeCompare(a.date))
  }, [accountTxs, txFilter, checkedIds, searchQuery])

  const totalPages = Math.max(1, Math.ceil(visibleTxs.length / PAGE_SIZE))
  const pagedTxs = visibleTxs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // ── History data (refreshed whenever step changes to 'history') ────────────
  const [historyData, setHistoryData] = useState<MockReconciliation[]>([])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function goToHistory() {
    setHistoryData(getReconciliationHistory())
    setStep('history')
  }

  function handleStartReconciliation() {
    if (!form.bankAccountId) { setFormError('Please select a bank account.'); return }
    if (!form.statementBalance.trim()) { setFormError('Please enter the statement ending balance.'); return }
    setFormError('')

    const txs = mockStore.items.filter(tx => tx.accountId === form.bankAccountId)
    const prevRec = new Set(txs.filter(tx => tx.reconciled).map(tx => tx.id))
    setAccountTxs(txs)
    setPrevReconciledIds(prevRec)
    setCheckedIds(new Set(prevRec))
    setTxFilter('all')
    setSearchQuery('')
    setPage(0)
    setStep('reconcile')
  }

  function handleToggle(txId: string) {
    if (prevReconciledIds.has(txId)) return
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(txId) ? next.delete(txId) : next.add(txId)
      return next
    })
  }

  function handleMarkAll() {
    setCheckedIds(new Set(accountTxs.map(tx => tx.id)))
  }

  function handleClearAll() {
    setCheckedIds(new Set(prevReconciledIds))
  }

  function handleFinishClick() {
    setModal(isBalanced ? 'success' : 'unbalanced')
  }

  function handleConfirmFinish() {
    const clearedTxIds = Array.from(checkedIds)
    const outstandingTxIds = accountTxs.filter(tx => !checkedIds.has(tx.id)).map(tx => tx.id)

    saveReconciliation({
      bankAccountId: form.bankAccountId,
      statementDate: form.statementDate,
      statementBalance,
      calculatedBalance,
      clearedTxIds,
      outstandingTxIds,
      serviceCharge: serviceChargeAmt > 0 ? serviceChargeAmt : undefined,
      interestIncome: interestIncomeAmt > 0 ? interestIncomeAmt : undefined,
    })

    setModal('none')
    showToast('Reconciliation saved successfully!')
    goToHistory()
  }

  // ─── Render: History ──────────────────────────────────────────────────────
  if (step === 'history') {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-700 text-white text-sm rounded-lg shadow-lg">
            {toast}
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Banking</p>
            <h1 className="text-2xl font-bold text-slate-900">Bank Reconciliation</h1>
            <p className="text-sm text-slate-500 mt-0.5">Reconcile your bank statements to your books</p>
          </div>
          <button
            onClick={() => { setFormError(''); setStep('setup') }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus size={14} /> New Reconciliation
          </button>
        </div>

        {historyData.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 text-slate-400">
            <History size={36} className="mb-3 text-slate-200" />
            <p className="font-medium text-slate-500">No reconciliations yet</p>
            <p className="text-sm mt-1">Start a new reconciliation to get started.</p>
            <button
              onClick={() => setStep('setup')}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Plus size={14} /> New Reconciliation
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Bank Account</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Difference</th>
                  <th className="px-4 py-3 text-right">Cleared Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...historyData].reverse().map(h => {
                  const acct = MOCK_BANK_ACCOUNTS.find(a => a.id === h.bankAccountId)
                  return (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{fmtMonth(h.statementDate)}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{acct?.name ?? h.bankAccountId}</td>
                      <td className="px-4 py-3.5 text-center">
                        {h.status === 'balanced' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={10} /> Balanced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle size={10} /> Not Balanced
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3.5 text-right font-mono text-sm tabular-nums ${Math.abs(h.difference) < 0.01 ? 'text-emerald-700' : 'text-red-600'
                        }`}>{fmt(h.difference)}</td>
                      <td className="px-4 py-3.5 text-right text-sm text-slate-600">
                        {h.clearedTxIds.length} transactions
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // ─── Render: Setup ────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div className="p-4 sm:p-6 flex items-start justify-center min-h-[60vh]">
        <div className="w-full max-w-lg">
          <button
            onClick={goToHistory}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to History
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg">New Reconciliation</h2>
              <p className="text-sm text-slate-500 mt-0.5">Enter your bank statement details</p>
            </div>

            <div className="px-6 py-6 space-y-4">
              {/* Bank Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Bank Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.bankAccountId}
                  onChange={e => setForm(f => ({ ...f, bankAccountId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">Select bank account…</option>
                  {MOCK_BANK_ACCOUNTS.map(a => (
                    <option key={a.id} value={a.id}>{a.name} — {a.accountNumber}</option>
                  ))}
                </select>
              </div>

              {/* Statement Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Statement Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.statementDate}
                  onChange={e => setForm(f => ({ ...f, statementDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Statement Ending Balance */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Statement Ending Balance <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" step="0.01"
                  value={form.statementBalance}
                  onChange={e => setForm(f => ({ ...f, statementBalance: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">Ending balance shown on your bank statement</p>
              </div>

              {/* Optional adjustments */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Service Charge</label>
                  <input
                    type="number" step="0.01"
                    value={form.serviceCharge}
                    onChange={e => setForm(f => ({ ...f, serviceCharge: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Bank fees not in feed (optional)</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Interest Income</label>
                  <input
                    type="number" step="0.01"
                    value={form.interestIncome}
                    onChange={e => setForm(f => ({ ...f, interestIncome: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Bank interest not in feed (optional)</p>
                </div>
              </div>

              {formError && (
                <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <AlertTriangle size={14} /> {formError}
                </p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={goToHistory}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartReconciliation}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Start Reconciliation →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render: Reconcile ────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 space-y-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-700 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* ── Unbalanced modal ──────────────────────────────────────────────── */}
      {modal === 'unbalanced' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
              <h3 className="font-bold text-slate-900">Unbalanced Reconciliation</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Your books don&apos;t match the bank statement.<br />
              <strong>Difference: {fmt(difference)}</strong><br />
              You can finish now and reconcile later, or go back and review.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setModal('none')}
                className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmFinish}
                className="flex-1 px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg"
              >
                Finish Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Balanced modal ────────────────────────────────────────────────── */}
      {modal === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
              <h3 className="font-bold text-slate-900">Reconciliation Complete!</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              All transactions are balanced. Your books match the bank statement.
            </p>
            <button
              onClick={handleConfirmFinish}
              className="w-full px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
            >
              Finish
            </button>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setStep('setup')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Setup
        </button>
        <h1 className="text-xl font-bold text-slate-900">
          Reconcile — {account?.name ?? 'Bank Account'}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Statement date: {fmtShort(form.statementDate)} · Check off transactions that appear on your bank statement
        </p>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="flex gap-4 items-start">

        {/* LEFT: Transaction list ~60% */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center gap-2">
            <button
              onClick={handleMarkAll}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-md text-slate-600 hover:bg-white transition-colors"
            >
              Mark All
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-md text-slate-600 hover:bg-white transition-colors"
            >
              Clear All
            </button>
            <select
              value={txFilter}
              onChange={e => { setTxFilter(e.target.value as TxFilter); setPage(0) }}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-md text-slate-600 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="cleared">Cleared</option>
              <option value="uncleared">Uncleared</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(0) }}
              placeholder="Search description…"
              className="flex-1 min-w-[140px] px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {pagedTxs.length === 0 ? (
            <p className="p-6 text-sm text-center text-slate-400">No transactions match the filter.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {pagedTxs.map(tx => {
                const isPrevRec = prevReconciledIds.has(tx.id)
                const isChecked = checkedIds.has(tx.id)
                const isHighlight = smartHighlightIds.has(tx.id)

                return (
                  <div
                    key={tx.id}
                    onClick={() => handleToggle(tx.id)}
                    title={isHighlight ? '💡 Possible match to clear the difference' : undefined}
                    className={[
                      'px-4 py-3 flex items-center gap-3 transition-colors select-none',
                      isPrevRec
                        ? 'bg-slate-50 cursor-default opacity-60'
                        : 'cursor-pointer hover:bg-slate-50',
                      isHighlight && !isPrevRec
                        ? 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400'
                        : '',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isPrevRec}
                      onChange={() => handleToggle(tx.id)}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 accent-emerald-600 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isPrevRec ? 'italic text-slate-400' : 'text-slate-800'}`}>
                        {tx.description}
                        {isPrevRec && <span className="ml-1 text-xs font-normal">(Previously reconciled)</span>}
                        {isHighlight && !isPrevRec && <span className="ml-1 text-xs font-normal text-yellow-600">💡 Possible match</span>}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{fmtShort(tx.date)}</p>
                    </div>
                    <span className={`font-mono font-semibold text-sm tabular-nums flex-shrink-0 ${tx.amount >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-400">
                Page {page + 1} of {totalPages} · {visibleTxs.length} transactions
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Reconciliation Summary ~40%, sticky */}
        <div className="w-[340px] flex-shrink-0 sticky top-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-700">Reconciliation Summary</h3>
            </div>

            <div className="px-4 py-4 space-y-2 text-sm">
              <SummaryRow label="Opening Balance:" value={fmt(openingBalance)} />
              <SummaryRow label="(+) Deposits Cleared:" value={'+' + fmt(clearedDeposits)} valueClass="text-emerald-700" />
              <SummaryRow label="(-) Checks Cleared:" value={'-' + fmt(clearedWithdrawals)} valueClass="text-rose-600" />
              {serviceChargeAmt > 0 && (
                <SummaryRow label="(-) Service Charges:" value={'-' + fmt(serviceChargeAmt)} valueClass="text-rose-600" />
              )}
              {interestIncomeAmt > 0 && (
                <SummaryRow label="(+) Interest Income:" value={'+' + fmt(interestIncomeAmt)} valueClass="text-emerald-700" />
              )}
              <div className="border-t border-slate-100 pt-2">
                <SummaryRow label="Calculated Balance:" value={fmt(calculatedBalance)} bold />
              </div>
              <SummaryRow label="Statement Balance:" value={fmt(statementBalance)} bold />
              <div className="border-t border-slate-100 pt-2">
                <SummaryRow
                  label="Difference:"
                  value={fmt(difference)}
                  bold
                  valueClass={isBalanced ? 'text-emerald-700' : 'text-red-600'}
                />
              </div>
            </div>

            {/* Balance status badge */}
            <div className={`px-4 py-3 border-t ${isBalanced ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              {isBalanced ? (
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                  <Check size={15} /> BALANCED
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                  <X size={15} /> NOT BALANCED — {fmt(Math.abs(difference))}
                </div>
              )}
            </div>

            {/* Outstanding items */}
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-600 mb-1">Outstanding Items:</p>
              <div className="flex justify-between">
                <span>Withdrawals:</span>
                <span className="text-rose-600 tabular-nums">
                  {fmt(Math.abs(outstandingWithdrawals.reduce((s, tx) => s + tx.amount, 0)))}
                  {' '}({outstandingWithdrawals.length} items)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Deposits:</span>
                <span className="text-emerald-700 tabular-nums">
                  {fmt(outstandingDeposits.reduce((s, tx) => s + tx.amount, 0))}
                  {' '}({outstandingDeposits.length} items)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Printer size={12} /> Print Report
              </button>
              <button
                onClick={handleFinishClick}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors text-white ${isBalanced ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'}`}
              >
                Finish Reconcile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-component: summary row ───────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  bold = false,
  valueClass = 'text-slate-800',
}: {
  label: string
  value: string
  bold?: boolean
  valueClass?: string
}) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold' : ''}`}>
      <span className={bold ? 'text-slate-700' : 'text-slate-500'}>{label}</span>
      <span className={`font-mono tabular-nums ${valueClass}`}>{value}</span>
    </div>
  )
}
