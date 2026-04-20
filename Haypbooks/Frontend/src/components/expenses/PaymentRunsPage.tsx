'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, Check, Ban, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface PaymentRunRow {
  id: string
  paymentRunNumber: string
  paymentDate: string
  paymentMethod: string
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  vendorCount: number
  totalAmount: number
}

type SortKey = 'paymentRunNumber' | 'paymentDate' | 'paymentMethod' | 'status' | 'vendorCount' | 'totalAmount'

const RUN_TABLE_ORDER: SortKey[] = ['paymentRunNumber', 'paymentDate', 'paymentMethod', 'status', 'vendorCount', 'totalAmount']
const DEFAULT_RUN_WIDTHS: Record<SortKey, number> = {
  paymentRunNumber: 140,
  paymentDate: 120,
  paymentMethod: 145,
  status: 130,
  vendorCount: 120,
  totalAmount: 150,
}
const PAYMENT_RUN_COLUMNS_STORAGE_KEY = 'payment-runs-column-widths-v1'

const SAMPLE_ROWS: PaymentRunRow[] = [
  {
    id: 'run-001',
    paymentRunNumber: 'RUN-2026-001',
    paymentDate: '2026-04-18',
    paymentMethod: 'Bank Transfer',
    status: 'DRAFT',
    vendorCount: 12,
    totalAmount: 185240,
  },
  {
    id: 'run-002',
    paymentRunNumber: 'RUN-2026-002',
    paymentDate: '2026-04-16',
    paymentMethod: 'Check',
    status: 'PROCESSING',
    vendorCount: 6,
    totalAmount: 94680,
  },
  {
    id: 'run-003',
    paymentRunNumber: 'RUN-2026-003',
    paymentDate: '2026-04-10',
    paymentMethod: 'Bank Transfer',
    status: 'COMPLETED',
    vendorCount: 9,
    totalAmount: 133500,
  },
]

function loadRunWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(PAYMENT_RUN_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_RUN_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_RUN_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => RUN_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_RUN_WIDTHS
  }
}

function compareRows(a: PaymentRunRow, b: PaymentRunRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''

  if (key === 'vendorCount' || key === 'totalAmount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }

  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function PaymentRunsPage() {
  const toast = useToast()
  const { currency } = useCompanyCurrency()

  const [rows, setRows] = useState<PaymentRunRow[]>(SAMPLE_ROWS)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('paymentDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadRunWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(PAYMENT_RUN_COLUMNS_STORAGE_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((row) =>
      row.paymentRunNumber.toLowerCase().includes(q) ||
      row.paymentMethod.toLowerCase().includes(q),
    )
  }, [rows, search])

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

  const handleProcess = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'PROCESSING' } : row))
    toast.success('Payment run started')
  }, [toast])

  const handleCancel = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'CANCELLED' } : row))
    toast.success('Payment run cancelled')
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
        accessorKey: 'paymentRunNumber',
        header: makeHeader('Payment Run #', 'paymentRunNumber', widths.paymentRunNumber),
        meta: { align: 'left', style: { width: widths.paymentRunNumber, minWidth: widths.paymentRunNumber, maxWidth: widths.paymentRunNumber } },
      },
      {
        accessorKey: 'paymentDate',
        header: makeHeader('Payment Date', 'paymentDate', widths.paymentDate),
        meta: { align: 'left', style: { width: widths.paymentDate, minWidth: widths.paymentDate, maxWidth: widths.paymentDate } },
      },
      {
        accessorKey: 'paymentMethod',
        header: makeHeader('Payment Method', 'paymentMethod', widths.paymentMethod),
        meta: { align: 'left', style: { width: widths.paymentMethod, minWidth: widths.paymentMethod, maxWidth: widths.paymentMethod } },
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', widths.status),
        meta: { align: 'left', style: { width: widths.status, minWidth: widths.status, maxWidth: widths.status } },
        cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'DRAFT')} domain="generic" />,
      },
      {
        accessorKey: 'vendorCount',
        header: makeHeader('Vendor Count', 'vendorCount', widths.vendorCount),
        meta: { align: 'right', style: { width: widths.vendorCount, minWidth: widths.vendorCount, maxWidth: widths.vendorCount } },
        cell: ({ getValue }) => <span className="tabular-nums">{Number(getValue() ?? 0)}</span>,
      },
      {
        accessorKey: 'totalAmount',
        header: makeHeader('Total Amount', 'totalAmount', widths.totalAmount),
        meta: { align: 'right', style: { width: widths.totalAmount, minWidth: widths.totalAmount, maxWidth: widths.totalAmount } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 112, minWidth: 112, maxWidth: 112 } },
        cell: ({ row }) => {
          const item = row.original as PaymentRunRow
          const canDraftAction = item.status === 'DRAFT'

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => toast.info('Coming soon')}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                data-no-row-toggle
                title="View payment run"
              >
                <Eye size={14} />
              </button>
              {canDraftAction && (
                <button
                  type="button"
                  onClick={() => handleProcess(item.id)}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                  data-no-row-toggle
                  title="Process payment run"
                >
                  <Check size={14} />
                </button>
              )}
              {canDraftAction && (
                <button
                  type="button"
                  onClick={() => handleCancel(item.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                  data-no-row-toggle
                  title="Cancel payment run"
                >
                  <Ban size={14} />
                </button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleCancel, handleProcess, saveWidths, sortDir, sortKey, toast, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Payment Runs"
      subtitle={`${sorted.length} payment runs`}
      filters={(
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
            placeholder="Search payment runs..."
            className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
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
      emptyTitle="No payment runs found"
      emptyDescription="Payment runs are generated from selected bills."
    />
  )
}
