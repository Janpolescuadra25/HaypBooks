'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Eye, Check, Ban, X } from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn, HaypActionItem, HaypBulkAction, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface VendorCredit {
  id: string
  creditNumber?: string
  vendorName?: string
  issueDate: string
  status?: string
  amount: number
  availableAmount?: number
}

const STATUSES = ['ALL', 'OPEN', 'PARTIALLY_USED', 'APPLIED', 'VOID'] as const

export default function VendorCreditsPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows] = useState<VendorCredit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>('ALL')
  const [toast, setToast] = useState('')

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }, [])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchCredits = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listVendorCredits(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.vendorCredits ?? [])
    } catch {
      setError('Failed to load vendor credits')
      showToast('Failed to load vendor credits')
    } finally {
      setLoading(false)
    }
  }, [companyId, showToast])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const handleApply = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await expensesService.applyVendorCredit(companyId, id)
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'APPLIED', availableAmount: 0 } : row)))
      showToast('Credit applied')
    } catch {
      showToast('Failed to apply credit')
    }
  }, [companyId, showToast])

  const handleVoid = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Void this vendor credit? This will preserve the audit trail.')) return
    try {
      await expensesService.updateVendorCredit(companyId, id, { status: 'VOID' })
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'VOID', availableAmount: 0 } : row)))
      showToast('Credit voided')
    } catch {
      showToast('Failed to void credit')
    }
  }, [companyId, showToast])

  const handleDeleteCredit = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Delete this vendor credit? This action cannot be undone.')) return
    try {
      await expensesService.deleteVendorCredit(companyId, id)
      setRows((prev) => prev.filter((row) => row.id !== id))
      showToast('Credit deleted')
    } catch {
      showToast('Failed to delete credit')
    }
  }, [companyId, showToast])

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') list = list.filter((row) => row.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((row) =>
        (row.creditNumber ?? '').toLowerCase().includes(q) ||
        (row.vendorName ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [rows, statusFilter, search])

  const columns = useMemo<HaypColumn<VendorCredit>[]>(() => [
    {
      id: 'creditNumber',
      accessorKey: 'creditNumber',
      header: 'Credit #',
      size: 140,
      minSize: 140,
      enableSorting: true,
      align: 'left',
      render: (value) => renderCell(value, 'creditNumber'),
    },
    {
      id: 'vendorName',
      accessorKey: 'vendorName',
      header: 'Vendor',
      size: 200,
      minSize: 150,
      enableSorting: true,
      align: 'left',
      render: (value) => renderCell(value, 'vendorName'),
    },
    {
      id: 'issueDate',
      accessorKey: 'issueDate',
      header: 'Issue Date',
      size: 115,
      minSize: 120,
      enableSorting: true,
      align: 'left',
      render: (value) => renderCell(value, 'issueDate'),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      size: 130,
      minSize: 100,
      enableSorting: true,
      align: 'left',
      render: (value) => renderCell(value, 'status'),
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: 'Amount',
      size: 130,
      minSize: 120,
      enableSorting: true,
      align: 'right',
      render: (value) => renderCell(value, 'amount'),
    },
    {
      id: 'availableAmount',
      accessorKey: 'availableAmount',
      header: 'Remaining',
      size: 130,
      minSize: 120,
      enableSorting: true,
      align: 'right',
      render: (value) => renderCell(value, 'availableAmount'),
    },
  ], [fmt])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['amount', 'availableAmount'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit Credit',
      icon: <Eye size={14} />,
      onClick: (_rowId, row) => router.push(`/expenses/bills-payments/vendor-credits/${row.id}/edit`),
    },
    {
      label: '',
      onClick: () => {},
      divider: true,
    },
    {
      label: 'Apply Credit',
      icon: <Check size={14} />,
      show: (row) => row.status === 'OPEN' || row.status === 'PARTIALLY_USED',
      onClick: (_rowId, row) => handleApply(row.id),
    },
    {
      label: 'Void Credit',
      icon: <Ban size={14} />,
      danger: true,
      show: (row) => (row.status ?? 'OPEN') !== 'VOID',
      onClick: (_rowId, row) => handleVoid(row.id),
    },
    {
      label: 'Delete Credit',
      icon: <X size={14} />,
      danger: true,
      show: (row) => (row.status ?? 'OPEN') === 'VOID',
      onClick: (_rowId, row) => handleDeleteCredit(row.id),
    },
  ], [handleApply, handleDeleteCredit, handleVoid, router])

  const bulkActions = useMemo<HaypBulkAction[]>(() => [
    {
      label: 'Void Selected',
      variant: 'danger',
      onClick: (_selectedIds, selectedRows) => {
        if (!companyId || selectedRows.length === 0) return
        const voidable = selectedRows.filter((row) => row.id != null && (row.status ?? 'OPEN') !== 'VOID') as VendorCredit[]
        if (voidable.length === 0) {
          showToast('No selected credits can be voided')
          return
        }
        if (!confirm(`Void ${voidable.length} selected credit${voidable.length !== 1 ? 's' : ''}?`)) return
        voidable.forEach(async (row) => {
          try {
            await expensesService.updateVendorCredit(companyId, row.id, { status: 'VOID' })
          } catch {
            showToast('Failed to void selected credits')
          }
        })
        setRows((prev) => prev.map((row) =>
          voidable.some((selected) => selected.id === row.id)
            ? { ...row, status: 'VOID', availableAmount: 0 }
            : row,
        ))
        showToast(`${voidable.length} selected credit${voidable.length !== 1 ? 's' : ''} voided`)
      },
    },
    {
      label: 'Export Selected',
      icon: <Download size={14} />,
      onClick: (_selectedIds, selectedRows) => {
        if (selectedRows.length === 0) return
        csvDownload(`vendor-credits-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Credit #', 'Vendor', 'Issue Date', 'Status', 'Amount', 'Remaining'],
          selectedRows.map((row) => [row.creditNumber ?? '', row.vendorName ?? '', row.issueDate, row.status ?? '', String(row.amount), String(row.availableAmount ?? 0)]),
        )
        showToast('Selected credits exported')
      },
    },
  ], [companyId, showToast])

  const filterLabel = statusFilter === 'ALL' ? 'Status' : statusFilter.toLowerCase().replace(/_/g, ' ')

  const handleExportCSV = useCallback(() => {
    csvDownload(`vendor-credits-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Credit #', 'Vendor', 'Issue Date', 'Status', 'Amount', 'Remaining'],
      filtered.map((row) => [row.creditNumber ?? '', row.vendorName ?? '', row.issueDate, row.status ?? '', String(row.amount), String(row.availableAmount ?? 0)]),
    )
    showToast('CSV exported')
  }, [filtered, showToast])

  const renderCell = useCallback((value: any, key: string) => {
    switch (key) {
      case 'creditNumber':
        return <span className="font-semibold text-gray-800">{value ?? '—'}</span>
      case 'vendorName':
        return <span className="text-gray-700 truncate">{value ?? '—'}</span>
      case 'issueDate':
        return <span className="text-gray-500">{fmtDate(value)}</span>
      case 'status':
        return <StatusPill status={value ?? 'OPEN'} />
      case 'amount':
        return <span className="font-semibold text-emerald-800 tabular-nums">{fmt(value)}</span>
      case 'availableAmount':
        return <span className={`font-semibold tabular-nums ${(value ?? 0) > 0 ? 'text-blue-700' : 'text-gray-400'}`}>{fmt(value ?? 0)}</span>
      default:
        return <span className="truncate">{value ?? '—'}</span>
    }
  }, [fmt])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Vendor Credits</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${filtered.length} credits`}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => router.push('/expenses/bills-payments/vendor-credits/new')} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"><Plus size={15} /> New Credit</button>
        </div>
      </div>

      <HaypDataTable
        tableId="vendor-credits"
        columns={columns}
        data={filtered}
        loading={loading || cidLoading}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        searchPlaceholder="Search credits..."
        filters={STATUSES.map((status) => ({ value: status.toLowerCase(), label: status === 'ALL' ? 'All' : status.replace(/_/g, ' ') }))}
        activeFilter={statusFilter.toLowerCase()}
        onFilterChange={(value: any) => setStatusFilter(String(value).toUpperCase() as (typeof STATUSES)[number])}
        filterLabel={filterLabel}
        onRefresh={fetchCredits}
        onExport={handleExportCSV}
        onActivityLog={() => router.push('/expenses/bills-payments/vendor-credits/activity')}
        actions={actions}
        bulkActions={bulkActions}
        totals={totals}
        actions={actions}
        emptyTitle="No credits found"
        emptySubtitle="Adjust your search or filter to see results"
        className="mt-4"
      />

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">{toast}</div>}
    </div>
  )
}
