'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

type PurchaseOrderRow = {
  id: string
  poNumber: string
  vendor: string
  description: string
  orderDate: string
  expectedDate: string
  totalAmount: number
  receivedAmount: number
  status: 'Draft' | 'Sent' | 'Partially Received' | 'Received' | 'Cancelled' | 'Closed'
}

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-gray-50 text-gray-600 border-gray-200',
  Sent: 'bg-blue-50 text-blue-700 border-blue-200',
  'Partially Received': 'bg-amber-50 text-amber-700 border-amber-200',
  Received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
  Closed: 'bg-slate-50 text-slate-500 border-slate-200',
}

export default function PurchaseOrdersPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<PurchaseOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/purchase-orders`)
      setItems(Array.isArray(data) ? data : data?.items ?? data?.purchaseOrders ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => {
    let list = items
    if (statusFilter !== 'ALL') list = list.filter((p) => p.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        p.poNumber?.toLowerCase().includes(q) ||
        p.vendor?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
    return list
  }, [items, search, statusFilter])

  const totalOpen = useMemo(
    () => items.filter((p) => p.status === 'Sent' || p.status === 'Partially Received').reduce((s, p) => s + (p.totalAmount ?? 0), 0),
    [items]
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
            <p className="text-sm text-slate-500 mt-1">Create and track purchase orders with vendors</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
              New PO
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="px-6 pb-3 flex gap-2 flex-wrap">
          {(['ALL', 'Draft', 'Sent', 'Partially Received', 'Received', 'Cancelled', 'Closed'] as const).map((s) => (
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
                <span className="ml-1 opacity-70">({items.filter((p) => p.status === s).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <input
            placeholder="Search by PO #, vendor, or description"
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
            { label: 'Total POs', value: items.length },
            { label: 'Open', value: items.filter((p) => p.status === 'Sent' || p.status === 'Partially Received').length },
            { label: 'Received', value: items.filter((p) => p.status === 'Received').length },
            { label: 'Open Value', value: formatCurrency(totalOpen, currency), isAmount: true },
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
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading purchase orders…</div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={fetchData} className="text-sm text-indigo-600 hover:underline">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <p className="text-sm">No purchase orders found</p>
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
                    {['PO #', 'Vendor', 'Description', 'Order Date', 'Expected Date', 'Total', 'Received', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => {
                    const pct = row.totalAmount > 0 ? Math.round((row.receivedAmount / row.totalAmount) * 100) : 0
                    return (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="px-4 py-3 font-medium text-slate-800">{row.poNumber}</td>
                        <td className="px-4 py-3 text-slate-700">{row.vendor}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{row.description}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.orderDate}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.expectedDate}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(row.totalAmount, currency)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-emerald-700">{formatCurrency(row.receivedAmount, currency)}</span>
                              <span className="text-xs text-slate-400">{pct}%</span>
                          </div>
                        </td>
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
