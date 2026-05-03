'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Clock, RefreshCw, Pencil, Trash2 } from 'lucide-react'
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

  const activeFilterCount = [statusFilter !== 'ALL'].filter(Boolean).length

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Reimbursements</h1>
          <p className="mt-2 text-sm text-slate-600">Manage employee reimbursements and payouts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchRows} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={16} /> Refresh</button>
          <button onClick={() => router.push('/expenses/employee-expenses/reimbursements/activity')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Clock size={16} /> Activity Log</button>
          <button onClick={() => toast.info('Coming soon')} title="Coming soon" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> New Reimbursement</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reimbursements" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {STATUSES.map((status) => (
            <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-2xl px-3 py-2 text-xs font-semibold ${statusFilter === status ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              {status === 'ALL' ? 'All' : status}
            </button>
          ))}
          <button type="button" onClick={() => setStatusFilter('ALL')} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Clear</button>
        </div>
      </div>

      <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="reimbursements"
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={[]}
        activeFilter=""
        onFilterChange={() => {} }
        filterLabel="All"
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
  )
}
