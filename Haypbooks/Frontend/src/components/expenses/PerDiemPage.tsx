'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Filter, Clock, RefreshCw, Pencil, Trash2, Calendar, CheckCircle, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import HaypModal from '@/components/shared/HaypModal'
import PerDiemForm, { type PerDiemFormHandle } from './PerDiemForm'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface PerDiem {
  id: string
  perDiemNumber?: string
  employee?: string
  destination?: string
  startDate: string
  endDate: string
  days?: number
  dailyRate?: number
  total: number
  status?: string
}

type StatusFilter = 'ALL' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
const STATUSES: StatusFilter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']

export default function PerDiemPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<PerDiem[]>([])
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
  const formRef = useRef<PerDiemFormHandle | null>(null)
  const saveAndNewRef = useRef(false)

  const fetchRows = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listPerDiem(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.perDiem ?? [])
    } catch {
      setError('Failed to load per diem claims')
      toast.error('Failed to load per diem claims')
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

  const handleDeletePerDiem = useCallback((id: string) => {
    if (!confirm('Delete this per diem claim?')) return
    setRows((prev) => prev.filter((row) => row.id !== id))
    toast.success('Per diem claim deleted')
  }, [toast])

  const filtered = useMemo(() => {
    return rows
      .filter((row) => statusFilter === 'ALL' || row.status === statusFilter)
      .filter((row) => {
        const q = search.toLowerCase()
        return (
          row.perDiemNumber?.toLowerCase().includes(q) ||
          row.employee?.toLowerCase().includes(q) ||
          row.destination?.toLowerCase().includes(q)
        )
      })
      .filter((row) => (dateFrom ? row.startDate >= dateFrom : true))
      .filter((row) => (dateTo ? row.startDate <= dateTo : true))
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['total'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const stats = useMemo(() => [
    { icon: Calendar, label: 'Total Entries', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Pending', value: rows.filter((row) => row.status === 'DRAFT' || row.status === 'SUBMITTED').length, color: 'amber' },
    { icon: CheckCircle, label: 'Approved', value: rows.filter((row) => row.status === 'APPROVED').length, color: 'emerald' },
    { icon: Wallet, label: 'Reimbursed', value: rows.filter((row) => row.status === 'REJECTED').length, color: 'rose' },
  ], [rows])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      onClick: (_id, row) => {
        setPanelOpen(true)
        setOpenMode('edit')
        setOpenId(row.id)
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (_id, row) => handleDeletePerDiem(row.id),
    },
  ], [handleDeletePerDiem])

  const columns = useMemo<HaypColumn<PerDiem>[]>(() => [
    {
      id: 'perDiemNumber',
      header: 'Per Diem #',
      accessorKey: 'perDiemNumber',
      size: 140,
      minSize: 120,
      render: (value) => <span className="font-semibold text-gray-900">{value ?? '—'}</span>,
    },
    {
      id: 'employee',
      header: 'Employee',
      accessorKey: 'employee',
      size: 170,
      minSize: 140,
      render: (value) => <span className="text-gray-800">{value ?? '—'}</span>,
    },
    {
      id: 'destination',
      header: 'Destination',
      accessorKey: 'destination',
      size: 160,
      minSize: 140,
      render: (value) => <span className="text-gray-700 truncate">{value ?? '—'}</span>,
    },
    {
      id: 'startDate',
      header: 'Start',
      accessorKey: 'startDate',
      size: 110,
      minSize: 100,
      render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
    },
    {
      id: 'endDate',
      header: 'End',
      accessorKey: 'endDate',
      size: 110,
      minSize: 100,
      render: (value) => <span className="text-gray-500">{fmtDate(value)}</span>,
    },
    {
      id: 'days',
      header: 'Days',
      accessorKey: 'days',
      size: 80,
      minSize: 70,
      align: 'right',
      render: (value) => <span className="tabular-nums font-medium text-gray-700">{value ?? 0}</span>,
    },
    {
      id: 'dailyRate',
      header: 'Daily Rate',
      accessorKey: 'dailyRate',
      size: 110,
      minSize: 90,
      align: 'right',
      render: (value) => <span className="text-gray-600 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
    },
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'total',
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
    csvDownload(`per-diem-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Per Diem #', 'Employee', 'Destination', 'Start', 'End', 'Days', 'Daily Rate', 'Total', 'Status'],
      filtered.map((row) => [
        row.perDiemNumber ?? '',
        row.employee ?? '',
        row.destination ?? '',
        row.startDate,
        row.endDate,
        String(row.days ?? 0),
        String(row.dailyRate ?? 0),
        String(row.total),
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
        csvDownload(`per-diem-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Per Diem #', 'Employee', 'Destination', 'Start', 'End', 'Days', 'Daily Rate', 'Total', 'Status'],
          selectedRows.map((row) => [
            row.perDiemNumber ?? '',
            row.employee ?? '',
            row.destination ?? '',
            row.startDate,
            row.endDate,
            String(row.days ?? 0),
            String(row.dailyRate ?? 0),
            String(row.total),
            row.status ?? '',
          ]),
        )
        toast.success('Selected rows exported')
      },
    },
  ], [toast])

  const handleRefresh = useCallback(() => {
    fetchRows()
  }, [fetchRows])

  const activeFilterCount = [statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  const openEdit = useCallback((id: string) => {
    setPanelOpen(true)
    setOpenMode('edit')
    setOpenId(id)
  }, [])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Per Diem</h1>
          <p className="mt-2 text-sm text-emerald-600/70">Manage per diem claims and totals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setPanelOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> New Claim</button>
          <button onClick={() => router.push('/expenses/employee-expenses/per-diem/activity')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Clock size={16} /> Activity Log</button>
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        {error && <div className="col-span-full rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search per diem claims" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
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
            <label htmlFor="perDiemFilterDateFrom" className="block text-xs font-medium text-slate-500 mb-1">Start From</label>
            <input id="perDiemFilterDateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div>
            <label htmlFor="perDiemFilterDateTo" className="block text-xs font-medium text-slate-500 mb-1">Start To</label>
            <input id="perDiemFilterDateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear all</button>
          </div>
        </div>
      )}

      <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="per-diem"
        title="Per Diem"
        description="Track employee per diem claims and reimbursements."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={[]}
        activeFilter=""
        onFilterChange={() => {}}
        filterLabel="All"
        stats={stats}
        actions={actions}
        bulkActions={bulkActions}
        totals={totals}
        onRefresh={handleRefresh}
        onExport={handleExportCSV}
        exportLabel="Export CSV"
        onRowClick={(row) => {
          setPanelOpen(true)
          setOpenMode('edit')
          setOpenId(row.id)
        }}
        emptyTitle={loading ? 'Loading per diem claims…' : 'No per diem claims found'}
        emptySubtitle="Use search or filters to locate claims"
        loading={loading}
      />

      <HaypModal
        open={panelOpen}
        onClose={handleClose}
        title={openMode === 'new' ? 'New Per Diem Claim' : 'Edit Per Diem Claim'}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={handleClose} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={() => { saveAndNewRef.current = true; formRef.current?.save() }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Save and new</button>
            <button type="button" onClick={() => { saveAndNewRef.current = false; formRef.current?.save() }} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Save</button>
          </div>
        }
      >
        <PerDiemForm
          key={`${openMode}-${openId ?? 'new'}`}
          ref={formRef}
          mode={openMode}
          perDiemId={openId ?? undefined}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      </HaypModal>
    </div>
  )
}
