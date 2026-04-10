'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, AlertCircle, X, Download, Search } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface AgingBucket {
  label: string
  amount: number
  count?: number
}

interface AgingCustomer {
  customerId: string
  customerName: string
  current: number
  days30: number
  days60: number
  days90: number
  over90: number
  total: number
}

export default function ArAgingPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0])
  const [search, setSearch] = useState('')

  const fetchAging = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data: res } = await apiClient.get(`/companies/${companyId}/ar/reports/aging`, { params: { asOf } })
      setData(res)
      setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load aging report') }
    finally { setLoading(false) }
  }, [companyId, asOf])

  useEffect(() => { fetchAging() }, [fetchAging])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  // Support both flat and structured response formats
  const buckets: AgingBucket[] = data?.buckets ?? data?.summary ?? []
  const allCustomers: AgingCustomer[] = data?.customers ?? data?.details ?? []
  const totalOutstanding = data?.total ?? allCustomers.reduce((s: number, c: AgingCustomer) => s + c.total, 0) ?? 0

  const customers = useMemo(() => {
    if (!search) return allCustomers
    const q = search.toLowerCase()
    return allCustomers.filter(c => c.customerName?.toLowerCase().includes(q))
  }, [allCustomers, search])

  function exportCsv() {
    const headers = ['Customer', 'Current', '1-30', '31-60', '61-90', '90+', 'Total']
    const rows = customers.map(c => [
      c.customerName, c.current, c.days30, c.days60, c.days90, c.over90, c.total
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `ar-aging-${asOf}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (cidLoading) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading…</span></div>
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">AR Aging Report</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">Accounts Receivable aging summary</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-emerald-100 rounded-lg px-3 py-1.5">
            <span className="text-xs text-emerald-500">As of</span>
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error} <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Summary buckets */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          {buckets.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {buckets.map((b, i) => (
                <div key={i} className="bg-white rounded-xl border border-emerald-100 p-4">
                  <p className="text-xs text-emerald-600/60 font-medium">{b.label}</p>
                  <p className="text-lg font-bold text-emerald-800 mt-1">{fmt(b.amount)}</p>
                  {b.count !== undefined && <p className="text-xs text-emerald-500 mt-0.5">{b.count} invoices</p>}
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 flex items-center justify-between">
            <span className="font-semibold text-emerald-700">Total Outstanding</span>
            <span className="text-xl font-bold text-emerald-800">{fmt(totalOutstanding)}</span>
          </div>

          {/* Customer detail */}
          {allCustomers.length > 0 && (
            <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
              <div className="p-3 border-b border-emerald-50">
                <div className="relative w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search customers…"
                    className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100">
                    <th className="text-left px-4 py-3 font-medium text-emerald-700">Customer</th>
                    <th className="text-right px-4 py-3 font-medium text-emerald-700">Current</th>
                    <th className="text-right px-4 py-3 font-medium text-emerald-700">1-30</th>
                    <th className="text-right px-4 py-3 font-medium text-emerald-700">31-60</th>
                    <th className="text-right px-4 py-3 font-medium text-emerald-700">61-90</th>
                    <th className="text-right px-4 py-3 font-medium text-emerald-700">90+</th>
                    <th className="text-right px-4 py-3 font-medium text-emerald-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-emerald-400">No customers found.</td></tr>
                  ) : customers.map(c => (
                    <tr key={c.customerId} className="border-t border-emerald-50 hover:bg-emerald-50/30">
                      <td className="px-4 py-2.5 font-medium text-emerald-900">{c.customerName}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{c.current ? fmt(c.current) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{c.days30 ? fmt(c.days30) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{c.days60 ? fmt(c.days60) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{c.days90 ? fmt(c.days90) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-red-600">{c.over90 ? fmt(c.over90) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-800">{fmt(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
