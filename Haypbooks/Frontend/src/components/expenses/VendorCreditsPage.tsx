'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

type VendorCreditRow = {
  id: string
  creditNumber: string
  vendor: string
  billNumber: string
  date: string
  amount: number
  appliedAmount: number
  remainingCredit: number
  reason: string
  status: 'Open' | 'Applied' | 'Partially Applied' | 'Void'
}

const STATUS_STYLES: Record<string, string> = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  Applied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Partially Applied': 'bg-amber-50 text-amber-700 border-amber-200',
  Void: 'bg-gray-50 text-gray-500 border-gray-200',
}

export default function VendorCreditsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<VendorCreditRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ap/vendor-credits`)
      setItems(Array.isArray(data) ? data : data?.items ?? data?.vendorCredits ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load vendor credits')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => {
    let list = items
    if (statusFilter !== 'ALL') list = list.filter((v) => v.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((v) =>
        v.creditNumber?.toLowerCase().includes(q) ||
        v.vendor?.toLowerCase().includes(q) ||
        v.billNumber?.toLowerCase().includes(q) ||
        v.reason?.toLowerCase().includes(q)
      )
    }
    return list
  }, [items, search, statusFilter])

  const totalAvailable = useMemo(
    () => items.filter((v) => v.status === 'Open' || v.status === 'Partially Applied').reduce((s, v) => s + (v.remainingCredit ?? 0), 0),
    [items]
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendor Credits</h1>
            <p className="text-sm text-slate-500 mt-1">Manage credits received from vendors</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
              New Vendor Credit
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="px-6 pb-3 flex gap-2 flex-wrap">
          {(['ALL', 'Open', 'Partially Applied', 'Applied', 'Void'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
              }`}
            >
              {s === 'ALL' ? 'All' : s}
              {s !== 'ALL' && (
                <span className="ml-1 opacity-70">({items.filter((v) => v.status === s).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <input
            placeholder="Search by credit #, vendor, bill, or reason"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Credits', value: items.length },
            { label: 'Open', value: items.filter((v) => v.status === 'Open').length },
            { label: 'Partially Applied', value: items.filter((v) => v.status === 'Partially Applied').length },
            { label: 'Available Credit', value: formatCurrency(totalAvailable, currency), isAmount: true },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{c.label}</p>
              <p className={`text-xl font-bold mt-1 ${c.isAmount ? 'text-indigo-700' : 'text-slate-900'}`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading || companyLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading vendor credits…</div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={fetchData} className="text-sm text-indigo-600 hover:underline">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <p className="text-sm">No vendor credits found</p>
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-indigo-600 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Credit #', 'Vendor', 'Bill #', 'Date', 'Amount', 'Applied', 'Remaining', 'Reason', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-medium text-slate-800">{row.creditNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{row.vendor}</td>
                      <td className="px-4 py-3 text-slate-600">{row.billNumber}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.date}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(row.amount, currency)}</td>
                      <td className="px-4 py-3 text-emerald-700">{formatCurrency(row.appliedAmount, currency)}</td>
                      <td className="px-4 py-3 font-semibold text-indigo-700">{formatCurrency(row.remainingCredit, currency)}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{row.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[row.status] ?? ''}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
