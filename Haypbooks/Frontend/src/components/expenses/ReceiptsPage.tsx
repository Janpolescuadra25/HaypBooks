'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Filter, RefreshCw, Pencil, Trash2, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface Receipt {
  id: string
  receiptNumber?: string
  merchant?: string
  date: string
  category?: string
  amount: number
  status?: string
}

type StatusFilter = 'ALL' | 'DRAFT' | 'UNMATCHED' | 'MATCHED' | 'ATTACHED'
const STATUSES: StatusFilter[] = ['ALL', 'DRAFT', 'UNMATCHED', 'MATCHED', 'ATTACHED']

export default function ReceiptsPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const fetchReceipts = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listReceipts(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.receipts ?? [])
    } catch {
      setError('Failed to load receipts')
      toast.error('Failed to load receipts')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchReceipts() }, [fetchReceipts])


  const filtered = useMemo(() => {
    return rows
      .filter((row) => statusFilter === 'ALL' || row.status === statusFilter)
      .filter((row) => {
        const q = search.toLowerCase()
        return (
          row.receiptNumber?.toLowerCase().includes(q) ||
          row.merchant?.toLowerCase().includes(q)
        )
      })
      .filter((row) => (dateFrom ? row.date >= dateFrom : true))
      .filter((row) => (dateTo ? row.date <= dateTo : true))
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['amount'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const stats = useMemo(() => [
    { icon: FileText, label: 'Total Receipts', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Pending', value: rows.filter((row) => row.status === 'DRAFT').length, color: 'amber' },
    { icon: CheckCircle, label: 'Matched', value: rows.filter((row) => row.status === 'MATCHED').length, color: 'emerald' },
    { icon: XCircle, label: 'Unmatched', value: rows.filter((row) => row.status === 'UNMATCHED').length, color: 'rose' },
  ], [rows])

  const columns = useMemo<HaypColumn<Receipt>[]>(() => [
    {
      id: 'receiptNumber',
      header: 'Receipt #',
      accessorKey: 'receiptNumber',
      size: 130,
      minSize: 110,
      render: (value) => <span className="font-semibold text-gray-900">{value ?? '—'}</span>,
    },
    {
      id: 'merchant',
      header: 'Merchant',
      accessorKey: 'merchant',
      size: 180,
      minSize: 140,
      render: (value) => <span className="text-gray-700 truncate">{value ?? '—'}</span>,
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      size: 115,
      minSize: 100,
      render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      size: 150,
      minSize: 130,
      render: (value) => <span className="text-gray-600 text-xs">{value ?? '—'}</span>,
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
    csvDownload(`receipts-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Receipt #', 'Merchant', 'Date', 'Category', 'Amount', 'Status'],
      filtered.map((row) => [row.receiptNumber ?? '', row.merchant ?? '', row.date, row.category ?? '', String(row.amount), row.status ?? '']),
    )
    toast.success('CSV exported')
  }, [filtered, toast])

  const bulkActions = useMemo<HaypBulkAction[]>(() => [
    {
      label: 'Delete selected',
      variant: 'danger',
      onClick: (_ids, selectedRows) => {
        const deletable = selectedRows.filter((row) => row.status === 'DRAFT')
        if (deletable.length === 0) {
          toast.error('Only draft receipts can be deleted')
          return
        }
        if (!confirm(`Delete ${deletable.length} selected receipt${deletable.length !== 1 ? 's' : ''}?`)) return
        Promise.all(deletable.map((row) => expensesService.deleteReceipt(companyId ?? '', row.id)))
          .then(() => {
            setRows((prev) => prev.filter((row) => !deletable.some((deleted) => deleted.id === row.id)))
            toast.success(`${deletable.length} selected receipt${deletable.length !== 1 ? 's' : ''} deleted`)
          })
          .catch(() => toast.error('Failed to delete selected receipts'))
      },
    },
    {
      label: 'Mark selected matched',
      onClick: async (_ids, selectedRows) => {
        if (selectedRows.length === 0) return
        if (!companyId) return
        try {
          await Promise.all(selectedRows.map((row) => expensesService.updateReceipt(companyId, row.id, { status: 'MATCHED' })))
          setRows((prev) => prev.map((row) => selectedRows.some((selected) => selected.id === row.id) ? { ...row, status: 'MATCHED' } : row))
          toast.success(`${selectedRows.length} receipt${selectedRows.length !== 1 ? 's' : ''} marked as matched`)
        } catch {
          toast.error('Failed to update receipt status')
        }
      },
    },
    {
      label: 'Export selected',
      icon: <Download className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (_ids, selectedRows) => {
        if (selectedRows.length === 0) return
        csvDownload(`receipts-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Receipt #', 'Merchant', 'Date', 'Category', 'Amount', 'Status'],
          selectedRows.map((row) => [row.receiptNumber ?? '', row.merchant ?? '', row.date, row.category ?? '', String(row.amount), row.status ?? '']),
        )
        toast.success('Selected receipts exported')
      },
    },
  ], [companyId, toast])

  const handleRefresh = useCallback(() => {
    fetchReceipts()
  }, [fetchReceipts])

  const activeFilterCount = [statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  const openEditReceipt = useCallback((id: string) => {
    router.push(`/expenses/employee-expenses/receipts/${id}/edit`)
  }, [router])

  const handleDeleteReceipt = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Delete this receipt? This action cannot be undone.')) return
    try {
      await expensesService.deleteReceipt(companyId, id)
      setRows((prev) => prev.filter((row) => row.id !== id))
      toast.success('Receipt deleted')
    } catch {
      toast.error('Failed to delete receipt')
    }
  }, [companyId, toast])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      onClick: (_id, row) => openEditReceipt(row.id),
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (_id, row) => handleDeleteReceipt(row.id),
    },
  ], [handleDeleteReceipt, openEditReceipt])

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        <HaypDataTable
        title="Receipts"
        description="Track and manage receipt records for expense reporting."
        data={filtered}
        columns={columns}
        tableId="receipts"
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        onActivityLog={() => router.push('/expenses/employee-expenses/receipts/activity')}
        filters={STATUSES.map((status) => ({ value: status.toLowerCase(), label: status === 'ALL' ? 'All' : status }))}
        activeFilter={statusFilter.toLowerCase()}
        onFilterChange={(value: any) => setStatusFilter(String(value).toUpperCase() as (typeof STATUSES)[number])}
        filterLabel="Status"
        stats={stats}
        headerActions={
          <button
            onClick={() => router.push('/expenses/employee-expenses/receipts/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            Add Receipt
          </button>
        }
        actions={actions}
        bulkActions={bulkActions}
        totals={totals}
        onRefresh={handleRefresh}
        onExport={handleExportCSV}
        exportLabel="Export CSV"
        onRowClick={(row) => openEditReceipt(row.id)}
        emptyTitle={loading ? 'Loading receipts…' : 'No receipts found'}
        emptySubtitle="Search or filter to locate receipts"
        loading={loading}
      />
      </div>
    </div>
  )
}
