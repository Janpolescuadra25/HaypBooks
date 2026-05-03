'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, ArrowUpRight, X, ListOrdered, Clock, Check, FileText, CheckCircle, XCircle } from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface PurchaseRequest {
  id: string
  prNumber?: string
  requestedBy?: string
  vendorName?: string
  date: string
  dateNeeded?: string
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED'
  total: number
}

const STATUSES = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ORDERED'] as const

export default function PurchaseRequestsPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows] = useState<PurchaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [toast, setToast] = useState('')

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }, [])

  const fetchRows = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await expensesService.listPurchaseRequests(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.purchaseRequests ?? [])
    } catch {
      setError('Failed to load purchase requests')
      showToast('Failed to load purchase requests')
    } finally {
      setLoading(false)
    }
  }, [companyId, showToast])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') {
      list = list.filter((row) => row.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (row) =>
          (row.prNumber ?? '').toLowerCase().includes(q) ||
          (row.requestedBy ?? '').toLowerCase().includes(q) ||
          (row.vendorName ?? '').toLowerCase().includes(q),
      )
    }
    if (dateFrom) {
      list = list.filter((row) => row.date >= dateFrom)
    }
    if (dateTo) {
      list = list.filter((row) => row.date <= dateTo)
    }
    return list
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const handleSubmitRequest = useCallback(
    async (id: string) => {
      if (!companyId) return
      try {
        await expensesService.updatePurchaseRequest(companyId, id, { status: 'PENDING' })
        setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'PENDING' } : row)))
        showToast('Purchase request submitted')
      } catch {
        showToast('Failed to submit purchase request')
      }
    },
    [companyId, showToast],
  )

  const handleDeleteSelected = useCallback(
    async (selectedIds: string[], selectedRows: PurchaseRequest[]) => {
      if (!companyId || selectedIds.length === 0) return
      const draftRows = selectedRows.filter((row) => row.status === 'DRAFT')
      if (draftRows.length === 0) {
        showToast('Only draft purchase requests can be deleted')
        return
      }
      if (!confirm(`Delete ${draftRows.length} selected purchase request${draftRows.length !== 1 ? 's' : ''}?`)) return
      try {
        await Promise.all(draftRows.map((row) => expensesService.deletePurchaseRequest(companyId, row.id)))
        setRows((prev) => prev.filter((row) => !selectedIds.includes(row.id)))
        showToast(`${draftRows.length} purchase request${draftRows.length !== 1 ? 's' : ''} deleted`)
      } catch {
        showToast('Failed to delete selected purchase requests')
      }
    },
    [companyId, showToast],
  )

  const handleSubmitSelected = useCallback(
    async (selectedIds: string[], selectedRows: PurchaseRequest[]) => {
      if (!companyId || selectedIds.length === 0) return
      const draftRows = selectedRows.filter((row) => row.status === 'DRAFT')
      if (draftRows.length === 0) {
        showToast('No draft purchase requests selected')
        return
      }
      if (!confirm(`Submit ${draftRows.length} selected purchase request${draftRows.length !== 1 ? 's' : ''} for approval?`)) return
      try {
        await Promise.all(draftRows.map((row) => expensesService.updatePurchaseRequest(companyId, row.id, { status: 'PENDING' })))
        setRows((prev) =>
          prev.map((row) =>
            selectedIds.includes(row.id) && row.status === 'DRAFT' ? { ...row, status: 'PENDING' } : row,
          ),
        )
        showToast(`${draftRows.length} purchase request${draftRows.length !== 1 ? 's' : ''} submitted`)
      } catch {
        showToast('Failed to submit selected purchase requests')
      }
    },
    [companyId, showToast],
  )

  const handleExportAll = useCallback(() => {
    csvDownload(
      `purchase-requests-${new Date().toISOString().slice(0, 10)}.csv`,
      ['PR #', 'Requested By', 'Vendor', 'Date', 'Date Needed', 'Status', 'Total'],
      filtered.map((row) => [row.prNumber ?? '', row.requestedBy ?? '', row.vendorName ?? '', row.date, row.dateNeeded ?? '', row.status ?? '', String(row.total)]),
    )
    showToast('CSV exported')
  }, [filtered, showToast])

  const columns = useMemo<HaypColumn<PurchaseRequest>>(
    () => [
      {
        id: 'prNumber',
        accessorKey: 'prNumber',
        header: 'PR #',
        size: 130,
        minSize: 150,
        enableSorting: true,
        render: (value) => <span className="font-semibold text-gray-800">{value ?? '—'}</span>,
      },
      {
        id: 'requestedBy',
        accessorKey: 'requestedBy',
        header: 'Requested By',
        size: 170,
        minSize: 150,
        enableSorting: true,
        render: (value) => <span className="text-gray-700">{value ?? '—'}</span>,
      },
      {
        id: 'vendorName',
        accessorKey: 'vendorName',
        header: 'Vendor',
        size: 200,
        minSize: 150,
        enableSorting: true,
        render: (value) => <span className="text-gray-600 truncate">{value ?? '—'}</span>,
      },
      {
        id: 'date',
        accessorKey: 'date',
        header: 'Date',
        size: 115,
        minSize: 120,
        enableSorting: true,
        render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
      },
      {
        id: 'dateNeeded',
        accessorKey: 'dateNeeded',
        header: 'Date Needed',
        size: 130,
        enableSorting: true,
        render: (value) => <span className="text-gray-500">{value ? fmtDate(value) : '—'}</span>,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        minSize: 100,
        enableSorting: true,
        render: (value) => <StatusPill status={value ?? 'DRAFT'} />,
      },
      {
        id: 'total',
        accessorKey: 'total',
        header: 'Total',
        size: 130,
        minSize: 120,
        enableSorting: true,
        align: 'right',
        isSummable: true,
        render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
      },
    ],
    [currency],
  )

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['total'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const actions = useMemo<HaypActionItem[]>(
    () => [
      {
        label: 'Edit Request',
        icon: <Eye size={14} />,
        onClick: (id) => router.push(`/expenses/procurement/purchase-requests/${id}/edit`),
      },
      { divider: true, label: '', onClick: () => {} },
      {
        label: 'Submit for Approval',
        icon: <ArrowUpRight size={14} />,
        show: (row) => row.status === 'DRAFT',
        onClick: (id) => handleSubmitRequest(id),
      },
    ],
    [handleSubmitRequest, router],
  )

  const bulkActions = useMemo<HaypBulkAction[]>(
    () => [
      {
        label: 'Delete Selected',
        icon: <X size={14} />,
        variant: 'danger',
        onClick: handleDeleteSelected,
      },
      {
        label: 'Submit Selected',
        icon: <ArrowUpRight size={14} />,
        onClick: handleSubmitSelected,
      },
      {
        label: 'Export Selected',
        icon: <Plus size={14} />,
        onClick: (selectedIds, selectedRows) => {
          if (selectedRows.length === 0) return
          csvDownload(
            `purchase-requests-selected-${new Date().toISOString().slice(0, 10)}.csv`,
            ['PR #', 'Requested By', 'Vendor', 'Date', 'Date Needed', 'Status', 'Total'],
            selectedRows.map((row) => [row.prNumber ?? '', row.requestedBy ?? '', row.vendorName ?? '', row.date, row.dateNeeded ?? '', row.status ?? '', String(row.total)]),
          )
          showToast('Selected purchase requests exported')
        },
      },
    ],
    [handleDeleteSelected, handleSubmitSelected, showToast],
  )

  const filterOptions = STATUSES.map((status) => ({ value: status.toLowerCase(), label: status === 'ALL' ? 'All' : status }))
  const filterLabel = statusFilter === 'ALL' ? 'Status' : `Status: ${statusFilter}`

  const stats = useMemo(() => [
    { icon: FileText, label: 'Total Requests', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Pending', value: rows.filter(r => r.status === 'PENDING').length, color: 'amber' },
    { icon: CheckCircle, label: 'Approved', value: rows.filter(r => r.status === 'APPROVED').length, color: 'emerald' },
    { icon: XCircle, label: 'Rejected', value: rows.filter(r => r.status === 'REJECTED').length, color: 'rose' },
  ], [rows])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Purchase Requests</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${filtered.length} requests`}</p>
        </div>
        <div>
          <button
            onClick={() => router.push('/expenses/procurement/purchase-requests/new')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus size={15} /> New PR
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
          <input
            type="date"
            title="Date from"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
          <input
            type="date"
            title="Date to"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <HaypDataTable
        tableId="purchase-requests"
        title="Purchase Requests"
        description="Track purchase requests through review and approval."
        columns={columns}
        data={filtered}
        loading={loading || cidLoading}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        searchPlaceholder="Search purchase requests..."
        filters={filterOptions}
        activeFilter={statusFilter.toLowerCase()}
        onFilterChange={(value) => setStatusFilter(String(value).toUpperCase() as (typeof STATUSES)[number])}
        filterLabel={filterLabel}
        actions={actions}
        bulkActions={bulkActions}
        totals={totals}
        stats={stats}
        onRefresh={fetchRows}
        onExport={handleExportAll}
        onActivityLog={() => router.push('/expenses/procurement/requests/activity')}
        emptyTitle="No purchase requests found"
        emptySubtitle="Create a new purchase request to get started"
        className="mt-4"
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}
