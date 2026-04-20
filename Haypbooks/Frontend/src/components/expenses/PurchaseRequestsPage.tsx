'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, Check, Ban, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface PurchaseRequestRow {
  id: string
  prNumber: string
  requestedBy: string
  vendor: string
  date: string
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED'
  total: number
}

type SortKey = 'prNumber' | 'requestedBy' | 'vendor' | 'date' | 'status' | 'total'

const PR_TABLE_ORDER: SortKey[] = ['prNumber', 'requestedBy', 'vendor', 'date', 'status', 'total']
const DEFAULT_PR_WIDTHS: Record<SortKey, number> = {
  prNumber: 140,
  requestedBy: 170,
  vendor: 210,
  date: 120,
  status: 140,
  total: 140,
}
const PR_COLUMNS_STORAGE_KEY = 'purchase-requests-column-widths-v1'

const SAMPLE_ROWS: PurchaseRequestRow[] = [
  {
    id: 'pr-001',
    prNumber: 'PR-2026-001',
    requestedBy: 'Maria Santos',
    vendor: 'Mabuhay Office Supplies',
    date: '2026-04-03',
    status: 'PENDING',
    total: 25800,
  },
  {
    id: 'pr-002',
    prNumber: 'PR-2026-002',
    requestedBy: 'Juan Dela Cruz',
    vendor: 'Luzon Steel Trading',
    date: '2026-04-09',
    status: 'DRAFT',
    total: 48200,
  },
  {
    id: 'pr-003',
    prNumber: 'PR-2026-003',
    requestedBy: 'Alyssa Reyes',
    vendor: 'Cebu Industrial Parts',
    date: '2026-04-12',
    status: 'APPROVED',
    total: 31950,
  },
]

function loadPrWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(PR_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_PR_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_PR_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => PR_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_PR_WIDTHS
  }
}

function compareRows(a: PurchaseRequestRow, b: PurchaseRequestRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''

  if (key === 'total') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }

  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function PurchaseRequestsPage() {
  const toast = useToast()
  const { currency } = useCompanyCurrency()

  const [rows, setRows] = useState<PurchaseRequestRow[]>(SAMPLE_ROWS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadPrWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(PR_COLUMNS_STORAGE_KEY, JSON.stringify(next))
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
        row.prNumber.toLowerCase().includes(q) ||
        row.requestedBy.toLowerCase().includes(q) ||
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

  const handleApprove = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'APPROVED' } : row))
    toast.success('Purchase request approved')
  }, [toast])

  const handleReject = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'REJECTED' } : row))
    toast.success('Purchase request rejected')
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
        accessorKey: 'prNumber',
        header: makeHeader('PR #', 'prNumber', widths.prNumber),
        meta: { align: 'left', style: { width: widths.prNumber, minWidth: widths.prNumber, maxWidth: widths.prNumber } },
      },
      {
        accessorKey: 'requestedBy',
        header: makeHeader('Requested By', 'requestedBy', widths.requestedBy),
        meta: { align: 'left', style: { width: widths.requestedBy, minWidth: widths.requestedBy, maxWidth: widths.requestedBy } },
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
        meta: { align: 'right', style: { width: 124, minWidth: 124, maxWidth: 124 } },
        cell: ({ row }) => {
          const item = row.original as PurchaseRequestRow
          const canReview = item.status === 'DRAFT' || item.status === 'PENDING'

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => toast.info('Coming soon')}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                data-no-row-toggle
                title="View purchase request"
              >
                <Eye size={14} />
              </button>
              {canReview && (
                <button
                  type="button"
                  onClick={() => handleApprove(item.id)}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                  data-no-row-toggle
                  title="Approve purchase request"
                >
                  <Check size={14} />
                </button>
              )}
              {canReview && (
                <button
                  type="button"
                  onClick={() => handleReject(item.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                  data-no-row-toggle
                  title="Reject purchase request"
                >
                  <Ban size={14} />
                </button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleApprove, handleReject, saveWidths, sortDir, sortKey, toast, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Purchase Requests"
      subtitle={`${sorted.length} requests`}
      primaryActionLabel="New Purchase Request"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
              placeholder="Search purchase requests..."
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }}
            aria-label="Filter purchase requests by status"
            className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ORDERED">Ordered</option>
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
      emptyTitle="No purchase requests found"
      emptyDescription="Try a different search or create a new purchase request."
      emptyPrimaryAction="New Purchase Request"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
