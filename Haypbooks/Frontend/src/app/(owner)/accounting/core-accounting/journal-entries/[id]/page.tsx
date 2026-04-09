'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit2, CheckCircle, XCircle, Trash2, Loader2,
  AlertCircle, Check, Plus, X, ChevronRight, Copy,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import AccountSelect from '@/components/accounting/AccountSelect'

interface JELine {
  id?: string
  accountId: string
  account?: { id: string; code?: string; name?: string }
  accountName?: string
  accountCode?: string
  debit: number
  credit: number
  description?: string
}

interface JournalEntry {
  id: string
  entryNumber?: string
  date: string
  description?: string
  memo?: string
  reference?: string
  postingStatus: 'DRAFT' | 'POSTED' | 'VOIDED'
  lines: JELine[]
  createdAt?: string
  updatedAt?: string
  createdBy?: { name?: string; email: string }
  updatedBy?: { name?: string; email: string }
}

interface Account {
  id: string
  code: string
  name: string
  type?: string
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT:  'bg-gray-100 text-gray-700 border-gray-200',
  POSTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  VOIDED: 'bg-red-50 text-red-600 border-red-200',
}

const fmtDate = (d?: string) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return d }
}

export default function JournalEntryDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editDate, setEditDate] = useState('')
  const [editMemo, setEditMemo] = useState('')
  const [editReference, setEditReference] = useState('')
  const [editLines, setEditLines] = useState<Array<{ accountId: string; debit: string; credit: string; description: string }>>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [saveError, setSaveError] = useState('')

  const fetchEntry = useCallback(async () => {
    if (!companyId || !params?.id) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/accounting/journal-entries/${params.id}`)
      setEntry(data)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load journal entry')
    } finally {
      setLoading(false)
    }
  }, [companyId, params?.id])

  useEffect(() => { fetchEntry() }, [fetchEntry])

  useEffect(() => {
    if (!companyId) return
    apiClient.get(`/companies/${companyId}/accounting/accounts`)
      .then(({ data }) => setAccounts(Array.isArray(data) ? data : (data.accounts ?? [])))
      .catch(() => {})
  }, [companyId])

  const enterEditMode = () => {
    if (!entry) return
    setEditDate(entry.date?.split('T')[0] ?? new Date().toISOString().split('T')[0])
    setEditMemo(entry.description ?? entry.memo ?? '')
    setEditReference((entry as any).reference ?? '')
    setEditLines((entry.lines ?? []).map(l => ({
      accountId: l.accountId,
      debit: l.debit ? String(l.debit) : '',
      credit: l.credit ? String(l.credit) : '',
      description: l.description ?? '',
    })))
    setEditMode(true)
    setSaveError('')
  }

  const totalDebit  = editLines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
  const totalCredit = editLines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005 && totalDebit > 0

  const updateLine = (idx: number, field: string, value: string) => {
    setEditLines(prev => prev.map((l, i) => {
      if (i !== idx) return l
      const updated = { ...l, [field]: value }
      if (field === 'debit' && Number(value) > 0) return { ...updated, credit: '' }
      if (field === 'credit' && Number(value) > 0) return { ...updated, debit: '' }
      return updated
    }))
  }

  const handleSave = async () => {
    if (!balanced) { setSaveError('Debits must equal credits.'); return }
    const validLines = editLines.filter(l => l.accountId)
    if (validLines.length < 2) { setSaveError('At least 2 account lines are required.'); return }
    setSaving(true)
    setSaveError('')
    try {
      await apiClient.put(`/companies/${companyId}/accounting/journal-entries/${params?.id}`, {
        date: editDate,
        description: editMemo,
        reference: editReference,
        lines: validLines.map(l => ({
          accountId: l.accountId,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description,
        })),
      })
      setEditMode(false)
      fetchEntry()
    } catch (e: any) {
      setSaveError(e?.response?.data?.message ?? 'Failed to save journal entry')
    } finally {
      setSaving(false)
    }
  }

  const handlePost = async () => {
    if (!companyId || !entry) return
    try {
      await apiClient.post(`/companies/${companyId}/accounting/journal-entries/${entry.id}/post`)
      fetchEntry()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to post entry')
    }
  }

  const handleVoid = async () => {
    if (!companyId || !entry) return
    if (!window.confirm('Void this posted entry? A reversal entry will be created and this cannot be undone.')) return
    try {
      await apiClient.post(`/companies/${companyId}/accounting/journal-entries/${entry.id}/void`, { reason: 'Voided by user' })
      fetchEntry()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to void entry')
    }
  }

  const handleCopyAsNew = () => {
    if (!entry) return
    const desc = encodeURIComponent(entry.description ?? entry.memo ?? '')
    const linesPayload = (entry.lines ?? []).map(l => ({
      accountId: l.accountId,
      debit: l.debit,
      credit: l.credit,
      description: l.description ?? '',
    }))
    const linesParam = encodeURIComponent(JSON.stringify(linesPayload))
    router.push(`/accounting/core-accounting/journal-entries/new?copy=1&desc=${desc}&lines=${linesParam}`)
  }

  const handleDelete = async () => {
    if (!companyId || !entry) return
    if (!window.confirm('Delete this draft entry? This cannot be undone.')) return
    try {
      await apiClient.delete(`/companies/${companyId}/accounting/journal-entries/${entry.id}`)
      router.push('/accounting/core-accounting/journal-entries')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to delete entry')
    }
  }

  if (cidLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (cidError || !companyId) {
    return <div className="p-6 text-red-600 text-sm">{cidError ?? 'No company selected.'}</div>
  }

  if (error && !entry) {
    return (
      <div className="p-6 space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={15} /> {error}
        </div>
        <button onClick={fetchEntry} className="text-sm text-emerald-600 underline">Retry</button>
      </div>
    )
  }

  if (!entry) return null

  const status = entry.postingStatus

  return (
    <div className="flex flex-col min-h-full pb-8 bg-slate-50">
      {/* Breadcrumb + header */}
      <div className="px-6 pt-5 pb-3">
        <nav className="flex items-center gap-1 text-xs text-slate-400 mb-3">
          <Link href="/accounting/core-accounting/journal-entries" className="hover:text-emerald-600 transition-colors">
            Journal Entries
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-medium">{entry.entryNumber ?? entry.id.slice(0, 8)}</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/accounting/core-accounting/journal-entries')}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <h1 className="text-xl font-bold text-slate-900">
                Journal Entry {entry.entryNumber ?? `#${entry.id.slice(0, 8)}`}
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded border ${STATUS_STYLES[status] ?? ''}`}>
                {status}
              </span>
            </div>
            <div className="mt-1 ml-9 flex flex-wrap gap-4 text-xs text-slate-400">
              <span>Date: <span className="text-slate-600">{fmtDate(entry.date)}</span></span>
              {entry.createdAt && <span>Created: <span className="text-slate-600">{fmtDate(entry.createdAt)}</span></span>}
              {entry.createdBy && <span>By: <span className="text-slate-600">{entry.createdBy.name ?? entry.createdBy.email}</span></span>}
            </div>
          </div>
          {!editMode && (
            <div className="flex items-center gap-2 flex-wrap ml-9 sm:ml-0">
              {status === 'DRAFT' && (
                <>
                  <button
                    onClick={enterEditMode}
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={handlePost}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle size={13} /> Post Entry
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </>
              )}
              {status === 'POSTED' && (
                <button
                  onClick={handleVoid}
                  className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <XCircle size={13} /> Void Entry
                </button>
              )}
              {(status === 'DRAFT' || status === 'POSTED') && (
                <button
                  onClick={handleCopyAsNew}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <Copy size={13} /> Copy as New
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      {/* View mode */}
      {!editMode ? (
        <div className="mx-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Meta row */}
          <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Date</p>
              <p className="font-medium text-slate-700">{fmtDate(entry.date)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Reference</p>
              <p className="font-medium text-slate-700">{(entry as any).reference || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Memo / Description</p>
              <p className="font-medium text-slate-700">{entry.description ?? entry.memo ?? '—'}</p>
            </div>
          </div>

          {/* Lines table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Account</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Description</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-600 w-36">Debit</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-600 w-36">Credit</th>
                </tr>
              </thead>
              <tbody>
                {(entry.lines ?? []).map((line, i) => {
                  const acct = line.account
                  const code = acct?.code ?? line.accountCode
                  const name = acct?.name ?? line.accountName ?? line.accountId
                  return (
                    <tr key={line.id ?? i} className="border-b border-gray-50 hover:bg-emerald-50/20">
                      <td className="px-5 py-2.5 font-medium text-slate-700">
                        {code && <span className="text-slate-400 mr-1.5 text-xs font-mono">{code}</span>}
                        {name}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">{line.description ?? '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-700">
                        {line.debit ? fmt(Number(line.debit)) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-slate-700">
                        {line.credit ? fmt(Number(line.credit)) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                  <td colSpan={2} className="px-5 py-3 text-slate-700">Total</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                    {fmt(entry.lines?.reduce((s, l) => s + Number(l.debit ?? 0), 0) ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                    {fmt(entry.lines?.reduce((s, l) => s + Number(l.credit ?? 0), 0) ?? 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* Edit mode */
        <div className="mx-6 space-y-4">
          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={14} /> {saveError}
            </div>
          )}

          {/* Edit header fields */}
          <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-emerald-800 mb-4">Entry Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">Reference</label>
                <input
                  value={editReference}
                  onChange={e => setEditReference(e.target.value)}
                  placeholder="REF-001"
                  className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">Memo</label>
                <input
                  value={editMemo}
                  onChange={e => setEditMemo(e.target.value)}
                  placeholder="Journal entry description"
                  className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>

          {/* Edit lines table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Line Items</h2>
              {balanced && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <Check size={12} /> Balanced
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200 w-[38%]">Account</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200">Description</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200 w-36">Debit</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200 w-36">Credit</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {editLines.map((line, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/30">
                      <td className="px-3 py-1.5 border-r border-gray-100">
                        <AccountSelect
                          value={line.accountId}
                          accounts={accounts}
                          onChange={v => updateLine(idx, 'accountId', v)}
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-gray-100">
                        <input
                          value={line.description}
                          onChange={e => updateLine(idx, 'description', e.target.value)}
                          placeholder="Note"
                          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-gray-100">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.debit}
                          onChange={e => updateLine(idx, 'debit', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </td>
                      <td className="px-3 py-1.5 border-r border-gray-100">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.credit}
                          onChange={e => updateLine(idx, 'credit', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {editLines.length > 2 && (
                          <button
                            onClick={() => setEditLines(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1 rounded hover:bg-red-100 text-red-400"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50">
                    <td colSpan={2} className="px-4 py-3">
                      <button
                        onClick={() => setEditLines(prev => [...prev, { accountId: '', debit: '', credit: '', description: '' }])}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                      >
                        <Plus size={13} /> Add Line
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-gray-900 border-r border-gray-200">
                      {fmt(totalDebit)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-gray-900 border-r border-gray-200">
                      {fmt(totalCredit)}
                    </td>
                    <td></td>
                  </tr>
                  {!balanced && totalDebit > 0 && (
                    <tr className="bg-red-50">
                      <td colSpan={5} className="px-4 py-2 text-xs text-red-600 font-medium">
                        Difference: {fmt(Math.abs(totalDebit - totalCredit))} — debits must equal credits
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </div>

          {/* Edit footer */}
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {balanced
                ? <span className="text-emerald-600 font-semibold">✓ Balanced — ready to save</span>
                : totalDebit > 0
                ? <span className="text-red-500">Out of balance by {fmt(Math.abs(totalDebit - totalCredit))}</span>
                : 'Enter debit and credit amounts'}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setEditMode(false); setSaveError('') }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !balanced}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 flex items-center gap-2"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
