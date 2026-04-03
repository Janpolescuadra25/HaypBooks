'use client'
export const dynamic = 'force-dynamic'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, X, AlertCircle, Loader2, Check, Lock, AlertTriangle } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import AccountSelect from '@/components/accounting/AccountSelect'

interface JELine {
  id?: string
  accountId: string
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

interface JournalEntry {
  id: string
  entryNumber?: string
  date: string
  description?: string
  reference?: string
  postingStatus: 'DRAFT' | 'POSTED' | 'VOIDED'
  lines: JELine[]
  totalDebit?: number
  totalCredit?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: { name?: string }
  updatedBy?: { name?: string }
}

export default function EditJournalEntryPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const entryId = params.id
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [entry, setEntry] = useState<JournalEntry | null>(null)

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [memo, setMemo] = useState('')
  const [reference, setReference] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'POSTED' | 'VOIDED'>('DRAFT')
  const [lines, setLines] = useState<JELine[]>([{ accountId: '', debit: 0, credit: 0, description: '' }, { accountId: '', debit: 0, credit: 0, description: '' }])
  const [accounts, setAccounts] = useState<Account[]>([])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  useEffect(() => {
    if (!companyId || !entryId) return
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await apiClient.get(`/companies/${companyId}/accounting/journal-entries/${entryId}`)
        const je: JournalEntry = data
        setEntry(je)
        setDate(je.date?.split('T')[0] ?? new Date().toISOString().split('T')[0])
        setMemo(je.description ?? '')
        setReference(je.reference ?? '')
        setStatus(je.postingStatus ?? 'DRAFT')
        setLines(je.lines && je.lines.length > 0 ? je.lines.map(l => ({ id: l.id, accountId: l.accountId, debit: l.debit, credit: l.credit, description: l.description })) : [{ accountId: '', debit: 0, credit: 0, description: '' }])
        setError('')
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'Failed to load journal entry')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [companyId, entryId])

  useEffect(() => {
    if (!companyId) return
    apiClient.get(`/companies/${companyId}/accounting/accounts`)
      .then(({ data }) => setAccounts(Array.isArray(data) ? data : data.accounts ?? []))
      .catch(() => {})
  }, [companyId])

  if (!entryId) {
    return <div className="p-6 text-red-600">Journal entry ID is missing.</div>
  }

  if (companyLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading Journal Entry…</span>
      </div>
    )
  }

  if (companyError) {
    return <div className="p-6 text-center text-red-600">{companyError}</div>
  }

  if (!companyId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-sm text-red-600 font-semibold">Please select or create a company before editing a journal entry.</p>
        </div>
      </div>
    )
  }

  const addLine = () => setLines(prev => [...prev, { accountId: '', debit: 0, credit: 0, description: '' }])
  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx))

  const updateLine = (idx: number, field: keyof JELine, value: string | number) =>
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l
      const updatedLine = { ...l, [field]: value }
      if (field === 'debit') {
        if (Number(value) > 0) return { ...updatedLine, credit: 0 }
      }
      if (field === 'credit') {
        if (Number(value) > 0) return { ...updatedLine, debit: 0 }
      }
      return updatedLine
    }))

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005 && totalDebit > 0
  const isVoided = status === 'VOIDED'
  const isPosted = status === 'POSTED'
  const isReadOnly = isVoided

  const handleSave = async (newStatus: 'DRAFT' | 'POSTED') => {
    if (!balanced) { setError('Debits must equal credits.'); return }
    const validLines = lines.filter(l => l.accountId)
    if (validLines.length < 2) { setError('At least 2 account lines are required.'); return }

    setSaving(true)
    setError('')
    try {
      await apiClient.put(`/companies/${companyId}/accounting/journal-entries/${entryId}`, {
        date,
        description: memo,
        reference,
        postingStatus: isPosted ? 'POSTED' : newStatus,
        lines: validLines.map(l => ({ accountId: l.accountId, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0, description: l.description })),
      })
      router.push('/accounting/core-accounting/journal-entries')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to update journal entry')
    } finally {
      setSaving(false)
    }
  }

  const fmtDate = (d: string | undefined) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return d }
  }

  const safeBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back()
    } else {
      router.push('/accounting/core-accounting/journal-entries')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0 z-10">
        <button onClick={safeBack} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-lg font-bold text-emerald-900">Edit Journal Entry</h1>
          <p className="text-xs text-emerald-500">Modify and save existing entry</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isVoided && <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full font-medium border border-red-200"><Lock size={12} /> Voided — View Only</span>}
          {isPosted && <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium border border-emerald-200">POSTED</span>}
          {!isVoided && !isPosted && balanced && <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium"><Check size={12} /> Balanced</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {isVoided && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
            <Lock size={16} className="shrink-0" />
            <span>This entry has been <strong>voided</strong>. It cannot be edited. Create a new journal entry to make corrections.</span>
          </div>
        )}

        {isPosted && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-amber-500" />
            <span>This entry is <strong>posted</strong>. Saving changes will <strong>void the current entry</strong> and create a corrected replacement with the same entry number.</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-emerald-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-slate-700">
              Created by <span className="font-semibold text-slate-900">{entry?.createdBy?.name ?? 'Unknown'}</span> on <span className="font-semibold text-slate-900">{fmtDate(entry?.createdAt)}</span>
              <span className="mx-1">·</span>
              Last modified by <span className="font-semibold text-slate-900">{entry?.updatedBy?.name ?? 'Unknown'}</span> on <span className="font-semibold text-slate-900">{fmtDate(entry?.updatedAt)}</span>
            </div>
            <button
              onClick={() => router.push(`/accounting/core-accounting/journal-entries/${entryId}/activity`)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
            >
              View Activity Log
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-6">
          <h2 className="text-sm font-semibold text-emerald-800 mb-4">Entry Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Reference</label>
              <input value={reference} onChange={e => setReference(e.target.value)} disabled={isReadOnly} placeholder="REF-001" className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Memo</label>
              <input value={memo} onChange={e => setMemo(e.target.value)} disabled={isReadOnly} placeholder="Journal entry description" className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
          </div>
        </div>

        {/* lines same as new page can be copied from new/page.tsx - place below */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Line Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200 w-[36%]">Account</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200">Description</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200 w-36">Debit</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700 border-r border-gray-200 w-36">Credit</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-1.5 border-r border-gray-100">
                      <AccountSelect
                        value={line.accountId}
                        accounts={accounts}
                        onChange={v => !isReadOnly && updateLine(idx, 'accountId', v)}
                        disabled={isReadOnly}
                      />
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-100">
                      <input
                        value={line.description ?? ''}
                        onChange={e => updateLine(idx, 'description', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="Note"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-100 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.debit || ''}
                        onChange={e => updateLine(idx, 'debit', Number(e.target.value))}
                        disabled={isReadOnly}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </td>
                    <td className="px-3 py-1.5 border-r border-gray-100 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.credit || ''}
                        onChange={e => updateLine(idx, 'credit', Number(e.target.value))}
                        disabled={isReadOnly}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {!isReadOnly && lines.length > 1 && (
                        <button onClick={() => removeLine(idx)} className="p-1 rounded-lg hover:bg-red-100 text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-300 bg-gray-50 flex justify-between items-center">
            {!isReadOnly && <button onClick={addLine} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">+ Add Line</button>}
            {isReadOnly && <span />}
            <div className="text-right">
              <div className="text-xs text-gray-600">Debit: {fmt(totalDebit)}</div>
              <div className="text-xs text-gray-600">Credit: {fmt(totalCredit)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {isVoided ? <span className="text-red-500 flex items-center gap-1"><Lock size={12} /> View only</span>
            : balanced ? <span className="text-emerald-600">✓ Balanced</span>
            : <span className="text-red-500">Out of balance</span>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/accounting/core-accounting/journal-entries')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">{isVoided ? 'Back' : 'Cancel'}</button>
          {!isVoided && !isPosted && (
            <>
              <button onClick={() => handleSave('DRAFT')} disabled={saving || !balanced} className="px-5 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-40">Save as Draft</button>
              <button onClick={() => handleSave('POSTED')} disabled={saving || !balanced} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">Save & Post</button>
            </>
          )}
          {isPosted && (
            <button onClick={() => handleSave('POSTED')} disabled={saving || !balanced} className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-40">
              {saving ? 'Saving…' : 'Apply Changes (Void & Re-post)'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
