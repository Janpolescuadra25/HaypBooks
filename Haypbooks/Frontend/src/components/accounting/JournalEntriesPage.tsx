'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Eye, X, AlertCircle, Loader2,
  FileText, Send, Ban, Pencil,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface JournalEntry {
  id: string
  entryNumber?: string
  date: string
  memo?: string
  reference?: string
  status: 'DRAFT' | 'POSTED' | 'VOIDED'
  lines: JELine[]
  totalDebit?: number
  totalCredit?: number
  createdAt?: string
}

interface JELine {
  id?: string
  accountId: string
  accountName?: string
  accountCode?: string
  account?: { id: string; code?: string; name?: string }
  debit: number
  credit: number
  description?: string
}

interface Account {
  id: string
  code: string
  name: string
  type: string
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-50 text-gray-700 border-gray-200',
  POSTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  VOIDED: 'bg-red-50 text-red-600 border-red-200',
}

export default function JournalEntriesPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null)

  const fetchEntries = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/accounting/journal-entries`)
      setEntries(Array.isArray(data) ? data : data.journalEntries ?? data.entries ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const filtered = useMemo(() => {
    let list = entries
    if (statusFilter !== 'ALL') list = list.filter(e => e.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        (e.entryNumber ?? '').toLowerCase().includes(q) ||
        (e.memo ?? '').toLowerCase().includes(q) ||
        (e.reference ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [entries, search, statusFilter])

  const handlePost = async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/accounting/journal-entries/${id}/post`)
      fetchEntries()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to post entry')
    }
  }

  const handleVoid = async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/accounting/journal-entries/${id}/void`, { reason: 'Voided by user' })
      fetchEntries()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to void entry')
    }
  }

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return d }
  }

  if (cidLoading || (loading && entries.length === 0)) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading Journal Entries…</span>
      </div>
    )
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  const STATUS_TABS = [
    { key: 'ALL', label: 'All' },
    { key: 'DRAFT', label: 'Draft' },
    { key: 'POSTED', label: 'Posted' },
    { key: 'VOIDED', label: 'Voided' },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* Page header */}
      <div className="px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Journal Entries</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} entries</p>
        </div>
        <button
          onClick={() => router.push('/accounting/core-accounting/journal-entries/new')}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Status tab bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 px-6">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.key
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="px-6 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by entry #, memo, or reference…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="mx-6 mb-4 rounded-lg border border-gray-200 overflow-x-auto bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="text-left px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200">Entry #</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200">Date</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-700 hidden md:table-cell border-r border-gray-200">Memo</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200">Status</th>
              <th className="text-right px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200">Debit</th>
              <th className="text-right px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200">Credit</th>
              <th className="text-right px-4 py-2.5 font-semibold text-gray-700 w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-emerald-400">
                  <FileText size={24} className="mx-auto mb-2 opacity-50" />
                  No journal entries found.
                </td>
              </tr>
            ) : (
              filtered.map(entry => {
                const debit = entry.lines?.reduce((s, l) => s + Number(l.debit ?? 0), 0) ?? 0
                const credit = entry.lines?.reduce((s, l) => s + Number(l.credit ?? 0), 0) ?? 0
                const balanced = Math.abs(debit - credit) <= 0.005
                return (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-blue-50/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-700 border-r border-gray-100">{entry.entryNumber ?? entry.id.slice(0, 8)}</td>
                    <td className="px-4 py-2.5 text-slate-700 border-r border-gray-100">{fmtDate(entry.date)}</td>
                    <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell truncate max-w-[200px] border-r border-gray-100">{entry.memo ?? '—'}</td>
                    <td className="px-4 py-2.5 border-r border-gray-100">
                      {!balanced ? (
                        <span className="bg-red-50 text-red-600 px-2 py-0.5 text-xs font-semibold rounded-full border border-red-200">Out of Balance</span>
                      ) : (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusStyles[entry.status] ?? ''}`}>
                          {entry.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-800 border-r border-gray-100">{fmt(debit)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-800 border-r border-gray-100">{fmt(credit)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewEntry(entry)} className="p-1 rounded hover:bg-gray-100 text-gray-500" title="Quick view"><Eye size={14} /></button>
                        {entry.status !== 'VOIDED' && (
                          <button onClick={() => router.push(`/accounting/core-accounting/journal-entries/${entry.id}`)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600" title="Edit"><Pencil size={14} /></button>
                        )}
                        {entry.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePost(entry.id)}
                            disabled={!balanced}
                            className={`p-1 rounded ${balanced ? 'hover:bg-emerald-100 text-emerald-600' : 'text-gray-300 cursor-not-allowed'}`}
                            title={balanced ? 'Post' : 'Cannot post out-of-balance entry'}
                          >
                            <Send size={14} />
                          </button>
                        )}
                        {entry.status === 'POSTED' && (
                          <button onClick={() => handleVoid(entry.id)} className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600" title="Void"><Ban size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* View detail modal */}
      <AnimatePresence>
        {viewEntry && (
          <JEDetailModal entry={viewEntry} onClose={() => setViewEntry(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ──── Detail Modal ──── */
function JEDetailModal({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-emerald-900">Journal Entry #{entry.entryNumber ?? entry.id.slice(0, 8)}</h2>
            <p className="text-xs text-emerald-600/60">{entry.date} · {entry.memo ?? 'No memo'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusStyles[entry.status]}`}>{entry.status}</span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
          </div>
        </div>
        <div className="p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-emerald-100">
                <th className="text-left py-2 font-medium text-emerald-700">Account</th>
                <th className="text-left py-2 font-medium text-emerald-700">Description</th>
                <th className="text-right py-2 font-medium text-emerald-700">Debit</th>
                <th className="text-right py-2 font-medium text-emerald-700">Credit</th>
              </tr>
            </thead>
            <tbody>
              {(entry.lines ?? []).map((line, i) => (
                <tr key={line.id ?? i} className="border-t border-emerald-50">
                  <td className="py-2 text-emerald-800">
                    {line.account?.code ? `${line.account.code} - ` : line.accountCode ? `${line.accountCode} - ` : ''}
                    {line.account?.name ?? line.accountName ?? line.accountId}
                  </td>
                  <td className="py-2 text-emerald-600/60">{line.description ?? '—'}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{line.debit ? fmt(line.debit) : '—'}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{line.credit ? fmt(line.credit) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-emerald-200 font-bold">
                <td colSpan={2} className="py-2 text-emerald-700">Total</td>
                <td className="py-2 text-right tabular-nums">{fmt(entry.lines?.reduce((s, l) => s + (l.debit ?? 0), 0) ?? 0)}</td>
                <td className="py-2 text-right tabular-nums">{fmt(entry.lines?.reduce((s, l) => s + (l.credit ?? 0), 0) ?? 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}


