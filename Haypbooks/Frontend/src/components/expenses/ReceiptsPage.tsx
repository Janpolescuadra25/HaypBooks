'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Filter, Clock, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import HaypModal from '@/components/shared/HaypModal'
import ReceiptForm, { type ReceiptFormHandle } from './ReceiptForm'
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
  const [receiptPanelOpen, setReceiptPanelOpen] = useState(false)
  const [openReceiptMode, setOpenReceiptMode] = useState<'new' | 'edit'>('new')
  const [openReceiptId, setOpenReceiptId] = useState<string | null>(null)
  const receiptFormRef = useRef<ReceiptFormHandle | null>(null)
  const saveAndNewRef = useRef(false)

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

  const handleClose = useCallback(() => {
    saveAndNewRef.current = false
    setReceiptPanelOpen(false)
    setOpenReceiptId(null)
    setOpenReceiptMode('new')
  }, [])

  const handleSaved = useCallback(async () => {
    await fetchReceipts()
    if (saveAndNewRef.current) {
      saveAndNewRef.current = false
      setOpenReceiptMode('new')
      setOpenReceiptId(null)
    } else {
      setReceiptPanelOpen(false)
      setOpenReceiptId(null)
    }
  }, [fetchReceipts])

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
      onClick: (_ids, selectedRows) => {
        if (selectedRows.length === 0) return
        setRows((prev) => prev.map((row) => selectedRows.some((selected) => selected.id === row.id) ? { ...row, status: 'MATCHED' } : row))
        toast.success(`${selectedRows.length} selected receipt${selectedRows.length !== 1 ? 's' : ''} marked as matched`)
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
    setReceiptPanelOpen(true)
    setOpenReceiptMode('edit')
    setOpenReceiptId(id)
  }, [])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Receipts</h1>
          <p className="mt-2 text-sm text-emerald-600/70">Capture and match receipts with expense claims.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setReceiptPanelOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> Add Receipt</button>
          <button onClick={() => router.push('/expenses/receipts/activity')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Clock size={16} /> Activity Log</button>
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        {error && <div className="col-span-full rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search receipts" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {STATUSES.map((status) => (
            <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-2xl px-3 py-2 text-xs font-semibold ${statusFilter === status ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              {status === 'ALL' ? 'All' : status}
            </button>
          ))}
          <button type="button" onClick={() => setShowAdvancedFilters((prev) => !prev)} className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Filter size={14} /> Filters</button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date From</label>
            <input type="date" aria-label="Date from" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date To</label>
            <input type="date" aria-label="Date to" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear all</button>
          </div>
        </div>
      )}

      <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="receipts"
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={[]}
        activeFilter=""
        onFilterChange={() => { }}
        filterLabel="All"
        bulkActions={bulkActions}
        totals={totals}
        onRefresh={handleRefresh}
        onExport={handleExportCSV}
        exportLabel="Export CSV"
        onRowClick={(row) => openEditReceipt(row.id)}
        onActivityLog={() => router.push('/expenses/receipts/activity')}
        emptyTitle={loading ? 'Loading receipts…' : 'No receipts found'}
        emptySubtitle="Search or filter to locate receipts"
        loading={loading}
      />

      <HaypModal
        open={receiptPanelOpen}
        onClose={handleClose}
        title={openReceiptMode === 'new' ? 'New Receipt' : 'Edit Receipt'}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { saveAndNewRef.current = true; receiptFormRef.current?.save() }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Save and new
            </button>
            <button
              type="button"
              onClick={() => { saveAndNewRef.current = false; receiptFormRef.current?.save() }}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        }
      >
        <ReceiptForm
          key={`${openReceiptMode}-${openReceiptId ?? 'new'}`}
          ref={receiptFormRef}
          mode={openReceiptMode}
          receiptId={openReceiptId ?? undefined}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      </HaypModal>
    </div>
  )
}
