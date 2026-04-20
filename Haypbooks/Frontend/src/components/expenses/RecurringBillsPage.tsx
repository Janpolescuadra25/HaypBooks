'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, Check, Ban, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface RecurringBillRow {
  id: string
  templateName: string
  vendor: string
  frequency: 'MONTHLY' | 'WEEKLY' | 'CUSTOM'
  nextDate: string
  status: 'ACTIVE' | 'PAUSED' | 'ENDED'
  amount: number
}

type SortKey = 'templateName' | 'vendor' | 'frequency' | 'nextDate' | 'status' | 'amount'

const RECURRING_TABLE_ORDER: SortKey[] = ['templateName', 'vendor', 'frequency', 'nextDate', 'status', 'amount']
const DEFAULT_RECURRING_WIDTHS: Record<SortKey, number> = {
  templateName: 220,
  vendor: 210,
  frequency: 120,
  nextDate: 120,
  status: 120,
  amount: 140,
}
const RECURRING_COLUMNS_STORAGE_KEY = 'recurring-bills-column-widths-v1'

const SAMPLE_ROWS: RecurringBillRow[] = [
  {
    id: 'rb-001',
    templateName: 'Monthly Fiber Internet - HQ',
    vendor: 'PLDT Enterprise',
    frequency: 'MONTHLY',
    nextDate: '2026-05-01',
    status: 'ACTIVE',
    amount: 12999,
  },
  {
    id: 'rb-002',
    templateName: 'Weekly Janitorial Services',
    vendor: 'CleanHub Facilities PH',
    frequency: 'WEEKLY',
    nextDate: '2026-04-23',
    status: 'PAUSED',
    amount: 8500,
  },
  {
    id: 'rb-003',
    templateName: 'Warehouse Generator Maintenance',
    vendor: 'Batangas Power Systems',
    frequency: 'CUSTOM',
    nextDate: '2026-06-15',
    status: 'ENDED',
    amount: 21500,
  },
]

function loadRecurringWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(RECURRING_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_RECURRING_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_RECURRING_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => RECURRING_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_RECURRING_WIDTHS
  }
}

function compareRows(a: RecurringBillRow, b: RecurringBillRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''

  if (key === 'amount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }

  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function RecurringBillsPage() {
  const toast = useToast()
  const { currency } = useCompanyCurrency()

  const [rows, setRows] = useState<RecurringBillRow[]>(SAMPLE_ROWS)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('nextDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadRecurringWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(RECURRING_COLUMNS_STORAGE_KEY, JSON.stringify(next))
    } catch {
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((row) =>
      row.templateName.toLowerCase().includes(q) ||
      row.vendor.toLowerCase().includes(q),
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

  const handleTogglePause = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => {
      if (row.id !== id || row.status === 'ENDED') return row
      return { ...row, status: row.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }
    }))
    toast.success('Recurring bill status updated')
  }, [toast])

  const handleEnd = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'ENDED' } : row))
    toast.success('Recurring bill ended')
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
        accessorKey: 'templateName',
        header: makeHeader('Template Name', 'templateName', widths.templateName),
        meta: { align: 'left', style: { width: widths.templateName, minWidth: widths.templateName, maxWidth: widths.templateName } },
      },
      {
        accessorKey: 'vendor',
        header: makeHeader('Vendor', 'vendor', widths.vendor),
        meta: { align: 'left', style: { width: widths.vendor, minWidth: widths.vendor, maxWidth: widths.vendor } },
      },
      {
        accessorKey: 'frequency',
        header: makeHeader('Frequency', 'frequency', widths.frequency),
        meta: { align: 'left', style: { width: widths.frequency, minWidth: widths.frequency, maxWidth: widths.frequency } },
      },
      {
        accessorKey: 'nextDate',
        header: makeHeader('Next Date', 'nextDate', widths.nextDate),
        meta: { align: 'left', style: { width: widths.nextDate, minWidth: widths.nextDate, maxWidth: widths.nextDate } },
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', widths.status),
        meta: { align: 'left', style: { width: widths.status, minWidth: widths.status, maxWidth: widths.status } },
        cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'ACTIVE')} domain="generic" />,
      },
      {
        accessorKey: 'amount',
        header: makeHeader('Amount', 'amount', widths.amount),
        meta: { align: 'right', style: { width: widths.amount, minWidth: widths.amount, maxWidth: widths.amount } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 128, minWidth: 128, maxWidth: 128 } },
        cell: ({ row }) => {
          const item = row.original as RecurringBillRow
          const canPauseResume = item.status !== 'ENDED'
          const canEnd = item.status !== 'ENDED'

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => toast.info('Coming soon')}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                data-no-row-toggle
                title="View recurring bill"
              >
                <Eye size={14} />
              </button>
              {canPauseResume && (
                <button
                  type="button"
                  onClick={() => handleTogglePause(item.id)}
                  className="p-1 rounded hover:bg-amber-100 text-amber-700"
                  data-no-row-toggle
                  title={item.status === 'ACTIVE' ? 'Pause recurring bill' : 'Resume recurring bill'}
                >
                  <Check size={14} />
                </button>
              )}
              {canEnd && (
                <button
                  type="button"
                  onClick={() => handleEnd(item.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                  data-no-row-toggle
                  title="End recurring bill"
                >
                  <Ban size={14} />
                </button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleEnd, handleTogglePause, saveWidths, sortDir, sortKey, toast, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Recurring Bills"
      subtitle={`${sorted.length} recurring bill templates`}
      primaryActionLabel="New Recurring Bill"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
            placeholder="Search recurring bills..."
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
      emptyTitle="No recurring bills found"
      emptyDescription="Try a different search or create a recurring bill template."
      emptyPrimaryAction="New Recurring Bill"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
