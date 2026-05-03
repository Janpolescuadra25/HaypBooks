'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Eye, Ban, ListOrdered, Banknote, Clock, CheckCircle } from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn, HaypActionItem, HaypBulkAction, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface BillPayment {
  id: string
  paymentNumber?: string
  vendorName?: string
  date: string
  method?: string
  status?: string
  amount: number
}

const STATUSES = ['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'VOIDED'] as const

export default function BillPaymentsPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [rows, setRows] = useState<BillPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>('ALL')
  const [toast, setToast] = useState('')

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }, [])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchPayments = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await expensesService.listBillPayments(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.payments ?? [])
    } catch {
      showToast('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [companyId, showToast])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleVoid = useCallback(async (id: string) => {
    if (!companyId) return

    try {
      await expensesService.voidBillPayment(companyId, id)
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'VOIDED' } : row)))
      showToast('Payment voided')
    } catch {
      showToast('Failed to void payment')
    }
  }, [companyId, showToast])

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') list = list.filter((row) => row.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((row) =>
        (row.paymentNumber ?? '').toLowerCase().includes(q) ||
        (row.vendorName ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [rows, statusFilter, search])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['amount'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const columns = useMemo<HaypColumn<BillPayment>[]>(() => [
    {
      id: 'paymentNumber',
      accessorKey: 'paymentNumber',
      header: 'Payment #',
      size: 140,
      minSize: 150,
      enableSorting: true,
      align: 'left',
      render: (value) => renderCell(value, 'paymentNumber'),
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
      id: 'date',
      accessorKey: 'date',
      header: 'Date',
      size: 115,
      minSize: 120,
      enableSorting: true,
      align: 'left',
      render: (value) => renderCell(value, 'date'),
    },
    {
      id: 'method',
      accessorKey: 'method',
      header: 'Method',
      size: 140,
      minSize: 150,
      enableSorting: true,
      align: 'left',
      render: (value) => renderCell(value, 'method'),
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
  ], [fmt])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'View Payment',
      icon: <Eye size={14} />,
      onClick: (_rowId, row) => router.push(`/expenses/bills-payments/${row.id}/edit`),
    },
    {
      label: '',
      onClick: () => {},
      divider: true,
    },
    {
      label: 'Void Payment',
      icon: <Ban size={14} />,
      danger: true,
      show: (row) => row.status === 'PENDING',
      onClick: (_rowId, row) => handleVoid(row.id),
    },
  ], [handleVoid, router])

  const bulkActions = useMemo<HaypBulkAction[]>(() => [
    {
      label: 'Export Selected',
      icon: <Download size={14} />,
      onClick: (_selectedIds, selectedRows) => {
        if (selectedRows.length === 0) return
        csvDownload(`bill-payments-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Payment #', 'Vendor', 'Date', 'Method', 'Status', 'Amount'],
          selectedRows.map((row) => [row.paymentNumber ?? '', row.vendorName ?? '', row.date, row.method ?? '', row.status ?? '', String(row.amount)]),
        )
        showToast('Selected payments exported')
      },
    },
  ], [showToast])

  const filterLabel = statusFilter === 'ALL' ? 'Status' : statusFilter.toLowerCase().replace(/_/g, ' ')

  const handleExportCSV = useCallback(() => {
    csvDownload(`bill-payments-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Payment #', 'Vendor', 'Date', 'Method', 'Status', 'Amount'],
      filtered.map((row) => [row.paymentNumber ?? '', row.vendorName ?? '', row.date, row.method ?? '', row.status ?? '', String(row.amount)]),
    )
    showToast('CSV exported')
  }, [filtered, showToast])

  const stats = useMemo(() => [
    { icon: ListOrdered, label: 'Total Payments', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Pending Payments', value: rows.filter((row) => row.status === 'PENDING').length, color: 'emerald' },
    { icon: CheckCircle, label: 'Completed Payments', value: rows.filter((row) => row.status === 'COMPLETED').length, color: 'amber' },
    { icon: Banknote, label: 'Total Paid', value: formatCurrency(rows.reduce((sum, row) => sum + Number(row.amount || 0), 0), currency), color: 'rose' },
  ], [rows, currency])

  const renderCell = useCallback((value: any, key: string) => {
    switch (key) {
      case 'paymentNumber':
        return <span className="font-semibold text-gray-800">{value ?? '—'}</span>
      case 'vendorName':
        return <span className="text-gray-700 truncate">{value ?? '—'}</span>
      case 'date':
        return <span className="text-gray-500">{fmtDate(value)}</span>
      case 'method':
        return <span className="text-gray-600">{value ?? '—'}</span>
      case 'status':
        return <StatusPill status={value ?? 'COMPLETED'} />
      case 'amount':
        return <span className="font-semibold text-emerald-800 tabular-nums">{fmt(value)}</span>
      default:
        return <span className="truncate">{value ?? '—'}</span>
    }
  }, [fmt])

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        <HaypDataTable
        tableId="bill-payments"
        data={filtered}
        columns={columns}
        title="Bill Payments"
        description="Track all payments made to vendors and manage payment history."
        stats={stats}
        headerActions={
          <button
            onClick={() => router.push('/expenses/bills-payments/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            Record Payment
          </button>
        }
        loading={loading || cidLoading}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        searchPlaceholder="Search payments..."
        filters={STATUSES.map((status) => ({ value: status.toLowerCase(), label: status === 'ALL' ? 'All' : status }))}
        activeFilter={statusFilter.toLowerCase()}
        onFilterChange={(value: any) => setStatusFilter(String(value).toUpperCase() as (typeof STATUSES)[number])}
        filterLabel={filterLabel}
        totals={totals}
        onRefresh={fetchPayments}
        onExport={handleExportCSV}
        onActivityLog={() => router.push('/expenses/bills-payments/activity')}
        actions={actions}
        bulkActions={bulkActions}
        emptyTitle="No payments found"
        emptySubtitle="Adjust your search or filter to see results"
      />
      </div>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg pointer-events-none">{toast}</div>}
    </div>
  )
}
