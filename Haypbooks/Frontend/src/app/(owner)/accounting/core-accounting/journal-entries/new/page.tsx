'use client'
export const dynamic = 'force-dynamic'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, AlertCircle, Loader2, Check } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface JELine {
  accountId: string
  debit: number
  credit: number
  description: string
}

interface Account {
  id: string
  code: string
  name: string
  type: string
}

export default function NewJournalEntryPage() {
  const router = useRouter()
  const { companyId, loading: companyLoading, error: companyError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

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

  if (!companyLoading && !companyId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-sm text-red-600 font-semibold">Please select or create a company before creating a journal entry.</p>
          {companyError && <p className="text-xs text-red-500 mt-2">{companyError}</p>}
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!companyId) return
    apiClient
      .get(`/companies/${companyId}/accounting/accounts`)
      .then(({ data }) => setAccounts(Array.isArray(data) ? data : (data.accounts ?? [])))
      .catch(() => {})
  }, [companyId])

  const addLine = () =>
    setLines(prev => [...prev, { accountId: '', debit: 0, credit: 0, description: '' }])

  const removeLine = (idx: number) =>
    setLines(prev => prev.filter((_, i) => i !== idx))

  const updateLine = (idx: number, field: keyof JELine, value: string | number) =>
    setLines(prev => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)))

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005 && totalDebit > 0

  const handleSave = async (status: 'DRAFT' | 'POSTED') => {
    if (!balanced) { setError('Debits must equal credits.'); return }
    const validLines = lines.filter(l => l.accountId)
    if (validLines.length < 2) { setError('At least 2 account lines are required.'); return }
    setSaving(true)
    setError('')
    try {
      await apiClient.post(`/companies/${companyId}/accounting/journal-entries`, {
        date,
        description: memo,
        reference,
        postingStatus: status,
        lines: validLines.map(l => ({
          accountId: l.accountId,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description,
        })),
      })
      router.push('/accounting/core-accounting/journal-entries')
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to create journal entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-emerald-900">New Journal Entry</h1>
          <p className="text-xs text-emerald-500">Manual double-entry booking</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {balanced && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
              <Check size={12} /> Balanced
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
      <div className="px-8 py-6 space-y-5">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Header fields */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6">
          <h2 className="text-sm font-semibold text-emerald-800 mb-4">Entry Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Reference</label>
              <input
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="REF-001"
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Memo</label>
              <input
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="Journal entry description"
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
        </div>

        {/* Lines table */}
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
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-1.5 border-r border-gray-100">
                      <select
                        value={line.accountId}
                        onChange={e => updateLine(idx, 'accountId', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                      >
                        <option value="">Select account…</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.code} – {a.name}
                          </option>
                        ))}
                      </select>
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
                        value={line.debit || ''}
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
                        value={line.credit || ''}
                        onChange={e => updateLine(idx, 'credit', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {lines.length > 2 && (
                        <button
                          onClick={() => removeLine(idx)}
                          className="p-1 rounded-lg hover:bg-red-100 text-red-400 transition-colors"
                        >
                          <X size={14} />
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
                      onClick={addLine}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
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

      </div>
      </div>

      {/* Sticky action footer */}
      <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {balanced
            ? <span className="text-emerald-600 font-semibold">✓ Balanced — ready to save</span>
            : totalDebit > 0
            ? <span className="text-red-500">Out of balance by {fmt(Math.abs(totalDebit - totalCredit))}</span>
            : 'Enter debit and credit amounts'}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave('DRAFT')}
            disabled={saving || !balanced}
            className="px-5 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-40"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave('POSTED')}
            disabled={saving || !balanced}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Create & Post
          </button>
        </div>
      </div>
    </div>
  )
}
