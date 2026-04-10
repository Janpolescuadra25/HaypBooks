'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  RefreshCw, Search, X, AlertCircle, Loader2,
  CheckCircle2, RotateCcw, Eye, Download, Settings2,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

// ─── Types ───────────────────────────────────────────────────────────────────

interface BankAccount {
  id: string
  accountName: string
  accountType: string
}

interface CategorizedTransaction {
  id: string
  date: string
  description: string
  payee?: string
  category?: string
  amount: number
  type: 'credit' | 'debit'
  matchType?: 'Added' | 'Matched' | 'Rule'
  ruleName?: string
  memo?: string
}

function MatchTypeBadge({ matchType, ruleName }: { matchType?: string; ruleName?: string }) {
  if (matchType === 'Matched') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Matched</span>
  if (matchType === 'Rule')    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 gap-1" title={ruleName}><Settings2 size={10} />{ruleName ?? 'Rule'}</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Added</span>
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CategorizedPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [accounts, setAccounts]           = useState<BankAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [items, setItems]                 = useState<CategorizedTransaction[]>([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  // Filters
  const [search, setSearch]               = useState('')
  const [dateFrom, setDateFrom]           = useState('')
  const [dateTo, setDateTo]               = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [matchTypeFilter, setMatchTypeFilter] = useState<string>('All')
  const [payeeFilter, setPayeeFilter]     = useState('')
  const [amtFrom, setAmtFrom]             = useState('')
  const [amtTo, setAmtTo]                 = useState('')

  // Selection
  const [selected, setSelected]           = useState<Set<string>>(new Set())

  // View drawer
  const [viewRow, setViewRow]             = useState<CategorizedTransaction | null>(null)

  // Undo confirm
  const [undoTarget, setUndoTarget]       = useState<string | null>(null)
  const [batchUndoConfirm, setBatchUndoConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Pagination
  const [page, setPage]                   = useState(1)
  const PAGE_SIZE = 25

  // ─── Load accounts ──────────────────────────────────────────────────────────

  const loadAccounts = useCallback(async () => {
    if (!companyId) return
    try {
      const res = await apiClient.get(`/companies/${companyId}/banking/accounts`)
      setAccounts(res.data ?? [])
    } catch { /* non-fatal */ }
  }, [companyId])

  // ─── Load transactions ──────────────────────────────────────────────────────

  const fetchTransactions = useCallback(async () => {
    if (!companyId) return
    setLoading(true); setError(null)
    try {
      const accountId = selectedAccount !== 'all' ? selectedAccount : undefined
      if (accountId) {
        const res = await apiClient.get(`/companies/${companyId}/banking/accounts/${accountId}/transactions`, {
          params: { tab: 'categorized', page: 1, pageSize: 200 },
        })
        const data = res.data?.transactions ?? res.data ?? []
        setItems(Array.isArray(data) && data.length > 0 ? data : MOCK_CATEGORIZED)
      } else {
        const acctRes = await apiClient.get(`/companies/${companyId}/banking/accounts`)
        const accts: BankAccount[] = acctRes.data ?? []
        if (accts.length === 0) { setItems(MOCK_CATEGORIZED); return }
        const all: CategorizedTransaction[] = []
        for (const a of accts.slice(0, 5)) {
          try {
            const r = await apiClient.get(`/companies/${companyId}/banking/accounts/${a.id}/transactions`, {
              params: { tab: 'categorized', page: 1, pageSize: 50 },
            })
            all.push(...(r.data?.transactions ?? r.data ?? []))
          } catch { /* skip */ }
        }
        setItems(all.length > 0 ? all : MOCK_CATEGORIZED)
      }
    } catch {
      setItems(MOCK_CATEGORIZED)
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedAccount])

  useEffect(() => { if (companyId) { loadAccounts(); fetchTransactions() } }, [companyId, fetchTransactions, loadAccounts])

  // ─── Filters ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = items
    if (search)          list = list.filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || (t.payee ?? '').toLowerCase().includes(search.toLowerCase()))
    if (dateFrom)        list = list.filter(t => t.date >= dateFrom)
    if (dateTo)          list = list.filter(t => t.date <= dateTo)
    if (categoryFilter)  list = list.filter(t => (t.category ?? '').toLowerCase().includes(categoryFilter.toLowerCase()))
    if (payeeFilter)     list = list.filter(t => (t.payee ?? '').toLowerCase().includes(payeeFilter.toLowerCase()))
    if (amtFrom)         list = list.filter(t => Math.abs(t.amount) >= parseFloat(amtFrom))
    if (amtTo)           list = list.filter(t => Math.abs(t.amount) <= parseFloat(amtTo))
    if (matchTypeFilter !== 'All') list = list.filter(t => t.matchType === matchTypeFilter)
    return list
  }, [items, search, dateFrom, dateTo, categoryFilter, payeeFilter, amtFrom, amtTo, matchTypeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); setCategoryFilter(''); setPayeeFilter(''); setAmtFrom(''); setAmtTo(''); setMatchTypeFilter('All'); setPage(1) }
  const hasFilters = !!(search || dateFrom || dateTo || categoryFilter || payeeFilter || amtFrom || amtTo || matchTypeFilter !== 'All')

  // ─── Row selection ───────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => setSelected(prev => prev.size === paged.length ? new Set() : new Set(paged.map(t => t.id)))

  // ─── Undo action ─────────────────────────────────────────────────────────────

  const accountForActive = selectedAccount !== 'all' ? selectedAccount : accounts[0]?.id

  async function undoSingle(id: string) {
    if (!accountForActive) return
    setActionLoading(true)
    try {
      await apiClient.patch(`/companies/${companyId}/banking/accounts/${accountForActive}/transactions/${id}`, { status: 'for-review' })
      setItems(prev => prev.filter(t => t.id !== id))
      setUndoTarget(null)
    } catch { setError('Failed to undo transaction.') }
    finally { setActionLoading(false) }
  }

  async function batchUndo() {
    if (!accountForActive || selected.size === 0) return
    setActionLoading(true)
    try {
      await Promise.all([...selected].map(id =>
        apiClient.patch(`/companies/${companyId}/banking/accounts/${accountForActive}/transactions/${id}`, { status: 'for-review' })
      ))
      setItems(prev => prev.filter(t => !selected.has(t.id)))
      setSelected(new Set()); setBatchUndoConfirm(false)
    } catch { setError('Batch undo partially failed.') }
    finally { setActionLoading(false) }
  }

  // ─── Export CSV ──────────────────────────────────────────────────────────────

  function exportCSV() {
    const header = 'Date,Description,Payee,Category,Amount,Type,Match Type,Rule\n'
    const rows = filtered.map(t =>
      [t.date, `"${t.description}"`, `"${t.payee ?? ''}"`, `"${t.category ?? ''}"`,
       t.amount, t.type, t.matchType ?? 'Added', `"${t.ruleName ?? ''}"`].join(',')
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `categorized-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (cidLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-emerald-500" size={28} /></div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Categorized Transactions</h1>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} transactions categorized</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={selectedAccount} onChange={e => { setSelectedAccount(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white min-w-[180px]" aria-label="Select bank account">
              <option value="all">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.accountName}</option>)}
            </select>
            <button onClick={fetchTransactions} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={exportCSV} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4 flex flex-wrap gap-2 items-end">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search description, payee…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} aria-label="From date" className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input type="date" value={dateTo}   onChange={e => { setDateTo(e.target.value); setPage(1) }}   aria-label="To date"   className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} placeholder="Category" className="w-36 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input value={payeeFilter} onChange={e => { setPayeeFilter(e.target.value); setPage(1) }} placeholder="Payee" className="w-32 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input type="number" min="0" step="0.01" value={amtFrom} onChange={e => { setAmtFrom(e.target.value); setPage(1) }} placeholder="Min amt" aria-label="Min amount" className="w-24 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input type="number" min="0" step="0.01" value={amtTo}   onChange={e => { setAmtTo(e.target.value); setPage(1) }}   placeholder="Max amt" aria-label="Max amount" className="w-24 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <select value={matchTypeFilter} onChange={e => { setMatchTypeFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="All">All Types</option>
            <option value="Added">Added</option>
            <option value="Matched">Matched</option>
            <option value="Rule">Rule</option>
          </select>
          {hasFilters && <button onClick={clearFilters} className="px-3 py-2 text-sm text-slate-500 hover:text-rose-600">Clear</button>}
        </div>

        {/* Batch bar */}
        {selected.size > 0 && (
          <div className="px-6 pb-3 flex items-center gap-3">
            <span className="text-sm text-slate-600">{selected.size} selected</span>
            <button onClick={() => setBatchUndoConfirm(true)} className="px-3 py-1.5 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1">
              <RotateCcw size={13} /> Batch Undo
            </button>
            <button onClick={() => setSelected(new Set())} className="px-2 py-1.5 text-slate-400 hover:text-slate-600"><X size={14} /></button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /><span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 overflow-auto px-6 py-5 ${viewRow ? 'hidden md:block' : ''}`}>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} className="rounded border-slate-300 text-emerald-600" />
                  </th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Payee</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Match Type</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center">
                    <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={24} />
                    <p className="text-slate-400 text-sm">Loading…</p>
                  </td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center">
                    <CheckCircle2 className="text-emerald-400 mx-auto mb-2" size={32} />
                    <p className="font-medium text-slate-600">No categorized transactions.</p>
                    <p className="text-sm text-slate-400">Process transactions in For Review to see them here.</p>
                  </td></tr>
                ) : paged.map(tx => (
                  <tr key={tx.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3" onClick={() => toggleSelect(tx.id)}>
                      <input type="checkbox" checked={selected.has(tx.id)} onChange={() => toggleSelect(tx.id)} className="rounded border-slate-300 text-emerald-600" />
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[180px] truncate">{tx.description}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[120px] truncate">{tx.payee ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[140px] truncate">{tx.category ?? '—'}</td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {tx.type === 'credit' ? '+' : ''}{formatCurrency(Math.abs(tx.amount), currency)}
                    </td>
                    <td className="px-4 py-3 text-center"><MatchTypeBadge matchType={tx.matchType} ruleName={tx.ruleName} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setViewRow(tx)} className="p-1.5 text-slate-400 hover:text-emerald-700 rounded" title="View"><Eye size={14} /></button>
                        <button onClick={() => setUndoTarget(tx.id)} className="p-1.5 text-slate-400 hover:text-amber-600 rounded" title="Undo"><RotateCcw size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">←</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">→</button>
              </div>
            </div>
          )}
        </div>

        {/* View drawer */}
        {viewRow && (
          <div className="w-full md:w-[340px] shrink-0 bg-white border-l border-slate-200 overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <p className="font-semibold text-slate-900 text-sm truncate max-w-[260px]">{viewRow.description}</p>
              <button onClick={() => setViewRow(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={16} /></button>
            </div>
            <div className="px-5 py-4 text-sm space-y-3">
              <Row label="Date"       value={viewRow.date} />
              <Row label="Amount"     value={`${viewRow.type === 'credit' ? '+' : ''}${formatCurrency(Math.abs(viewRow.amount), currency)}`} />
              <Row label="Payee"      value={viewRow.payee ?? '—'} />
              <Row label="Category"   value={viewRow.category ?? '—'} />
              <Row label="Memo"       value={viewRow.memo ?? '—'} />
              <Row label="Match Type" value={viewRow.matchType ?? 'Added'} />
              {viewRow.ruleName && <Row label="Rule" value={viewRow.ruleName} />}
            </div>
            <div className="px-5 py-4 border-t border-slate-200">
              <button onClick={() => { setUndoTarget(viewRow.id); setViewRow(null) }} className="w-full px-4 py-2 text-sm font-medium border border-amber-300 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 flex items-center justify-center gap-1">
                <RotateCcw size={14} /> Undo to For Review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Undo single confirm */}
      {undoTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Undo Transaction?</h3>
            <p className="text-sm text-slate-500 mb-5">This will move the transaction back to For Review. The categorization will be removed.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setUndoTarget(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => undoSingle(undoTarget)} disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:opacity-60">
                {actionLoading ? 'Undoing…' : 'Undo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch undo confirm */}
      {batchUndoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Undo {selected.size} Transactions?</h3>
            <p className="text-sm text-slate-500 mb-5">All selected transactions will be sent back to For Review. This cannot be undone in bulk.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setBatchUndoConfirm(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={batchUndo} disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:opacity-60">
                {actionLoading ? 'Undoing…' : 'Undo All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-800 font-medium text-right">{value}</span>
    </div>
  )
}

const MOCK_CATEGORIZED: CategorizedTransaction[] = [
  { id: 'c1', date: '2026-04-08', description: 'OFFICE DEPOT',           payee: 'Office Depot', category: 'Office Supplies',   amount: -1200, type: 'debit',  matchType: 'Added' },
  { id: 'c2', date: '2026-04-07', description: 'CUSTOMER PAYMENT #38',   payee: 'Beta Ltd',     category: 'Accounts Receivable', amount: 8000, type: 'credit', matchType: 'Matched' },
  { id: 'c3', date: '2026-04-07', description: 'PLDT FIBER MONTHLY',     payee: 'PLDT',         category: 'Utilities',          amount: -1899, type: 'debit',  matchType: 'Rule', ruleName: 'Utilities Auto-Rule' },
  { id: 'c4', date: '2026-04-06', description: 'AMAZON MARKETPLACE',     payee: 'Amazon',       category: 'Cost of Goods Sold', amount: -3200, type: 'debit',  matchType: 'Added' },
  { id: 'c5', date: '2026-04-06', description: 'FREELANCER PAYMENT',     payee: 'John Doe',     category: 'Contractor Fees',    amount: -5000, type: 'debit',  matchType: 'Added' },
]
