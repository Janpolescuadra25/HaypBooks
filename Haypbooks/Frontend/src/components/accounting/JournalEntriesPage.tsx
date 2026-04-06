'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Eye, X, AlertCircle, Loader2,
  FileText, RefreshCw, Ban, Pencil, Copy, Clock,
  CheckCircle, XCircle, MoreVertical, Download,
  Printer, Trash2, Upload, Keyboard,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'


const fmtDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return d }
}

interface JournalEntry {
  id: string
  entryNumber?: string
  date: string
  description?: string
  memo?: string
  reference?: string
  status: 'DRAFT' | 'POSTED' | 'VOIDED'
  lines: JELine[]
  totalDebit?: number
  totalCredit?: number
  createdAt?: string
  updatedAt?: string
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

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-50 text-gray-700 border-gray-200',
  POSTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  VOIDED: 'bg-red-50 text-red-600 border-red-200',
}

/* ──── Dropdown Menu (lightweight) ──── */
function RowMenu({ entry, onView, onEdit, onCopy, onPost, onVoid, onAudit, onDelete, balanced }: {
  entry: JournalEntry
  onView: () => void
  onEdit: () => void
  onCopy: () => void
  onPost: () => void
  onVoid: () => void
  onAudit: () => void
  onDelete: () => void
  balanced: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        className="p-1 rounded hover:bg-gray-100 text-gray-400" title="More options">
        <MoreVertical size={13} />
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-50 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 text-sm">
          <button onClick={() => { setOpen(false); onView() }}
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-gray-50 text-gray-700">
            <Eye size={13} /> View details
          </button>
          {entry.status !== 'VOIDED' && (
            <button onClick={() => { setOpen(false); onEdit() }}
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-gray-50 text-gray-700">
              <Pencil size={13} /> Edit
            </button>
          )}
          <button onClick={() => { setOpen(false); onCopy() }}
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-gray-50 text-gray-700">
            <Copy size={13} /> Copy as new
          </button>
          <button onClick={() => { setOpen(false); onAudit() }}
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-purple-50 text-purple-700">
            <Clock size={13} /> Audit log
          </button>
          <div className="border-t border-gray-100 my-1" />
          {entry.status === 'DRAFT' && balanced && (
            <button onClick={() => { setOpen(false); onPost() }}
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-emerald-50 text-emerald-700">
              <CheckCircle size={13} /> Post entry
            </button>
          )}
          {entry.status === 'POSTED' && (
            <button onClick={() => { setOpen(false); onVoid() }}
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-red-50 text-red-600">
              <XCircle size={13} /> Void entry
            </button>
          )}
          <div className="border-t border-gray-100 my-1" />
          {entry.status === 'DRAFT' && (
            <button onClick={() => { setOpen(false); onDelete() }}
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-red-50 text-red-600">
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function JournalEntriesPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
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
      const { data } = await apiClient.get(`/companies/${companyId}/accounting/journal-entries`, {
        params: { sourceType: 'MANUAL_JOURNAL' },
      })
      setEntries(Array.isArray(data) ? data : data.journalEntries ?? data.entries ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load journal entries')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        router.push('/accounting/core-accounting/journal-entries/new')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setViewEntry(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])

  const filtered = useMemo(() => {
    let list = entries
    if (statusFilter !== 'ALL') list = list.filter(e => e.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        (e.entryNumber ?? '').toLowerCase().includes(q) ||
        (e.description ?? e.memo ?? '').toLowerCase().includes(q) ||
        (e.reference ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [entries, search, statusFilter])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalEntries = entries.length
  const postedCount = entries.filter(e => e.status === 'POSTED').length
  const draftCount = entries.filter(e => e.status === 'DRAFT').length
  const voidedCount = entries.filter(e => e.status === 'VOIDED').length
  const lastUpdatedMs = entries.length > 0
    ? Math.max(...entries.map(e => new Date(e.updatedAt ?? e.createdAt ?? 0).getTime()))
    : null
  const lastUpdated = lastUpdatedMs ? fmtDate(new Date(lastUpdatedMs).toISOString()) : null
  // Count entries modified in last 7 days (for audit badge)
  const recentlyModifiedCount = entries.filter(e => {
    const ms = new Date(e.updatedAt ?? e.createdAt ?? 0).getTime()
    return Date.now() - ms < 7 * 24 * 3600 * 1000
  }).length

  const handlePost = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/accounting/journal-entries/${id}/post`)
      fetchEntries()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to post entry')
    }
  }, [companyId, fetchEntries])

  const handleVoid = useCallback(async (id: string) => {
    if (!companyId) return
    if (!window.confirm('Void this posted entry? This will create a reversing entry and cannot be undone.')) return
    try {
      await apiClient.post(`/companies/${companyId}/accounting/journal-entries/${id}/void`, { reason: 'Voided by user' })
      fetchEntries()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to void entry')
    }
  }, [companyId, fetchEntries])

  const handleDelete = useCallback(async (id: string) => {
    if (!companyId) return
    if (!window.confirm('Delete this draft entry? This cannot be undone.')) return
    try {
      await apiClient.delete(`/companies/${companyId}/accounting/journal-entries/${id}`)
      fetchEntries()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to delete entry')
    }
  }, [companyId, fetchEntries])

  const handleCopyAsNew = useCallback((entry: JournalEntry) => {
    // Navigate to new entry with pre-filled data via query params
    const lines = encodeURIComponent(JSON.stringify((entry.lines ?? []).map(l => ({
      accountId: l.accountId,
      debit: l.debit,
      credit: l.credit,
      description: l.description ?? '',
    }))))
    const desc = encodeURIComponent(entry.description ?? entry.memo ?? '')
    router.push(`/accounting/core-accounting/journal-entries/new?copy=1&desc=${desc}&lines=${lines}`)
  }, [router])

  const openAuditLog = useCallback((entryId: string | null) => {
    if (entryId) {
      router.push(`/accounting/core-accounting/journal-entries/${entryId}/activity`)
    } else {
      router.push('/accounting/core-accounting/journal-entries/audit-log')
    }
  }, [router])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  if (cidLoading || (loading && entries.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
        <p className="text-sm text-gray-500 mt-2">Loading journal entries…</p>
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
    <div className="flex flex-col min-h-full pb-8 bg-slate-50">
      {/* Page header */}
      <div className="px-6 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Journal Entries</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} of {totalEntries} entries</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audit Log button */}
          <button
            onClick={() => openAuditLog(null)}
            className="flex items-center gap-1.5 px-3 py-2 border border-purple-200 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
          >
            <Clock size={14} />
            Audit Log
            {recentlyModifiedCount > 0 && (
              <span className="ml-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                {recentlyModifiedCount > 9 ? '9+' : recentlyModifiedCount}
              </span>
            )}
          </button>
          <button
            onClick={fetchEntries}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => router.push('/accounting/core-accounting/journal-entries/new')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} /> New Entry
          </button>
        </div>
      </div>

      {/* Status tab bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 px-6 bg-white mx-6 rounded-t-lg">
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
            {tab.key !== 'ALL' && (
              <span className="ml-1 text-xs text-gray-400">
                ({tab.key === 'DRAFT' ? draftCount : tab.key === 'POSTED' ? postedCount : voidedCount})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="px-6 py-3 bg-white mx-6 border-x border-gray-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by entry #, memo, or reference… (Ctrl+F)"
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
      <div className="mx-6 rounded-b-lg border border-t-0 border-gray-200 overflow-x-auto bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 whitespace-nowrap">Entry #</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 whitespace-nowrap">Date</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 hidden md:table-cell border-r border-gray-200">Memo</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200">Status</th>
              <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 whitespace-nowrap">Debit</th>
              <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 whitespace-nowrap">Credit</th>
              <th className="text-right px-4 py-2.5 font-semibold text-gray-600 w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center">
                  <Loader2 size={20} className="animate-spin text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Loading…</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-700">No journal entries yet</h3>
                    <p className="text-sm text-gray-400 max-w-sm text-center mt-1 mb-4">
                      {search || statusFilter !== 'ALL'
                        ? 'No entries match your current filters.'
                        : 'Create your first journal entry to start recording transactions.'}
                    </p>
                    {!search && statusFilter === 'ALL' && (
                      <button
                        onClick={() => router.push('/accounting/core-accounting/journal-entries/new')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        <Plus size={15} /> Create First Entry
                      </button>
                    )}
                    {!search && statusFilter === 'ALL' && (
                      <div className="mt-6 pt-4 border-t border-gray-100 text-left max-w-xs">
                        <p className="text-xs text-gray-400 font-medium mb-1">Common examples:</p>
                        <ul className="text-xs text-gray-400 space-y-0.5">
                          <li>• Office Supplies → Cash (Debit expense, Credit cash)</li>
                          <li>• Sale to Customer → AR (Debit AR, Credit Revenue)</li>
                          <li>• Bill from Vendor → AP (Debit AP, Credit Cash)</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(entry => {
                const debit = entry.lines?.reduce((s, l) => s + Number(l.debit ?? 0), 0) ?? 0
                const credit = entry.lines?.reduce((s, l) => s + Number(l.credit ?? 0), 0) ?? 0
                const balanced = Math.abs(debit - credit) <= 0.005
                // First account name in lines for display
                const firstAccountName = entry.lines?.[0]?.account?.name ?? entry.lines?.[0]?.accountName ?? null
                return (
                  <tr key={entry.id} className="group border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-700 border-r border-gray-100 whitespace-nowrap">
                      {entry.entryNumber ?? entry.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 border-r border-gray-100 whitespace-nowrap">{fmtDate(entry.date)}</td>
                    <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell border-r border-gray-100">
                      <div className="truncate max-w-[220px]">{entry.description ?? entry.memo ?? '—'}</div>
                      {firstAccountName && (
                        <div className="text-xs text-gray-400 truncate max-w-[220px]">{firstAccountName}{entry.lines && entry.lines.length > 1 ? ` +${entry.lines.length - 1} more` : ''}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 border-r border-gray-100">
                      {!balanced ? (
                        <span className="bg-red-50 text-red-600 px-2 py-0.5 text-xs font-semibold rounded-full border border-red-200">Out of Balance</span>
                      ) : (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusStyles[entry.status] ?? ''}`}>
                          {entry.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-800 border-r border-gray-100 whitespace-nowrap">{fmt(debit)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-800 border-r border-gray-100 whitespace-nowrap">{fmt(credit)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        {/* Quick actions — always visible */}
                        <button onClick={() => setViewEntry(entry)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Quick view">
                          <Eye size={13} />
                        </button>
                        {entry.status !== 'VOIDED' && (
                          <button onClick={() => router.push(`/accounting/core-accounting/journal-entries/${entry.id}`)}
                            className="p-1 rounded hover:bg-emerald-50 text-gray-400 hover:text-emerald-600" title="Edit">
                            <Pencil size={13} />
                          </button>
                        )}
                        {entry.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePost(entry.id)}
                            disabled={!balanced}
                            className={`p-1 rounded ${balanced ? 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-600' : 'text-gray-200 cursor-not-allowed'}`}
                            title={balanced ? 'Post this entry' : 'Cannot post unbalanced entry'}
                          >
                            <CheckCircle size={13} />
                          </button>
                        )}
                        {entry.status === 'POSTED' && (
                          <button onClick={() => handleVoid(entry.id)}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500" title="Void">
                            <Ban size={13} />
                          </button>
                        )}
                        <button onClick={() => openAuditLog(entry.id)}
                          className="p-1 rounded hover:bg-purple-50 text-gray-400 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Audit log">
                          <Clock size={13} />
                        </button>
                        {/* More menu */}
                        <RowMenu
                          entry={entry}
                          balanced={balanced}
                          onView={() => setViewEntry(entry)}
                          onEdit={() => router.push(`/accounting/core-accounting/journal-entries/${entry.id}`)}
                          onCopy={() => handleCopyAsNew(entry)}
                          onPost={() => handlePost(entry.id)}
                          onVoid={() => handleVoid(entry.id)}
                          onAudit={() => openAuditLog(entry.id)}
                          onDelete={() => handleDelete(entry.id)}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Keyboard hints */}
        {totalEntries > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
            <Keyboard size={12} />
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono font-bold">Ctrl+N</kbd><span>New Entry</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono font-bold">Ctrl+F</kbd><span>Search</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono font-bold">Esc</kbd><span>Close</span>
          </div>
        )}
      </div>

      {/* View detail modal */}
      <AnimatePresence>
        {viewEntry && (
          <JEDetailModal entry={viewEntry} onClose={() => setViewEntry(null)} fmt={fmt} />
        )}
      </AnimatePresence>


    </div>
  )
}

/* ──── Detail Modal ──── */
function JEDetailModal({ entry, onClose, fmt }: { entry: JournalEntry; onClose: () => void; fmt: (n: number) => string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-emerald-900">Journal Entry #{entry.entryNumber ?? entry.id.slice(0, 8)}</h2>
            <p className="text-xs text-emerald-600/60">{fmtDate(entry.date)} · {entry.description ?? entry.memo ?? 'No memo'}</p>
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


