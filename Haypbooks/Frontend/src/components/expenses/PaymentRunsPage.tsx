'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Filter, Eye, Trash2, FileText, AlertCircle, CheckCircle } from 'lucide-react'
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

  const dateFiltered = useMemo(() => {
    return rows
      .filter((run) => (dateFrom ? run.paymentDate >= dateFrom : true))
      .filter((run) => (dateTo ? run.paymentDate <= dateTo : true))
  }, [rows, dateFrom, dateTo])

  const filtered = useMemo(() => {
    return dateFiltered
      .filter((run) => statusFilter === 'ALL' || run.status === statusFilter)
      .filter((run) => {
        const q = search.toLowerCase()
        return (
          run.runNumber?.toLowerCase().includes(q) ||
          run.method?.toLowerCase().includes(q)
        )
      })
  }, [dateFiltered, statusFilter, search])

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

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <HaypDataTable
          data={dateFiltered}
          columns={columns}
          tableId="payment-runs"
          title="Payment Runs"
          description="Manage batch payment runs and review totals."
          stats={stats}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          filters={STATUSES.map((status) => ({ value: status, label: status === 'ALL' ? 'All' : status }))}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          filterLabel="Status"
          dateRange={{ start: dateFrom ? new Date(dateFrom) : new Date('1970-01-01'), end: dateTo ? new Date(dateTo) : new Date('9999-12-31') }}
          onDateRangeChange={({ start, end }) => {
            setDateFrom(start.toISOString().slice(0, 10))
            setDateTo(end.toISOString().slice(0, 10))
          }}
          actions={actions}
          bulkActions={bulkActions}
          totals={totals}
          onRefresh={handleRefresh}
          onExport={handleExportCSV}
          exportLabel="Export CSV"
          onActivityLog={() => router.push('/expenses/bills-payments/payment-runs/activity')}
          onRowClick={(row) => router.push(`/expenses/bills-payments/payment-runs/${row.id}/edit`)}
          emptyTitle={loading ? 'Loading payment runs…' : 'No payment runs found'}
          emptySubtitle="Use search or filters to find runs"
          loading={loading}
        />
      </div>
    </div>
  )
}
