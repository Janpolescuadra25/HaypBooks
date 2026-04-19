'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import DataPage from '@/components/shared/DataPage'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'
import ColumnResizer from '@/components/ColumnResizer'

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

type SortKey = 'poNumber' | 'vendor' | 'description' | 'orderDate' | 'expectedDate' | 'totalAmount' | 'receivedAmount' | 'status'

const PO_TABLE_ORDER: SortKey[] = ['poNumber', 'vendor', 'description', 'orderDate', 'expectedDate', 'totalAmount', 'receivedAmount', 'status']
const DEFAULT_PO_COL_WIDTHS: Record<SortKey, number> = {
  poNumber: 140,
  vendor: 200,
  description: 240,
  orderDate: 120,
  expectedDate: 130,
  totalAmount: 120,
  receivedAmount: 140,
  status: 140,
}
const PO_COLUMNS_STORAGE_KEY = 'purchase-orders-cols-v1'

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-gray-50 text-gray-600 border-gray-200',
  Sent: 'bg-blue-50 text-blue-700 border-blue-200',
  'Partially Received': 'bg-amber-50 text-amber-700 border-amber-200',
  Received: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
  Closed: 'bg-slate-50 text-slate-500 border-slate-200',
}

function loadPOWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(PO_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_PO_COL_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return { ...DEFAULT_PO_COL_WIDTHS, ...Object.fromEntries(Object.entries(parsed).filter(([key]) => PO_TABLE_ORDER.includes(key as SortKey))) }
  } catch {
    return DEFAULT_PO_COL_WIDTHS
  }
}

function comparePOs(a: PurchaseOrderRow, b: PurchaseOrderRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''
  if (key === 'totalAmount' || key === 'receivedAmount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }
  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<PurchaseOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('orderDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadPOWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const widthsRef = useRef(widths)

  useEffect(() => { widthsRef.current = widths }, [widths])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try { localStorage.setItem(PO_COLUMNS_STORAGE_KEY, JSON.stringify(next)) } catch { }
  }, [])

  const { containerRef } = useFixedWidthResizableMap({
    widths,
    widthsRef,
    order: PO_TABLE_ORDER,
    saveWidths,
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
        p.poNumber.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [items, search, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => comparePOs(a, b, sortKey, sortDir))
  }, [filtered, sortKey, sortDir])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, pageSize, sorted.length])

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
  }

  const columns = useMemo(() => {
    const makeHeader = (label: string, key: SortKey, width: number) => (
      <div className="relative flex items-center gap-2">
        <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-2 text-left font-medium text-slate-800 hover:text-slate-900">
          {label}
          {sortKey === key ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
        </button>
        <ColumnResizer colKey={key} width={width} onChange={(_, next) => setWidths((prev) => ({ ...prev, [key]: next }))} min={80} />
      </div>
    )

    return [
      {
        accessorKey: 'poNumber',
        header: makeHeader('PO #', 'poNumber', widths.poNumber),
        meta: { align: 'left', style: { width: widths.poNumber, minWidth: widths.poNumber, maxWidth: widths.poNumber } },
      },
      {
        accessorKey: 'vendor',
        header: makeHeader('Vendor', 'vendor', widths.vendor),
        meta: { align: 'left', style: { width: widths.vendor, minWidth: widths.vendor, maxWidth: widths.vendor } },
      },
      {
        accessorKey: 'description',
        header: makeHeader('Description', 'description', widths.description),
        meta: { align: 'left', style: { width: widths.description, minWidth: widths.description, maxWidth: widths.description } },
      },
      {
        accessorKey: 'orderDate',
        header: makeHeader('Order Date', 'orderDate', widths.orderDate),
        meta: { align: 'left', style: { width: widths.orderDate, minWidth: widths.orderDate, maxWidth: widths.orderDate } },
        cell: ({ getValue }) => <span>{fmtDate(String(getValue() ?? ''))}</span>,
      },
      {
        accessorKey: 'expectedDate',
        header: makeHeader('Expected Date', 'expectedDate', widths.expectedDate),
        meta: { align: 'left', style: { width: widths.expectedDate, minWidth: widths.expectedDate, maxWidth: widths.expectedDate } },
      },
      {
        accessorKey: 'totalAmount',
        header: makeHeader('Total', 'totalAmount', widths.totalAmount),
        meta: { align: 'right', style: { width: widths.totalAmount, minWidth: widths.totalAmount, maxWidth: widths.totalAmount } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'receivedAmount',
        header: makeHeader('Received', 'receivedAmount', widths.receivedAmount),
        meta: { align: 'right', style: { width: widths.receivedAmount, minWidth: widths.receivedAmount, maxWidth: widths.receivedAmount } },
        cell: ({ getValue }) => <span className="font-semibold text-indigo-700 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', widths.status),
        meta: { align: 'left', style: { width: widths.status, minWidth: widths.status, maxWidth: widths.status } },
        cell: ({ getValue }) => <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${STATUS_STYLES[String(getValue() ?? '')] ?? ''}`}>{String(getValue() ?? '')}</span>,
      },
    ]
  }, [fmt, sortKey, sortDir, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const totalOpen = useMemo(
    () => items.filter((p) => p.status === 'Sent' || p.status === 'Partially Received').reduce((s, p) => s + (p.totalAmount ?? 0), 0),
    [items],
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
            <p className="text-sm text-slate-500 mt-1">Create and track purchase orders with vendors</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/expenses/purchasing/orders/activity')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm"
            >
              <Clock size={15} /> Activity Log
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
              New PO
            </button>
          </div>
        </div>

        <div className="px-6 pb-3 flex gap-2 flex-wrap">
          {(['ALL', 'Draft', 'Sent', 'Partially Received', 'Received', 'Cancelled', 'Closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1) }}
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

        <div className="px-6 pb-4">
          <input
            placeholder="Search by PO #, vendor, or description"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 px-6 py-6">
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

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DataPage
            title="Purchase Orders"
            subtitle={`${sorted.length} purchase orders`}
            primaryActionLabel="New PO"
            onPrimaryAction={() => {}}
            secondaryActions={
              <button
                type="button"
                onClick={() => router.push('/expenses/purchasing/orders/activity')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Clock size={15} /> Activity Log
              </button>
            }
            filters={(
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                    placeholder="Search purchase orders…"
                    className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                  className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="ALL">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Partially Received">Partially Received</option>
                  <option value="Received">Received</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            )}
            columns={columns}
            data={paged}
            isLoading={loading || companyLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={sorted.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
            selectedIds={[]}
            onSelectionChange={() => {}}
            getRowId={(row) => row.id}
            emptyTitle="No purchase orders found"
            emptyDescription="Try a different search or create a new PO."
            emptyPrimaryAction="New PO"
            onEmptyPrimaryAction={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
