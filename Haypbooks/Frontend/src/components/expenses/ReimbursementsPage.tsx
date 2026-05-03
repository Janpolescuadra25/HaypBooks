'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Clock, Pencil, Trash2, CheckCircle, ListOrdered, Banknote } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { csvDownload } from './_helpers'

interface Reimbursement {
  id: string
  reimbursementNumber?: string
  employeeName?: string
  submittedAt?: string
  totalAmount: number
  status?: string
}

const STATUSES = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REIMBURSED', 'REJECTED'] as const

type StatusFilter = typeof STATUSES[number]

function fmtDate(dateString?: string) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ReimbursementsPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<Reimbursement[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [loading, setLoading] = useState(false)

  const fetchRows = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const res = await expensesService.listReimbursements(companyId, { limit: 100 })
      const data = res.data || []
      setRows(data.map((item: any) => ({
        id: String(item.id ?? ''),
        reimbursementNumber: String(item.reimbursementNumber ?? item.id ?? ''),
        employeeName: item.employeeName,
        submittedAt: item.submittedAt,
        totalAmount: Number(item.totalAmount ?? 0),
        status: item.status,
      })))
    } catch {
      toast.error('Failed to load reimbursements')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchRows() }, [fetchRows])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows
      .filter((item) => statusFilter === 'ALL' || item.status === statusFilter)
      .filter((item) =>
        item.reimbursementNumber?.toLowerCase().includes(q) ||
        item.employeeName?.toLowerCase().includes(q),
      )
  }, [rows, search, statusFilter])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['totalAmount'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const handleDeleteReimbursement = useCallback((id: string) => {
    if (!confirm('Delete this reimbursement?')) return
    setRows((prev) => prev.filter((row) => row.id !== id))
    toast.success('Reimbursement deleted')
  }, [toast])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      onClick: (id) => router.push(`/expenses/employee-expenses/reimbursements/${id}/edit`),
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (_id, row) => handleDeleteReimbursement(row.id),
    },
  ], [handleDeleteReimbursement, router])

  const columns = useMemo<HaypColumn<Reimbursement>[]>(() => [
    {
      id: 'reimbursementNumber',
      header: 'Reimbursement',
      accessorKey: 'reimbursementNumber',
      size: 180,
      minSize: 150,
      render: (value) => <span className="font-semibold text-slate-900">{value ?? '—'}</span>,
    },
    {
      id: 'employeeName',
      header: 'Employee',
      accessorKey: 'employeeName',
      size: 170,
      minSize: 150,
      render: (value) => <span className="text-slate-700">{value ?? '—'}</span>,
    },
    {
      id: 'submittedAt',
      header: 'Submitted',
      accessorKey: 'submittedAt',
      size: 140,
      minSize: 120,
      render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
    },
    {
      id: 'totalAmount',
      header: 'Total',
      accessorKey: 'totalAmount',
      align: 'right',
      size: 120,
      minSize: 120,
      isSummable: true,
      render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 120,
      minSize: 100,
      render: (value) => <span className="text-slate-600 uppercase tracking-wide text-[11px] font-semibold">{value ?? 'PENDING'}</span>,
    },
  ], [currency])

  const handleExport = useCallback(() => {
    const rowsToExport = filtered
    const csvRows = rowsToExport.map((row) => [
      row.reimbursementNumber ?? '',
      row.employeeName ?? '',
      row.submittedAt ?? '',
      String(row.totalAmount),
      row.status ?? '',
    ])
    csvDownload(`reimbursements-${new Date().toISOString().slice(0, 10)}.csv`, ['Reimbursement', 'Employee', 'Submitted', 'Total', 'Status'], csvRows)
    toast.success('CSV exported')
  }, [filtered, toast])

  const stats = useMemo(() => [
    { icon: ListOrdered, label: 'Total Claims', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Pending', value: rows.filter((row) => row.status === 'DRAFT' || row.status === 'SUBMITTED').length, color: 'amber' },
    { icon: CheckCircle, label: 'Approved', value: rows.filter((row) => row.status === 'APPROVED').length, color: 'emerald' },
    { icon: Banknote, label: 'Total Amount', value: formatCurrency(rows.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0), currency), color: 'rose' },
  ], [rows, currency])

  const bulkActions = useMemo<HaypBulkAction[]>(() => [
    {
      label: 'Export selected',
      onClick: (_ids, selectedRows) => {
        if (selectedRows.length === 0) return
        const csvRows = selectedRows.map((row) => [
          row.reimbursementNumber ?? '',
          row.employeeName ?? '',
          row.submittedAt ?? '',
          String(row.totalAmount),
          row.status ?? '',
        ])
        csvDownload(`reimbursements-selected-${new Date().toISOString().slice(0, 10)}.csv`, ['Reimbursement', 'Employee', 'Submitted', 'Total', 'Status'], csvRows)
        toast.success('Selected reimbursements exported')
      },
    },
  ], [toast])

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="reimbursements"
        title="Reimbursements"
        description="Process employee expense reimbursements and track approvals."
        stats={stats}
        headerActions={
          <button
            onClick={() => toast.info('Coming soon')}
            title="Coming soon"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            New Reimbursement
          </button>
        }
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={STATUSES.map((status) => ({ value: status, label: status === 'ALL' ? 'All' : status }))}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterLabel="Status"
        actions={actions}
        bulkActions={bulkActions}
        totals={totals}
        onRefresh={fetchRows}
        onExport={handleExport}
        exportLabel="Export CSV"
        onActivityLog={() => router.push('/expenses/employee-expenses/reimbursements/activity')}
        onRowClick={(row) => router.push(`/expenses/employee-expenses/reimbursements/${row.id}/edit`)}
        emptyTitle={loading ? 'Loading reimbursements…' : 'No reimbursements found'}
        emptySubtitle="Search or filter to locate reimbursements"
        loading={loading}
      />
    </div>
  </div>
  )
}
