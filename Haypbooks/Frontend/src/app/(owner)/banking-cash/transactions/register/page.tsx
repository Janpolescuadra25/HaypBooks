'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle, ArrowRightLeft, CheckSquare, ChevronDown, ChevronLeft, ChevronRight,
  Download, Loader2, Printer, RefreshCw, Search, X,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import {
  MOCK_BANK_ACCOUNTS, getAuditLogForEntity, toggleReconciliation,
  type AuditLogEntry,
} from '../mockGLState'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankAccount {
  id: string
  name: string
  accountNumber?: string
  balance?: number
  accountType?: string
}

type TxType   = 'Credit' | 'Debit'
type TxStatus = 'Cleared' | 'Pending' | 'Reconciled' | 'Voided'

interface RegisterTransaction {
  id: string
  date: string
  reference?: string
  description: string
  type: TxType
  category?: string
  transactionType?: string
  accountId?: string
  accountName?: string
  amount: number
  runningBalance?: number
  status: TxStatus
  bankRef?: string
  reconciled?: boolean
}

// ─── Fallback mock data (shown ONLY when API returns no records) ──────────────

const MOCK_FALLBACK: RegisterTransaction[] = [
  { id: 'm1',  date: '2026-04-10', reference: 'TXN-0001', description: 'Customer Payment — INV-2026-0089',          type: 'Credit', category: 'Accounts Receivable',     amount: 85000,  runningBalance: 392400, status: 'Cleared',    bankRef: 'PNBFT-884321', reconciled: true  },
  { id: 'm2',  date: '2026-04-09', reference: 'TXN-0002', description: 'Vendor Payment — Metro Office Supplies',   type: 'Debit',  category: 'Office Expenses',         amount: 12500,  runningBalance: 307400, status: 'Cleared',    reconciled: true  },
  { id: 'm3',  date: '2026-04-08', reference: 'TXN-0003', description: 'Payroll — April 1–15 Salary Run',          type: 'Debit',  category: 'Salaries & Wages',        amount: 245000, runningBalance: 480100, status: 'Cleared',    bankRef: 'BPIFT-554112', reconciled: true  },
  { id: 'm4',  date: '2026-04-07', reference: 'TXN-0004', description: 'Fund Transfer — Operating to Payroll',    type: 'Credit', category: 'Inter-Bank Transfer',     amount: 300000, runningBalance: 725100, status: 'Cleared',    reconciled: true  },
  { id: 'm5',  date: '2026-04-05', reference: 'TXN-0005', description: 'SSS / PhilHealth / Pag-IBIG Remittance',   type: 'Debit',  category: 'Government Contributions', amount: 38420,  runningBalance: 307900, status: 'Reconciled', reconciled: true  },
  { id: 'm6',  date: '2026-04-04', reference: 'TXN-0006', description: 'Credit Card Bill Payment — Corporate Visa', type: 'Debit',  category: 'Credit Card Payment',     amount: 24800,  runningBalance: 346320, status: 'Cleared',    reconciled: true  },
  { id: 'm7',  date: '2026-04-03', reference: 'TXN-0007', description: 'Customer Advance — GlobalEdge Solutions',  type: 'Credit', category: 'Accounts Receivable',     amount: 157500, runningBalance: 371120, status: 'Cleared',    reconciled: true  },
  { id: 'm8',  date: '2026-04-02', reference: 'TXN-0008', description: 'BIR Withholding Tax — Form 1601C',         type: 'Debit',  category: 'Taxes Payable',           amount: 16240,  runningBalance: 213620, status: 'Reconciled', reconciled: true  },
  { id: 'm9',  date: '2026-04-01', reference: 'TXN-0009', description: 'Office Rent — April 2026',                 type: 'Debit',  category: 'Rent Expense',            amount: 65000,  runningBalance: 229860, status: 'Cleared',    reconciled: false },
  { id: 'm10', date: '2026-03-31', reference: 'TXN-0010', description: 'Interest Income — Savings March 2026',     type: 'Credit', category: 'Interest Income',         amount: 2480,   runningBalance: 294860, status: 'Reconciled', reconciled: false },
  { id: 'm11', date: '2026-04-11', reference: 'TXN-0011', description: 'Shopify Sales Payout — pending settlement', type: 'Credit', category: '',                        amount: 42000,  runningBalance: 434400, status: 'Pending',    reconciled: false },
  { id: 'm12', date: '2026-04-11', reference: 'TXN-0012', description: 'Supplier Invoice — TechParts PH',           type: 'Debit',  category: '',                        amount: 18750,  runningBalance: 373650, status: 'Pending',    reconciled: false },
]

// ─── Status badge helper ──────────────────────────────────────────────────────

const STATUS_STYLE: Record<TxStatus, { bg: string; dot: string }> = {
  Cleared:    { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Reconciled: { bg: 'bg-sky-50 text-sky-700 border-sky-200',             dot: 'bg-sky-500' },
  Pending:    { bg: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400 animate-pulse' },
  Voided:     { bg: 'bg-slate-100 text-slate-400 border-slate-200',      dot: 'bg-slate-300' },
}

function StatusBadge({ status }: { status: TxStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.Pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  )
}

function formatLongDate(date: string): string {
  try {
    return new Date(date + 'T12:00:00').toLocaleDateString('en-PH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch {
    return date
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25

export default function RegisterPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  // ── Bank accounts ──────────────────────────────────────────────────────────
  const [accounts, setAccounts]           = useState<BankAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('all')

  // ── Transactions ───────────────────────────────────────────────────────────
  const [items, setItems]                 = useState<RegisterTransaction[]>([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [usingMock, setUsingMock]         = useState(false)

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search, setSearch]               = useState('')
  const [dateFrom, setDateFrom]           = useState('')
  const [dateTo, setDateTo]               = useState('')
  const [typeFilter, setTypeFilter]       = useState<TxType | 'All'>('All')
  const [statusFilter, setStatusFilter]   = useState<TxStatus | 'All'>('All')

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [page, setPage]                   = useState(1)

  // ── Transfer modal ─────────────────────────────────────────────────────────
  const [showTransfer, setShowTransfer]   = useState(false)
  const [transferForm, setTransferForm]   = useState({
    fromId: '', toId: '', amount: '', date: new Date().toISOString().split('T')[0], memo: '',
  })
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError]   = useState('')
  const [toast, setToast]                 = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  // ── Reconciliation & detail state ───────────────────────────────────────
  const [reconciledIds, setReconciledIds] = useState<Set<string>>(new Set())
  const [detailTx, setDetailTx]           = useState<(RegisterTransaction & { _balance: number }) | null>(null)
  const [reconcileOpen, setReconcileOpen] = useState(false)
  const [statementBalance, setStatementBalance] = useState('')

  // ── Load bank accounts ─────────────────────────────────────────────────────
  const loadAccounts = useCallback(async () => {
    if (!companyId) return
    try {
      const res = await apiClient.get(`/companies/${companyId}/banking/accounts`)
      const list: BankAccount[] = Array.isArray(res.data) ? res.data : res.data?.accounts ?? []
      setAccounts(list)
    } catch {
      // non-fatal
    }
  }, [companyId])

  // ── Normalise any transaction shape from the API ───────────────────────────
  const normalise = (raw: any, accountName?: string): RegisterTransaction => ({
    id: raw.id ?? raw._id ?? String(Math.random()),
    date: (raw.date ?? raw.transactionDate ?? raw.createdAt ?? '').substring(0, 10),
    reference: raw.reference ?? raw.ref ?? raw.bankRef ?? undefined,
    description: raw.description ?? raw.memo ?? raw.note ?? '—',
    type: (raw.type === 'credit' || raw.type === 'Credit' || raw.amount > 0) ? 'Credit' : 'Debit',
    category: raw.category ?? raw.categoryName ?? undefined,
    transactionType: raw.transactionType ?? raw.txType ?? undefined,
    accountId: raw.bankAccountId ?? raw.accountId ?? undefined,
    accountName: raw.accountName ?? accountName,
    amount: Math.abs(raw.amount ?? 0),
    runningBalance: raw.runningBalance ?? raw.balance ?? undefined,
    status: (['Cleared', 'Reconciled', 'Voided'].includes(raw.status)
      ? raw.status
      : raw.status === 'reconciled' ? 'Reconciled'
      : raw.status === 'voided' ? 'Voided'
      : raw.isCleared ? 'Cleared'
      : 'Pending') as TxStatus,
    bankRef: raw.bankRef ?? undefined,
    reconciled: raw.reconciled ?? false,
  })

  // ── Fetch transactions ─────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    setUsingMock(false)
    try {
      let all: RegisterTransaction[] = []

      if (selectedAccount !== 'all') {
        const res = await apiClient.get(
          `/companies/${companyId}/banking/accounts/${selectedAccount}/transactions`,
          { params: { pageSize: 200, page: 1 } },
        )
        const raw: any[] = res.data?.transactions ?? res.data ?? []
        const acct = accounts.find(a => a.id === selectedAccount)
        all = raw.map(t => normalise(t, acct?.name))
      } else {
        // Load from each account (capped at 6)
        const acctList = accounts.length > 0 ? accounts : (() => {
          // If accounts not loaded yet, fetch inline
          return []
        })()
        if (acctList.length === 0) {
          // Try fetching accounts first
          const ar = await apiClient.get(`/companies/${companyId}/banking/accounts`)
          const loaded: BankAccount[] = Array.isArray(ar.data) ? ar.data : ar.data?.accounts ?? []
          setAccounts(loaded)
          for (const acct of loaded.slice(0, 6)) {
            try {
              const res = await apiClient.get(
                `/companies/${companyId}/banking/accounts/${acct.id}/transactions`,
                { params: { pageSize: 100, page: 1 } },
              )
              const raw: any[] = res.data?.transactions ?? res.data ?? []
              all.push(...raw.map(t => normalise(t, acct.name)))
            } catch { /* skip */ }
          }
        } else {
          for (const acct of acctList.slice(0, 6)) {
            try {
              const res = await apiClient.get(
                `/companies/${companyId}/banking/accounts/${acct.id}/transactions`,
                { params: { pageSize: 100, page: 1 } },
              )
              const raw: any[] = res.data?.transactions ?? res.data ?? []
              all.push(...raw.map(t => normalise(t, acct.name)))
            } catch { /* skip */ }
          }
        }
      }

      if (all.length > 0) {
        setItems(all)
      } else {
        setItems(MOCK_FALLBACK)
        setUsingMock(true)
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load transactions')
      setItems(MOCK_FALLBACK)
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedAccount, accounts])

  useEffect(() => { if (companyId) loadAccounts() }, [companyId, loadAccounts])
  useEffect(() => { if (companyId) { setPage(1); fetchTransactions() } }, [companyId, selectedAccount, fetchTransactions])
  // Initialise reconciled IDs from loaded items
  useEffect(() => {
    setReconciledIds(new Set(items.filter(t => t.reconciled).map(t => t.id)))
  }, [items])

  // ── Derived, filtered, sorted ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = items
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (t.reference ?? '').toLowerCase().includes(q) ||
        (t.category ?? '').toLowerCase().includes(q) ||
        (t.accountName ?? '').toLowerCase().includes(q)
      )
    }
    if (dateFrom)           list = list.filter(t => t.date >= dateFrom)
    if (dateTo)             list = list.filter(t => t.date <= dateTo)
    if (typeFilter !== 'All') list = list.filter(t => t.type === typeFilter)
    if (statusFilter !== 'All') list = list.filter(t => t.status === statusFilter)
    // Sort by date desc, then account
    return [...list].sort((a, b) =>
      b.date.localeCompare(a.date) || (a.accountName ?? '').localeCompare(b.accountName ?? '')
    )
  }, [items, search, dateFrom, dateTo, typeFilter, statusFilter])

  // Running balance: compute per-account or globally
  const withBalance = useMemo<Array<RegisterTransaction & { _balance: number }>>(() => {
    if (selectedAccount !== 'all') {
      // Single account — compute running balance from earliest to latest
      const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date))
      let running = 0
      const withBal = sorted.map(t => {
        running = t.type === 'Credit' ? running + t.amount : running - t.amount
        return { ...t, _balance: running }
      })
      // Reverse back to newest-first for display
      return withBal.reverse()
    }
    // Multi-account — use runningBalance from API if available, else just show amount
    return filtered.map(t => ({ ...t, _balance: t.runningBalance ?? 0 }))
  }, [filtered, selectedAccount])

  const totalPages = Math.max(1, Math.ceil(withBalance.length / PAGE_SIZE))
  const pageRows   = withBalance.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalCredits  = filtered.filter(t => t.type === 'Credit').reduce((s, t) => s + t.amount, 0)
  const totalDebits   = filtered.filter(t => t.type === 'Debit').reduce((s, t) => s + t.amount, 0)
  const netFlow       = totalCredits - totalDebits

  // Reconciliation derived
  const reconciledCount         = filtered.filter(t => reconciledIds.has(t.id)).length
  const totalCount              = filtered.length
  const closingBalance          = withBalance.length > 0 ? withBalance[withBalance.length - 1]._balance : 0
  const outstandingWithdrawals  = filtered.filter(t => t.type === 'Debit'   && !reconciledIds.has(t.id)).reduce((s, t) => s + t.amount, 0)
  const outstandingDeposits     = filtered.filter(t => t.type === 'Credit'  && !reconciledIds.has(t.id)).reduce((s, t) => s + t.amount, 0)
  const stmtBal                 = parseFloat(statementBalance) || 0
  const adjustedBookBalance     = closingBalance - outstandingWithdrawals + outstandingDeposits
  const reconcileDiff           = stmtBal - adjustedBookBalance

  // Opening balance for selected single account
  const selectedMockAcct = MOCK_BANK_ACCOUNTS.find(a => a.id === selectedAccount)
  const openingBalance   = selectedMockAcct?.openingBalance ?? 0

  const markAllReconciled = () => {
    const allIds = filtered.map(t => t.id)
    const allDone = allIds.every(id => reconciledIds.has(id))
    setReconciledIds(prev => {
      const next = new Set(prev)
      if (allDone) { allIds.forEach(id => next.delete(id)) }
      else         { allIds.forEach(id => next.add(id)) }
      return next
    })
  }

  // ── CSV export ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Date', 'Reference', 'Description', 'Account', 'Category', 'Tx Type', 'Type', 'Debit', 'Credit', 'Balance', 'Status', 'Reconciled']
    const rows = withBalance.map(t => [
      t.date,
      t.reference ?? '',
      `"${(t.description ?? '').replace(/"/g, '""')}"`,
      t.accountName ?? '',
      t.category ?? '',
      t.transactionType ?? '',
      t.type,
      t.type === 'Debit'   ? t.amount.toFixed(2) : '',
      t.type === 'Credit'  ? t.amount.toFixed(2) : '',
      t._balance.toFixed(2),
      t.status,
      reconciledIds.has(t.id) ? 'Yes' : 'No',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `bank-register-${new Date().toISOString().substring(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Transfer funds ─────────────────────────────────────────────────────────
  const openTransfer = () => {
    setTransferForm({ fromId: '', toId: '', amount: '', date: new Date().toISOString().split('T')[0], memo: '' })
    setTransferError('')
    setShowTransfer(true)
  }

  const submitTransfer = async () => {
    const amt = parseFloat(transferForm.amount)
    if (!transferForm.fromId || !transferForm.toId || isNaN(amt) || amt <= 0) {
      setTransferError('Please complete all required fields.')
      return
    }
    if (transferForm.fromId === transferForm.toId) {
      setTransferError('Source and destination must be different accounts.')
      return
    }
    setTransferLoading(true)
    setTransferError('')
    try {
      await apiClient.post(`/companies/${companyId}/banking/transfers`, {
        fromBankAccountId: transferForm.fromId,
        toBankAccountId:   transferForm.toId,
        amount:            amt,
        date:              transferForm.date,
        memo:              transferForm.memo || undefined,
      })
      showToast('Transfer completed successfully')
      setShowTransfer(false)
      fetchTransactions()
    } catch (e: any) {
      setTransferError(e?.response?.data?.message ?? 'Transfer failed. Please try again.')
    } finally {
      setTransferLoading(false)
    }
  }

  const selectedAcctObj = accounts.find(a => a.id === selectedAccount)

  // ── Render ─────────────────────────────────────────────────────────────────

  if (cidLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Banking & Cash / Transactions</p>
            <h1 className="text-2xl font-bold text-slate-900">Bank Register</h1>
            <p className="text-sm text-slate-500 mt-0.5">Full transaction history with running balances by account</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap print:hidden">
            <button
              onClick={markAllReconciled}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              {filtered.every(t => reconciledIds.has(t.id)) ? 'Unreconcile All' : 'Mark All Reconciled'}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={openTransfer}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Transfer Funds
            </button>
            <button
              onClick={() => { setPage(1); fetchTransactions() }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── KPI cards ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'Total Credits',
              value: fmt(totalCredits),
              sub: `${filtered.filter(t => t.type === 'Credit').length} inflows`,
              color: 'text-emerald-700 bg-emerald-50',
              icon: '↑',
            },
            {
              label: 'Total Debits',
              value: fmt(totalDebits),
              sub: `${filtered.filter(t => t.type === 'Debit').length} outflows`,
              color: 'text-rose-600 bg-rose-50',
              icon: '↓',
            },
            {
              label: 'Net Flow',
              value: fmt(Math.abs(netFlow)),
              sub: netFlow >= 0 ? 'Net inflow' : 'Net outflow',
              color: netFlow >= 0 ? 'text-sky-700 bg-sky-50' : 'text-amber-700 bg-amber-50',
              icon: '≈',
            },
            {
              label: 'Reconciled',
              value: `${reconciledCount} / ${totalCount}`,
              sub: `${totalCount > 0 ? Math.round((reconciledCount / totalCount) * 100) : 0}% reconciled`,
              color: 'text-emerald-700 bg-emerald-50',
              icon: '✓',
            },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${c.color}`}>
                {c.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{c.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="px-6 py-5">

        {/* Print-only header */}
        <div className="hidden print:block mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Bank Register &mdash; {selectedAcctObj?.name ?? 'All Accounts'}
            {dateFrom || dateTo ? ` \u2014 ${dateFrom || '\u2026'} to ${dateTo || '\u2026'}` : ''}
          </h2>
          <p className="text-xs text-slate-500">Printed {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Mock data banner */}
        {usingMock && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Showing sample data — no transactions found for your accounts yet.
          </div>
        )}

        {/* Error banner */}
        {error && !loading && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={fetchTransactions} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* ── Filters toolbar ─────────────────────────────────────────────── */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap print:hidden">

            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search transactions…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
              />
            </div>

            {/* Account selector */}
            <select
              aria-label="Filter by account"
              value={selectedAccount}
              onChange={e => { setSelectedAccount(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer max-w-[220px]"
            >
              <option value="all">All Accounts</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}{a.accountNumber ? ` — ${a.accountNumber}` : ''}
                </option>
              ))}
            </select>

            {/* Date range */}
            <input
              type="date"
              aria-label="Date from"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <span className="text-slate-400 text-sm">–</span>
            <input
              type="date"
              aria-label="Date to"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />

            {/* Type */}
            <select
              aria-label="Filter by type"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as any); setPage(1) }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>

            {/* Status */}
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setPage(1) }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Cleared">Cleared</option>
              <option value="Reconciled">Reconciled</option>
              <option value="Pending">Pending</option>
              <option value="Voided">Voided</option>
            </select>

            <span className="ml-auto text-xs text-slate-400">{filtered.length} records</span>
          </div>

          {/* ── Reconciliation progress bar ──────────────────────────────────── */}
          {totalCount > 0 && (
            <div className="flex items-center gap-3 text-xs text-gray-500 px-4 py-1.5 border-b border-slate-100 print:hidden">
              <span>{reconciledCount} of {totalCount} transactions reconciled</span>
              <div className="flex-1 max-w-xs h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(reconciledCount / totalCount) * 100}%` }}
                />
              </div>
              <span className="font-medium text-gray-700">
                {Math.round((reconciledCount / totalCount) * 100)}%
              </span>
            </div>
          )}

          {/* ── Loading state ────────────────────────────────────────────────── */}
          {loading && (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          )}

          {/* ── Table ───────────────────────────────────────────────────────── */}
          {!loading && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      <th className="px-4 py-3 w-28 whitespace-nowrap">Date</th>
                      <th className="px-4 py-3 min-w-[260px]">Reference / Description</th>
                      {selectedAccount === 'all' && <th className="px-4 py-3 w-40 whitespace-nowrap">Account</th>}
                      <th className="px-4 py-3 w-36 whitespace-nowrap">Category</th>
                      <th className="px-4 py-3 w-28 whitespace-nowrap">Tx Type</th>
                      <th className="px-4 py-3 text-right whitespace-nowrap w-32">Debit</th>
                      <th className="px-4 py-3 text-right whitespace-nowrap w-32">Credit</th>
                      <th className="px-4 py-3 text-right whitespace-nowrap w-36 border-l-2 border-gray-300">Balance</th>
                      <th className="px-4 py-3 w-32 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={selectedAccount === 'all' ? 9 : 8} className="px-4 py-16 text-center text-slate-400 text-sm">
                          No transactions match the current filters.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {/* Opening balance row — only on page 1 for a specific account */}
                        {selectedAccount !== 'all' && page === 1 && (
                          <tr className="bg-blue-50/50 font-medium">
                            <td colSpan={6} className="px-4 py-2 text-sm text-blue-700 italic">
                              Opening Balance &mdash; {selectedMockAcct?.name ?? selectedAcctObj?.name}
                            </td>
                            <td className="px-4 py-2 text-right text-sm font-semibold text-blue-700 border-l-2 border-gray-300">
                              {fmt(openingBalance)}
                            </td>
                            <td />
                          </tr>
                        )}
                        {pageRows.map((tx, idx) => {
                          const prevTx = pageRows[idx - 1]
                          const isNewDate    = idx === 0 || prevTx?.date !== tx.date
                          const isNewAccount = selectedAccount === 'all' &&
                            (idx === 0 || prevTx?.accountName !== tx.accountName)
                          const isReconciled = reconciledIds.has(tx.id)
                          const colCount     = selectedAccount === 'all' ? 9 : 8

                          return (
                            <Fragment key={tx.id}>
                              {isNewAccount && (
                                <tr className="bg-slate-100 border-t-2 border-slate-200">
                                  <td colSpan={colCount} className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
                                    {tx.accountName ?? 'Unknown Account'}
                                  </td>
                                </tr>
                              )}
                              {isNewDate && (
                                <tr className="bg-gray-50">
                                  <td colSpan={colCount} className="px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {formatLongDate(tx.date)}
                                  </td>
                                </tr>
                              )}
                              <tr
                                className={`hover:bg-slate-50/70 transition-colors cursor-pointer select-none ${
                                  isReconciled ? 'border-l-4 border-green-400 bg-green-50/30' : ''
                                }`}
                                onDoubleClick={() => setDetailTx(tx)}
                                title="Double-click for details"
                              >
                                <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap font-mono">
                                  {tx.date}
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="text-sm font-medium text-slate-800">{tx.description}</div>
                                  {(tx.reference || tx.bankRef) && (
                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                      {tx.reference}{tx.reference && tx.bankRef ? ' \u00b7 ' : ''}{tx.bankRef}
                                    </div>
                                  )}
                                </td>
                                {selectedAccount === 'all' && (
                                  <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap max-w-[160px] truncate">
                                    {tx.accountName ?? '\u2014'}
                                  </td>
                                )}
                                <td className="px-4 py-3.5">
                                  {tx.category ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 max-w-[130px] truncate block">
                                      {tx.category}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-xs">\u2014</span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5">
                                  {tx.transactionType ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-sky-50 text-sky-700 border border-sky-100 whitespace-nowrap">
                                      {tx.transactionType}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-xs">\u2014</span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-right font-mono text-sm">
                                  {tx.type === 'Debit'
                                    ? <span className="text-rose-600 font-semibold">{fmt(tx.amount)}</span>
                                    : <span className="text-slate-300">\u2014</span>}
                                </td>
                                <td className="px-4 py-3.5 text-right font-mono text-sm">
                                  {tx.type === 'Credit'
                                    ? <span className="text-emerald-700 font-semibold">{fmt(tx.amount)}</span>
                                    : <span className="text-slate-300">\u2014</span>}
                                </td>
                                <td className="px-4 py-3.5 text-right font-mono text-sm font-semibold whitespace-nowrap border-l-2 border-gray-300">
                                  {tx._balance !== 0 || selectedAccount !== 'all'
                                    ? <span className={tx._balance < 0 ? 'text-red-600 font-bold' : 'text-slate-800'}>{fmt(tx._balance)}</span>
                                    : <span className="text-slate-300">\u2014</span>}
                                </td>
                                <td className="px-4 py-3.5">
                                  <StatusBadge status={tx.status} />
                                </td>
                              </tr>
                            </Fragment>
                          )
                        })}
                      </>
                    )}
                  </tbody>
                  {pageRows.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-200 text-sm font-bold">
                        <td colSpan={selectedAccount === 'all' ? 5 : 4} className="px-4 py-3 text-xs text-slate-500 uppercase">
                          Page totals ({pageRows.length})
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-rose-600">
                          {fmt(pageRows.filter(t => t.type === 'Debit').reduce((s, t) => s + t.amount, 0))}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700">
                          {fmt(pageRows.filter(t => t.type === 'Credit').reduce((s, t) => s + t.amount, 0))}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-800 border-l-2 border-gray-300">
                          {pageRows.length > 0 ? fmt(pageRows[pageRows.length - 1]._balance) : '\u2014'}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* ── Pagination ─────────────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 print:hidden">
                  <span className="text-xs text-slate-500">
                    Page {page} of {totalPages} · {filtered.length} records
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                      const n = start + i
                      return (
                        <button
                          key={n}
                          onClick={() => setPage(n)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            n === page
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {n}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Bank Reconciliation Widget ───────────────────────────────────── */}
        <div className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
          <button
            onClick={() => setReconcileOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              Bank Reconciliation
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${reconcileOpen ? 'rotate-180' : ''}`} />
          </button>

          {reconcileOpen && (
            <div className="px-5 pb-5 border-t border-slate-100">
              <div className="mt-4 max-w-sm">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Statement Balance (from your bank statement)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">&#8369;</span>
                  <input
                    type="number"
                    value={statementBalance}
                    onChange={e => setStatementBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm max-w-sm">
                {[
                  { label: 'Calculated Balance',         value: closingBalance,         sign: '',  cls: 'text-slate-800' },
                  { label: 'Less: Outstanding Withdrawals', value: outstandingWithdrawals, sign: '-', cls: 'text-rose-600' },
                  { label: 'Add: Outstanding Deposits',  value: outstandingDeposits,    sign: '+', cls: 'text-emerald-700' },
                  { label: 'Adjusted Book Balance',      value: adjustedBookBalance,    sign: '',  cls: 'font-semibold text-slate-900 border-t border-slate-200 pt-2 mt-2' },
                ].map(row => (
                  <div key={row.label} className={`flex justify-between ${row.cls}`}>
                    <span className="text-slate-500">{row.label}</span>
                    <span className="font-mono">{row.sign}{fmt(Math.abs(row.value))}</span>
                  </div>
                ))}
                <div className={`flex justify-between font-bold border-t-2 border-slate-300 pt-2 mt-2 ${
                  reconcileDiff === 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  <span className="text-slate-600 font-semibold">Difference</span>
                  <span className="font-mono">{fmt(Math.abs(reconcileDiff))}</span>
                </div>
              </div>

              {statementBalance !== '' && (
                <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2 ${
                  reconcileDiff === 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {reconcileDiff === 0
                    ? '✅ RECONCILED'
                    : `❌ NOT BALANCED — Difference: ${fmt(Math.abs(reconcileDiff))}`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-700 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* ── Detail Popover ────────────────────────────────────────────────────── */}
      {detailTx && (() => {
        const history: AuditLogEntry[] = getAuditLogForEntity(detailTx.id)
        const DOT: Record<string, string> = {
          categorized: 'bg-emerald-500', matched: 'bg-sky-500', split: 'bg-purple-500',
          excluded: 'bg-slate-400', reconciled: 'bg-green-600', unreconciled: 'bg-amber-500',
        }
        return (
          <div
            className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center p-4"
            onClick={() => setDetailTx(null)}
            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Escape' && setDetailTx(null)}
            tabIndex={-1}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex-1 min-w-0 mr-3">
                  <h2 className="font-bold text-slate-900 text-base truncate">{detailTx.description}</h2>
                  <p className="text-xs text-slate-500 mt-1">{formatLongDate(detailTx.date)}</p>
                </div>
                <button onClick={() => setDetailTx(null)} className="p-1 text-slate-400 hover:text-slate-600 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Details */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium text-slate-800">{detailTx.category || '\u2014'}</span>
                  <span className="text-slate-500">Amount</span>
                  <span className={`font-semibold ${detailTx.type === 'Debit' ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {detailTx.type === 'Debit' ? '\u2212' : '+'}{fmt(detailTx.amount)}
                  </span>
                  <span className="text-slate-500">Balance</span>
                  <span className={`font-mono font-semibold ${detailTx._balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                    {fmt(detailTx._balance)}
                  </span>
                  <span className="text-slate-500">Status</span>
                  <span><StatusBadge status={detailTx.status} /></span>
                  {detailTx.reference && (
                    <>
                      <span className="text-slate-500">Reference</span>
                      <span className="font-mono text-xs text-slate-700">{detailTx.reference}</span>
                    </>
                  )}
                  <span className="text-slate-500">Reconciled</span>
                  <span className={reconciledIds.has(detailTx.id) ? 'text-green-600 font-medium' : 'text-slate-400'}>
                    {reconciledIds.has(detailTx.id) ? 'Yes' : 'No'}
                  </span>
                </div>

                {/* Audit history */}
                {history.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Activity</p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {history.map(e => (
                        <div key={e.id} className="flex items-start gap-2 text-xs">
                          <span className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${DOT[e.action] ?? 'bg-slate-300'}`} />
                          <div>
                            <span className="text-slate-700">{e.details}</span>
                            <span className="text-slate-400 ml-1">\u00b7 {e.userName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    const was = reconciledIds.has(detailTx.id)
                    setReconciledIds(prev => {
                      const next = new Set(prev)
                      was ? next.delete(detailTx.id) : next.add(detailTx.id)
                      return next
                    })
                    toggleReconciliation(detailTx.id, !was)
                  }}
                  className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
                    reconciledIds.has(detailTx.id)
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {reconciledIds.has(detailTx.id) ? 'Unreconcile' : 'Mark Reconciled'}
                </button>
                <button
                  onClick={() => setDetailTx(null)}
                  className="flex-1 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Transfer Funds Modal ───────────────────────────────────────────────── */}
      {showTransfer && (
        <div
          className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4"
          onClick={() => setShowTransfer(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900">Transfer Funds</h2>
              </div>
              <button
                onClick={() => setShowTransfer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* From */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  From Account <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="From Account"
                  value={transferForm.fromId}
                  onChange={e => setTransferForm(f => ({ ...f, fromId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">Select source account…</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id} disabled={a.id === transferForm.toId}>
                      {a.name}{a.accountNumber ? ` — ${a.accountNumber}` : ''}
                      {a.balance !== undefined ? ` (${fmt(a.balance)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* To */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  To Account <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="To Account"
                  value={transferForm.toId}
                  onChange={e => setTransferForm(f => ({ ...f, toId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">Select destination account…</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id} disabled={a.id === transferForm.fromId}>
                      {a.name}{a.accountNumber ? ` — ${a.accountNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" min="0.01" step="0.01"
                    value={transferForm.amount}
                    onChange={e => setTransferForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    aria-label="Transfer Date"
                    value={transferForm.date}
                    onChange={e => setTransferForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Memo</label>
                <input
                  type="text"
                  value={transferForm.memo}
                  onChange={e => setTransferForm(f => ({ ...f, memo: e.target.value }))}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Journal preview */}
              {transferForm.fromId && transferForm.toId && transferForm.amount && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-700 mb-1">Journal Entry Preview</p>
                  <div className="flex justify-between">
                    <span>DR — {accounts.find(a => a.id === transferForm.toId)?.name ?? 'To Account'}</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      {fmt(parseFloat(transferForm.amount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>CR — {accounts.find(a => a.id === transferForm.fromId)?.name ?? 'From Account'}</span>
                    <span className="font-mono font-semibold text-blue-700">
                      {fmt(parseFloat(transferForm.amount) || 0)}
                    </span>
                  </div>
                </div>
              )}

              {transferError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{transferError}</p>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setShowTransfer(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitTransfer}
                disabled={
                  transferLoading ||
                  !transferForm.fromId ||
                  !transferForm.toId ||
                  !transferForm.amount
                }
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {transferLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Transferring…</>
                  : <><ArrowRightLeft className="w-4 h-4" /> Transfer Funds</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
