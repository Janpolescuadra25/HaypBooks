'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Filter, Clock, RefreshCw, Eye, X, FileText, PauseCircle, PlayCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import HaypModal from '@/components/shared/HaypModal'
import RecurringBillForm, { type RecurringBillFormHandle } from './RecurringBillForm'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface RecurringBill {
  id: string
  templateName?: string
  vendorName?: string
  frequency?: string
  nextDate?: string
  status?: string
  amount: number
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'PAUSED' | 'ENDED'
const STATUSES: StatusFilter[] = ['ALL', 'ACTIVE', 'PAUSED', 'ENDED']

export default function RecurringBillsPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<RecurringBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [openMode, setOpenMode] = useState<'new' | 'edit'>('new')
  const [openId, setOpenId] = useState<string | null>(null)
  const formRef = useRef<RecurringBillFormHandle | null>(null)
  const saveAndNewRef = useRef(false)

  const fetchRows = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listRecurringBills(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.recurringBills ?? [])
    } catch {
      setError('Failed to load recurring bills')
      toast.error('Failed to load recurring bills')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchRows() }, [fetchRows])

  const handleClose = useCallback(() => {
    saveAndNewRef.current = false
    setPanelOpen(false)
    setOpenId(null)
    setOpenMode('new')
  }, [])

  const handleSaved = useCallback(async () => {
    await fetchRows()
    if (saveAndNewRef.current) {
      saveAndNewRef.current = false
      setOpenMode('new')
      setOpenId(null)
    } else {
      setPanelOpen(false)
      setOpenId(null)
    }
  }, [fetchRows])

  const filtered = useMemo(() => {
    return rows
      .filter((row) => statusFilter === 'ALL' || row.status === statusFilter)
      .filter((row) => {
        const q = search.toLowerCase()
        return (
          row.templateName?.toLowerCase().includes(q) ||
          row.vendorName?.toLowerCase().includes(q)
        )
      })
      .filter((row) => (dateFrom ? (row.nextDate ?? '') >= dateFrom : true))
      .filter((row) => (dateTo ? (row.nextDate ?? '') <= dateTo : true))
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['amount'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const columns = useMemo<HaypColumn<RecurringBill>[]>(() => [
    {
      id: 'templateName',
      header: 'Template',
      accessorKey: 'templateName',
      size: 200,
      render: (value) => <span className="font-semibold text-gray-900">{value ?? '—'}</span>,
    },
    {
      id: 'vendorName',
      header: 'Vendor',
      accessorKey: 'vendorName',
      size: 170,
      render: (value) => <span className="text-gray-700 truncate">{value ?? '—'}</span>,
    },
    {
      id: 'frequency',
      header: 'Frequency',
      accessorKey: 'frequency',
      size: 140,
      render: (value) => <span className="text-gray-600 text-xs">{value ?? '—'}</span>,
    },
    {
      id: 'nextDate',
      header: 'Next Date',
      accessorKey: 'nextDate',
      size: 130,
      render: (value) => <span className="text-gray-500">{value ? fmtDate(value) : '—'}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 120,
      render: (value) => <StatusPill status={value ?? 'ACTIVE'} />,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      size: 130,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
    },
  ], [currency])

  const activeFilterCount = [statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  const handleExportCSV = useCallback(() => {
    csvDownload(`recurring-bills-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Template', 'Vendor', 'Frequency', 'Next Date', 'Status', 'Amount'],
      filtered.map((row) => [row.templateName ?? '', row.vendorName ?? '', row.frequency ?? '', row.nextDate ?? '', row.status ?? '', String(row.amount)]),
    )
    toast.success('CSV exported')
  }, [filtered, toast])

  const openEdit = useCallback((id: string) => {
    setOpenMode('edit')
    setOpenId(id)
    setPanelOpen(true)
  }, [])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit Template',
      icon: <Eye size={14} />,
      onClick: (id) => openEdit(id),
    },
    {
      label: '',
      onClick: () => {},
      divider: true,
    },
    {
      label: 'Delete Template',
      icon: <X size={14} />,
      variant: 'danger',
      show: (row) => row.status === 'DRAFT',
      onClick: (id) => {
        if (!confirm('Delete this recurring bill template?')) return
        setRows((prev) => prev.filter((row) => row.id !== id))
        toast.success('Recurring bill template deleted')
      },
    },
  ], [openEdit, toast])

  const bulkActions = useMemo<HaypBulkAction[]>(() => [
    {
      label: 'Delete selected',
      variant: 'danger',
      onClick: (_ids, selectedRows) => {
        const drafts = selectedRows.filter((row) => row.status === 'DRAFT')
        if (drafts.length === 0) {
          toast.error('Only draft recurring bills can be deleted')
          return
        }
        if (!confirm(`Delete ${drafts.length} selected recurring bill${drafts.length !== 1 ? 's' : ''}?`)) return
        Promise.all(drafts.map((row) => expensesService.updateRecurringBill(companyId ?? '', row.id, { status: 'DELETED' })))
          .then(() => {
            setRows((prev) => prev.filter((row) => !drafts.some((draft) => draft.id === row.id)))
            toast.success(`${drafts.length} selected recurring bill${drafts.length !== 1 ? 's' : ''} deleted`)
          })
          .catch(() => toast.error('Failed to delete selected recurring bills'))
      },
    },
    {
      label: 'Void selected',
      variant: 'danger',
      onClick: (_ids, selectedRows) => {
        const voidable = selectedRows.filter((row) => row.status !== 'DRAFT' && row.status !== 'VOID')
        if (voidable.length === 0) {
          toast.error('No recurring bills selected to void')
          return
        }
        if (!confirm(`Void ${voidable.length} selected recurring bill${voidable.length !== 1 ? 's' : ''}?`)) return
        Promise.all(voidable.map((row) => expensesService.updateRecurringBill(companyId ?? '', row.id, { status: 'VOID' })))
          .then(() => {
            setRows((prev) => prev.map((row) => voidable.some((selected) => selected.id === row.id) ? { ...row, status: 'VOID' } : row))
            toast.success(`${voidable.length} selected recurring bill${voidable.length !== 1 ? 's' : ''} voided`)
          })
          .catch(() => toast.error('Failed to void selected recurring bills'))
      },
    },
    {
      label: 'Export selected',
      icon: <Download className="mr-2.5 h-4 w-4 opacity-70" />,
      onClick: (_ids, selectedRows) => {
        if (selectedRows.length === 0) return
        csvDownload(`recurring-bills-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Template', 'Vendor', 'Frequency', 'Next Date', 'Status', 'Amount'],
          selectedRows.map((row) => [row.templateName ?? '', row.vendorName ?? '', row.frequency ?? '', row.nextDate ?? '', row.status ?? '', String(row.amount)]),
        )
        toast.success('Selected recurring bills exported')
      },
    },
  ], [companyId, toast])

  const stats = useMemo(() => [
    { icon: FileText, label: 'Total Active', value: rows.length, color: 'blue' },
    { icon: PlayCircle, label: 'Draft', value: rows.filter(r => r.status === 'DRAFT').length, color: 'amber' },
    { icon: CheckCircle, label: 'Active', value: rows.filter(r => r.status === 'ACTIVE').length, color: 'emerald' },
    { icon: PauseCircle, label: 'Paused', value: rows.filter(r => r.status === 'PAUSED').length, color: 'rose' },
  ], [rows])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Recurring Bills</h1>
          <p className="mt-2 text-sm text-emerald-600/70">Manage recurring bill templates and entry schedules.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchRows} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={16} /> Refresh</button>
          <button onClick={() => router.push('/expenses/bills-payments/recurring-bills/activity')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Clock size={16} /> Activity Log</button>
          <button onClick={() => { setPanelOpen(true); setOpenMode('new'); setOpenId(null) }} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> New Template</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        {error && <div className="col-span-full rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recurring bills" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
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
            <label className="block text-xs font-medium text-slate-500 mb-1">Next Date From</label>
            <input type="date" aria-label="Next date from" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Next Date To</label>
            <input type="date" aria-label="Next date to" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear all</button>
          </div>
        </div>
      )}

      <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="recurring-bills"
        title="Recurring Bills"
        description="Manage recurring bill templates and payment schedules."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={[]}
        activeFilter=""
        onFilterChange={() => {} }
        filterLabel="All"
        actions={actions}
        bulkActions={bulkActions}
        totals={totals}
        stats={stats}
        onRefresh={fetchRows}
        onExport={handleExportCSV}
        exportLabel="Export CSV"
        onRowClick={(row) => openEdit(row.id)}
        onActivityLog={() => router.push('/expenses/bills-payments/recurring-bills/activity')}
        emptyTitle={loading ? 'Loading recurring bills…' : 'No recurring bills found'}
        emptySubtitle="Use search and filters to locate templates"
        loading={loading}
      />

      <HaypModal
        open={panelOpen}
        onClose={handleClose}
        title={openMode === 'new' ? 'New Recurring Bill Template' : 'Edit Recurring Bill Template'}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={handleClose} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={() => { saveAndNewRef.current = true; formRef.current?.save() }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Save and new</button>
            <button type="button" onClick={() => { saveAndNewRef.current = false; formRef.current?.save() }} className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Save</button>
          </div>
        }
      >
        <RecurringBillForm key={`${openMode}-${openId ?? 'new'}`} ref={formRef} mode={openMode} billId={openId ?? undefined} onClose={handleClose} onSaved={handleSaved} />
      </HaypModal>
    </div>
  )
}
