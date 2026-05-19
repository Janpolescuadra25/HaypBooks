'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Receipt, Clock, CheckCircle, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import HaypSelect from '@/components/shared/HaypSelect'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { StatusPill } from '@/components/expenses/_helpers'

interface ExpenseReport {
  id: string
  expenseNumber?: string
  employeeName?: string
  description?: string
  status?: string
  postingStatus?: string
  totalAmount: number
  submittedAt?: string
}

const POSTING_STATUSES: Array<'ALL' | 'DRAFT' | 'POSTED' | 'VOIDED'> = ['ALL', 'DRAFT', 'POSTED', 'VOIDED']

type StatusFilter = 'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'

function fmtDate(dateString?: string) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const STATUSES: StatusFilter[] = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'PAID', 'REJECTED']

export default function ExpensesPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [postingStatusFilter, setPostingStatusFilter] = useState<'ALL' | 'DRAFT' | 'POSTED' | 'VOIDED'>('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReports = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listExpenseReports(companyId, {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        postingStatus: postingStatusFilter !== 'ALL' ? postingStatusFilter : undefined,
        limit: 100,
      })
      const data = res.data || []
      setReports(
        (data as any[]).map((item) => ({
          id: String(item.id ?? ''),
          expenseNumber: item.expenseNumber as string | undefined,
          employeeName: item.employeeName as string | undefined,
          description: item.description as string | undefined,
          status: item.status as string | undefined,
          postingStatus: item.postingStatus as string | undefined,
          totalAmount: Number(item.totalAmount ?? 0),
          submittedAt: item.submittedAt as string | undefined,
        })),
      )
    } catch {
      setError('Failed to load expense reports')
      toast.error('Failed to load expense reports')
    } finally {
      setLoading(false)
    }
  }, [companyId, postingStatusFilter, statusFilter, toast])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const filtered = useMemo(() => {
    const searchValue = search.toLowerCase()
    return reports
      .filter((report) =>
        report.expenseNumber?.toLowerCase().includes(searchValue) ||
        report.employeeName?.toLowerCase().includes(searchValue) ||
        report.description?.toLowerCase().includes(searchValue),
      )
  }, [reports, search])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['totalAmount'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const stats = useMemo(() => [
    { icon: Receipt, label: 'Total Expenses', value: reports.length, color: 'blue' },
    { icon: Clock, label: 'Pending', value: reports.filter((report) => report.status === 'PENDING').length, color: 'amber' },
    { icon: CheckCircle, label: 'Approved', value: reports.filter((report) => report.status === 'APPROVED').length, color: 'emerald' },
    { icon: CreditCard, label: 'Reimbursed', value: reports.filter((report) => report.status === 'PAID').length, color: 'rose' },
  ], [reports])

  const columns = useMemo<HaypColumn<ExpenseReport>[]>(() => [
    {
      id: 'expenseNumber',
      header: 'Expense',
      accessorKey: 'expenseNumber',
      size: 180,
      minSize: 160,
      render: (value) => <span className="font-semibold text-slate-900">{value ?? '—'}</span>,
    },
    {
      id: 'employeeName',
      header: 'Employee',
      accessorKey: 'employeeName',
      size: 180,
      minSize: 140,
      render: (value) => <span className="text-slate-700">{value ?? '—'}</span>,
    },
    {
      id: 'submittedAt',
      header: 'Submitted',
      accessorKey: 'submittedAt',
      size: 140,
      minSize: 120,
      render: (value) => <span className="text-slate-500">{fmtDate(value)}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 120,
      minSize: 110,
      render: (value) => <StatusPill status={value ?? 'DRAFT'} />,
    },
    {
      id: 'postingStatus',
      header: 'Posting',
      accessorKey: 'postingStatus',
      size: 110,
      minSize: 100,
      render: (value) => <StatusPill status={value ?? 'DRAFT'} type="posting" />,
    },
    {
      id: 'totalAmount',
      header: 'Total',
      accessorKey: 'totalAmount',
      size: 120,
      minSize: 110,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{formatCurrency(Number(value ?? 0), currency)}</span>,
    },
  ], [currency])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'View details',
      onClick: (id) => router.push(`/expenses/employee-expenses/expenses/${id}`),
    },
    {
      label: 'Edit expense',
      onClick: (id) => router.push(`/expenses/${id}/edit`),
    },
    {
      label: 'Approve',
      show: (row) => row.status === 'DRAFT' || row.status === 'SUBMITTED',
      onClick: async (id) => {
        try {
          await expensesService.approveExpenseReport(companyId ?? '', id)
          toast.success('Expense report approved')
          fetchReports()
        } catch {
          toast.error('Failed to approve expense report')
        }
      },
    },
    {
      label: 'Reimburse',
      show: (row) => row.status === 'APPROVED',
      onClick: async (id) => {
        try {
          await expensesService.reimburseExpenseReport(companyId ?? '', id, { method: 'MANUAL' })
          toast.success('Expense report marked as reimbursed')
          fetchReports()
        } catch {
          toast.error('Failed to reimburse expense report')
        }
      },
    },
  ], [router, companyId, toast, fetchReports])

  const bulkActions = useMemo<HaypBulkAction[]>(() => [
    {
      label: 'Delete selected',
      variant: 'danger',
      onClick: (_ids, selectedRows) => {
        const drafts = selectedRows.filter((row) => row.status === 'DRAFT')
        if (drafts.length === 0) {
          toast.error('Only draft expense reports can be deleted')
          return
        }
        if (!confirm(`Delete ${drafts.length} selected expense report${drafts.length !== 1 ? 's' : ''}?`)) return
        Promise.all(drafts.map((row) => expensesService.updateExpenseReport(companyId ?? '', row.id, { status: 'DELETED' })))
          .then(() => {
            setReports((prev) => prev.filter((row) => !drafts.some((draft) => draft.id === row.id)))
            toast.success(`${drafts.length} selected expense report${drafts.length !== 1 ? 's' : ''} deleted`)
          })
          .catch(() => toast.error('Failed to delete selected expense reports'))
      },
      disabled: (selectedIds, selectedRows) => selectedRows.length === 0 || !selectedRows.every((row) => row.status === 'DRAFT'),
    },
    {
      label: 'Void selected',
      variant: 'danger',
      onClick: async (_ids, selectedRows) => {
        const voidable = selectedRows.filter((row) => row.status !== 'DRAFT' && row.status !== 'VOID' && row.status !== 'VOIDED')
        if (voidable.length === 0) {
          toast.error('No expense reports selected to void')
          return
        }
        if (!confirm(`Void ${voidable.length} selected expense report${voidable.length !== 1 ? 's' : ''}? This will reverse the GL journal entries and cannot be undone.`)) return
        try {
          await Promise.all(voidable.map((row) => expensesService.voidExpenseReport(companyId ?? '', row.id)))
          setReports((prev) => prev.map((row) => voidable.some((selected) => selected.id === row.id) ? { ...row, status: 'VOID' } : row))
          toast.success(`${voidable.length} selected expense report${voidable.length !== 1 ? 's' : ''} voided`)
        } catch {
          toast.error('Failed to void selected expense reports')
        }
      },
      disabled: (selectedIds, selectedRows) => selectedRows.length === 0 || selectedRows.every((row) => row.status === 'DRAFT' || row.status === 'VOID' || row.status === 'VOIDED'),
    },
  ], [companyId, toast])

  const handleRefresh = useCallback(() => {
    fetchReports()
  }, [fetchReports])

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        <HaypDataTable
          data={filtered}
          columns={columns}
          tableId="expense-reports"
          title="Expenses"
          description="Track and manage all business expenses in one place."
          stats={stats}
          headerActions={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <HaypSelect
              label="Posting Status"
              value={postingStatusFilter}
              onChange={(value) => setPostingStatusFilter(String(value) as 'ALL' | 'DRAFT' | 'POSTED' | 'VOIDED')}
              options={POSTING_STATUSES.map((status) => ({ value: status, label: status === 'ALL' ? 'All Posting Statuses' : status }))}
              className="min-w-[220px]"
            />
            <button
              onClick={() => router.push('/expenses/new')}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} />
              New Expense
            </button>
          </div>
        }
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          onActivityLog={() => router.push('/expenses/employee-expenses/expenses/activity')}
          filters={STATUSES.map((status) => ({ value: status, label: status === 'ALL' ? 'All Statuses' : status }))}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          filterLabel="Status"
          actions={actions}
          bulkActions={bulkActions}
          totals={totals}
          onRefresh={handleRefresh}
          onRowClick={(row) => router.push(`/expenses/${row.id}/edit`)}
          emptyTitle={loading ? 'Loading expense reports…' : 'No expense reports found'}
          emptySubtitle="Use search or status filters to locate reports"
          loading={loading}
        />
      </div>
    </div>
  )
}
