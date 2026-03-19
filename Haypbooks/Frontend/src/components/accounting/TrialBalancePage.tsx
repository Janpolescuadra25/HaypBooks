'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Loader2, AlertCircle, X, Download, Calendar } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface TBRow {
  accountId: string
  accountCode: string
  accountName: string
  accountType: string
  debit: number
  credit: number
  balance?: number
}

export default function TrialBalancePage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows] = useState<TBRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchTB = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/accounting/trial-balance`, { params: { asOf } })
      setRows(Array.isArray(data) ? data : data.rows ?? data.accounts ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load trial balance')
    } finally {
      setLoading(false)
    }
  }, [companyId, asOf])

  useEffect(() => { fetchTB() }, [fetchTB])

  const totalDebit = rows.reduce((s, r) => s + (r.debit ?? 0), 0)
  const totalCredit = rows.reduce((s, r) => s + (r.credit ?? 0), 0)
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading…</span>
      </div>
    )
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Trial Balance</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">As of {new Date(asOf).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-emerald-100 rounded-lg px-3 py-1.5">
            <Calendar size={14} className="text-emerald-500" />
            <input
              type="date"
              value={asOf}
              onChange={e => setAsOf(e.target.value)}
              className="text-sm border-0 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Balance status */}
      <div className={`rounded-lg p-3 flex items-center gap-2 text-sm font-semibold ${balanced ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        {balanced ? '✓ Trial balance is in balance' : `✗ Out of balance by ${fmt(Math.abs(totalDebit - totalCredit))}`}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-50/50 border-b border-emerald-100">
                <th className="text-left px-4 py-3 font-medium text-emerald-700">Code</th>
                <th className="text-left px-4 py-3 font-medium text-emerald-700">Account</th>
                <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden md:table-cell">Type</th>
                <th className="text-right px-4 py-3 font-medium text-emerald-700">Debit</th>
                <th className="text-right px-4 py-3 font-medium text-emerald-700">Credit</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-emerald-400">No accounts with balances for this period.</td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={row.accountId ?? i} className="border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-emerald-600">{row.accountCode}</td>
                    <td className="px-4 py-2.5 font-medium text-emerald-900">{row.accountName}</td>
                    <td className="px-4 py-2.5 text-emerald-600/60 hidden md:table-cell">{row.accountType}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-emerald-800">{row.debit ? fmt(row.debit) : '—'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-emerald-800">{row.credit ? fmt(row.credit) : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-emerald-300 bg-emerald-50/30 font-bold">
                <td colSpan={3} className="px-4 py-3 text-emerald-700">Total</td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-800">{fmt(totalDebit)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-800">{fmt(totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
