'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Loader2, AlertCircle, X } from 'lucide-react'
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

  const fetchAging = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data: res } = await apiClient.get(`/companies/${companyId}/ar/reports/aging`)
      setData(res)
      setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load aging report') }
    finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchAging() }, [fetchAging])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  if (cidLoading || loading) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading…</span></div>
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  // Support both flat and structured response formats
  const buckets: AgingBucket[] = data?.buckets ?? data?.summary ?? []
  const customers: AgingCustomer[] = data?.customers ?? data?.details ?? []
  const totalOutstanding = data?.total ?? customers.reduce((s: number, c: AgingCustomer) => s + c.total, 0) ?? 0

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900">AR Aging Report</h1>
        <p className="text-sm text-emerald-600/70 mt-0.5">Accounts Receivable aging summary</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error} <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Summary buckets */}
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
      {customers.length > 0 && (
        <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
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
              {customers.map(c => (
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
    </div>
  )
}
