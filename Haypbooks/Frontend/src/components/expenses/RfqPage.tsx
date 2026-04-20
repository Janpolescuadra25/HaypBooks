'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, Check, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface RfqRow {
  id: string
  rfqNumber: string
  subject: string
  vendors: string
  dateSent: string
  closingDate: string
  status: 'DRAFT' | 'SENT' | 'OPENED' | 'AWARDED' | 'CANCELLED'
}

type SortKey = 'rfqNumber' | 'subject' | 'vendors' | 'dateSent' | 'closingDate' | 'status'

const RFQ_TABLE_ORDER: SortKey[] = ['rfqNumber', 'subject', 'vendors', 'dateSent', 'closingDate', 'status']
const DEFAULT_RFQ_WIDTHS: Record<SortKey, number> = {
  rfqNumber: 130,
  subject: 250,
  vendors: 150,
  dateSent: 120,
  closingDate: 125,
  status: 140,
}
const RFQ_COLUMNS_STORAGE_KEY = 'rfq-column-widths-v1'

const SAMPLE_ROWS: RfqRow[] = [
  {
    id: 'rfq-001',
    rfqNumber: 'RFQ-2026-001',
    subject: 'Network Switches for Branch Upgrade',
    vendors: '3 vendors',
    dateSent: '2026-04-07',
    closingDate: '2026-04-18',
    status: 'SENT',
  },
  {
    id: 'rfq-002',
    rfqNumber: 'RFQ-2026-002',
    subject: 'Warehouse Packaging Materials',
    vendors: '2 vendors',
    dateSent: '2026-04-11',
    closingDate: '2026-04-20',
    status: 'OPENED',
  },
  {
    id: 'rfq-003',
    rfqNumber: 'RFQ-2026-003',
    subject: 'Office Renovation Works - Makati',
    vendors: '4 vendors',
    dateSent: '2026-04-13',
    closingDate: '2026-04-25',
    status: 'DRAFT',
  },
]

function loadRfqWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(RFQ_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_RFQ_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_RFQ_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => RFQ_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_RFQ_WIDTHS
  }
}

function compareRows(a: RfqRow, b: RfqRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''

  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function RfqPage() {
  const toast = useToast()

  const [rows, setRows] = useState<RfqRow[]>(SAMPLE_ROWS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('dateSent')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadRfqWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(RFQ_COLUMNS_STORAGE_KEY, JSON.stringify(next))
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
        row.rfqNumber.toLowerCase().includes(q) ||
        row.subject.toLowerCase().includes(q),
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

  const handleSend = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'SENT' } : row))
    toast.success('RFQ sent')
  }, [toast])

  const handleAward = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'AWARDED' } : row))
    toast.success('RFQ awarded')
  }, [toast])

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
        accessorKey: 'rfqNumber',
        header: makeHeader('RFQ #', 'rfqNumber', widths.rfqNumber),
        meta: { align: 'left', style: { width: widths.rfqNumber, minWidth: widths.rfqNumber, maxWidth: widths.rfqNumber } },
      },
      {
        accessorKey: 'subject',
        header: makeHeader('Subject', 'subject', widths.subject),
        meta: { align: 'left', style: { width: widths.subject, minWidth: widths.subject, maxWidth: widths.subject } },
      },
      {
        accessorKey: 'vendors',
        header: makeHeader('Vendor(s)', 'vendors', widths.vendors),
        meta: { align: 'left', style: { width: widths.vendors, minWidth: widths.vendors, maxWidth: widths.vendors } },
      },
      {
        accessorKey: 'dateSent',
        header: makeHeader('Date Sent', 'dateSent', widths.dateSent),
        meta: { align: 'left', style: { width: widths.dateSent, minWidth: widths.dateSent, maxWidth: widths.dateSent } },
      },
      {
        accessorKey: 'closingDate',
        header: makeHeader('Closing Date', 'closingDate', widths.closingDate),
        meta: { align: 'left', style: { width: widths.closingDate, minWidth: widths.closingDate, maxWidth: widths.closingDate } },
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
          const item = row.original as RfqRow
          const canSend = item.status === 'DRAFT'
          const canAward = item.status === 'OPENED'

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => toast.info('Coming soon')}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                data-no-row-toggle
                title="View RFQ"
              >
                <Eye size={14} />
              </button>
              {canSend && (
                <button
                  type="button"
                  onClick={() => handleSend(item.id)}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                  data-no-row-toggle
                  title="Send RFQ"
                >
                  <Check size={14} />
                </button>
              )}
              {canAward && (
                <button
                  type="button"
                  onClick={() => handleAward(item.id)}
                  className="p-1 rounded hover:bg-blue-100 text-blue-600"
                  data-no-row-toggle
                  title="Award RFQ"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          )
        },
      },
    ]
  }, [handleAward, handleSend, saveWidths, sortDir, sortKey, toast, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="RFQ"
      subtitle={`${sorted.length} RFQs`}
      primaryActionLabel="New RFQ"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
              placeholder="Search RFQs..."
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }}
            aria-label="Filter RFQs by status"
            className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="OPENED">Opened</option>
            <option value="AWARDED">Awarded</option>
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
      emptyTitle="No RFQs found"
      emptyDescription="Try a different search or create an RFQ."
      emptyPrimaryAction="New RFQ"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
