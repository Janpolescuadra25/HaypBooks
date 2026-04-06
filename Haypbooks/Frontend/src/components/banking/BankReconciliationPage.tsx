'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Loader2, AlertCircle, CheckCircle2, Link2, Link2Off, Zap,
  RefreshCw, ChevronRight, ArrowLeft, Clock, History, X,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'history' | 'setup' | 'match' | 'complete'
type ReconStatus = 'IN_PROGRESS' | 'COMPLETED' | 'VOIDED'

interface BankAccount {
  id: string
  name: string
  accountNumber?: string
  balance?: number
}

interface BankTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'CREDIT' | 'DEBIT'
  reference?: string
  matchedJournalLineId?: string | null
}

interface BookEntry {
  id: string
  date: string
  entryNumber?: string
  description?: string
  debit: number
  credit: number
  accountCode: string
  accountName: string
  matchedBankTransactionId?: string | null
}

interface ReconciliationSummary {
  id: string
  bankAccountId: string
  bankAccountName?: string
  statementDate: string
  openingBalance: number
  closingBalance: number
  status: ReconStatus
  createdAt: string
  matchedCount?: number
}

interface ReconciliationDetail extends ReconciliationSummary {
  bankTransactions: BankTransaction[]
  bookEntries: BookEntry[]
  matches: Array<{ bankTransactionId: string; journalLineId: string }>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BankReconciliationPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  // ── Navigation state ─────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('history')

  // ── Shared data ──────────────────────────────────────────────────────────
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [history, setHistory] = useState<ReconciliationSummary[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  // ── Setup form state ─────────────────────────────────────────────────────
  const [setupForm, setSetupForm] = useState({
    bankAccountId: '',
    statementDate: new Date().toISOString().split('T')[0],
    openingBalance: '',
    closingBalance: '',
  })
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError] = useState('')

  // ── Active reconciliation state ─────────────────────────────────────────
  const [recon, setRecon] = useState<ReconciliationDetail | null>(null)
  const [matchLoading, setMatchLoading] = useState('')
  const [autoMatchLoading, setAutoMatchLoading] = useState(false)
  const [completeLoading, setCompleteLoading] = useState(false)

  // ── Selection for manual matching ────────────────────────────────────────
  const [selectedBankTx, setSelectedBankTx] = useState<string | null>(null)
  const [selectedBookEntry, setSelectedBookEntry] = useState<string | null>(null)

  // ── Load bank accounts & history ─────────────────────────────────────────
  const loadInitialData = useCallback(async () => {
    if (!companyId) return
    setHistoryLoading(true)
    try {
      const [accsRes] = await Promise.allSettled([
        apiClient.get(`/companies/${companyId}/banking/accounts`),
      ])
      if (accsRes.status === 'fulfilled') {
        const a = accsRes.value.data
        setBankAccounts(Array.isArray(a) ? a : a.accounts ?? [])
      }
      setHistoryError('')
    } catch (e: any) {
      setHistoryError(e?.response?.data?.message ?? 'Failed to load data')
    } finally {
      setHistoryLoading(false)
    }
  }, [companyId])

  const loadHistory = useCallback(async (bankAccountId?: string) => {
    if (!companyId) return
    if (!bankAccountId && !setupForm.bankAccountId) return
    const bid = bankAccountId ?? setupForm.bankAccountId
    setHistoryLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/banking/accounts/${bid}/reconciliations`)
      setHistory(Array.isArray(data) ? data : data.items ?? [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }, [companyId, setupForm.bankAccountId])

  useEffect(() => { loadInitialData() }, [loadInitialData])

  // ── Setup: create reconciliation ─────────────────────────────────────────
  const handleStartReconciliation = async () => {
    if (!setupForm.bankAccountId || !setupForm.statementDate || setupForm.openingBalance === '' || setupForm.closingBalance === '') {
      setSetupError('Please fill in all fields.')
      return
    }
    setSetupLoading(true)
    setSetupError('')
    try {
      const { data } = await apiClient.post(
        `/companies/${companyId}/banking/accounts/${setupForm.bankAccountId}/reconciliations`,
        {
          statementDate: setupForm.statementDate,
          openingBalance: parseFloat(setupForm.openingBalance),
          closingBalance: parseFloat(setupForm.closingBalance),
        },
      )
      // Load full detail immediately
      const { data: detail } = await apiClient.get(`/companies/${companyId}/banking/reconciliations/${data.id}`)
      setRecon(detail)
      setStep('match')
    } catch (e: any) {
      setSetupError(e?.response?.data?.message ?? 'Failed to start reconciliation')
    } finally {
      setSetupLoading(false)
    }
  }

  // ── Load existing reconciliation ─────────────────────────────────────────
  const handleOpenRecon = async (reconId: string, readOnly = false) => {
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/banking/reconciliations/${reconId}`)
      setRecon(data)
      setStep(readOnly || data.status === 'COMPLETED' ? 'complete' : 'match')
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Failed to load reconciliation')
    }
  }

  // ── Auto-match ────────────────────────────────────────────────────────────
  const handleAutoMatch = async () => {
    if (!recon) return
    setAutoMatchLoading(true)
    try {
      const { data } = await apiClient.post(`/companies/${companyId}/banking/reconciliations/${recon.id}/auto-match`)
      setRecon(data)
      showToast('Auto-match complete')
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Auto-match failed')
    } finally {
      setAutoMatchLoading(false)
    }
  }

  // ── Manual match ─────────────────────────────────────────────────────────
  const handleMatch = async () => {
    if (!recon || !selectedBankTx || !selectedBookEntry) return
    setMatchLoading(`${selectedBankTx}-${selectedBookEntry}`)
    try {
      const { data } = await apiClient.post(`/companies/${companyId}/banking/reconciliations/${recon.id}/match`, {
        bankTransactionId: selectedBankTx,
        journalLineId: selectedBookEntry,
      })
      setRecon(data)
      setSelectedBankTx(null)
      setSelectedBookEntry(null)
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Match failed')
    } finally {
      setMatchLoading('')
    }
  }

  // ── Unmatch ───────────────────────────────────────────────────────────────
  const handleUnmatch = async (bankTxId: string) => {
    if (!recon) return
    setMatchLoading(bankTxId)
    try {
      const { data } = await apiClient.delete(
        `/companies/${companyId}/banking/reconciliations/${recon.id}/match/${bankTxId}`,
      )
      setRecon(data)
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Unmatch failed')
    } finally {
      setMatchLoading('')
    }
  }

  // ── Complete ──────────────────────────────────────────────────────────────
  const handleComplete = async () => {
    if (!recon) return
    setCompleteLoading(true)
    try {
      const { data } = await apiClient.post(`/companies/${companyId}/banking/reconciliations/${recon.id}/complete`)
      setRecon(data)
      setStep('complete')
      showToast('Reconciliation completed!')
      loadHistory(recon.bankAccountId)
    } catch (e: any) {
      showToast(e?.response?.data?.message ?? 'Failed to complete reconciliation')
    } finally {
      setCompleteLoading(false)
    }
  }

  // ── Derived match info ────────────────────────────────────────────────────
  const matchMap = useMemo(() => {
    if (!recon) return new Map<string, string>()
    const m = new Map<string, string>()
    recon.matches?.forEach(mx => {
      m.set(mx.bankTransactionId, mx.journalLineId)
      m.set(mx.journalLineId, mx.bankTransactionId)
    })
    // Also read from inlined fields
    recon.bankTransactions?.forEach(tx => {
      if (tx.matchedJournalLineId) m.set(tx.id, tx.matchedJournalLineId)
    })
    recon.bookEntries?.forEach(e => {
      if (e.matchedBankTransactionId) m.set(e.id, e.matchedBankTransactionId)
    })
    return m
  }, [recon])

  const matchedBankCount = recon?.bankTransactions?.filter(tx => matchMap.has(tx.id)).length ?? 0
  const unmatchedBankCount = (recon?.bankTransactions?.length ?? 0) - matchedBankCount
  const matchedBookCount = recon?.bookEntries?.filter(e => matchMap.has(e.id)).length ?? 0
  const unmatchedBookCount = (recon?.bookEntries?.length ?? 0) - matchedBookCount

  const statementClosing = recon?.closingBalance ?? 0
  const matchedTotal = recon?.bankTransactions
    ?.filter(tx => matchMap.has(tx.id))
    ?.reduce((s, tx) => s + (tx.type === 'CREDIT' ? tx.amount : -tx.amount), 0) ?? 0
  const bookBalance = (recon?.openingBalance ?? 0) + matchedTotal
  const difference = Math.abs(statementClosing - bookBalance)
  const isBalanced = difference < 0.005

  const canMatch = !!selectedBankTx && !!selectedBookEntry && !matchMap.has(selectedBankTx) && !matchMap.has(selectedBookEntry)

  // ─── Render guards ────────────────────────────────────────────────────────
  if (cidLoading) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="ml-2 text-emerald-700">Loading…</span>
    </div>
  )
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  // ─── STEP: History ────────────────────────────────────────────────────────
  if (step === 'history') {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-700 text-white text-sm rounded-lg shadow-lg">{toast}</div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Banking & Cash</p>
            <h1 className="text-2xl font-bold text-slate-900">Bank Reconciliation</h1>
            <p className="text-sm text-slate-500 mt-0.5">Match bank statement lines to your book transactions</p>
          </div>
          <button
            onClick={() => { setSetupForm(f => ({ ...f, bankAccountId: '' })); setSetupError(''); setStep('setup') }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            New Reconciliation <ChevronRight size={14} />
          </button>
        </div>

        {/* Filter by account */}
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-slate-500 mb-1">Filter by bank account</label>
              <select
                aria-label="Filter by bank account"
                onChange={e => { setSetupForm(f => ({ ...f, bankAccountId: e.target.value })); loadHistory(e.target.value) }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <option value="">All accounts</option>
                {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="ml-2 text-slate-500">Loading history…</span>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <History size={36} className="mb-3 text-slate-200" />
              <p className="font-medium text-slate-500">No reconciliations yet</p>
              <p className="text-sm mt-1">Start a new reconciliation to match your bank statement.</p>
              <button
                onClick={() => setStep('setup')}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                New Reconciliation <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-3 whitespace-nowrap">Statement Date</th>
                    <th className="px-4 py-3">Bank Account</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Opening</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Closing</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => handleOpenRecon(h.id, h.status === 'COMPLETED')}>
                      <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">{fmtDate(h.statementDate)}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{h.bankAccountName ?? '—'}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-sm text-slate-600 tabular-nums">{fmt(h.openingBalance)}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold text-slate-800 tabular-nums">{fmt(h.closingBalance)}</td>
                      <td className="px-4 py-3.5 text-center">
                        {h.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={10} /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={10} /> In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-emerald-700 font-medium">
                          {h.status === 'COMPLETED' ? 'View' : 'Continue'} <ChevronRight size={11} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── STEP: Setup ──────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div className="p-4 sm:p-6 flex items-start justify-center min-h-[60vh]">
        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-700 text-white text-sm rounded-lg shadow-lg">{toast}</div>
        )}
        <div className="w-full max-w-lg">
          <button
            onClick={() => setStep('history')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to History
          </button>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg">New Reconciliation</h2>
              <p className="text-sm text-slate-500 mt-0.5">Enter your bank statement details to begin matching</p>
            </div>
            <div className="px-6 py-6 space-y-4">
              {/* Bank account */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Bank Account <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="Bank Account"
                  value={setupForm.bankAccountId}
                  onChange={e => setSetupForm(f => ({ ...f, bankAccountId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">Select bank account…</option>
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name}{a.accountNumber ? ` — ${a.accountNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statement date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Statement Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date" value={setupForm.statementDate}
                  aria-label="Statement Date"
                  onChange={e => setSetupForm(f => ({ ...f, statementDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Opening Balance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" step="0.01" value={setupForm.openingBalance}
                    onChange={e => setSetupForm(f => ({ ...f, openingBalance: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">From your bank statement</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Closing Balance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" step="0.01" value={setupForm.closingBalance}
                    onChange={e => setSetupForm(f => ({ ...f, closingBalance: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Ending balance on statement</p>
                </div>
              </div>

              {setupError && (
                <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle size={14} /> {setupError}
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setStep('history')}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartReconciliation}
                disabled={setupLoading || !setupForm.bankAccountId || !setupForm.statementDate}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {setupLoading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                {setupLoading ? 'Starting…' : 'Start Reconciliation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── STEP: Match ──────────────────────────────────────────────────────────
  if ((step === 'match' || step === 'complete') && recon) {
    const isReadOnly = step === 'complete' || recon.status === 'COMPLETED'
    const bankTxs = recon.bankTransactions ?? []
    const bookEntries = recon.bookEntries ?? []

    return (
      <div className="p-4 sm:p-6 space-y-4">
        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-700 text-white text-sm rounded-lg shadow-lg">{toast}</div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => { setStep('history'); setRecon(null); setSelectedBankTx(null); setSelectedBookEntry(null) }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors"
            >
              <ArrowLeft size={14} /> Back to History
            </button>
            <h1 className="text-xl font-bold text-slate-900">
              Reconciliation — {bankAccounts.find(a => a.id === recon.bankAccountId)?.name ?? 'Bank Account'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Statement date: {fmtDate(recon.statementDate)}</p>
          </div>
          {!isReadOnly && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleAutoMatch}
                disabled={autoMatchLoading}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {autoMatchLoading ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                Auto-Match
              </button>
              {canMatch && (
                <button
                  onClick={handleMatch}
                  disabled={!!matchLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  <Link2 size={14} /> Match Selected
                </button>
              )}
            </div>
          )}
        </div>

        {/* Summary panel */}
        <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 rounded-lg border text-sm ${
          isBalanced ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-wide ${isBalanced ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isBalanced ? '✓ Balanced' : '⚠ Difference'}: {fmt(difference)}
          </span>
          <span className="text-slate-500 text-xs">Statement closing: <span className="font-semibold tabular-nums">{fmt(statementClosing)}</span></span>
          <span className="text-slate-300 text-xs hidden sm:inline">|</span>
          <span className="text-slate-500 text-xs">Matched: <span className="font-semibold text-emerald-700">{matchedBankCount}</span></span>
          <span className="text-slate-300 text-xs hidden sm:inline">|</span>
          <span className="text-slate-500 text-xs">Unmatched bank: <span className="font-semibold text-amber-600">{unmatchedBankCount}</span></span>
          <span className="text-slate-300 text-xs hidden sm:inline">|</span>
          <span className="text-slate-500 text-xs">Unmatched book: <span className="font-semibold text-slate-600">{unmatchedBookCount}</span></span>
          {!isReadOnly && (
            <button
              onClick={handleComplete}
              disabled={!isBalanced || completeLoading}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isBalanced ? 'Complete reconciliation' : 'Resolve all differences first'}
            >
              {completeLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              Complete Reconciliation
            </button>
          )}
          {isReadOnly && (
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
              <CheckCircle2 size={12} /> Completed
            </span>
          )}
        </div>

        {/* Two-column matching layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* LEFT: Bank Transactions */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-700">Bank Statement Lines</h3>
              <span className="text-xs text-slate-400">{bankTxs.length} transactions</span>
            </div>
            {bankTxs.length === 0 ? (
              <p className="p-6 text-sm text-center text-slate-400">No bank transactions loaded for this reconciliation.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                {bankTxs.map(tx => {
                  const isMatched = matchMap.has(tx.id)
                  const isSelected = selectedBankTx === tx.id
                  return (
                    <div
                      key={tx.id}
                      onClick={() => !isReadOnly && !isMatched && setSelectedBankTx(prev => prev === tx.id ? null : tx.id)}
                      className={`px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                        isReadOnly ? '' : 'cursor-pointer'
                      } ${isMatched ? 'bg-emerald-50/50' : ''} ${isSelected ? 'ring-2 ring-inset ring-emerald-400 bg-emerald-50' : ''
                      } ${!isReadOnly && !isMatched ? 'hover:bg-slate-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isMatched
                            ? <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                            : <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-emerald-500' : 'bg-amber-400'}`} />}
                          <span className="text-sm font-medium text-slate-800 truncate">{tx.description}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 ml-5">
                          <span className="text-xs text-slate-400">{fmtDate(tx.date)}</span>
                          {tx.reference && <span className="text-xs font-mono text-slate-400">{tx.reference}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`font-mono font-semibold text-sm tabular-nums ${
                          tx.type === 'CREDIT' ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {tx.type === 'CREDIT' ? '+' : '-'}{fmt(tx.amount)}
                        </span>
                        {isMatched && !isReadOnly && (
                          <button
                            onClick={e => { e.stopPropagation(); handleUnmatch(tx.id) }}
                            disabled={matchLoading === tx.id}
                            className="p-1 text-slate-300 hover:text-red-400 transition-colors"
                            title="Unmatch"
                          >
                            {matchLoading === tx.id ? <Loader2 size={12} className="animate-spin" /> : <Link2Off size={12} />}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Book Entries (GL) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-700">Book Transactions (GL)</h3>
              <span className="text-xs text-slate-400">{bookEntries.length} entries</span>
            </div>
            {bookEntries.length === 0 ? (
              <p className="p-6 text-sm text-center text-slate-400">No GL entries loaded for this reconciliation.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                {bookEntries.map(entry => {
                  const isMatched = matchMap.has(entry.id)
                  const isSelected = selectedBookEntry === entry.id
                  return (
                    <div
                      key={entry.id}
                      onClick={() => !isReadOnly && !isMatched && setSelectedBookEntry(prev => prev === entry.id ? null : entry.id)}
                      className={`px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                        isReadOnly ? '' : 'cursor-pointer'
                      } ${isMatched ? 'bg-emerald-50/50' : ''} ${isSelected ? 'ring-2 ring-inset ring-emerald-400 bg-emerald-50' : ''
                      } ${!isReadOnly && !isMatched ? 'hover:bg-slate-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isMatched
                            ? <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                            : <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-emerald-500' : 'bg-slate-300'}`} />}
                          <span className="text-sm font-medium text-slate-800 truncate">
                            {entry.description ?? entry.accountName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 ml-5">
                          <span className="text-xs text-slate-400">{fmtDate(entry.date)}</span>
                          {entry.entryNumber && <span className="text-xs font-mono text-slate-400">{entry.entryNumber}</span>}
                          <span className="text-xs text-slate-400">{entry.accountCode} — {entry.accountName}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {entry.debit > 0 && (
                          <span className="block font-mono font-semibold text-sm text-emerald-700 tabular-nums">+{fmt(entry.debit)}</span>
                        )}
                        {entry.credit > 0 && (
                          <span className="block font-mono font-semibold text-sm text-rose-600 tabular-nums">-{fmt(entry.credit)}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Manual match instructions (only when something selected but not yet matched) */}
        {(selectedBankTx || selectedBookEntry) && !isReadOnly && (
          <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg border text-sm ${
            canMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              <Link2 size={14} />
              {canMatch
                ? 'Both sides selected — click "Match Selected" to pair them.'
                : `${selectedBankTx ? '1 bank transaction' : '0 bank transactions'} selected. Now click a ${selectedBankTx ? 'book entry' : 'bank transaction'} on the right.`}
            </div>
            <button onClick={() => { setSelectedBankTx(null); setSelectedBookEntry(null) }} className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1">
              <X size={11} /> Clear
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
