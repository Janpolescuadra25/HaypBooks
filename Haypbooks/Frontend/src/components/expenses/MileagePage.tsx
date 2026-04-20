'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, Check, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface MileageRow {
  id: string
  date: string
  employee: string
  tripPurpose: string
  startEndLocation: string
  distanceKm: number
  rate: number
  amount: number
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
}

type SortKey = 'date' | 'employee' | 'tripPurpose' | 'startEndLocation' | 'distanceKm' | 'rate' | 'amount' | 'status'

const MILEAGE_TABLE_ORDER: SortKey[] = ['date', 'employee', 'tripPurpose', 'startEndLocation', 'distanceKm', 'rate', 'amount', 'status']
const DEFAULT_MILEAGE_WIDTHS: Record<SortKey, number> = {
  date: 120,
  employee: 170,
  tripPurpose: 200,
  startEndLocation: 220,
  distanceKm: 120,
  rate: 110,
  amount: 130,
  status: 120,
}
const MILEAGE_COLUMNS_STORAGE_KEY = 'mileage-column-widths-v1'

const SAMPLE_ROWS: MileageRow[] = [
  {
    id: 'mile-001',
    date: '2026-04-07',
    employee: 'Miguel Aquino',
    tripPurpose: 'Client site visit',
    startEndLocation: 'Makati CBD -> Bonifacio Global City',
    distanceKm: 8.4,
    rate: 15,
    amount: 126,
    status: 'SUBMITTED',
  },
  {
    id: 'mile-002',
    date: '2026-04-09',
    employee: 'Patricia Mendoza',
    tripPurpose: 'Bank document drop-off',
    startEndLocation: 'Ortigas Center -> Pasig City Hall',
    distanceKm: 6.2,
    rate: 15,
    amount: 93,
    status: 'DRAFT',
  },
  {
    id: 'mile-003',
    date: '2026-04-11',
    employee: 'Jerome Villanueva',
    tripPurpose: 'Warehouse inventory check',
    startEndLocation: 'Quezon City -> Valenzuela Depot',
    distanceKm: 14.1,
    rate: 15,
    amount: 211.5,
    status: 'APPROVED',
  },
]

function loadMileageWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(MILEAGE_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_MILEAGE_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_MILEAGE_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => MILEAGE_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_MILEAGE_WIDTHS
  }
}

function compareRows(a: MileageRow, b: MileageRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''

  if (key === 'distanceKm' || key === 'rate' || key === 'amount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }

  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function MileagePage() {
  const toast = useToast()
  const { currency } = useCompanyCurrency()

  const [rows, setRows] = useState<MileageRow[]>(SAMPLE_ROWS)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadMileageWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(MILEAGE_COLUMNS_STORAGE_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((row) =>
      row.employee.toLowerCase().includes(q) ||
      row.tripPurpose.toLowerCase().includes(q) ||
      row.startEndLocation.toLowerCase().includes(q),
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
    toast.success('Mileage entry submitted')
  }, [toast])

  const handleApprove = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'APPROVED' } : row))
    toast.success('Mileage entry approved')
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
        accessorKey: 'date',
        header: makeHeader('Date', 'date', widths.date),
        meta: { align: 'left', style: { width: widths.date, minWidth: widths.date, maxWidth: widths.date } },
      },
      {
        accessorKey: 'employee',
        header: makeHeader('Employee', 'employee', widths.employee),
        meta: { align: 'left', style: { width: widths.employee, minWidth: widths.employee, maxWidth: widths.employee } },
      },
      {
        accessorKey: 'tripPurpose',
        header: makeHeader('Trip Purpose', 'tripPurpose', widths.tripPurpose),
        meta: { align: 'left', style: { width: widths.tripPurpose, minWidth: widths.tripPurpose, maxWidth: widths.tripPurpose } },
      },
      {
        accessorKey: 'startEndLocation',
        header: makeHeader('Start/End Location', 'startEndLocation', widths.startEndLocation),
        meta: { align: 'left', style: { width: widths.startEndLocation, minWidth: widths.startEndLocation, maxWidth: widths.startEndLocation } },
      },
      {
        accessorKey: 'distanceKm',
        header: makeHeader('Distance (km)', 'distanceKm', widths.distanceKm),
        meta: { align: 'right', style: { width: widths.distanceKm, minWidth: widths.distanceKm, maxWidth: widths.distanceKm } },
        cell: ({ getValue }) => <span className="tabular-nums">{Number(getValue() ?? 0).toFixed(1)}</span>,
      },
      {
        accessorKey: 'rate',
        header: makeHeader('Rate', 'rate', widths.rate),
        meta: { align: 'right', style: { width: widths.rate, minWidth: widths.rate, maxWidth: widths.rate } },
        cell: ({ getValue }) => <span className="tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'amount',
        header: makeHeader('Amount', 'amount', widths.amount),
        meta: { align: 'right', style: { width: widths.amount, minWidth: widths.amount, maxWidth: widths.amount } },
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
          const item = row.original as MileageRow
          const canSubmit = item.status === 'DRAFT'
          const canApprove = item.status === 'SUBMITTED'

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => toast.info('Coming soon')}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                data-no-row-toggle
                title="View mileage entry"
              >
                <Eye size={14} />
              </button>
              {canSubmit && (
                <button
                  type="button"
                  onClick={() => handleSubmit(item.id)}
                  className="p-1 rounded hover:bg-blue-100 text-blue-600"
                  data-no-row-toggle
                  title="Submit mileage entry"
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
                  title="Approve mileage entry"
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
      title="Mileage"
      subtitle={`${sorted.length} mileage entries`}
      primaryActionLabel="New Mileage Entry"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
            placeholder="Search mileage entries..."
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
      emptyTitle="No mileage entries found"
      emptyDescription="Try a different search or create a mileage entry."
      emptyPrimaryAction="New Mileage Entry"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
