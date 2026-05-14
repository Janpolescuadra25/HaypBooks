'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Eye, Printer, TrendingUp, Clock, AlertCircle, Ban } from 'lucide-react'
import { apService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
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
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<ApAgingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

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
    const q = search.toLowerCase()
    if (!q) return rows
    return rows.filter((row) => (row.vendorName ?? '').toLowerCase().includes(q))
  }, [rows, search])

  const exportRows = filtered

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

  const stats = useMemo(() => [
    { icon: TrendingUp, label: 'Current', value: rows.filter((row) => row.current > 0).length, color: 'emerald' },
    { icon: Clock, label: '31-60 Days', value: rows.filter((row) => row.days31To60 > 0).length, color: 'amber' },
    { icon: AlertCircle, label: '61-90 Days', value: rows.filter((row) => row.days61To90 > 0).length, color: 'orange' },
    { icon: Ban, label: 'Over 90 Days', value: rows.filter((row) => row.over90 > 0).length, color: 'rose' },
  ], [rows])

  const handleViewDetails = useCallback(
    (row: ApAgingRow) => {
      if (!row?.id || row.id.startsWith('vendor-')) {
        toast.info('Vendor details unavailable for this entry')
        return
      }
      router.push(`/expenses/procurement/vendors/${row.id}`)
    },
    [router, toast],
  )

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'View Vendor',
      icon: <Eye size={14} />,
      onClick: (_id, row) => handleViewDetails(row),
    },
    {
      label: 'Print Report',
      icon: <Printer size={14} />,
      onClick: () => window.print(),
    },
  ], [handleViewDetails])

  const handleExportCSV = useCallback(() => {
    csvDownload(`ap-aging-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Vendor', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total'],
      exportRows.map((row) => [
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
  }, [exportRows, toast])

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
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="ap-aging"
        title="A/P Aging"
        description="Monitor accounts payable aging balances by bucket."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        stats={stats}
        actions={actions}
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
    </div>
  )
}
