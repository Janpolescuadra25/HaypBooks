'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'

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

const PURCHASE_ORDERS_COL_WIDTHS_KEY = 'purchase-orders-cols-v1'
const defaultPurchaseOrdersColWidths = {
  poNumber: 140,
  vendor: 200,
  description: 240,
  orderDate: 120,
  expectedDate: 130,
  totalAmount: 120,
  receivedAmount: 140,
  status: 140,
}

export default function PurchaseOrdersPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<PurchaseOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [colWidths, setColWidths] = useState<typeof defaultPurchaseOrdersColWidths>(() => {
    if (typeof window === 'undefined') return defaultPurchaseOrdersColWidths
    try {
      return {
        ...defaultPurchaseOrdersColWidths,
        ...JSON.parse(localStorage.getItem(PURCHASE_ORDERS_COL_WIDTHS_KEY) ?? '{}'),
      }
    } catch {
      return defaultPurchaseOrdersColWidths
    }
  })
  const colWidthsRef = useRef(colWidths)
  useEffect(() => { colWidthsRef.current = colWidths }, [colWidths])
  const saveColWidths = useCallback((next: typeof defaultPurchaseOrdersColWidths) => {
    setColWidths(next)
    try { localStorage.setItem(PURCHASE_ORDERS_COL_WIDTHS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])
  const { containerRef: poTableRef, startResize: startPOResize, isOverflowing: poTableOverflowing } = useFixedWidthResizableMap({
    widths: colWidths,
    widthsRef: colWidthsRef,
    order: ['poNumber', 'vendor', 'description', 'orderDate', 'expectedDate', 'totalAmount', 'receivedAmount', 'status'],
    saveWidths: saveColWidths,
    minWidth: {
      poNumber: 110,
      vendor: 130,
      description: 160,
      orderDate: 100,
      expectedDate: 100,
      totalAmount: 100,
      receivedAmount: 110,
      status: 110,
    },
  })

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
            <div ref={poTableRef} className={poTableOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}>
              <table className="w-full min-w-[980px] table-fixed text-sm">
                <colgroup>
                  <col style={{ width: colWidths.poNumber }} />
                  <col style={{ width: colWidths.vendor }} />
                  <col style={{ width: colWidths.description }} />
                  <col style={{ width: colWidths.orderDate }} />
                  <col style={{ width: colWidths.expectedDate }} />
                  <col style={{ width: colWidths.totalAmount }} />
                  <col style={{ width: colWidths.receivedAmount }} />
                  <col style={{ width: colWidths.status }} />
                </colgroup>
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide truncate" style={{ width: colWidths.poNumber, minWidth: colWidths.poNumber, maxWidth: colWidths.poNumber }} title="PO #">
                      PO #
                      <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startPOResize(e, 'poNumber')} />
                    </th>
                    <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide truncate" style={{ width: colWidths.vendor, minWidth: colWidths.vendor, maxWidth: colWidths.vendor }} title="Vendor">
                      Vendor
                      <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startPOResize(e, 'vendor')} />
                    </th>
                    <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide truncate" style={{ width: colWidths.description, minWidth: colWidths.description, maxWidth: colWidths.description }} title="Description">
                      Description
                      <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startPOResize(e, 'description')} />
                    </th>
                    <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide truncate" style={{ width: colWidths.orderDate, minWidth: colWidths.orderDate, maxWidth: colWidths.orderDate }} title="Order Date">
                      Order Date
                      <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startPOResize(e, 'orderDate')} />
                    </th>
                    <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide truncate" style={{ width: colWidths.expectedDate, minWidth: colWidths.expectedDate, maxWidth: colWidths.expectedDate }} title="Expected Date">
                      Expected Date
                      <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startPOResize(e, 'expectedDate')} />
                    </th>
                    <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide truncate" style={{ width: colWidths.totalAmount, minWidth: colWidths.totalAmount, maxWidth: colWidths.totalAmount }} title="Total">
                      Total
                      <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startPOResize(e, 'totalAmount')} />
                    </th>
                    <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide truncate" style={{ width: colWidths.receivedAmount, minWidth: colWidths.receivedAmount, maxWidth: colWidths.receivedAmount }} title="Received">
                      Received
                      <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startPOResize(e, 'receivedAmount')} />
                    </th>
                    <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide truncate" style={{ width: colWidths.status, minWidth: colWidths.status, maxWidth: colWidths.status }} title="Status">
                      Status
                      <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startPOResize(e, 'status')} />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => {
                    const pct = row.totalAmount > 0 ? Math.round((row.receivedAmount / row.totalAmount) * 100) : 0
                    return (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="px-4 py-3 font-medium text-slate-800 truncate" style={{ width: colWidths.poNumber, minWidth: colWidths.poNumber, maxWidth: colWidths.poNumber }} title={row.poNumber}>{row.poNumber}</td>
                        <td className="px-4 py-3 text-slate-700 truncate" style={{ width: colWidths.vendor, minWidth: colWidths.vendor, maxWidth: colWidths.vendor }} title={row.vendor}>{row.vendor}</td>
                        <td className="px-4 py-3 text-slate-600 truncate" style={{ width: colWidths.description, minWidth: colWidths.description, maxWidth: colWidths.description }} title={row.description}>{row.description}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap" style={{ width: colWidths.orderDate, minWidth: colWidths.orderDate, maxWidth: colWidths.orderDate }}>{row.orderDate}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap" style={{ width: colWidths.expectedDate, minWidth: colWidths.expectedDate, maxWidth: colWidths.expectedDate }}>{row.expectedDate}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800" style={{ width: colWidths.totalAmount, minWidth: colWidths.totalAmount, maxWidth: colWidths.totalAmount }}>{formatCurrency(row.totalAmount, currency)}</td>
                        <td className="px-4 py-3" style={{ width: colWidths.receivedAmount, minWidth: colWidths.receivedAmount, maxWidth: colWidths.receivedAmount }}>
                          <div className="flex flex-col gap-1">
                            <span className="text-emerald-700">{formatCurrency(row.receivedAmount, currency)}</span>
                              <span className="text-xs text-slate-400">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ width: colWidths.status, minWidth: colWidths.status, maxWidth: colWidths.status }}>
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
