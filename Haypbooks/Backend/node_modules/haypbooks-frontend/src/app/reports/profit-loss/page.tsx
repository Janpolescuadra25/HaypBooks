'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Loader2, AlertCircle, Download, ChevronDown, ChevronRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface AccountLine { accountId: string; code: string; name: string; net: number }
interface PnlData { from: string; to: string; revenue: AccountLine[]; totalRevenue: number; expenses: AccountLine[]; totalExpenses: number; netIncome: number }

export default function ProfitLossPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const [data, setData] = useState<PnlData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [from, setFrom] = useState(() => { const d = new Date(); return `${d.getFullYear()}-01-01` })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])
  const [revOpen, setRevOpen] = useState(true)
  const [expOpen, setExpOpen] = useState(true)

  const fetch_ = useCallback(async () => {
    if (!companyId) return; setLoading(true)
    try {
      const { data: d } = await apiClient.get(`/companies/${companyId}/reports/profit-and-loss`, { params: { from, to } })
      setData(d); setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load report') }
    finally { setLoading(false) }
  }, [companyId, from, to])

  useEffect(() => { fetch_() }, [fetch_])

  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  if (cidLoading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-emerald-900">Profit &amp; Loss</h1>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          <span className="text-emerald-400">to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={16} />{error}</div>}
      {loading && <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-emerald-600" /><span className="ml-2 text-sm text-emerald-700">Loading…</span></div>}

      {data && !loading && (
        <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
          {/* Revenue */}
          <button onClick={() => setRevOpen(!revOpen)} className="w-full flex items-center gap-2 px-4 py-3 bg-emerald-50/50 border-b border-emerald-100 text-left">
            {revOpen ? <ChevronDown size={16} className="text-emerald-500" /> : <ChevronRight size={16} className="text-emerald-500" />}
            <span className="font-semibold text-emerald-800">Revenue</span><span className="ml-auto font-bold text-emerald-700 tabular-nums">{fmt(data.totalRevenue)}</span>
          </button>
          {revOpen && (
            <table className="w-full text-sm">
              <tbody>
                {data.revenue.map(a => (
                  <tr key={a.accountId} className="border-t border-emerald-50 hover:bg-emerald-50/30">
                    <td className="px-6 py-2 text-emerald-600">{a.code}</td><td className="px-4 py-2 text-emerald-900">{a.name}</td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium">{fmt(a.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Expenses */}
          <button onClick={() => setExpOpen(!expOpen)} className="w-full flex items-center gap-2 px-4 py-3 bg-emerald-50/50 border-b border-emerald-100 text-left">
            {expOpen ? <ChevronDown size={16} className="text-emerald-500" /> : <ChevronRight size={16} className="text-emerald-500" />}
            <span className="font-semibold text-emerald-800">Expenses</span><span className="ml-auto font-bold text-red-600 tabular-nums">{fmt(data.totalExpenses)}</span>
          </button>
          {expOpen && (
            <table className="w-full text-sm">
              <tbody>
                {data.expenses.map(a => (
                  <tr key={a.accountId} className="border-t border-emerald-50 hover:bg-emerald-50/30">
                    <td className="px-6 py-2 text-emerald-600">{a.code}</td><td className="px-4 py-2 text-emerald-900">{a.name}</td>
                    <td className="px-4 py-2 text-right tabular-nums font-medium">{fmt(a.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Net Income */}
          <div className="px-4 py-4 bg-emerald-50 border-t-2 border-emerald-200 flex justify-between items-center">
            <span className="text-lg font-bold text-emerald-900">Net Income</span>
            <span className={`text-lg font-bold tabular-nums ${data.netIncome >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{fmt(data.netIncome)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
