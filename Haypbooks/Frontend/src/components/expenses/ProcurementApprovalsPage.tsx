'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Check, Ban, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface ApprovalRow {
  id: string
  type: 'PR' | 'PO' | 'EXPENSE'
  referenceNumber: string
  submittedBy: string
  date: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  amount: number
}

type SortKey = 'type' | 'referenceNumber' | 'submittedBy' | 'date' | 'status' | 'amount'

const APPROVAL_TABLE_ORDER: SortKey[] = ['type', 'referenceNumber', 'submittedBy', 'date', 'status', 'amount']
const DEFAULT_APPROVAL_WIDTHS: Record<SortKey, number> = {
  type: 100,
  referenceNumber: 140,
  submittedBy: 170,
  date: 120,
  status: 130,
  amount: 140,
}
const APPROVAL_COLUMNS_STORAGE_KEY = 'procurement-approvals-column-widths-v1'

const SAMPLE_ROWS: ApprovalRow[] = [
  {
    id: 'approval-001',
    type: 'PR',
    referenceNumber: 'PR-2026-008',
    submittedBy: 'Maria Santos',
    date: '2026-04-13',
    status: 'PENDING',
    amount: 18400,
  },
  {
    id: 'approval-002',
    type: 'PO',
    referenceNumber: 'PO-2026-011',
    submittedBy: 'John Ramos',
    date: '2026-04-14',
    status: 'PENDING',
    amount: 47350,
  },
  {
    id: 'approval-003',
    type: 'EXPENSE',
    referenceNumber: 'EXP-2026-021',
    submittedBy: 'Aira Cruz',
    date: '2026-04-10',
    status: 'APPROVED',
    amount: 6250,
  },
  {
    id: 'approval-004',
    type: 'PR',
    referenceNumber: 'PR-2026-005',
    submittedBy: 'Miguel Aquino',
    date: '2026-04-09',
    status: 'REJECTED',
    amount: 12100,
  },
]

function loadApprovalWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(APPROVAL_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_APPROVAL_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_APPROVAL_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => APPROVAL_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_APPROVAL_WIDTHS
  }
}

function compareRows(a: ApprovalRow, b: ApprovalRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''

  if (key === 'amount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }

  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function ProcurementApprovalsPage() {
  const toast = useToast()
  const { currency } = useCompanyCurrency()

  const [rows, setRows] = useState<ApprovalRow[]>(SAMPLE_ROWS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadApprovalWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(APPROVAL_COLUMNS_STORAGE_KEY, JSON.stringify(next))
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
        row.referenceNumber.toLowerCase().includes(q) ||
        row.submittedBy.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q),
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
    toast.success('Approval completed')
  }, [toast])

  const handleReject = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'REJECTED' } : row))
    toast.success('Approval rejected')
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
        accessorKey: 'type',
        header: makeHeader('Type', 'type', widths.type),
        meta: { align: 'left', style: { width: widths.type, minWidth: widths.type, maxWidth: widths.type } },
      },
      {
        accessorKey: 'referenceNumber',
        header: makeHeader('Reference #', 'referenceNumber', widths.referenceNumber),
        meta: { align: 'left', style: { width: widths.referenceNumber, minWidth: widths.referenceNumber, maxWidth: widths.referenceNumber } },
      },
      {
        accessorKey: 'submittedBy',
        header: makeHeader('Submitted By', 'submittedBy', widths.submittedBy),
        meta: { align: 'left', style: { width: widths.submittedBy, minWidth: widths.submittedBy, maxWidth: widths.submittedBy } },
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
        cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'PENDING')} domain="generic" />,
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
        meta: { align: 'right', style: { width: 104, minWidth: 104, maxWidth: 104 } },
        cell: ({ row }) => {
          const item = row.original as ApprovalRow
          const canReview = item.status === 'PENDING'

          return (
            <div className="flex items-center justify-end gap-1">
              {canReview && (
                <button
                  type="button"
                  onClick={() => handleApprove(item.id)}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                  data-no-row-toggle
                  title="Approve"
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
                  title="Reject"
                >
                  <Ban size={14} />
                </button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleApprove, handleReject, saveWidths, sortDir, sortKey, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Procurement Approvals"
      subtitle={`${sorted.length} approval items`}
      primaryActionLabel="New Approval"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
              placeholder="Search approvals..."
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }}
            aria-label="Filter approvals by status"
            className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
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
      emptyTitle="No approval items found"
      emptyDescription="Try a different search or status filter."
    />
  )
}
