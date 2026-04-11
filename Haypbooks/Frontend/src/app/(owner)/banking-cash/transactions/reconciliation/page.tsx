'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Printer,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import {
  MOCK_BANK_ACCOUNTS,
  getReconciliationHistory,
  mockStore,
  saveReconciliation,
  type MockBankTransaction,
  type MockReconciliation,
} from '../mockGLState'

type ViewFilter = 'all' | 'cleared' | 'uncleared'
type FinishModalKind = 'balanced' | 'unbalanced' | null

const PAGE_SIZE = 25

function getCurrentMonthEnd(): string {
  const today = new Date()
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return endOfMonth.toISOString().slice(0, 10)
}

function getMonthStart(date: string): string {
  return `${date.slice(0, 7)}-01`
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

function parseOptionalNumber(value: string): number | null {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? roundCurrency(parsed) : null
}

function formatDate(value: string): string {
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

function formatMonth(value: string): string {
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-PH', {
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

function SummaryLine({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'positive' | 'negative' | 'strong'
}) {
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-700'
      : tone === 'negative'
        ? 'text-rose-600'
        : tone === 'strong'
          ? 'text-slate-900'
          : 'text-slate-700'

  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-mono tabular-nums ${toneClass}`}>{value}</span>
    </div>
  )
}

function HistoryStatus({ entry }: { entry: MockReconciliation }) {
  if (entry.status === 'balanced') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Balanced
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
      <XCircle className="h-3.5 w-3.5" /> Not Balanced
    </span>
  )
}

export default function ReconciliationPage() {
  const router = useRouter()
  const { currency } = useCompanyCurrency()

  const [selectedBankAccountId, setSelectedBankAccountId] = useState(MOCK_BANK_ACCOUNTS[0]?.id ?? '')
  const [statementDate, setStatementDate] = useState(getCurrentMonthEnd())
  const [statementBalance, setStatementBalance] = useState('')
  const [serviceCharge, setServiceCharge] = useState('')
  const [interestIncome, setInterestIncome] = useState('')
  const [workflowStarted, setWorkflowStarted] = useState(false)
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [manuallyClearedIds, setManuallyClearedIds] = useState<string[]>([])
  const [toast, setToast] = useState('')
  const [validationError, setValidationError] = useState('')
  const [finishModal, setFinishModal] = useState<FinishModalKind>(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    setPage(1)
  }, [viewFilter, search, selectedBankAccountId, statementDate])

  const selectedBankAccount = MOCK_BANK_ACCOUNTS.find(account => account.id === selectedBankAccountId) ?? null
  const displayCurrency = selectedBankAccount?.currency ?? currency
  const formatMoney = (amount: number) => formatCurrency(Math.abs(amount), displayCurrency)
  const formatSignedMoney = (amount: number) => {
    if (Math.abs(amount) < 0.01) return formatCurrency(0, displayCurrency)
    const prefix = amount > 0 ? '+' : '-'
    return `${prefix}${formatMoney(amount)}`
  }

  const historyEntries = getReconciliationHistory(selectedBankAccountId)
  const previousReconciliation = [...historyEntries]
    .filter(entry => entry.statementDate < statementDate)
    .sort((left, right) => right.statementDate.localeCompare(left.statementDate))[0] ?? null
  const statementStartDate = previousReconciliation?.statementDate ?? getMonthStart(statementDate)
  const openingBalance = previousReconciliation?.statementBalance ?? selectedBankAccount?.openingBalance ?? 0

  const statementBalanceNumber = parseOptionalNumber(statementBalance)
  const serviceChargeNumber = parseOptionalNumber(serviceCharge) ?? 0
  const interestIncomeNumber = parseOptionalNumber(interestIncome) ?? 0
  const manualClearedSet = new Set(manuallyClearedIds)

  const scopedTransactions = [...mockStore.items]
    .filter(item => (item.bankAccountId ?? item.accountId) === selectedBankAccountId)
    .filter(item => item.date > statementStartDate && item.date <= statementDate)
    .sort((left, right) => {
      const dateOrder = left.date.localeCompare(right.date)
      if (dateOrder !== 0) return dateOrder
      return left.description.localeCompare(right.description)
    })

  const previouslyReconciledIds = new Set(
    scopedTransactions.filter(item => item.reconciled).map(item => item.id),
  )

  const isCleared = (transactionId: string) => previouslyReconciledIds.has(transactionId) || manualClearedSet.has(transactionId)

  const filteredTransactions = scopedTransactions.filter(item => {
    const matchesFilter =
      viewFilter === 'all'
        ? true
        : viewFilter === 'cleared'
          ? isCleared(item.id)
          : !isCleared(item.id)

    if (!matchesFilter) return false

    if (!search.trim()) return true

    const normalizedSearch = search.trim().toLowerCase()
    return item.description.toLowerCase().includes(normalizedSearch)
  })

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filteredTransactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const clearedTransactions = scopedTransactions.filter(item => isCleared(item.id))
  const unclearedTransactions = scopedTransactions.filter(item => !isCleared(item.id))
  const depositsCleared = clearedTransactions.filter(item => item.amount > 0).reduce((sum, item) => sum + item.amount, 0)
  const withdrawalsCleared = clearedTransactions.filter(item => item.amount < 0).reduce((sum, item) => sum + Math.abs(item.amount), 0)
  const calculatedEndingBalance = roundCurrency(
    openingBalance + clearedTransactions.reduce((sum, item) => sum + item.amount, 0) - serviceChargeNumber + interestIncomeNumber,
  )
  const difference = statementBalanceNumber === null ? 0 : roundCurrency(statementBalanceNumber - calculatedEndingBalance)
  const isBalanced = statementBalanceNumber !== null && Math.abs(difference) < 0.01
  const outstandingWithdrawals = unclearedTransactions.filter(item => item.amount < 0)
  const outstandingDeposits = unclearedTransactions.filter(item => item.amount > 0)
  const possibleMatchIds = new Set(
    scopedTransactions
      .filter(item => !previouslyReconciledIds.has(item.id) && !manualClearedSet.has(item.id))
      .filter(item => statementBalanceNumber !== null && Math.abs(item.amount - difference) < 0.01)
      .map(item => item.id),
  )

  const selectedHistory = historyEntries.find(entry => entry.id === selectedHistoryId) ?? historyEntries[0] ?? null
  const selectedHistoryTransactions = selectedHistory
    ? mockStore.items.filter(item => selectedHistory.clearedTxIds.includes(item.id))
    : []

  function toggleTransaction(transactionId: string) {
    if (previouslyReconciledIds.has(transactionId)) return

    setManuallyClearedIds(current => {
      if (current.includes(transactionId)) {
        return current.filter(id => id !== transactionId)
      }
      return [...current, transactionId]
    })
  }

  function markAllVisible() {
    const selectableIds = filteredTransactions
      .filter(item => !previouslyReconciledIds.has(item.id))
      .map(item => item.id)

    setManuallyClearedIds(current => {
      const next = new Set(current)
      selectableIds.forEach(id => next.add(id))
      return Array.from(next)
    })
  }

  function clearAllVisible() {
    const selectableIds = new Set(
      filteredTransactions.filter(item => !previouslyReconciledIds.has(item.id)).map(item => item.id),
    )

    setManuallyClearedIds(current => current.filter(id => !selectableIds.has(id)))
  }

  function startReconciliation() {
    if (!selectedBankAccountId || !statementDate || statementBalanceNumber === null) {
      setValidationError('Select a bank account, statement ending date, and statement ending balance to continue.')
      return
    }

    setValidationError('')
    setWorkflowStarted(true)
    setSelectedHistoryId(null)
    setManuallyClearedIds([])
    setToast('Reconciliation session started.')
  }

  function handlePrintReport() {
    window.print()
  }

  function handleExportPdf() {
    setToast('Use your browser print dialog to save this reconciliation as PDF.')
    window.print()
  }

  function finalizeReconciliation() {
    if (statementBalanceNumber === null) {
      setValidationError('Enter the statement ending balance before finishing reconciliation.')
      return
    }

    const clearedTxIds = clearedTransactions.map(item => item.id)
    const saved = saveReconciliation({
      bankAccountId: selectedBankAccountId,
      statementDate,
      statementBalance: statementBalanceNumber,
      calculatedBalance: calculatedEndingBalance,
      clearedTxIds,
      serviceCharge: serviceChargeNumber || undefined,
      interestIncome: interestIncomeNumber || undefined,
    })

    setHistoryRefreshKey(current => current + 1)
    setSelectedHistoryId(saved.id)
    setWorkflowStarted(false)
    setManuallyClearedIds([])
    setFinishModal(null)
    setStatementBalance('')
    setServiceCharge('')
    setInterestIncome('')
    setValidationError('')
    setToast(saved.status === 'balanced' ? 'Reconciliation complete.' : 'Reconciliation saved. You can finish balancing it later.')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {toast ? (
          <div className="fixed right-4 top-4 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">
            {toast}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="border-b border-slate-100 bg-[linear-gradient(135deg,_rgba(16,185,129,0.10),_rgba(59,130,246,0.05))] px-6 py-6 sm:px-8">
            <button
              type="button"
              onClick={() => router.push('/banking-cash/transactions')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Banking
            </button>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Banking Cleanup Phase 14</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Bank Reconciliation</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Clear statement activity, book missing bank charges and interest, and keep a full month-by-month reconciliation history in one workflow.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opening Balance</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-slate-900">{formatCurrency(openingBalance, displayCurrency)}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Previous Statement</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{previousReconciliation ? formatDate(previousReconciliation.statementDate) : 'No prior reconciliation'}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Statement Window</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(statementStartDate)} to {formatDate(statementDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:px-8 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Step 1</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Select Account & Statement</h2>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Statement Setup</div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Bank Account</span>
                  <select
                    value={selectedBankAccountId}
                    onChange={event => setSelectedBankAccountId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    {MOCK_BANK_ACCOUNTS.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} {account.accountNumber ? `(${account.accountNumber})` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Statement Ending Date</span>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={statementDate}
                      onChange={event => setStatementDate(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Statement Ending Balance</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      value={statementBalance}
                      onChange={event => setStatementBalance(event.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Service Charge</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      value={serviceCharge}
                      onChange={event => setServiceCharge(event.target.value)}
                      placeholder="Optional"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Interest Income</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₱</span>
                    <input
                      type="number"
                      step="0.01"
                      value={interestIncome}
                      onChange={event => setInterestIncome(event.target.value)}
                      placeholder="Optional"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>
              </div>

              {validationError ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {validationError}
                </div>
              ) : null}

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  {selectedBankAccount ? `Using ${selectedBankAccount.name} with ${formatCurrency(openingBalance, displayCurrency)} opening books balance.` : 'Choose a bank account to begin.'}
                </div>
                <button
                  type="button"
                  onClick={startReconciliation}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {workflowStarted ? 'Refresh Reconciliation' : 'Start Reconciliation'} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Reconciliation Targets</p>
              <h2 className="mt-2 text-xl font-semibold">What gets saved when you finish</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-200">
                <li className="flex gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-emerald-300" /><span>Checked transactions are saved into reconciliation history and marked as reconciled in the mock bank feed.</span></li>
                <li className="flex gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-emerald-300" /><span>Service charges and interest income create categorized manual entries automatically for the selected statement date.</span></li>
                <li className="flex gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-emerald-300" /><span>Audit log entries are written for reconciled transactions, generated manual entries, and the reconciliation summary itself.</span></li>
              </ul>
            </div>
          </div>
        </section>

        {workflowStarted ? (
          <div className="grid gap-6 xl:grid-cols-[1.35fr,0.95fr]">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Step 2</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">Clear Transactions</h2>
                    <p className="mt-1 text-sm text-slate-500">Statement window: {formatDate(statementStartDate)} to {formatDate(statementDate)}</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      aria-label="Filter reconciliation transactions"
                      value={viewFilter}
                      onChange={event => setViewFilter(event.target.value as ViewFilter)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="all">All</option>
                      <option value="cleared">Cleared</option>
                      <option value="uncleared">Uncleared</option>
                    </select>

                    <label className="relative block min-w-[240px]">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Search descriptions"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Clear</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                          No transactions match the current filters for this statement window.
                        </td>
                      </tr>
                    ) : null}

                    {pageRows.map(item => {
                      const locked = previouslyReconciledIds.has(item.id)
                      const checked = isCleared(item.id)
                      const possibleMatch = possibleMatchIds.has(item.id)
                      const rowTone = locked
                        ? 'bg-slate-50 text-slate-400 italic'
                        : possibleMatch
                          ? 'bg-amber-50/70'
                          : 'bg-white'

                      return (
                        <tr key={`${item.id}-${historyRefreshKey}`} className={`${rowTone} transition-colors hover:bg-slate-50`} title={possibleMatch ? 'Possible match for the remaining difference.' : undefined}>
                          <td className="px-4 py-3 align-top">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={locked}
                              onChange={() => toggleTransaction(item.id)}
                              aria-label={`Mark ${item.description} as cleared`}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-3 align-top font-medium text-slate-700 not-italic">{formatDate(item.date)}</td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-start gap-3">
                              <div className="min-w-0">
                                <p className={`truncate font-medium ${locked ? 'text-slate-400' : 'text-slate-900'}`}>{item.description}</p>
                                {possibleMatch ? (
                                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-700 not-italic">
                                    <Sparkles className="h-3.5 w-3.5" /> Possible match
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            {locked ? (
                              <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 not-italic">
                                Previously reconciled
                              </span>
                            ) : checked ? (
                              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                Cleared
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                Outstanding
                              </span>
                            )}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono align-top tabular-nums ${item.amount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {item.amount < 0 ? `-${formatMoney(item.amount)}` : `+${formatMoney(item.amount)}`}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={markAllVisible}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    ☑ Mark All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllVisible}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    ☐ Clear All
                  </button>
                  <span className="text-sm text-slate-500">Showing {pageRows.length} of {filteredTransactions.length} transactions</span>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <button
                    type="button"
                    onClick={() => setPage(current => Math.max(1, current - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="min-w-[92px] text-center text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
                  <button
                    type="button"
                    onClick={() => setPage(current => Math.min(totalPages, current + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
                <div className="border-b border-slate-100 px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live Summary</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Reconciliation Summary</h2>
                </div>

                <div className="grid gap-6 px-6 py-5 lg:grid-cols-[0.95fr,1.05fr]">
                  <div>
                    <SummaryLine label="Opening Balance (per books)" value={formatCurrency(openingBalance, displayCurrency)} tone="strong" />
                    <SummaryLine label="(+) Deposits Cleared" value={formatSignedMoney(depositsCleared)} tone="positive" />
                    <SummaryLine label="(-) Withdrawals Cleared" value={`-${formatMoney(withdrawalsCleared)}`} tone="negative" />
                    <SummaryLine label="(-) Service Charges" value={`-${formatMoney(serviceChargeNumber)}`} tone={serviceChargeNumber > 0 ? 'negative' : 'default'} />
                    <SummaryLine label="(+) Interest Income" value={formatSignedMoney(interestIncomeNumber)} tone={interestIncomeNumber > 0 ? 'positive' : 'default'} />
                    <div className="my-2 border-t border-dashed border-slate-200" />
                    <SummaryLine label="Calculated Ending Balance" value={formatCurrency(calculatedEndingBalance, displayCurrency)} tone="strong" />
                    <SummaryLine label="Statement Ending Balance" value={statementBalanceNumber === null ? '—' : formatCurrency(statementBalanceNumber, displayCurrency)} tone="strong" />
                    <div className="my-2 border-t border-dashed border-slate-200" />
                    <SummaryLine label="Difference" value={statementBalanceNumber === null ? '—' : formatSignedMoney(difference)} tone={isBalanced ? 'positive' : 'negative'} />

                    <div className={`mt-5 rounded-3xl border px-4 py-4 ${isBalanced ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                      <div className="flex items-start gap-3">
                        {isBalanced ? <CheckCircle2 className="mt-0.5 h-5 w-5" /> : <AlertTriangle className="mt-0.5 h-5 w-5" />}
                        <div>
                          <p className="font-semibold">{isBalanced ? 'BALANCED' : 'NOT BALANCED'}</p>
                          <p className="mt-1 text-sm">
                            {isBalanced
                              ? 'Books and statement are aligned. Finish when you are ready to save the session.'
                              : statementBalanceNumber === null
                                ? 'Enter the statement ending balance to compare against your cleared transactions.'
                                : `Difference remaining: ${formatCurrency(Math.abs(difference), displayCurrency)}.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <h3 className="text-sm font-semibold text-slate-900">Outstanding Items</h3>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2">
                          <span className="text-slate-500">Withdrawals</span>
                          <span className="font-mono text-rose-600">-{formatMoney(outstandingWithdrawals.reduce((sum, item) => sum + Math.abs(item.amount), 0))} ({outstandingWithdrawals.length})</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2">
                          <span className="text-slate-500">Deposits</span>
                          <span className="font-mono text-emerald-700">+{formatMoney(outstandingDeposits.reduce((sum, item) => sum + item.amount, 0))} ({outstandingDeposits.length})</span>
                        </div>
                      </div>

                      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                        {unclearedTransactions.length === 0 ? (
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                            No outstanding transactions remain in the current statement window.
                          </div>
                        ) : (
                          unclearedTransactions.map(item => (
                            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900">{item.description}</p>
                                  <p className="mt-1 text-xs text-slate-500">{formatDate(item.date)}</p>
                                </div>
                                <span className={`font-mono text-sm ${item.amount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                  {item.amount < 0 ? `-${formatMoney(item.amount)}` : `+${formatMoney(item.amount)}`}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handlePrintReport}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Printer className="h-4 w-4" /> Print Report
                      </button>
                      <button
                        type="button"
                        onClick={handleExportPdf}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <FileText className="h-4 w-4" /> Export PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setFinishModal(isBalanced ? 'balanced' : 'unbalanced')}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Finish Reconciliation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Archive</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Past Reconciliations</h2>
              </div>
              <p className="text-sm text-slate-500">{historyEntries.length} saved sessions for {selectedBankAccount?.name ?? 'this account'}.</p>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[1.05fr,0.95fr]">
            <div className="overflow-x-auto border-b border-slate-100 xl:border-b-0 xl:border-r xl:border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Difference</th>
                    <th className="px-4 py-3">Prepared By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                        No reconciliation history is available for this account yet.
                      </td>
                    </tr>
                  ) : null}

                  {historyEntries.map(entry => {
                    const bankAccountName = MOCK_BANK_ACCOUNTS.find(account => account.id === entry.bankAccountId)?.name ?? entry.bankAccountId
                    const isSelected = selectedHistory?.id === entry.id

                    return (
                      <tr
                        key={`${entry.id}-${historyRefreshKey}`}
                        onClick={() => setSelectedHistoryId(entry.id)}
                        className={`cursor-pointer transition ${isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{formatMonth(entry.statementDate)}</td>
                        <td className="px-4 py-3 text-slate-600">{bankAccountName}</td>
                        <td className="px-4 py-3"><HistoryStatus entry={entry} /></td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">{formatSignedMoney(entry.difference)}</td>
                        <td className="px-4 py-3 text-slate-500">{entry.createdBy}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-5">
              {selectedHistory ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Selected Session</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">{formatMonth(selectedHistory.statementDate)}</h3>
                    <p className="mt-1 text-sm text-slate-500">Created {formatDate(selectedHistory.createdAt.slice(0, 10))} by {selectedHistory.createdBy}.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Statement Balance</p>
                      <p className="mt-2 font-mono text-lg font-semibold text-slate-900">{formatCurrency(selectedHistory.statementBalance, displayCurrency)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calculated Balance</p>
                      <p className="mt-2 font-mono text-lg font-semibold text-slate-900">{formatCurrency(selectedHistory.calculatedBalance, displayCurrency)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Service Charge</p>
                      <p className="mt-2 font-mono text-sm font-semibold text-slate-900">{selectedHistory.serviceCharge ? formatCurrency(selectedHistory.serviceCharge, displayCurrency) : '—'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interest Income</p>
                      <p className="mt-2 font-mono text-sm font-semibold text-slate-900">{selectedHistory.interestIncome ? formatCurrency(selectedHistory.interestIncome, displayCurrency) : '—'}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">Cleared Transactions</p>
                    </div>
                    <div className="max-h-80 space-y-2 overflow-y-auto px-4 py-4">
                      {selectedHistoryTransactions.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                          This saved session does not have linked transaction detail in the current mock dataset.
                        </div>
                      ) : (
                        selectedHistoryTransactions.map((item: MockBankTransaction) => (
                          <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">{item.description}</p>
                                <p className="mt-1 text-xs text-slate-500">{formatDate(item.date)}</p>
                              </div>
                              <span className={`font-mono text-sm ${item.amount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                {item.amount < 0 ? `-${formatMoney(item.amount)}` : `+${formatMoney(item.amount)}`}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
                  Save or select a reconciliation entry to view its full detail here.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {finishModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
            <div className="flex items-start gap-3">
              {finishModal === 'balanced' ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="mt-0.5 h-6 w-6 text-amber-500" />
              )}
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {finishModal === 'balanced' ? 'Reconciliation complete!' : 'Finish with a remaining difference?'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {finishModal === 'balanced'
                    ? 'All transactions are balanced. Click Finish to save the reconciliation history and mark the cleared transactions.'
                    : `Your books do not match the bank statement yet. Difference remaining: ${formatCurrency(Math.abs(difference), displayCurrency)}. You can still finish and reconcile later, or go back and check your transactions.`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {finishModal === 'unbalanced' ? (
                <button
                  type="button"
                  onClick={() => setFinishModal(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Go Back
                </button>
              ) : null}
              <button
                type="button"
                onClick={finalizeReconciliation}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {finishModal === 'balanced' ? 'Finish' : 'Finish Anyway'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}