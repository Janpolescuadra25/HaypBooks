'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Filter, Clock, Pencil, Trash2, Calendar, CheckCircle, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import HaypSelect from '@/components/shared/HaypSelect'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface PerDiem {
  id: string
  perDiemNumber?: string
  employee?: string
  destination?: string
  startDate: string
  endDate: string
  days?: number
  dailyRate?: number
  total: number
  status?: string
  postingStatus?: string
}

const POSTING_STATUSES = ['ALL', 'DRAFT', 'POSTED', 'VOIDED'] as const

type StatusFilter = 'ALL' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
const STATUSES: StatusFilter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']

export default function PerDiemPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<PerDiem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [postingStatusFilter, setPostingStatusFilter] = useState<(typeof POSTING_STATUSES)[number]>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchRows = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listPerDiem(companyId, {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        postingStatus: postingStatusFilter !== 'ALL' ? postingStatusFilter : undefined,
      })
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.perDiem ?? [])
    } catch {
      setError('Failed to load per diem claims')
      toast.error('Failed to load per diem claims')
    } finally {
      setLoading(false)
    }
  }, [companyId, postingStatusFilter, statusFilter, toast])

  useEffect(() => { fetchRows() }, [fetchRows])


  const handleDeletePerDiem = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Delete this per diem claim?')) return
    try {
      await expensesService.deletePerDiem(companyId, id)
      setRows((prev) => prev.filter((row) => row.id !== id))
      toast.success('Per diem claim deleted')
    } catch {
      toast.error('Failed to delete per diem. Backend delete endpoint may not exist yet.')
    }
  }, [companyId, toast])

  const dateFiltered = useMemo(() => {
    return rows
      .filter((row) => (dateFrom ? row.startDate >= dateFrom : true))
      .filter((row) => (dateTo ? row.startDate <= dateTo : true))
  }, [rows, dateFrom, dateTo])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return dateFiltered
      .filter((row) => (
        row.perDiemNumber?.toLowerCase().includes(q) ||
        row.employee?.toLowerCase().includes(q) ||
        row.destination?.toLowerCase().includes(q)
      ))
  }, [dateFiltered, search])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['total'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const stats = useMemo(() => [
    { icon: Calendar, label: 'Total Entries', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Pending', value: rows.filter((row) => row.status === 'DRAFT' || row.status === 'SUBMITTED').length, color: 'amber' },
    { icon: CheckCircle, label: 'Approved', value: rows.filter((row) => row.status === 'APPROVED').length, color: 'emerald' },
    { icon: Wallet, label: 'Rejected', value: rows.filter((row) => row.status === 'REJECTED').length, color: 'rose' },
  ], [rows])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      onClick: (_id, row) => router.push(`/expenses/employee-expenses/per-diem/${row.id}/edit`),
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (_id, row) => handleDeletePerDiem(row.id),
    },
  ], [handleDeletePerDiem])

  const columns = useMemo<HaypColumn<PerDiem>[]>(() => [
    {
      id: 'perDiemNumber',
      header: 'Per Diem #',
      accessorKey: 'perDiemNumber',
      size: 140,
      minSize: 120,
      render: (value) => <span className="font-semibold text-gray-900">{value ?? '—'}</span>,
    },
    {
      id: 'employee',
      header: 'Employee',
      accessorKey: 'employee',
      size: 170,
      minSize: 140,
      render: (value) => <span className="text-gray-800">{value ?? '—'}</span>,
    },
    {
      id: 'destination',
      header: 'Destination',
      accessorKey: 'destination',
      size: 160,
      minSize: 140,
      render: (value) => <span className="text-gray-700 truncate">{value ?? '—'}</span>,
    },
    {
      id: 'startDate',
      header: 'Start',
      accessorKey: 'startDate',
      size: 110,
      minSize: 100,
      render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
    },
    {
      id: 'endDate',
      header: 'End',
      accessorKey: 'endDate',
      size: 110,
      minSize: 100,
      render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
    },
    {
      id: 'days',
      header: 'Days',
      accessorKey: 'days',
      size: 80,
      minSize: 70,
      align: 'right',
      render: (value) => <span className="tabular-nums font-medium text-gray-700">{value ?? 0}</span>,
    },
    {
      id: 'dailyRate',
      header: 'Daily Rate',
      accessorKey: 'dailyRate',
      size: 110,
      minSize: 90,
      align: 'right',
      render: (value) => <span className="text-gray-600 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
    },
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'total',
      size: 120,
      minSize: 100,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
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
      id: 'postingStatus',
      header: 'Posting',
      accessorKey: 'postingStatus',
      size: 110,
      minSize: 100,
      render: (value) => <StatusPill status={value ?? 'DRAFT'} type="posting" />,
    },
  ], [currency])

  const handleExportCSV = useCallback(() => {
    csvDownload(`per-diem-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Per Diem #', 'Employee', 'Destination', 'Start', 'End', 'Days', 'Daily Rate', 'Total', 'Status'],
      filtered.map((row) => [
        row.perDiemNumber ?? '',
        row.employee ?? '',
        row.destination ?? '',
        row.startDate,
        row.endDate,
        String(row.days ?? 0),
        String(row.dailyRate ?? 0),
        String(row.total),
        row.status ?? '',
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
        csvDownload(`per-diem-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Per Diem #', 'Employee', 'Destination', 'Start', 'End', 'Days', 'Daily Rate', 'Total', 'Status'],
          selectedRows.map((row) => [
            row.perDiemNumber ?? '',
            row.employee ?? '',
            row.destination ?? '',
            row.startDate,
            row.endDate,
            String(row.days ?? 0),
            String(row.dailyRate ?? 0),
            String(row.total),
            row.status ?? '',
          ]),
        )
        toast.success('Selected rows exported')
      },
    },
  ], [toast])

  const handleRefresh = useCallback(() => {
    fetchRows()
  }, [fetchRows])

  const activeFilterCount = [statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        <HaypDataTable
        headerActions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <HaypSelect
              label="Posting Status"
              value={postingStatusFilter}
              onChange={(value) => setPostingStatusFilter(String(value) as (typeof POSTING_STATUSES)[number])}
              options={POSTING_STATUSES.map((status) => ({ value: status, label: status === 'ALL' ? 'All Posting Statuses' : status }))}
              className="min-w-[220px]"
            />
            <button onClick={() => router.push('/expenses/employee-expenses/per-diem/new')} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> New Claim</button>
          </div>
        }
        data={filtered}
        columns={columns}
        tableId="per-diem"
        title="Per Diem"
        description="Track employee per diem claims and reimbursements."
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
        stats={stats}
        actions={actions}
        bulkActions={bulkActions}
        totals={totals}
        onRefresh={handleRefresh}
        onExport={handleExportCSV}
        exportLabel="Export CSV"
        onActivityLog={() => router.push('/expenses/employee-expenses/per-diem/activity')}
        onRowClick={(row) => router.push(`/expenses/employee-expenses/per-diem/${row.id}/edit`)}
        emptyTitle={loading ? 'Loading per diem claims…' : 'No per diem claims found'}
        emptySubtitle="Use search or filters to locate claims"
        loading={loading}
      />
      </div>

    </div>
  )
}
