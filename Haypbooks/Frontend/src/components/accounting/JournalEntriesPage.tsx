'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Search, Filter, Eye, X, Check, AlertCircle, Loader2,
  FileText, Send, Ban, ChevronDown, Calendar, ArrowUpDown
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
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [showForm, setShowForm] = useState(false)
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

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Journal Entries</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} entries</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* filters */}
      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            placeholder="Search entries…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="POSTED">Posted</option>
          <option value="VOIDED">Voided</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* table */}
      <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-emerald-50/50 border-b border-emerald-100">
              <th className="text-left px-4 py-3 font-medium text-emerald-700">Entry #</th>
              <th className="text-left px-4 py-3 font-medium text-emerald-700">Date</th>
              <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden md:table-cell">Memo</th>
              <th className="text-left px-4 py-3 font-medium text-emerald-700">Status</th>
              <th className="text-right px-4 py-3 font-medium text-emerald-700">Debit</th>
              <th className="text-right px-4 py-3 font-medium text-emerald-700">Credit</th>
              <th className="text-right px-4 py-3 font-medium text-emerald-700 w-28">Actions</th>
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
                const debit = entry.totalDebit ?? entry.lines?.reduce((s, l) => s + (l.debit ?? 0), 0) ?? 0
                const credit = entry.totalCredit ?? entry.lines?.reduce((s, l) => s + (l.credit ?? 0), 0) ?? 0
                return (
                  <tr key={entry.id} className="border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-emerald-600">{entry.entryNumber ?? entry.id.slice(0, 8)}</td>
                    <td className="px-4 py-2.5 text-emerald-800">{fmtDate(entry.date)}</td>
                    <td className="px-4 py-2.5 text-emerald-600/70 hidden md:table-cell truncate max-w-[200px]">{entry.memo ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusStyles[entry.status] ?? ''}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-emerald-800">{fmt(debit)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-emerald-800">{fmt(credit)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewEntry(entry)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600" title="View"><Eye size={14} /></button>
                        {entry.status === 'DRAFT' && (
                          <button onClick={() => handlePost(entry.id)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600" title="Post"><Send size={14} /></button>
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

      {/* Create form modal */}
      <AnimatePresence>
        {showForm && (
          <JEFormModal
            companyId={companyId!}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); fetchEntries() }}
          />
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
                  <td className="py-2 text-emerald-800">{line.accountCode ? `${line.accountCode} - ` : ''}{line.accountName ?? line.accountId}</td>
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

/* ──── Create Form Modal ──── */
function JEFormModal({ companyId, onClose, onSaved }: { companyId: string; onClose: () => void; onSaved: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [memo, setMemo] = useState('')
  const [reference, setReference] = useState('')
  const [lines, setLines] = useState<JELine[]>([
    { accountId: '', debit: 0, credit: 0, description: '' },
    { accountId: '', debit: 0, credit: 0, description: '' },
  ])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get(`/companies/${companyId}/accounting/accounts`)
      .then(({ data }) => setAccounts(Array.isArray(data) ? data : data.accounts ?? []))
      .catch(() => {})
  }, [companyId])

  const addLine = () => setLines(prev => [...prev, { accountId: '', debit: 0, credit: 0, description: '' }])
  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx))
  const updateLine = (idx: number, field: keyof JELine, value: any) =>
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005 && totalDebit > 0

  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const handleSave = async () => {
    if (!balanced) { setError('Debits must equal credits.'); return }
    const validLines = lines.filter(l => l.accountId)
    if (validLines.length < 2) { setError('At least 2 lines required.'); return }
    setSaving(true)
    setError('')
    try {
      await apiClient.post(`/companies/${companyId}/accounting/journal-entries`, {
        date, memo, reference,
        lines: validLines.map(l => ({
          accountId: l.accountId,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description,
        })),
      })
      onSaved()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create journal entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-emerald-900">New Journal Entry</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Reference</label>
              <input value={reference} onChange={e => setReference(e.target.value)} placeholder="REF-001"
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Memo</label>
              <input value={memo} onChange={e => setMemo(e.target.value)} placeholder="Description"
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>

          {/* Lines table */}
          <div className="border border-emerald-100 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-50/50">
                  <th className="text-left px-3 py-2 font-medium text-emerald-700">Account</th>
                  <th className="text-left px-3 py-2 font-medium text-emerald-700 hidden sm:table-cell">Description</th>
                  <th className="text-right px-3 py-2 font-medium text-emerald-700 w-28">Debit</th>
                  <th className="text-right px-3 py-2 font-medium text-emerald-700 w-28">Credit</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="border-t border-emerald-50">
                    <td className="px-3 py-1.5">
                      <select value={line.accountId} onChange={e => updateLine(idx, 'accountId', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-emerald-100 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                        <option value="">Select…</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-1.5 hidden sm:table-cell">
                      <input value={line.description ?? ''} onChange={e => updateLine(idx, 'description', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-emerald-100 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="Note" />
                    </td>
                    <td className="px-3 py-1.5">
                      <input type="number" min="0" step="0.01" value={line.debit || ''} onChange={e => updateLine(idx, 'debit', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm text-right border border-emerald-100 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="0.00" />
                    </td>
                    <td className="px-3 py-1.5">
                      <input type="number" min="0" step="0.01" value={line.credit || ''} onChange={e => updateLine(idx, 'credit', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm text-right border border-emerald-100 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="0.00" />
                    </td>
                    <td className="px-1 py-1.5">
                      {lines.length > 2 && (
                        <button onClick={() => removeLine(idx)} className="p-1 rounded hover:bg-red-100 text-red-400"><X size={14} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-emerald-200">
                  <td colSpan={2} className="px-3 py-2">
                    <button onClick={addLine} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                      <Plus size={12} /> Add Line
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right font-bold tabular-nums text-emerald-800">{fmt(totalDebit)}</td>
                  <td className="px-3 py-2 text-right font-bold tabular-nums text-emerald-800">{fmt(totalCredit)}</td>
                  <td></td>
                </tr>
                {!balanced && totalDebit > 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-1 text-xs text-red-500">
                      Difference: {fmt(Math.abs(totalDebit - totalCredit))} — debits must equal credits
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !balanced}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />} Create Entry
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
