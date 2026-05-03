'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, Download, Filter, Clock, Pencil, Trash2, Car, CheckCircle, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import HaypModal from '@/components/shared/HaypModal'
import MileageForm, { type MileageFormHandle } from './MileageForm'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface MileageLog {
  id: string
  date: string
  employee?: string
  purpose?: string
  route?: string
  distanceKm?: number
  rate?: number
  amount: number
  status?: string
}

type StatusFilter = 'ALL' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
const STATUSES: StatusFilter[] = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']

export default function MileagePage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<MileageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [mileagePanelOpen, setMileagePanelOpen] = useState(false)
  const [openMileageId, setOpenMileageId] = useState<string | null>(null)
  const [openMileageMode, setOpenMileageMode] = useState<'new' | 'edit'>('new')
  const mileageFormRef = useRef<MileageFormHandle | null>(null)
  const saveAndNewRef = useRef(false)

  const fetchMileage = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listMileageLogs(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.mileageLogs ?? [])
    } catch {
      setError('Failed to load mileage logs')
      toast.error('Failed to load mileage logs')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchMileage() }, [fetchMileage])

  const closeMileagePanel = useCallback(() => {
    saveAndNewRef.current = false
    setMileagePanelOpen(false)
    setOpenMileageId(null)
    setOpenMileageMode('new')
  }, [])

  const handleSaved = useCallback(async () => {
    await fetchMileage()
    if (saveAndNewRef.current) {
      saveAndNewRef.current = false
      setOpenMileageMode('new')
      setOpenMileageId(null)
    } else {
      closeMileagePanel()
    }
  }, [fetchMileage, closeMileagePanel])

  const openNewMileage = useCallback(() => {
    setMileagePanelOpen(true)
    setOpenMileageMode('new')
    setOpenMileageId(null)
  }, [])

  const openEditMileage = useCallback((id: string) => {
    setMileagePanelOpen(true)
    setOpenMileageMode('edit')
    setOpenMileageId(id)
  }, [])

  const handleDeleteMileage = useCallback((id: string) => {
    if (!confirm('Delete this mileage log?')) return
    setRows((prev) => prev.filter((row) => row.id !== id))
    toast.success('Mileage log deleted')
  }, [toast])

  const filtered = useMemo(() => {
    return rows
      .filter((row) => statusFilter === 'ALL' || row.status === statusFilter)
      .filter((row) => {
        const q = search.toLowerCase()
        return (
          row.employee?.toLowerCase().includes(q) ||
          row.purpose?.toLowerCase().includes(q) ||
          row.route?.toLowerCase().includes(q)
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
    { icon: Car, label: 'Total Trips', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Pending', value: rows.filter((row) => row.status === 'DRAFT' || row.status === 'SUBMITTED').length, color: 'amber' },
    { icon: CheckCircle, label: 'Approved', value: rows.filter((row) => row.status === 'APPROVED').length, color: 'emerald' },
    { icon: CreditCard, label: 'Reimbursed', value: rows.filter((row) => row.status === 'REJECTED').length, color: 'rose' },
  ], [rows])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      onClick: (_id, row) => openEditMileage(row.id),
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (_id, row) => handleDeleteMileage(row.id),
    },
  ], [handleDeleteMileage, openEditMileage])

  const columns = useMemo<HaypColumn<MileageLog>[]>(() => [
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      size: 120,
      minSize: 120,
      render: (value) => <span className="text-gray-700">{fmtDate(value)}</span>,
    },
    {
      id: 'employee',
      header: 'Employee',
      accessorKey: 'employee',
      size: 170,
      minSize: 140,
      render: (value) => <span className="font-medium text-gray-900">{value ?? '—'}</span>,
    },
    {
      id: 'purpose',
      header: 'Purpose',
      accessorKey: 'purpose',
      size: 180,
      minSize: 140,
      render: (value) => <span className="text-gray-700 truncate">{value ?? '—'}</span>,
    },
    {
      id: 'route',
      header: 'Route',
      accessorKey: 'route',
      size: 190,
      minSize: 140,
      render: (value) => <span className="text-gray-600 text-xs truncate">{value ?? '—'}</span>,
    },
    {
      id: 'distanceKm',
      header: 'Km',
      accessorKey: 'distanceKm',
      size: 90,
      minSize: 80,
      align: 'right',
      isSummable: false,
      render: (value) => <span className="font-medium text-gray-700 tabular-nums">{value ?? 0}</span>,
    },
    {
      id: 'rate',
      header: 'Rate/Km',
      accessorKey: 'rate',
      size: 100,
      minSize: 90,
      align: 'right',
      render: (value) => <span className="text-gray-600 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
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
    csvDownload(`mileage-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Date', 'Employee', 'Purpose', 'Route', 'Km', 'Rate/Km', 'Amount', 'Status'],
      filtered.map((row) => [
        row.date,
        row.employee ?? '',
        row.purpose ?? '',
        row.route ?? '',
        String(row.distanceKm ?? 0),
        String(row.rate ?? 0),
        String(row.amount),
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
        csvDownload(`mileage-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Date', 'Employee', 'Purpose', 'Route', 'Km', 'Rate/Km', 'Amount', 'Status'],
          selectedRows.map((row) => [
            row.date,
            row.employee ?? '',
            row.purpose ?? '',
            row.route ?? '',
            String(row.distanceKm ?? 0),
            String(row.rate ?? 0),
            String(row.amount),
            row.status ?? '',
          ]),
        )
        toast.success('Selected rows exported')
      },
    },
  ], [toast])

  const handleRefresh = useCallback(() => {
    fetchMileage()
  }, [fetchMileage])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Mileage</h1>
          <p className="mt-2 text-sm text-emerald-600/70">Track mileage logs with amount totals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={openNewMileage} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> Log Mileage</button>
          <button onClick={() => router.push('/expenses/employee-expenses/mileage/activity')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Clock size={16} /> Activity Log</button>
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download size={16} /> Refresh</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
        {error && <div className="col-span-full rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search mileage logs" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-2xl px-3 py-2 text-xs font-semibold ${statusFilter === status ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              {status === 'ALL' ? 'All' : status}
            </button>
          ))}
          <button type="button" onClick={() => setShowAdvancedFilters((prev) => !prev)} className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Filter size={14} /> Filters</button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="mileageFilterDateFrom" className="block text-xs font-medium text-slate-500 mb-1">Date From</label>
            <input id="mileageFilterDateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div>
            <label htmlFor="mileageFilterDateTo" className="block text-xs font-medium text-slate-500 mb-1">Date To</label>
            <input id="mileageFilterDateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={() => { setDateFrom(''); setDateTo('') }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear dates</button>
          </div>
        </div>
      )}

      <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="mileage"
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
        onRowClick={(row) => openEditMileage(row.id)}
        emptyTitle="No mileage logs found"
        emptySubtitle="Adjust your search or filters to see results"
        loading={loading}
      />

      <HaypModal
        open={mileagePanelOpen}
        onClose={closeMileagePanel}
        title={openMileageMode === 'new' ? 'New Mileage Log' : 'Edit Mileage Log'}
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeMileagePanel}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { saveAndNewRef.current = true; mileageFormRef.current?.save() }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Save and new
            </button>
            <button
              type="button"
              onClick={() => { saveAndNewRef.current = false; mileageFormRef.current?.save() }}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        }
      >
        <MileageForm
          key={`${openMileageMode}-${openMileageId ?? 'new'}`}
          ref={mileageFormRef}
          mode={openMileageMode}
          logId={openMileageId ?? undefined}
          onClose={closeMileagePanel}
          onSaved={handleSaved}
        />
      </HaypModal>
    </div>
  )
}
