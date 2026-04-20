'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Eye, Check, Ban, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { useToast } from '@/components/ui/Toast'

interface ExpenseRow {
  id: string
  expenseNumber: string
  submittedBy: string
  category: string
  date: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED'
  amount: number
}

type SortKey = 'expenseNumber' | 'submittedBy' | 'category' | 'date' | 'status' | 'amount'

const EXPENSE_TABLE_ORDER: SortKey[] = ['expenseNumber', 'submittedBy', 'category', 'date', 'status', 'amount']
const DEFAULT_EXPENSE_WIDTHS: Record<SortKey, number> = {
  expenseNumber: 140,
  submittedBy: 180,
  category: 170,
  date: 120,
  status: 135,
  amount: 140,
}
const EXPENSE_COLUMNS_STORAGE_KEY = 'expense-capture-expenses-column-widths-v1'

const SAMPLE_ROWS: ExpenseRow[] = [
  {
    id: 'exp-001',
    expenseNumber: 'EXP-2026-001',
    submittedBy: 'Patricia Mendoza',
    category: 'Transportation',
    date: '2026-04-05',
    status: 'SUBMITTED',
    amount: 2850,
  },
  {
    id: 'exp-002',
    expenseNumber: 'EXP-2026-002',
    submittedBy: 'Jerome Villanueva',
    category: 'Meals',
    date: '2026-04-08',
    status: 'DRAFT',
    amount: 1360,
  },
  {
    id: 'exp-003',
    expenseNumber: 'EXP-2026-003',
    submittedBy: 'Aira Cruz',
    category: 'Office Supplies',
    date: '2026-04-10',
    status: 'APPROVED',
    amount: 4780,
  },
  {
    id: 'exp-004',
    expenseNumber: 'EXP-2026-004',
    submittedBy: 'Miguel Aquino',
    category: 'Client Meeting',
    date: '2026-04-12',
    status: 'REIMBURSED',
    amount: 5290,
  },
]

function loadExpenseWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(EXPENSE_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_EXPENSE_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_EXPENSE_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => EXPENSE_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_EXPENSE_WIDTHS
  }
}

function compareRows(a: ExpenseRow, b: ExpenseRow, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''

  if (key === 'amount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }

  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function ExpensesPage() {
  const toast = useToast()
  const { currency } = useCompanyCurrency()

  const [rows, setRows] = useState<ExpenseRow[]>(SAMPLE_ROWS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadExpenseWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try {
      localStorage.setItem(EXPENSE_COLUMNS_STORAGE_KEY, JSON.stringify(next))
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
        row.expenseNumber.toLowerCase().includes(q) ||
        row.submittedBy.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q),
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

  const handleSubmit = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'SUBMITTED' } : row))
    toast.success('Expense submitted')
  }, [toast])

  const handleApprove = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'APPROVED' } : row))
    toast.success('Expense approved')
  }, [toast])

  const handleReject = useCallback((id: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'REJECTED' } : row))
    toast.success('Expense rejected')
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
        accessorKey: 'expenseNumber',
        header: makeHeader('Expense #', 'expenseNumber', widths.expenseNumber),
        meta: { align: 'left', style: { width: widths.expenseNumber, minWidth: widths.expenseNumber, maxWidth: widths.expenseNumber } },
      },
      {
        accessorKey: 'submittedBy',
        header: makeHeader('Employee / Submitted By', 'submittedBy', widths.submittedBy),
        meta: { align: 'left', style: { width: widths.submittedBy, minWidth: widths.submittedBy, maxWidth: widths.submittedBy } },
      },
      {
        accessorKey: 'category',
        header: makeHeader('Category', 'category', widths.category),
        meta: { align: 'left', style: { width: widths.category, minWidth: widths.category, maxWidth: widths.category } },
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
        accessorKey: 'amount',
        header: makeHeader('Amount', 'amount', widths.amount),
        meta: { align: 'right', style: { width: widths.amount, minWidth: widths.amount, maxWidth: widths.amount } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 140, minWidth: 140, maxWidth: 140 } },
        cell: ({ row }) => {
          const item = row.original as ExpenseRow
          const canSubmit = item.status === 'DRAFT'
          const canApprove = item.status === 'SUBMITTED'
          const canReject = item.status === 'DRAFT' || item.status === 'SUBMITTED'

          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => toast.info('Coming soon')}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                data-no-row-toggle
                title="View expense"
              >
                <Eye size={14} />
              </button>
              {canSubmit && (
                <button
                  type="button"
                  onClick={() => handleSubmit(item.id)}
                  className="p-1 rounded hover:bg-blue-100 text-blue-600"
                  data-no-row-toggle
                  title="Submit expense"
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
                  title="Approve expense"
                >
                  <Check size={14} />
                </button>
              )}
              {canReject && (
                <button
                  type="button"
                  onClick={() => handleReject(item.id)}
                  className="p-1 rounded hover:bg-red-100 text-red-500"
                  data-no-row-toggle
                  title="Reject expense"
                >
                  <Ban size={14} />
                </button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleApprove, handleReject, handleSubmit, saveWidths, sortDir, sortKey, toast, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <DataPage
      title="Expenses"
      subtitle={`${sorted.length} expenses`}
      primaryActionLabel="New Expense"
      onPrimaryAction={() => toast.info('Coming soon')}
      filters={(
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
              placeholder="Search expenses..."
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }}
            aria-label="Filter expenses by status"
            className="w-full max-w-xs px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="REIMBURSED">Reimbursed</option>
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
      emptyTitle="No expenses found"
      emptyDescription="Try a different search or create a new expense."
      emptyPrimaryAction="New Expense"
      onEmptyPrimaryAction={() => toast.info('Coming soon')}
    />
  )
}
