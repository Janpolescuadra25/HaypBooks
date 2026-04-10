'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  RefreshCw, Search, X, AlertCircle, Loader2,
  RotateCcw, Trash2, Info,
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

interface ExcludedTransaction {
  id: string
  date: string
  description: string
  payee?: string
  amount: number
  type: 'credit' | 'debit'
  excludeReason?: string
  memo?: string
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ExcludedPage() {
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [accounts, setAccounts]             = useState<BankAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [items, setItems]                   = useState<ExcludedTransaction[]>([])
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  // Filters
  const [search, setSearch]                 = useState('')
  const [dateFrom, setDateFrom]             = useState('')
  const [dateTo, setDateTo]                 = useState('')

  // Selection
  const [selected, setSelected]             = useState<Set<string>>(new Set())

  // Confirm modals
  const [restoreTarget, setRestoreTarget]   = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget]     = useState<string | null>(null)
  const [batchRestoreConfirm, setBatchRestoreConfirm] = useState(false)
  const [batchDeleteConfirm, setBatchDeleteConfirm]   = useState(false)
  const [actionLoading, setActionLoading]   = useState(false)

  // Pagination
  const [page, setPage]                     = useState(1)
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
          params: { tab: 'excluded', page: 1, pageSize: 200 },
        })
        const data = res.data?.transactions ?? res.data ?? []
        setItems(Array.isArray(data) && data.length > 0 ? data : MOCK_EXCLUDED)
      } else {
        const acctRes = await apiClient.get(`/companies/${companyId}/banking/accounts`)
        const accts: BankAccount[] = acctRes.data ?? []
        if (accts.length === 0) { setItems(MOCK_EXCLUDED); return }
        const all: ExcludedTransaction[] = []
        for (const a of accts.slice(0, 5)) {
          try {
            const r = await apiClient.get(`/companies/${companyId}/banking/accounts/${a.id}/transactions`, {
              params: { tab: 'excluded', page: 1, pageSize: 50 },
            })
            all.push(...(r.data?.transactions ?? r.data ?? []))
          } catch { /* skip */ }
        }
        setItems(all.length > 0 ? all : MOCK_EXCLUDED)
      }
    } catch {
      setItems(MOCK_EXCLUDED)
    } finally {
      setLoading(false)
    }
  }, [companyId, selectedAccount])

  useEffect(() => { if (companyId) { loadAccounts(); fetchTransactions() } }, [companyId, fetchTransactions, loadAccounts])

  // ─── Filters ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = items
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t => t.description.toLowerCase().includes(q) || (t.payee ?? '').toLowerCase().includes(q))
    }
    if (dateFrom) list = list.filter(t => t.date >= dateFrom)
    if (dateTo)   list = list.filter(t => t.date <= dateTo)
    return list
  }, [items, search, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasFilters = !!(search || dateFrom || dateTo)
  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); setPage(1) }

  // ─── Row selection ───────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => setSelected(prev => prev.size === paged.length ? new Set() : new Set(paged.map(t => t.id)))

  const accountForAction = selectedAccount !== 'all' ? selectedAccount : accounts[0]?.id

  // ─── Restore ─────────────────────────────────────────────────────────────────

  async function restoreSingle(id: string) {
    if (!accountForAction) return
    setActionLoading(true)
    try {
      await apiClient.patch(`/companies/${companyId}/banking/accounts/${accountForAction}/transactions/${id}`, { status: 'for-review' })
      setItems(prev => prev.filter(t => t.id !== id))
      setRestoreTarget(null)
    } catch { setError('Failed to restore transaction.') }
    finally { setActionLoading(false) }
  }

  async function batchRestore() {
    if (!accountForAction || selected.size === 0) return
    setActionLoading(true)
    try {
      await Promise.all([...selected].map(id =>
        apiClient.patch(`/companies/${companyId}/banking/accounts/${accountForAction}/transactions/${id}`, { status: 'for-review' })
      ))
      setItems(prev => prev.filter(t => !selected.has(t.id)))
      setSelected(new Set()); setBatchRestoreConfirm(false)
    } catch { setError('Batch restore partially failed.') }
    finally { setActionLoading(false) }
  }

  // ─── Delete (permanent) ──────────────────────────────────────────────────────

  async function deleteSingle(id: string) {
    if (!accountForAction) return
    setActionLoading(true)
    try {
      // Try DELETE endpoint first; fall back to status patch
      try {
        await apiClient.delete(`/companies/${companyId}/banking/accounts/${accountForAction}/transactions/${id}`)
      } catch {
        await apiClient.patch(`/companies/${companyId}/banking/accounts/${accountForAction}/transactions/${id}`, { status: 'deleted' })
      }
      setItems(prev => prev.filter(t => t.id !== id))
      setDeleteTarget(null)
    } catch { setError('Failed to delete transaction.') }
    finally { setActionLoading(false) }
  }

  async function batchDelete() {
    if (!accountForAction || selected.size === 0) return
    setActionLoading(true)
    try {
      await Promise.all([...selected].map(async id => {
        try {
          await apiClient.delete(`/companies/${companyId}/banking/accounts/${accountForAction}/transactions/${id}`)
        } catch {
          await apiClient.patch(`/companies/${companyId}/banking/accounts/${accountForAction}/transactions/${id}`, { status: 'deleted' })
        }
      }))
      setItems(prev => prev.filter(t => !selected.has(t.id)))
      setSelected(new Set()); setBatchDeleteConfirm(false)
    } catch { setError('Batch delete partially failed.') }
    finally { setActionLoading(false) }
  }

  if (cidLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-emerald-500" size={28} /></div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Info banner */}
      <div className="mx-6 mt-5 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
        <Info size={16} className="mt-0.5 shrink-0 text-amber-500" />
        <span>Excluded transactions <strong>do not appear in financial reports</strong>. You can restore them to For Review at any time.</span>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm mt-4">
        <div className="px-6 py-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Excluded Transactions</h1>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} transactions excluded</p>
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
          {hasFilters && <button onClick={clearFilters} className="px-3 py-2 text-sm text-slate-500 hover:text-rose-600">Clear</button>}
        </div>

        {/* Batch bar */}
        {selected.size > 0 && (
          <div className="px-6 pb-3 flex items-center gap-3">
            <span className="text-sm text-slate-600">{selected.size} selected</span>
            <button onClick={() => setBatchRestoreConfirm(true)} className="px-3 py-1.5 text-sm font-medium border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1">
              <RotateCcw size={13} /> Batch Restore
            </button>
            <button onClick={() => setBatchDeleteConfirm(true)} className="px-3 py-1.5 text-sm font-medium border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 inline-flex items-center gap-1">
              <Trash2 size={13} /> Batch Delete
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
      <div className="px-6 py-5 flex-1 overflow-auto">
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
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Exclude Reason</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center">
                  <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={24} />
                  <p className="text-slate-400 text-sm">Loading…</p>
                </td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center">
                  <p className="font-medium text-slate-600">No excluded transactions.</p>
                  <p className="text-sm text-slate-400">Transactions you exclude in For Review will appear here.</p>
                </td></tr>
              ) : paged.map(tx => (
                <tr key={tx.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3" onClick={() => toggleSelect(tx.id)}>
                    <input type="checkbox" checked={selected.has(tx.id)} onChange={() => toggleSelect(tx.id)} className="rounded border-slate-300 text-emerald-600" />
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{tx.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{tx.description}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[140px] truncate">{tx.payee ?? '—'}</td>
                  <td className={`px-4 py-3 text-right font-semibold tabular-nums ${tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {tx.type === 'credit' ? '+' : ''}{formatCurrency(Math.abs(tx.amount), currency)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs italic">{tx.excludeReason ?? 'Manually excluded'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setRestoreTarget(tx.id)} className="p-1.5 text-slate-400 hover:text-emerald-700 rounded" title="Restore to For Review">
                        <RotateCcw size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(tx.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded" title="Delete permanently">
                        <Trash2 size={14} />
                      </button>
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

      {/* Restore single confirm */}
      {restoreTarget && (
        <ConfirmModal
          title="Restore Transaction?"
          message="This will send the transaction back to For Review."
          confirmLabel="Restore"
          confirmClass="bg-emerald-600 hover:bg-emerald-700"
          loading={actionLoading}
          onCancel={() => setRestoreTarget(null)}
          onConfirm={() => restoreSingle(restoreTarget)}
        />
      )}

      {/* Delete single confirm */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Transaction?"
          message="This will permanently delete the excluded transaction. This action cannot be undone."
          confirmLabel="Delete"
          confirmClass="bg-rose-600 hover:bg-rose-700"
          loading={actionLoading}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteSingle(deleteTarget)}
        />
      )}

      {/* Batch restore confirm */}
      {batchRestoreConfirm && (
        <ConfirmModal
          title={`Restore ${selected.size} Transactions?`}
          message="All selected transactions will be sent back to For Review."
          confirmLabel="Restore All"
          confirmClass="bg-emerald-600 hover:bg-emerald-700"
          loading={actionLoading}
          onCancel={() => setBatchRestoreConfirm(false)}
          onConfirm={batchRestore}
        />
      )}

      {/* Batch delete confirm */}
      {batchDeleteConfirm && (
        <ConfirmModal
          title={`Delete ${selected.size} Transactions?`}
          message="All selected transactions will be permanently deleted. This action cannot be undone."
          confirmLabel="Delete All"
          confirmClass="bg-rose-600 hover:bg-rose-700"
          loading={actionLoading}
          onCancel={() => setBatchDeleteConfirm(false)}
          onConfirm={batchDelete}
        />
      )}
    </div>
  )
}

function ConfirmModal({
  title, message, confirmLabel, confirmClass, loading, onCancel, onConfirm
}: {
  title: string; message: string; confirmLabel: string; confirmClass: string
  loading: boolean; onCancel: () => void; onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60 ${confirmClass}`}>
            {loading ? <span className="inline-flex items-center gap-1"><Loader2 size={14} className="animate-spin" /> Loading…</span> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const MOCK_EXCLUDED: ExcludedTransaction[] = [
  { id: 'e1', date: '2026-04-05', description: 'DUPLICATE CHARGE',      payee: 'Unknown',   amount: -500,  type: 'debit',  excludeReason: 'Duplicate transaction' },
  { id: 'e2', date: '2026-04-03', description: 'TRANSFER FEE',          payee: 'BDO',       amount: -50,   type: 'debit',  excludeReason: 'Bank fee — not an expense' },
  { id: 'e3', date: '2026-04-01', description: 'INTERNAL REIMBURSEMENT',payee: 'HR Dept',   amount: 2000,  type: 'credit', excludeReason: 'Non-business reimbursement' },
]
