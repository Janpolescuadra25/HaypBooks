'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Loader2, AlertCircle, DollarSign } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface AgingBucket { current: number; days1to30: number; days31to60: number; days61to90: number; over90: number; total: number }
interface VendorAging { vendorId: string; vendorName: string; current: number; days1to30: number; days31to60: number; days61to90: number; over90: number; total: number }

export default function ApAgingPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [summary, setSummary] = useState<AgingBucket>({ current: 0, days1to30: 0, days31to60: 0, days61to90: 0, over90: 0, total: 0 })
  const [vendors, setVendors] = useState<VendorAging[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAging = useCallback(async () => {
    if (!companyId) return; setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ap/reports/aging`)
      if (data.summary) setSummary(data.summary)
      else setSummary({ current: data.current ?? 0, days1to30: data.days1to30 ?? 0, days31to60: data.days31to60 ?? 0, days61to90: data.days61to90 ?? 0, over90: data.over90 ?? 0, total: data.total ?? 0 })
      setVendors(data.vendors ?? data.details ?? data.items ?? [])
      setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load aging report') }
    finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchAging() }, [fetchAging])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  if (cidLoading || loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading…</span></div>
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  const buckets = [
    { label: 'Current', value: summary.current, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { label: '1-30 Days', value: summary.days1to30, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: '31-60 Days', value: summary.days31to60, color: 'text-orange-700 bg-orange-50 border-orange-200' },
    { label: '61-90 Days', value: summary.days61to90, color: 'text-red-600 bg-red-50 border-red-200' },
    { label: '90+ Days', value: summary.over90, color: 'text-red-800 bg-red-100 border-red-300' },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div><h1 className="text-2xl font-bold text-emerald-900">AP Aging Summary</h1><p className="text-sm text-emerald-600/70 mt-0.5">Total Outstanding: {fmt(summary.total)}</p></div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={16} /> {error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {buckets.map(b => (
          <div key={b.label} className={`rounded-xl border p-4 ${b.color}`}>
            <p className="text-xs font-medium opacity-80">{b.label}</p>
            <p className="text-lg font-bold mt-1">{fmt(b.value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50/50 border-b border-emerald-100">
            <th className="text-left px-4 py-3 font-medium text-emerald-700">Vendor</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700">Current</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700">1-30</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700">31-60</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700">61-90</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700">90+</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700">Total</th>
          </tr></thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-emerald-400"><DollarSign size={24} className="mx-auto mb-2 opacity-50" />No aging data available.</td></tr>
            ) : vendors.map(v => (
              <tr key={v.vendorId} className="border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                <td className="px-4 py-2.5 font-medium text-emerald-900">{v.vendorName}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmt(v.current)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmt(v.days1to30)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmt(v.days31to60)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmt(v.days61to90)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{fmt(v.over90)}</td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-emerald-800">{fmt(v.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
