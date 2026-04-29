'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Check, XCircle, RefreshCw } from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface ProcurementApproval {
  id: string
  type?: 'PR' | 'PO' | 'EXPENSE'
  referenceNumber?: string
  submittedBy?: string
  date: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  amount: number
}

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const
const TYPE_STYLES: Record<string, string> = {
  PR: 'bg-blue-50 text-blue-700',
  PO: 'bg-purple-50 text-purple-700',
  EXPENSE: 'bg-amber-50 text-amber-700',
}

export default function ProcurementApprovalsPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows] = useState<ProcurementApproval[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [toast, setToast] = useState('')

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }, [])

  const fetchRows = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')

    try {
      const [billRes, expenseRes] = await Promise.all([
        expensesService.listBills(companyId, { status: 'PENDING' }),
        expensesService.listExpenseReports(companyId, { status: 'SUBMITTED', limit: 100 }),
      ])
      const billRows: ProcurementApproval[] = (billRes.data ?? []).map((bill: any) => ({
        id: bill.id,
        type: 'PO',
        referenceNumber: bill.billNumber ?? bill.referenceNumber ?? `BILL-${bill.id}`,
        submittedBy: bill.vendorName ?? bill.vendor ?? 'Vendor',
        date: bill.dueDate ?? bill.createdAt ?? bill.approvalRequestedAt ?? new Date().toISOString().slice(0, 10),
        status: bill.status ?? 'PENDING',
        amount: Number(bill.totalAmount ?? bill.amount ?? 0),
      }))
      const expenseRows: ProcurementApproval[] = (expenseRes.data ?? []).map((expense: any) => ({
        id: expense.id,
        type: 'EXPENSE',
        referenceNumber: expense.expenseNumber ?? `EXP-${expense.id}`,
        submittedBy: expense.employeeName ?? 'Employee',
        date: expense.submittedAt ?? expense.createdAt ?? new Date().toISOString().slice(0, 10),
        status: expense.status ?? 'PENDING',
        amount: Number(expense.totalAmount ?? 0),
      }))
      setRows([...billRows, ...expenseRows])
    } catch {
      setError('Failed to load approval items')
      showToast('Failed to load approval items')
    } finally {
      setLoading(false)
    }
  }, [companyId, showToast])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') {
      list = list.filter((row) => row.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (row) =>
          (row.referenceNumber ?? '').toLowerCase().includes(q) ||
          (row.submittedBy ?? '').toLowerCase().includes(q),
      )
    }
    if (dateFrom) {
      list = list.filter((row) => row.date >= dateFrom)
    }
    if (dateTo) {
      list = list.filter((row) => row.date <= dateTo)
    }
    return list
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const handleApprove = useCallback(
    async (row: ProcurementApproval) => {
      if (!companyId) {
        showToast('Missing company context')
        return
      }
      try {
        if (row.type === 'PO') {
          await expensesService.approveBill(companyId, row.id)
        } else {
          await expensesService.approveExpenseReport(companyId, row.id)
        }
        setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: 'APPROVED' } : item)))
        showToast('Approval recorded')
      } catch {
        showToast('Approval failed')
      }
    },
    [companyId, showToast],
  )

  const handleReject = useCallback(
    async (row: ProcurementApproval) => {
      if (!companyId) {
        showToast('Missing company context')
        return
      }
      if (row.type !== 'EXPENSE') {
        showToast('Reject not available for this item')
        return
      }
      try {
        await expensesService.updateExpenseReport(companyId, row.id, { status: 'REJECTED' })
        setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: 'REJECTED' } : item)))
        showToast('Expense report rejected')
      } catch {
        showToast('Reject failed')
      }
    },
    [companyId, showToast],
  )

  const handleExportAll = useCallback(() => {
    csvDownload(
      `procurement-approvals-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Type', 'Reference #', 'Submitted By', 'Date', 'Status', 'Amount'],
      filtered.map((row) => [row.type ?? '', row.referenceNumber ?? '', row.submittedBy ?? '', row.date, row.status ?? '', String(row.amount)]),
    )
    showToast('CSV exported')
  }, [filtered, showToast])

  const columns = useMemo<HaypColumn<ProcurementApproval>>(
    () => [
      {
        id: 'type',
        accessorKey: 'type',
        header: 'Type',
        size: 100,
        enableSorting: true,
        render: (value) => (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${TYPE_STYLES[value ?? ''] ?? 'bg-gray-50 text-gray-600'}`}>
            {value ?? '—'}
          </span>
        ),
      },
      {
        id: 'referenceNumber',
        accessorKey: 'referenceNumber',
        header: 'Reference #',
        size: 150,
        enableSorting: true,
        render: (value) => <span className="font-semibold text-gray-800">{value ?? '—'}</span>,
      },
      {
        id: 'submittedBy',
        accessorKey: 'submittedBy',
        header: 'Submitted By',
        size: 170,
        enableSorting: true,
        render: (value) => <span className="text-gray-700">{value ?? '—'}</span>,
      },
      {
        id: 'date',
        accessorKey: 'date',
        header: 'Date',
        size: 115,
        enableSorting: true,
        render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        enableSorting: true,
        render: (value) => <StatusPill status={value ?? 'PENDING'} />,
      },
      {
        id: 'amount',
        accessorKey: 'amount',
        header: 'Amount',
        size: 130,
        enableSorting: true,
        align: 'right',
        isSummable: true,
        render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
      },
    ],
    [currency],
  )

  const actions = useMemo<HaypActionItem[]>(
    () => [
      {
        label: 'View Details',
        icon: <Eye size={14} />,
        onClick: () => showToast('Coming soon'),
      },
      { divider: true, label: '', onClick: () => {} },
      {
        label: 'Approve',
        icon: <Check size={14} />,
        show: (row) => row.status === 'PENDING',
        onClick: (_id, row) => handleApprove(row),
      },
      {
        label: 'Reject',
        icon: <XCircle size={14} />,
        danger: true,
        show: (row) => row.status === 'PENDING' && row.type === 'EXPENSE',
        onClick: (_id, row) => handleReject(row),
      },
    ],
    [handleApprove, handleReject, showToast],
  )

  const bulkActions = useMemo<HaypBulkAction[]>(
    () => [
      {
        label: 'Export Selected',
        icon: <Plus size={14} />,
        onClick: (_selectedIds, selectedRows) => {
          if (selectedRows.length === 0) return
          csvDownload(
            `procurement-approvals-selected-${new Date().toISOString().slice(0, 10)}.csv`,
            ['Type', 'Reference #', 'Submitted By', 'Date', 'Status', 'Amount'],
            selectedRows.map((row) => [row.type ?? '', row.referenceNumber ?? '', row.submittedBy ?? '', row.date, row.status ?? '', String(row.amount)]),
          )
          showToast('Selected approvals exported')
        },
      },
    ],
    [showToast],
  )

  const filterOptions = STATUSES.map((status) => ({ value: status.toLowerCase(), label: status === 'ALL' ? 'All' : status }))
  const filterLabel = statusFilter === 'ALL' ? 'Status' : `Status: ${statusFilter}`

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Procurement Approvals</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${filtered.length} approvals`}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchRows}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => showToast('Coming soon')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus size={15} /> New Approval
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Date from"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Date to"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <HaypDataTable
        tableId="procurement-approvals"
        columns={columns}
        data={filtered}
        loading={loading}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        searchPlaceholder="Search approvals..."
        filters={filterOptions}
        activeFilter={statusFilter.toLowerCase()}
        onFilterChange={(value) => setStatusFilter(String(value).toUpperCase() as (typeof STATUSES)[number])}
        filterLabel={filterLabel}
        actions={actions}
        bulkActions={bulkActions}
        onExport={handleExportAll}
        onActivityLog={() => router.push('/expenses/procurement/approvals/activity')}
        emptyTitle="No approvals found"
        emptySubtitle="Approval items will appear here when submitted"
        className="mt-4"
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}
