'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, AlertCircle, X, Download, Calendar, Search } from 'lucide-react'
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
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

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

  const accountTypes = useMemo(() => {
    const types = [...new Set(rows.map(r => r.accountType).filter(Boolean))]
    return ['All', ...types.sort()]
  }, [rows])

  const filtered = useMemo(() => {
    let list = rows
    if (typeFilter !== 'All') list = list.filter(r => r.accountType === typeFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.accountName?.toLowerCase().includes(q) ||
        r.accountCode?.toLowerCase().includes(q)
      )
    }
    return list
  }, [rows, typeFilter, search])

  const totalDebit = filtered.reduce((s, r) => s + (r.debit ?? 0), 0)
  const totalCredit = filtered.reduce((s, r) => s + (r.credit ?? 0), 0)
  const balanced = Math.abs(
    rows.reduce((s, r) => s + (r.debit ?? 0), 0) -
    rows.reduce((s, r) => s + (r.credit ?? 0), 0)
  ) < 0.005

  function exportCsv() {
    const headers = ['Code', 'Account', 'Type', 'Debit', 'Credit']
    const csvRows = filtered.map(r => [r.accountCode, r.accountName, r.accountType, r.debit ?? '', r.credit ?? ''])
    const csv = [headers, ...csvRows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `trial-balance-${asOf}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

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
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search account name or code…"
            className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Balance status */}
      <div className={`rounded-lg p-3 flex items-center gap-2 text-sm font-semibold ${balanced ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        {balanced ? '✓ Trial balance is in balance' : `✗ Out of balance by ${fmt(Math.abs(rows.reduce((s,r)=>s+(r.debit??0),0) - rows.reduce((s,r)=>s+(r.credit??0),0)))}`}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-emerald-400">No accounts with balances for this period.</td>
                </tr>
              ) : (
                filtered.map((row, i) => (
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
