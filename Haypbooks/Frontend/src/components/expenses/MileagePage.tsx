'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Download, Clock, Pencil, Trash2, Car, CheckCircle, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface MileageLog {
  id: string
  date: string
  employee?: string
  purpose?: string
  route?: string
  distanceKm?: number
  rate?: number
  amount: number
  status?: string
}

export default function MileagePage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<MileageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchMileage = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listMileageLogs(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.mileageLogs ?? [])
    } catch {
      setError('Failed to load mileage logs')
      toast.error('Failed to load mileage logs')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchMileage() }, [fetchMileage])

  const openNewMileage = useCallback(() => {
    router.push('/expenses/employee-expenses/mileage/new')
  }, [router])

  const openEditMileage = useCallback((id: string) => {
    router.push(`/expenses/employee-expenses/mileage/${id}/edit`)
  }, [router])

  const handleDeleteMileage = useCallback((id: string) => {
    if (!confirm('Delete this mileage log?')) return
    setRows((prev) => prev.filter((row) => row.id !== id))
    toast.success('Mileage log deleted')
  }, [toast])

  const dateFiltered = useMemo(() => {
    return rows
      .filter((row) => (dateFrom ? row.date >= dateFrom : true))
      .filter((row) => (dateTo ? row.date <= dateTo : true))
  }, [rows, dateFrom, dateTo])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return dateFiltered.filter((row) => (
      row.employee?.toLowerCase().includes(q) ||
      row.purpose?.toLowerCase().includes(q) ||
      row.route?.toLowerCase().includes(q)
    ))
  }, [dateFiltered, search])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['amount'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const stats = useMemo(() => [
    { icon: Car, label: 'Total Trips', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Pending', value: rows.filter((row) => row.status === 'DRAFT' || row.status === 'SUBMITTED').length, color: 'amber' },
    { icon: CheckCircle, label: 'Approved', value: rows.filter((row) => row.status === 'APPROVED').length, color: 'emerald' },
    { icon: CreditCard, label: 'Rejected', value: rows.filter((row) => row.status === 'REJECTED').length, color: 'red' },
  ], [rows])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      onClick: (_id, row) => openEditMileage(row.id),
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (_id, row) => handleDeleteMileage(row.id),
    },
  ], [handleDeleteMileage, openEditMileage])

  const columns = useMemo<HaypColumn<MileageLog>[]>(() => [
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      size: 120,
      minSize: 120,
      render: (value) => <span className="text-gray-700">{fmtDate(value)}</span>,
    },
    {
      id: 'employee',
      header: 'Employee',
      accessorKey: 'employee',
      size: 170,
      minSize: 140,
      render: (value) => <span className="font-medium text-gray-900">{value ?? '—'}</span>,
    },
    {
      id: 'purpose',
      header: 'Purpose',
      accessorKey: 'purpose',
      size: 180,
      minSize: 140,
      render: (value) => <span className="text-gray-700 truncate">{value ?? '—'}</span>,
    },
    {
      id: 'route',
      header: 'Route',
      accessorKey: 'route',
      size: 190,
      minSize: 140,
      render: (value) => <span className="text-gray-600 text-xs truncate">{value ?? '—'}</span>,
    },
    {
      id: 'distanceKm',
      header: 'Km',
      accessorKey: 'distanceKm',
      size: 90,
      minSize: 80,
      align: 'right',
      isSummable: false,
      render: (value) => <span className="font-medium text-gray-700 tabular-nums">{value ?? 0}</span>,
    },
    {
      id: 'rate',
      header: 'Rate/Km',
      accessorKey: 'rate',
      size: 100,
      minSize: 90,
      align: 'right',
      render: (value) => <span className="text-gray-600 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
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
  ], [currency])

  const handleExportCSV = useCallback(() => {
    csvDownload(`mileage-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Date', 'Employee', 'Purpose', 'Route', 'Km', 'Rate/Km', 'Amount', 'Status'],
      filtered.map((row) => [
        row.date,
        row.employee ?? '',
        row.purpose ?? '',
        row.route ?? '',
        String(row.distanceKm ?? 0),
        String(row.rate ?? 0),
        String(row.amount),
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
        csvDownload(`mileage-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Date', 'Employee', 'Purpose', 'Route', 'Km', 'Rate/Km', 'Amount', 'Status'],
          selectedRows.map((row) => [
            row.date,
            row.employee ?? '',
            row.purpose ?? '',
            row.route ?? '',
            String(row.distanceKm ?? 0),
            String(row.rate ?? 0),
            String(row.amount),
            row.status ?? '',
          ]),
        )
        toast.success('Selected rows exported')
      },
    },
  ], [toast])

  const handleRefresh = useCallback(() => {
    fetchMileage()
  }, [fetchMileage])

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="mileage"
        title="Mileage"
        description="Track mileage logs with amount totals."
        headerActions={
          <button onClick={openNewMileage} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> Log Mileage</button>
        }
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        dateRange={{ start: dateFrom ? new Date(dateFrom) : new Date('1970-01-01'), end: dateTo ? new Date(dateTo) : new Date() }}
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
        onActivityLog={() => router.push('/expenses/employee-expenses/mileage/activity')}
        onRowClick={(row) => openEditMileage(row.id)}
        emptyTitle="No mileage logs found"
        emptySubtitle="Adjust your search or filters to see results"
        loading={loading}
      />
      </div>

    </div>
  )
}
