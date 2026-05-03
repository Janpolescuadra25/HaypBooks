'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Download, RefreshCw } from 'lucide-react'
import { apService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { csvDownload } from './_helpers'

interface ApAgingRow {
  id: string
  vendorName?: string
  current: number
  days1To30: number
  days31To60: number
  days61To90: number
  over90: number
  total: number
}

export default function ApAgingPage() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<ApAgingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')

  const fetchAging = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await apService.listApAging(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.rows ?? [])
    } catch {
      setError('Failed to load AP aging')
      toast.error('Failed to load AP aging')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchAging() }, [fetchAging])

  const filtered = useMemo(() => {
    const base = activeFilter === 'ALL'
      ? rows
      : rows.filter((row) => (row.vendorName ?? '').toLowerCase().includes(activeFilter.toLowerCase()))
    return base
  }, [rows, activeFilter])

  const filters = useMemo(() => [], [])

  const columns = useMemo<HaypColumn<ApAgingRow>[]>(() => [
    {
      id: 'vendorName',
      header: 'Vendor',
      accessorKey: 'vendorName',
      size: 240,
      minSize: 180,
      render: (value) => <span className="font-semibold text-gray-800">{value ?? '—'}</span>,
    },
    {
      id: 'current',
      header: 'Current',
      accessorKey: 'current',
      size: 110,
      minSize: 90,
      align: 'right',
      isSummable: true,
      render: (value) => (
        <span className="tabular-nums font-medium text-emerald-700">{formatCurrency(value ?? 0, currency)}</span>
      ),
    },
    {
      id: 'days1To30',
      header: '1–30 Days',
      accessorKey: 'days1To30',
      size: 120,
      minSize: 90,
      align: 'right',
      isSummable: true,
      render: (value) => (
        <span className={cn('tabular-nums font-medium', value > 0 ? 'text-amber-600' : 'text-gray-400')}>
          {formatCurrency(value ?? 0, currency)}
        </span>
      ),
    },
    {
      id: 'days31To60',
      header: '31–60 Days',
      accessorKey: 'days31To60',
      size: 120,
      minSize: 90,
      align: 'right',
      isSummable: true,
      render: (value) => (
        <span className={cn('tabular-nums font-medium', value > 0 ? 'text-orange-600' : 'text-gray-400')}>
          {formatCurrency(value ?? 0, currency)}
        </span>
      ),
    },
    {
      id: 'days61To90',
      header: '61–90 Days',
      accessorKey: 'days61To90',
      size: 120,
      minSize: 90,
      align: 'right',
      isSummable: true,
      render: (value) => (
        <span className={cn('tabular-nums font-medium', value > 0 ? 'text-red-500' : 'text-gray-400')}>
          {formatCurrency(value ?? 0, currency)}
        </span>
      ),
    },
    {
      id: 'over90',
      header: '90+ Days',
      accessorKey: 'over90',
      size: 120,
      minSize: 90,
      align: 'right',
      isSummable: true,
      render: (value) => (
        <span className={cn('tabular-nums font-bold', value > 0 ? 'text-rose-700' : 'text-gray-400')}>
          {formatCurrency(value ?? 0, currency)}
        </span>
      ),
    },
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'total',
      size: 130,
      minSize: 100,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-bold text-gray-900 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
    },
  ], [currency])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['current', 'days1To30', 'days31To60', 'days61To90', 'over90', 'total'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const handleExportCSV = useCallback(() => {
    csvDownload(`ap-aging-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Vendor', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total'],
      rows.map((row) => [
        row.vendorName ?? '',
        String(row.current),
        String(row.days1To30),
        String(row.days31To60),
        String(row.days61To90),
        String(row.over90),
        String(row.total),
      ]),
    )
    toast.success('CSV exported')
  }, [rows, toast])

  const bulkActions = useMemo<HaypBulkAction[]>(() => [
    {
      label: 'Export selected',
      icon: <Download className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (_ids, selectedRows) => {
        if (selectedRows.length === 0) return
        csvDownload(`ap-aging-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Vendor', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total'],
          selectedRows.map((row) => [
            row.vendorName ?? '',
            String(row.current),
            String(row.days1To30),
            String(row.days31To60),
            String(row.days61To90),
            String(row.over90),
            String(row.total),
          ]),
        )
        toast.success('Selected rows exported')
      },
    },
  ], [toast])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">AP Aging</h1>
          <p className="mt-2 text-sm text-emerald-600/70">Track outstanding vendor balances and aging buckets.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={fetchAging} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        {error && <div className="col-span-full rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">Status filter is unavailable for AP Aging</span>
        </div>
      </div>

      <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="ap-aging"
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={filters}
        activeFilter=""
        onFilterChange={() => {}}
        filterLabel="All"
        bulkActions={bulkActions}
        totals={totals}
        onRefresh={fetchAging}
        onExport={handleExportCSV}
        exportLabel="Export CSV"
        emptyTitle="No aging data found"
        emptySubtitle="Adjust your search or refresh to see results"
        loading={loading}
      />
    </div>
  )
}
