'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, FileText, Check, X, ListOrdered, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface PurchaseOrder {
  id: string
  poNumber?: string
  vendorName?: string
  date: string
  expectedDelivery?: string
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RECEIVED' | 'PARTIAL_RECEIVED' | 'CANCELLED'
  total: number
}

const STATUSES = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'RECEIVED', 'CANCELLED'] as const
const CONVERTABLE_STATUSES = ['APPROVED', 'RECEIVED', 'PARTIAL_RECEIVED']

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 3000)
  }, [])

  const fetchRows = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await expensesService.listPurchaseOrders(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.purchaseOrders ?? [])
    } catch {
      setError('Failed to load purchase orders')
      toast.error('Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

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
          (row.poNumber ?? '').toLowerCase().includes(q) ||
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

  const handleConvertToBill = useCallback(
    async (id: string) => {
      if (!companyId) return
      try {
        const res = await expensesService.convertPurchaseOrderToBill(companyId, id)
        const data = res.data ?? res
        const billId = data?.id ?? data?.bill?.id ?? data?.billId
        if (billId) {
          toast.success('Bill created from PO')
          router.push(`/expenses/bills-payments/bills/${billId}/edit`)
        } else {
          toast.error('Failed to convert PO to bill')
        }
      } catch {
        toast.error('Failed to convert PO to bill')
      }
    },
    [companyId, router, toast],
  )

  const handleDeleteSelected = useCallback(
    async (selectedIds: string[], selectedRows: PurchaseOrder[]) => {
      if (!companyId || selectedIds.length === 0) return
      const draftRows = selectedRows.filter((row) => row.status === 'DRAFT')
      if (draftRows.length === 0) {
        toast.error('Only draft purchase orders can be deleted')
        return
      }
      if (!confirm(`Delete ${draftRows.length} selected purchase order${draftRows.length !== 1 ? 's' : ''}?`)) return
      try {
        await Promise.all(draftRows.map((row) => expensesService.deletePurchaseOrder(companyId, row.id)))
        setRows((prev) => prev.filter((row) => !selectedIds.includes(row.id)))
        toast.success(`${draftRows.length} purchase order${draftRows.length !== 1 ? 's' : ''} deleted`)
      } catch {
        toast.error('Failed to delete selected purchase orders')
      }
    },
    [companyId, toast],
  )

  const handleApproveSelected = useCallback(
    (selectedIds: string[], selectedRows: PurchaseOrder[]) => {
      if (selectedRows.length === 0) return
      setRows((prev) => prev.map((row) => (selectedIds.includes(row.id) ? { ...row, status: 'APPROVED' } : row)))
      toast.success(`${selectedRows.length} selected order${selectedRows.length !== 1 ? 's' : ''} approved`)
    },
    [toast],
  )

  const handleConvertSelected = useCallback(
    async (selectedIds: string[], selectedRows: PurchaseOrder[]) => {
      if (!companyId || selectedRows.length === 0) return
      const convertible = selectedRows.filter((row) => CONVERTABLE_STATUSES.includes(row.status ?? ''))
      if (convertible.length === 0) {
        toast.error('No selected orders can be converted')
        return
      }
      if (!confirm(`Convert ${convertible.length} selected purchase order${convertible.length !== 1 ? 's' : ''} to bills?`)) return
      try {
        await Promise.all(convertible.map((row) => expensesService.convertPurchaseOrderToBill(companyId, row.id)))
        toast.success(`${convertible.length} selected order${convertible.length !== 1 ? 's' : ''} converted to bills`)
      } catch {
        toast.error('Failed to convert selected purchase orders')
      }
    },
    [companyId, toast],
  )

  const handleExportAll = useCallback(() => {
    csvDownload(
      `purchase-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      ['PO #', 'Vendor', 'Date', 'Expected Delivery', 'Status', 'Total'],
      filtered.map((row) => [row.poNumber ?? '', row.vendorName ?? '', row.date, row.expectedDelivery ?? '', row.status ?? '', String(row.total)]),
    )
    toast.success('CSV exported')
  }, [filtered, toast])

  const columns = useMemo<HaypColumn<PurchaseOrder>>(
    () => [
      {
        id: 'poNumber',
        accessorKey: 'poNumber',
        header: 'PO #',
        size: 130,
        minSize: 150,
        enableSorting: true,
        render: (value) => <span className="font-semibold text-gray-800">{value ?? '—'}</span>,
      },
      {
        id: 'vendorName',
        accessorKey: 'vendorName',
        header: 'Vendor',
        size: 200,
        minSize: 150,
        enableSorting: true,
        render: (value) => <span className="text-gray-700 truncate">{value ?? '—'}</span>,
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
        id: 'expectedDelivery',
        accessorKey: 'expectedDelivery',
        header: 'Expected Delivery',
        size: 130,
        minSize: 120,
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
        label: 'View Order',
        icon: <Eye size={14} />,
        onClick: (id) => router.push(`/expenses/procurement/purchase-orders/${id}/edit`),
      },
      { divider: true, label: '', onClick: () => {} },
      {
        label: 'Convert to Bill',
        icon: <FileText size={14} />,
        show: (row) => CONVERTABLE_STATUSES.includes(row.status ?? ''),
        onClick: (id) => handleConvertToBill(id),
      },
    ],
    [handleConvertToBill, router],
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
        label: 'Approve Selected',
        icon: <Check size={14} />,
        onClick: handleApproveSelected,
      },
      {
        label: 'Convert to Bill',
        icon: <FileText size={14} />,
        onClick: handleConvertSelected,
      },
      {
        label: 'Export Selected',
        icon: <Plus size={14} />,
        onClick: (selectedIds, selectedRows) => {
          if (selectedRows.length === 0) return
          csvDownload(
            `purchase-orders-selected-${new Date().toISOString().slice(0, 10)}.csv`,
            ['PO #', 'Vendor', 'Date', 'Expected Delivery', 'Status', 'Total'],
            selectedRows.map((row) => [row.poNumber ?? '', row.vendorName ?? '', row.date, row.expectedDelivery ?? '', row.status ?? '', String(row.total)]),
          )
          toast.success('Selected purchase orders exported')
        },
      },
    ],
    [handleDeleteSelected, handleApproveSelected, handleConvertSelected, toast],
  )

  const stats = useMemo(() => [
    { icon: ListOrdered, label: 'Total Orders', value: rows.length, color: 'blue' },
    { icon: AlertCircle, label: 'Pending', value: rows.filter(r => r.status === 'SUBMITTED').length, color: 'amber' },
    { icon: CheckCircle, label: 'Partially Received', value: rows.filter(r => r.status === 'PARTIAL_RECEIVED').length, color: 'emerald' },
    { icon: Check, label: 'Received', value: rows.filter(r => r.status === 'RECEIVED').length, color: 'rose' },
  ], [rows])

  const filterOptions = STATUSES.map((status) => ({ value: status.toLowerCase(), label: status === 'ALL' ? 'All' : status }))
  const filterLabel = statusFilter === 'ALL' ? 'Status' : `Status: ${statusFilter}`

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Purchase Orders</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${filtered.length} orders`}</p>
        </div>
        <div>
          <button
            onClick={() => router.push('/expenses/procurement/purchase-orders/new')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus size={15} /> New PO
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
        tableId="purchase-orders"
        title="Purchase Orders"
        description="Manage purchase orders, approvals, and vendor deliveries."
        columns={columns}
        data={filtered}
        loading={loading || cidLoading}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        searchPlaceholder="Search purchase orders..."
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
        onActivityLog={() => router.push('/expenses/procurement/orders/activity')}
        emptyTitle="No purchase orders found"
        emptySubtitle="Create a new purchase order to get started"
        className="mt-4"
      />

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
