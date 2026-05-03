'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Filter, Clock, RefreshCw, Eye, Trash2, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface PaymentRun {
  id: string
  runNumber?: string
  paymentDate: string
  method?: string
  status?: string
  vendorCount?: number
  totalAmount: number
}

type StatusFilter = 'ALL' | 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
const STATUSES: StatusFilter[] = ['ALL', 'DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED']

export default function PaymentRunsPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<PaymentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const fetchRows = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listPaymentRuns(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.paymentRuns ?? [])
    } catch {
      setError('Failed to load payment runs')
      toast.error('Failed to load payment runs')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchRows() }, [fetchRows])

  const filtered = useMemo(() => {
    return rows
      .filter((run) => statusFilter === 'ALL' || run.status === statusFilter)
      .filter((run) => {
        const q = search.toLowerCase()
        return (
          run.runNumber?.toLowerCase().includes(q) ||
          run.method?.toLowerCase().includes(q)
        )
      })
      .filter((run) => (dateFrom ? run.paymentDate >= dateFrom : true))
      .filter((run) => (dateTo ? run.paymentDate <= dateTo : true))
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['totalAmount'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const handleDeletePaymentRun = useCallback((id: string) => {
    if (!confirm('Delete this payment run?')) return
    setRows((prev) => prev.filter((run) => run.id !== id))
    toast.success('Payment run deleted')
  }, [toast])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'View Details',
      icon: <Eye size={14} />,
      onClick: (id) => router.push(`/expenses/bills-payments/payment-runs/${id}/edit`),
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (_id, row) => handleDeletePaymentRun(row.id),
    },
  ], [handleDeletePaymentRun, router])

  const columns = useMemo<HaypColumn<PaymentRun>[]>(() => [
    {
      id: 'runNumber',
      header: 'Run #',
      accessorKey: 'runNumber',
      size: 140,
      minSize: 120,
      render: (value) => <span className="font-semibold text-gray-900">{value ?? '—'}</span>,
    },
    {
      id: 'paymentDate',
      header: 'Payment Date',
      accessorKey: 'paymentDate',
      size: 130,
      minSize: 120,
      render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
    },
    {
      id: 'method',
      header: 'Method',
      accessorKey: 'method',
      size: 150,
      minSize: 130,
      render: (value) => <span className="text-gray-700 text-sm">{value ?? '—'}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 130,
      minSize: 110,
      render: (value) => <StatusPill status={value ?? 'DRAFT'} />,
    },
    {
      id: 'vendorCount',
      header: 'Vendors',
      accessorKey: 'vendorCount',
      size: 100,
      minSize: 90,
      align: 'right',
      render: (value) => <span className="tabular-nums font-medium text-gray-700">{value ?? 0}</span>,
    },
    {
      id: 'totalAmount',
      header: 'Total Amount',
      accessorKey: 'totalAmount',
      size: 130,
      minSize: 110,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
    },
  ], [currency])

  const handleExportCSV = useCallback(() => {
    csvDownload(`payment-runs-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Run #', 'Payment Date', 'Method', 'Status', 'Vendors', 'Total'],
      filtered.map((run) => [
        run.runNumber ?? '',
        run.paymentDate,
        run.method ?? '',
        run.status ?? '',
        String(run.vendorCount ?? 0),
        String(run.totalAmount),
      ]),
    )
    toast.success('CSV exported')
  }, [filtered, toast])

  const bulkActions = useMemo<HaypBulkAction[]>(() => [
    {
      label: 'Export selected',
      icon: <Download className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (_ids, selectedRows) => {
        if (selectedRows.length === 0) return
        csvDownload(`payment-runs-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Run #', 'Payment Date', 'Method', 'Status', 'Vendors', 'Total'],
          selectedRows.map((run) => [
            run.runNumber ?? '',
            run.paymentDate,
            run.method ?? '',
            run.status ?? '',
            String(run.vendorCount ?? 0),
            String(run.totalAmount),
          ]),
        )
        toast.success('Selected rows exported')
      },
    },
  ], [toast])

  const handleRefresh = useCallback(() => {
    fetchRows()
  }, [fetchRows])

  const stats = useMemo(() => [
    { icon: FileText, label: 'Total Runs', value: rows.length, color: 'blue' },
    { icon: AlertCircle, label: 'Draft', value: rows.filter(r => r.status === 'DRAFT').length, color: 'amber' },
    { icon: CheckCircle, label: 'Completed', value: rows.filter(r => r.status === 'COMPLETED').length, color: 'emerald' },
    { icon: AlertCircle, label: 'Failed', value: rows.filter(r => r.status === 'FAILED').length, color: 'rose' },
  ], [rows])

  const activeFilterCount = [statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Payment Runs</h1>
          <p className="mt-2 text-sm text-emerald-600/70">Manage batch payment runs and review totals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => router.push('/expenses/bills-payments/payment-runs/activity')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Clock size={16} /> Activity Log</button>
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        {error && <div className="col-span-full rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search runs..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {STATUSES.map((status) => (
            <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-2xl px-3 py-2 text-xs font-semibold ${statusFilter === status ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              {status === 'ALL' ? 'All' : status}
            </button>
          ))}
          <button type="button" onClick={() => setShowAdvancedFilters((prev) => !prev)} className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Filter size={14} /> Filters</button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date From</label>
            <input title="Date from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date To</label>
            <input title="Date to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear all</button>
          </div>
        </div>
      )}

      <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="payment-runs"
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={[]}
        activeFilter=""
        onFilterChange={() => {}}
        filterLabel="All"
        actions={actions}
        bulkActions={bulkActions}
        totals={totals}
        onRefresh={handleRefresh}
        onExport={handleExportCSV}
        exportLabel="Export CSV"
        onRowClick={(row) => router.push(`/expenses/bills-payments/payment-runs/${row.id}/edit`)}
        emptyTitle={loading ? 'Loading payment runs…' : 'No payment runs found'}
        emptySubtitle="Use search or filters to find runs"
        loading={loading}
      />
    </div>
  )
}
