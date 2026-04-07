'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

type RecognitionRow = {
  id: string
  contractId: string
  customer: string
  description: string
  totalContractValue: number
  recognizedToDate: number
  remaining: number
  startDate: string
  endDate: string
  method: 'Straight-Line' | 'Milestone' | 'Percentage of Completion' | 'Event-Based'
  status: 'Active' | 'Completed' | 'On Hold'
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  'On Hold': 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function RevenueRecognitionPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<RecognitionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/revenue-recognition`)
      setItems(Array.isArray(data) ? data : data?.items ?? data?.contracts ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load revenue recognition data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => {
    let list = items
    if (statusFilter !== 'ALL') list = list.filter((r) => r.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) =>
        r.contractId?.toLowerCase().includes(q) ||
        r.customer?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      )
    }
    return list
  }, [items, search, statusFilter])

  const totalRecognized = useMemo(() => filtered.reduce((s, r) => s + (r.recognizedToDate ?? 0), 0), [filtered])
  const totalRemaining = useMemo(() => filtered.reduce((s, r) => s + (r.remaining ?? 0), 0), [filtered])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Revenue Recognition</h1>
            <p className="text-sm text-slate-500 mt-1">Manage revenue recognition schedules (ASC 606 / IFRS 15)</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm">
              Run Recognition
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">
              New Contract
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="px-6 pb-3 flex gap-2 flex-wrap">
          {(['ALL', 'Active', 'Completed', 'On Hold'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
              }`}
            >
              {s === 'ALL' ? 'All' : s}
              {s !== 'ALL' && (
                <span className="ml-1 opacity-70">({items.filter((r) => r.status === s).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <input
            placeholder="Search by contract ID, customer, or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Contracts', value: items.filter((r) => r.status === 'Active').length },
            { label: 'Completed', value: items.filter((r) => r.status === 'Completed').length },
            { label: 'Recognized to Date', value: formatCurrency(totalRecognized, currency), isAmount: true },
            { label: 'Remaining', value: formatCurrency(totalRemaining, currency), isAmount: true },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.isAmount ? 'text-emerald-700' : 'text-slate-900'}`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading || companyLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Loading revenue recognition data…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={fetchData} className="text-sm text-emerald-600 hover:underline">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <p className="text-sm">No contracts found</p>
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-emerald-600 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Contract ID', 'Customer', 'Description', 'Method', 'Total Value', 'Recognized', 'Remaining', 'Period', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => {
                    const pct = row.totalContractValue > 0
                      ? Math.round((row.recognizedToDate / row.totalContractValue) * 100)
                      : 0
                    return (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="px-4 py-3 font-medium text-slate-800">{row.contractId}</td>
                        <td className="px-4 py-3 text-slate-700">{row.customer}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{row.description}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.method}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(row.totalContractValue, currency)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-emerald-700">{formatCurrency(row.recognizedToDate, currency)}</span>
                            <span className="text-xs text-slate-400">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatCurrency(row.remaining, currency)}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{row.startDate} – {row.endDate}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[row.status] ?? ''}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
