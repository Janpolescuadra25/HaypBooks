'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, Check, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface ReimbursementRow {
  id: string
  reimbursementNumber: string
  employee: string
  dateSubmitted: string
  totalAmount: number
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'REJECTED'
}

type SortKey = 'reimbursementNumber' | 'employee' | 'dateSubmitted' | 'totalAmount' | 'status'

const REIMBURSEMENT_TABLE_ORDER: SortKey[] = ['reimbursementNumber', 'employee', 'dateSubmitted', 'totalAmount', 'status']
const DEFAULT_REIMBURSEMENT_WIDTHS: Record<SortKey, number> = {
  reimbursementNumber: 165,
  employee: 180,
  dateSubmitted: 130,
  totalAmount: 140,
  status: 135,
}
const REIMBURSEMENT_COLUMNS_STORAGE_KEY = 'reimbursements-column-widths-v1'

const SAMPLE_ROWS: ReimbursementRow[] = [
  {
    id: 'reim-001',
    reimbursementNumber: 'RBM-2026-001',
    employee: 'Patricia Mendoza',
    dateSubmitted: '2026-04-06',
    totalAmount: 8420,
    status: 'PENDING',
  },
  {
    id: 'reim-002',
    reimbursementNumber: 'RBM-2026-002',
    employee: 'Jerome Villanueva',
    dateSubmitted: '2026-04-08',
    totalAmount: 3150,
    status: 'APPROVED',
  },
  {
    id: 'reim-003',
    reimbursementNumber: 'RBM-2026-003',
    employee: 'Miguel Aquino',
    dateSubmitted: '2026-04-10',
    totalAmount: 12750,
    status: 'PROCESSING',
  },
  {
    id: 'reim-004',
    reimbursementNumber: 'RBM-2026-004',
    employee: 'Aira Cruz',
    dateSubmitted: '2026-04-12',
    totalAmount: 2260,
    status: 'DRAFT',
  },
]

function loadReimbursementWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(REIMBURSEMENT_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_REIMBURSEMENT_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_REIMBURSEMENT_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => REIMBURSEMENT_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_REIMBURSEMENT_WIDTHS
  }
}

function compareRows(a: ReimbursementRow, b: ReimbursementRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''

  if (key === 'totalAmount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }

  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function ReimbursementsPage() {
  const toast = useToast()
  const { currency } = useCompanyCurrency()

  const [rows, setRows] = useState<ReimbursementRow[]>(SAMPLE_ROWS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('dateSubmitted')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadReimbursementWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(REIMBURSEMENT_COLUMNS_STORAGE_KEY, JSON.stringify(next))
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
        row.reimbursementNumber.toLowerCase().includes(q) ||
        row.employee.toLowerCase().includes(q),
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
    toast.success('Reimbursement approved')
  }, [toast])

  const handlePay = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'PAID' } : row))
    toast.success('Reimbursement marked as paid')
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
        accessorKey: 'reimbursementNumber',
        header: makeHeader('Reimbursement #', 'reimbursementNumber', widths.reimbursementNumber),
        meta: { align: 'left', style: { width: widths.reimbursementNumber, minWidth: widths.reimbursementNumber, maxWidth: widths.reimbursementNumber } },
      },
      {
        accessorKey: 'employee',
        header: makeHeader('Employee', 'employee', widths.employee),
        meta: { align: 'left', style: { width: widths.employee, minWidth: widths.employee, maxWidth: widths.employee } },
      },
      {
        accessorKey: 'dateSubmitted',
        header: makeHeader('Date Submitted', 'dateSubmitted', widths.dateSubmitted),
        meta: { align: 'left', style: { width: widths.dateSubmitted, minWidth: widths.dateSubmitted, maxWidth: widths.dateSubmitted } },
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
          const item = row.original as ReimbursementRow
          const canApprove = item.status === 'DRAFT' || item.status === 'PENDING'
          const canPay = item.status === 'APPROVED'

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => toast.info('Coming soon')}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                data-no-row-toggle
                title="View reimbursement"
              >
                <Eye size={14} />
              </button>
              {canApprove && (
                <button
                  type="button"
                  onClick={() => handleApprove(item.id)}
                  className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                  data-no-row-toggle
                  title="Approve reimbursement"
                >
                  <Check size={14} />
                </button>
              )}
              {canPay && (
                <button
                  type="button"
                  onClick={() => handlePay(item.id)}
                  className="p-1 rounded hover:bg-blue-100 text-blue-600"
                  data-no-row-toggle
                  title="Mark reimbursement as paid"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleApprove, handlePay, saveWidths, sortDir, sortKey, toast, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Reimbursements"
      subtitle={`${sorted.length} reimbursements`}
      primaryActionLabel="New Reimbursement"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
              placeholder="Search reimbursements..."
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }}
            aria-label="Filter reimbursements by status"
            className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="PROCESSING">Processing</option>
            <option value="PAID">Paid</option>
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
      emptyTitle="No reimbursements found"
      emptyDescription="Try a different search or create a reimbursement request."
      emptyPrimaryAction="New Reimbursement"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
