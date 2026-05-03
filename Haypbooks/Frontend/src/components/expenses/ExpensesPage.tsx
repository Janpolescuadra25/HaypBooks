'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Receipt, Clock, CheckCircle, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { StatusPill } from '@/components/expenses/_helpers'

interface ExpenseReport {
  id: string
  expenseNumber?: string
  employeeName?: string
  description?: string
  status?: string
  totalAmount: number
  submittedAt?: string
}

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReports = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listExpenseReports(companyId, { limit: 100 })
      const data = res.data || []
      setReports(
        (data as any[]).map((item) => ({
          id: String(item.id ?? ''),
          expenseNumber: item.expenseNumber as string | undefined,
          employeeName: item.employeeName as string | undefined,
          description: item.description as string | undefined,
          status: item.status as string | undefined,
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
  }, [companyId, toast])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const filtered = useMemo(() => {
    const searchValue = search.toLowerCase()
    return reports
      .filter((report) => statusFilter === 'ALL' || report.status === statusFilter)
      .filter((report) =>
        report.expenseNumber?.toLowerCase().includes(searchValue) ||
        report.employeeName?.toLowerCase().includes(searchValue) ||
        report.description?.toLowerCase().includes(searchValue),
      )
  }, [reports, search, statusFilter])

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
      label: 'Open expense',
      onClick: (id) => router.push(`/expenses/${id}/edit`),
    },
  ], [router])

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
      onClick: (_ids, selectedRows) => {
        const voidable = selectedRows.filter((row) => row.status !== 'DRAFT' && row.status !== 'VOID')
        if (voidable.length === 0) {
          toast.error('No expense reports selected to void')
          return
        }
        if (!confirm(`Void ${voidable.length} selected expense report${voidable.length !== 1 ? 's' : ''}?`)) return
        Promise.all(voidable.map((row) => expensesService.updateExpenseReport(companyId ?? '', row.id, { status: 'VOID' })))
          .then(() => {
            setReports((prev) => prev.map((row) => voidable.some((selected) => selected.id === row.id) ? { ...row, status: 'VOID' } : row))
            toast.success(`${voidable.length} selected expense report${voidable.length !== 1 ? 's' : ''} voided`)
          })
          .catch(() => toast.error('Failed to void selected expense reports'))
      },
      disabled: (selectedIds, selectedRows) => selectedRows.length === 0 || selectedRows.every((row) => row.status === 'DRAFT' || row.status === 'VOID'),
    },
  ], [companyId, toast])

  const handleRefresh = useCallback(() => {
    fetchReports()
  }, [fetchReports])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Expenses</h1>
          <p className="mt-2 text-sm text-slate-600">Create and manage expense reports.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => router.push('/expenses/new')} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> New Expense Report</button>
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download size={16} /> Refresh</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        {error && <div className="col-span-full rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="Search expense reports" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-2xl px-3 py-2 text-xs font-semibold ${statusFilter === status ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              {status === 'ALL' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="expense-reports"
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={[]}
        activeFilter=""
        onFilterChange={() => {}}
        filterLabel="All"
        stats={stats}
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
  )
}
