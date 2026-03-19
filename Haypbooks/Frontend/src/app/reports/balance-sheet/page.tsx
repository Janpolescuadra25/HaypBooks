'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Loader2, AlertCircle, ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface AccountLine { accountId: string; code: string; name: string; balance: number }
interface Section { current: AccountLine[]; nonCurrent: AccountLine[]; total: number }
interface BSData { asOf: string; assets: Section; liabilities: Section; equity: { items: AccountLine[]; total: number }; isBalanced: boolean }

export default function BalanceSheetPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const [data, setData] = useState<BSData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [asOf, setAsOf] = useState(() => new Date().toISOString().split('T')[0])
  const [aOpen, setAOpen] = useState(true)
  const [lOpen, setLOpen] = useState(true)
  const [eOpen, setEOpen] = useState(true)

  const fetch_ = useCallback(async () => {
    if (!companyId) return; setLoading(true)
    try {
      const { data: d } = await apiClient.get(`/companies/${companyId}/reports/balance-sheet`, { params: { asOf } })
      setData(d); setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load report') }
    finally { setLoading(false) }
  }, [companyId, asOf])

  useEffect(() => { fetch_() }, [fetch_])

  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const renderRows = (lines: AccountLine[]) => lines.map(a => (
    <tr key={a.accountId} className="border-t border-emerald-50 hover:bg-emerald-50/30">
      <td className="px-6 py-2 text-emerald-600 text-sm">{a.code}</td><td className="px-4 py-2 text-emerald-900 text-sm">{a.name}</td>
      <td className="px-4 py-2 text-right tabular-nums font-medium text-sm">{fmt(a.balance)}</td>
    </tr>
  ))

  if (cidLoading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-emerald-900">Balance Sheet</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-emerald-600">As of</span>
          <input type="date" value={asOf} onChange={e => setAsOf(e.target.value)} className="px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      </div>

      {data && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${data.isBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {data.isBalanced ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {data.isBalanced ? 'Balance sheet is in balance' : 'Balance sheet is OUT of balance'}
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={16} />{error}</div>}
      {loading && <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-emerald-600" /><span className="ml-2 text-sm text-emerald-700">Loading…</span></div>}

      {data && !loading && (
        <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
          {/* Assets */}
          <button onClick={() => setAOpen(!aOpen)} className="w-full flex items-center gap-2 px-4 py-3 bg-emerald-50/50 border-b border-emerald-100 text-left">
            {aOpen ? <ChevronDown size={16} className="text-emerald-500" /> : <ChevronRight size={16} className="text-emerald-500" />}
            <span className="font-semibold text-emerald-800">Assets</span><span className="ml-auto font-bold text-emerald-700 tabular-nums">{fmt(data.assets.total)}</span>
          </button>
          {aOpen && <table className="w-full">
            <tbody>
              {data.assets.current.length > 0 && <tr><td colSpan={3} className="px-5 py-1.5 text-xs font-semibold text-emerald-500 uppercase tracking-wide bg-emerald-50/30">Current Assets</td></tr>}
              {renderRows(data.assets.current)}
              {data.assets.nonCurrent.length > 0 && <tr><td colSpan={3} className="px-5 py-1.5 text-xs font-semibold text-emerald-500 uppercase tracking-wide bg-emerald-50/30">Non-Current Assets</td></tr>}
              {renderRows(data.assets.nonCurrent)}
            </tbody>
          </table>}

          {/* Liabilities */}
          <button onClick={() => setLOpen(!lOpen)} className="w-full flex items-center gap-2 px-4 py-3 bg-emerald-50/50 border-b border-t border-emerald-100 text-left">
            {lOpen ? <ChevronDown size={16} className="text-emerald-500" /> : <ChevronRight size={16} className="text-emerald-500" />}
            <span className="font-semibold text-emerald-800">Liabilities</span><span className="ml-auto font-bold text-red-600 tabular-nums">{fmt(data.liabilities.total)}</span>
          </button>
          {lOpen && <table className="w-full">
            <tbody>
              {data.liabilities.current.length > 0 && <tr><td colSpan={3} className="px-5 py-1.5 text-xs font-semibold text-emerald-500 uppercase tracking-wide bg-emerald-50/30">Current Liabilities</td></tr>}
              {renderRows(data.liabilities.current)}
              {data.liabilities.nonCurrent.length > 0 && <tr><td colSpan={3} className="px-5 py-1.5 text-xs font-semibold text-emerald-500 uppercase tracking-wide bg-emerald-50/30">Non-Current Liabilities</td></tr>}
              {renderRows(data.liabilities.nonCurrent)}
            </tbody>
          </table>}

          {/* Equity */}
          <button onClick={() => setEOpen(!eOpen)} className="w-full flex items-center gap-2 px-4 py-3 bg-emerald-50/50 border-b border-t border-emerald-100 text-left">
            {eOpen ? <ChevronDown size={16} className="text-emerald-500" /> : <ChevronRight size={16} className="text-emerald-500" />}
            <span className="font-semibold text-emerald-800">Equity</span><span className="ml-auto font-bold text-emerald-700 tabular-nums">{fmt(data.equity.total)}</span>
          </button>
          {eOpen && <table className="w-full"><tbody>{renderRows(data.equity.items)}</tbody></table>}
        </div>
      )}
    </div>
  )
}
