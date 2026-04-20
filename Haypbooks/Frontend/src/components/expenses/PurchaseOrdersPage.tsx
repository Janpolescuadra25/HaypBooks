'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, Edit2, Check, Ban, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface PurchaseOrderRow {
  id: string
  poNumber: string
  vendor: string
  date: string
  expectedDelivery: string
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED'
  total: number
}

type SortKey = 'poNumber' | 'vendor' | 'date' | 'expectedDelivery' | 'status' | 'total'

const PO_TABLE_ORDER: SortKey[] = ['poNumber', 'vendor', 'date', 'expectedDelivery', 'status', 'total']
const DEFAULT_PO_WIDTHS: Record<SortKey, number> = {
  poNumber: 135,
  vendor: 210,
  date: 120,
  expectedDelivery: 145,
  status: 135,
  total: 140,
}
const PO_COLUMNS_STORAGE_KEY = 'purchase-orders-column-widths-v1'

const SAMPLE_ROWS: PurchaseOrderRow[] = [
  {
    id: 'po-001',
    poNumber: 'PO-2026-001',
    vendor: 'Mabuhay Office Supplies',
    date: '2026-04-05',
    expectedDelivery: '2026-04-22',
    status: 'SENT',
    total: 36250,
  },
  {
    id: 'po-002',
    poNumber: 'PO-2026-002',
    vendor: 'Luzon Steel Trading',
    date: '2026-04-08',
    expectedDelivery: '2026-04-24',
    status: 'CONFIRMED',
    total: 58900,
  },
  {
    id: 'po-003',
    poNumber: 'PO-2026-003',
    vendor: 'Visayas Packaging Solutions',
    date: '2026-04-10',
    expectedDelivery: '2026-04-28',
    status: 'DRAFT',
    total: 12750,
  },
  {
    id: 'po-004',
    poNumber: 'PO-2026-004',
    vendor: 'Cebu Industrial Parts',
    date: '2026-04-02',
    expectedDelivery: '2026-04-18',
    status: 'RECEIVED',
    total: 80400,
  },
]

function loadPoWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(PO_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_PO_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_PO_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => PO_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_PO_WIDTHS
  }
}

function compareRows(a: PurchaseOrderRow, b: PurchaseOrderRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''

  if (key === 'total') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }

  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function PurchaseOrdersPage() {
  const toast = useToast()
  const { currency } = useCompanyCurrency()

  const [rows, setRows] = useState<PurchaseOrderRow[]>(SAMPLE_ROWS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadPoWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(PO_COLUMNS_STORAGE_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const filtered = useMemo(() => {
    let list = rows

    if (statusFilter !== 'ALL') {
      list = list.filter((row) => row.status === statusFilter)
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter((row) =>
        row.poNumber.toLowerCase().includes(q) ||
        row.vendor.toLowerCase().includes(q),
      )
    }

    return list
  }, [rows, search, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => compareRows(a, b, sortKey, sortDir))
  }, [filtered, sortDir, sortKey])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, pageSize, sorted.length])

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [currentPage, pageSize, sorted])

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
  }

  const handleReceive = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'RECEIVED' } : row))
    toast.success('Purchase order marked as received')
  }, [toast])

  const handleCancel = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'CANCELLED' } : row))
    toast.success('Purchase order cancelled')
  }, [toast])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const columns = useMemo(() => {
    const makeHeader = (label: string, key: SortKey, width: number) => (
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className="inline-flex items-center gap-2 text-left font-medium text-slate-800 hover:text-slate-900"
        >
          {label}
          {sortKey === key
            ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
            : <ArrowUpDown size={12} className="opacity-40" />}
        </button>
        <ColumnResizer colKey={key} width={width} onChange={(_, next) => saveWidths({ ...widths, [key]: next })} min={80} />
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
        accessorKey: 'date',
        header: makeHeader('Date', 'date', widths.date),
        meta: { align: 'left', style: { width: widths.date, minWidth: widths.date, maxWidth: widths.date } },
      },
      {
        accessorKey: 'expectedDelivery',
        header: makeHeader('Expected Delivery', 'expectedDelivery', widths.expectedDelivery),
        meta: { align: 'left', style: { width: widths.expectedDelivery, minWidth: widths.expectedDelivery, maxWidth: widths.expectedDelivery } },
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', widths.status),
        meta: { align: 'left', style: { width: widths.status, minWidth: widths.status, maxWidth: widths.status } },
        cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'DRAFT')} domain="generic" />,
      },
      {
        accessorKey: 'total',
        header: makeHeader('Total', 'total', widths.total),
        meta: { align: 'right', style: { width: widths.total, minWidth: widths.total, maxWidth: widths.total } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 144, minWidth: 144, maxWidth: 144 } },
        cell: ({ row }) => {
          const item = row.original as PurchaseOrderRow
          const canReceive = item.status === 'CONFIRMED'
          const canCancel = item.status === 'DRAFT' || item.status === 'SENT'

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => toast.info('Coming soon')}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                data-no-row-toggle
                title="View purchase order"
              >
                <Eye size={14} />
              </button>
              <button
                type="button"
                onClick={() => toast.info('Coming soon')}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                data-no-row-toggle
                title="Edit purchase order"
              >
                <Edit2 size={14} />
              </button>
              {canReceive && (
                <button
                  type="button"
                  onClick={() => handleReceive(item.id)}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                  data-no-row-toggle
                  title="Receive purchase order"
                >
                  <Check size={14} />
                </button>
              )}
              {canCancel && (
                <button
                  type="button"
                  onClick={() => handleCancel(item.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                  data-no-row-toggle
                  title="Cancel purchase order"
                >
                  <Ban size={14} />
                </button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleCancel, handleReceive, saveWidths, sortDir, sortKey, toast, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Purchase Orders"
      subtitle={`${sorted.length} purchase orders`}
      primaryActionLabel="New Purchase Order"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
              placeholder="Search purchase orders..."
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }}
            aria-label="Filter purchase orders by status"
            className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      )}
      columns={columns}
      data={paged}
      isLoading={false}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={sorted.length}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      getRowId={(row) => row.id}
      emptyTitle="No purchase orders found"
      emptyDescription="Try a different search or create a purchase order."
      emptyPrimaryAction="New Purchase Order"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
