'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, Check, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface PerDiemRow {
  id: string
  perDiemNumber: string
  employee: string
  destination: string
  startDate: string
  endDate: string
  days: number
  dailyRate: number
  totalAmount: number
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
}

type SortKey = 'perDiemNumber' | 'employee' | 'destination' | 'startDate' | 'endDate' | 'days' | 'dailyRate' | 'totalAmount' | 'status'

const PER_DIEM_TABLE_ORDER: SortKey[] = ['perDiemNumber', 'employee', 'destination', 'startDate', 'endDate', 'days', 'dailyRate', 'totalAmount', 'status']
const DEFAULT_PER_DIEM_WIDTHS: Record<SortKey, number> = {
  perDiemNumber: 135,
  employee: 160,
  destination: 180,
  startDate: 120,
  endDate: 120,
  days: 80,
  dailyRate: 110,
  totalAmount: 130,
  status: 120,
}
const PER_DIEM_COLUMNS_STORAGE_KEY = 'per-diem-column-widths-v1'

const SAMPLE_ROWS: PerDiemRow[] = [
  {
    id: 'pd-001',
    perDiemNumber: 'PD-2026-001',
    employee: 'Patricia Mendoza',
    destination: 'Cebu City',
    startDate: '2026-04-20',
    endDate: '2026-04-22',
    days: 3,
    dailyRate: 1500,
    totalAmount: 4500,
    status: 'SUBMITTED',
  },
  {
    id: 'pd-002',
    perDiemNumber: 'PD-2026-002',
    employee: 'Jerome Villanueva',
    destination: 'Baguio City',
    startDate: '2026-04-24',
    endDate: '2026-04-25',
    days: 2,
    dailyRate: 1500,
    totalAmount: 3000,
    status: 'DRAFT',
  },
  {
    id: 'pd-003',
    perDiemNumber: 'PD-2026-003',
    employee: 'Miguel Aquino',
    destination: 'Davao City',
    startDate: '2026-04-15',
    endDate: '2026-04-17',
    days: 3,
    dailyRate: 1800,
    totalAmount: 5400,
    status: 'APPROVED',
  },
]

function loadPerDiemWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(PER_DIEM_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_PER_DIEM_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_PER_DIEM_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => PER_DIEM_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_PER_DIEM_WIDTHS
  }
}

function compareRows(a: PerDiemRow, b: PerDiemRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''

  if (key === 'days' || key === 'dailyRate' || key === 'totalAmount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }

  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function PerDiemPage() {
  const toast = useToast()
  const { currency } = useCompanyCurrency()

  const [rows, setRows] = useState<PerDiemRow[]>(SAMPLE_ROWS)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('startDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadPerDiemWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(PER_DIEM_COLUMNS_STORAGE_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((row) =>
      row.perDiemNumber.toLowerCase().includes(q) ||
      row.employee.toLowerCase().includes(q) ||
      row.destination.toLowerCase().includes(q),
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

  const handleSubmit = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'SUBMITTED' } : row))
    toast.success('Per diem request submitted')
  }, [toast])

  const handleApprove = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'APPROVED' } : row))
    toast.success('Per diem request approved')
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
        accessorKey: 'perDiemNumber',
        header: makeHeader('Per Diem #', 'perDiemNumber', widths.perDiemNumber),
        meta: { align: 'left', style: { width: widths.perDiemNumber, minWidth: widths.perDiemNumber, maxWidth: widths.perDiemNumber } },
      },
      {
        accessorKey: 'employee',
        header: makeHeader('Employee', 'employee', widths.employee),
        meta: { align: 'left', style: { width: widths.employee, minWidth: widths.employee, maxWidth: widths.employee } },
      },
      {
        accessorKey: 'destination',
        header: makeHeader('Destination', 'destination', widths.destination),
        meta: { align: 'left', style: { width: widths.destination, minWidth: widths.destination, maxWidth: widths.destination } },
      },
      {
        accessorKey: 'startDate',
        header: makeHeader('Start Date', 'startDate', widths.startDate),
        meta: { align: 'left', style: { width: widths.startDate, minWidth: widths.startDate, maxWidth: widths.startDate } },
      },
      {
        accessorKey: 'endDate',
        header: makeHeader('End Date', 'endDate', widths.endDate),
        meta: { align: 'left', style: { width: widths.endDate, minWidth: widths.endDate, maxWidth: widths.endDate } },
      },
      {
        accessorKey: 'days',
        header: makeHeader('Days', 'days', widths.days),
        meta: { align: 'right', style: { width: widths.days, minWidth: widths.days, maxWidth: widths.days } },
        cell: ({ getValue }) => <span className="tabular-nums">{Number(getValue() ?? 0)}</span>,
      },
      {
        accessorKey: 'dailyRate',
        header: makeHeader('Daily Rate', 'dailyRate', widths.dailyRate),
        meta: { align: 'right', style: { width: widths.dailyRate, minWidth: widths.dailyRate, maxWidth: widths.dailyRate } },
        cell: ({ getValue }) => <span className="tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'totalAmount',
        header: makeHeader('Total Amount', 'totalAmount', widths.totalAmount),
        meta: { align: 'right', style: { width: widths.totalAmount, minWidth: widths.totalAmount, maxWidth: widths.totalAmount } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', widths.status),
        meta: { align: 'left', style: { width: widths.status, minWidth: widths.status, maxWidth: widths.status } },
        cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'DRAFT')} domain="generic" />,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 120, minWidth: 120, maxWidth: 120 } },
        cell: ({ row }) => {
          const item = row.original as PerDiemRow
          const canSubmit = item.status === 'DRAFT'
          const canApprove = item.status === 'SUBMITTED'

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => toast.info('Coming soon')}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                data-no-row-toggle
                title="View per diem"
              >
                <Eye size={14} />
              </button>
              {canSubmit && (
                <button
                  type="button"
                  onClick={() => handleSubmit(item.id)}
                  className="p-1 rounded hover:bg-blue-100 text-blue-600"
                  data-no-row-toggle
                  title="Submit per diem"
                >
                  <Check size={14} />
                </button>
              )}
              {canApprove && (
                <button
                  type="button"
                  onClick={() => handleApprove(item.id)}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                  data-no-row-toggle
                  title="Approve per diem"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleApprove, handleSubmit, saveWidths, sortDir, sortKey, toast, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Per Diem"
      subtitle={`${sorted.length} per diem requests`}
      primaryActionLabel="New Per Diem"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
            placeholder="Search per diem requests..."
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
      emptyTitle="No per diem requests found"
      emptyDescription="Try a different search or create a per diem request."
      emptyPrimaryAction="New Per Diem"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
