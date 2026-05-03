'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Filter, Clock, RefreshCw } from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { csvDownload, fmtDate, StatusPill } from './_helpers'

interface Rfq {
  id: string
  rfqNumber?: string
  subject?: string
  vendorCount?: number
  dateSent?: string
  closingDate?: string
  status?: string
}

const STATUSES = ['ALL', 'DRAFT', 'SENT', 'CLOSED', 'AWARDED'] as const

type StatusFilter = typeof STATUSES[number]

export default function RfqPage() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const router = useRouter()
  const toast = useToast()
  const [rows, setRows] = useState<Rfq[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [sortKey, setSortKey] = useState<'dateSent' | 'closingDate' | 'rfqNumber' | 'subject' | 'vendorCount' | 'status'>('dateSent')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    if (!companyId) { setLoading(false); return }
    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listRfqs(companyId)
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.rfqs ?? [])
    } catch {
      setError('Failed to load RFQs')
      toast.error('Failed to load RFQs')
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchRows() }, [fetchRows])

  const sendRfq = useCallback(async (id: string) => {
    if (!companyId) { toast.error('Company not loaded'); return }
    setSendingId(id)
    try {
      await expensesService.updateRfq(companyId, id, { status: 'SENT' })
      toast.success('RFQ sent to vendors')
      fetchRows()
    } catch {
      toast.error('Failed to send RFQ')
    } finally {
      setSendingId(null)
    }
  }, [companyId, fetchRows, toast])

  const filtered = useMemo(() => {
    let list = rows
    if (statusFilter !== 'ALL') list = list.filter((row) => row.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((row) => (row.rfqNumber ?? '').toLowerCase().includes(q) || (row.subject ?? '').toLowerCase().includes(q))
    }
    if (dateFrom) list = list.filter((row) => (row.dateSent ?? '') >= dateFrom)
    if (dateTo) list = list.filter((row) => (row.dateSent ?? '') <= dateTo)
    return list
  }, [rows, statusFilter, search, dateFrom, dateTo])

  const sorted = useMemo(() => {
    const next = [...filtered]
    next.sort((a, b) => {
      const left = a[sortKey] ?? ''
      const right = b[sortKey] ?? ''
      if (sortKey === 'vendorCount') {
        const d = Number(a.vendorCount ?? 0) - Number(b.vendorCount ?? 0)
        return sortDir === 'asc' ? d : -d
      }
      const al = String(left).toLowerCase()
      const bl = String(right).toLowerCase()
      return sortDir === 'asc' ? al.localeCompare(bl) : bl.localeCompare(al)
    })
    return next
  }, [filtered, sortDir, sortKey])

  const pageSize = 25
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages) }, [currentPage, totalPages])
  const paged = useMemo(() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sorted, currentPage])

  const columns = useMemo<HaypColumn<Rfq>[]>(() => [
    {
      id: 'rfqNumber',
      header: 'RFQ #',
      accessorKey: 'rfqNumber',
      size: 130,
      minSize: 150,
      render: (value) => <span className="font-semibold text-gray-800">{value ?? '—'}</span>,
    },
    {
      id: 'subject',
      header: 'Subject',
      accessorKey: 'subject',
      size: 220,
      minSize: 200,
      render: (value) => <span className="text-gray-700 truncate">{value ?? '—'}</span>,
    },
    {
      id: 'vendorCount',
      header: 'Vendors',
      accessorKey: 'vendorCount',
      size: 100,
      minSize: 90,
      align: 'right',
      render: (value) => <span className="font-medium text-gray-700 tabular-nums">{value ?? 0}</span>,
    },
    {
      id: 'dateSent',
      header: 'Date Sent',
      accessorKey: 'dateSent',
      size: 115,
      minSize: 120,
      render: (value) => <span className="text-gray-500">{value ? fmtDate(value) : '—'}</span>,
    },
    {
      id: 'closingDate',
      header: 'Closing Date',
      accessorKey: 'closingDate',
      size: 115,
      minSize: 120,
      render: (value) => <span className="text-gray-500">{value ? fmtDate(value) : '—'}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 130,
      minSize: 100,
      render: (value) => <StatusPill status={value ?? 'DRAFT'} />,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      size: 130,
      minSize: 120,
      enableSorting: true,
      align: 'right',
      isSummable: true,
      render: (value) => <span className="font-semibold text-emerald-800 tabular-nums">{formatCurrency(value ?? 0, currency)}</span>,
    },
  ], [currency])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit RFQ',
      onClick: (id) => router.push(`/expenses/procurement/rfq/${id}/edit`),
    },
    {
      label: 'Send to vendors',
      onClick: (id) => sendRfq(id),
      show: (row) => row.status === 'DRAFT',
      disabled: sendingId !== null,
    },
  ], [router, sendRfq, sendingId])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['amount'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const handleExportCSV = useCallback(() => {
    csvDownload(`rfq-${new Date().toISOString().slice(0, 10)}.csv`,
      ['RFQ #', 'Subject', 'Vendors', 'Date Sent', 'Closing Date', 'Status'],
      sorted.map((row) => [row.rfqNumber ?? '', row.subject ?? '', String(row.vendorCount ?? 0), row.dateSent ?? '', row.closingDate ?? '', row.status ?? '']),
    )
    toast.success('CSV exported')
  }, [sorted, toast])

  const activeFilterCount = [statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  const toggleSort = useCallback((key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }, [sortKey])

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Request for Quotation</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{loading ? 'Loading...' : `${sorted.length} RFQs`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button title="Refresh" onClick={fetchRows} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"><RefreshCw size={14} /></button>
          <button onClick={() => router.push('/expenses/procurement/rfq/activity')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50"> <Clock size={15} /> Activity Log</button>
          <button onClick={() => toast.info('Coming soon')} title="Coming soon" className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"><Plus size={15} /> New RFQ</button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input type="text" placeholder="Search RFQs..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{s === 'ALL' ? 'All' : s}</button>
          ))}
        </div>
        <button onClick={() => setShowAdvancedFilters((prev) => !prev)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${showAdvancedFilters || activeFilterCount > 0 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Filter size={13} /> Filters {activeFilterCount > 0 && <span className="bg-emerald-600 text-white rounded-full px-1.5 py-px text-[10px] font-bold">{activeFilterCount}</span>}</button>
      </div>

      {showAdvancedFilters && (
        <div className="bg-white rounded-xl border border-emerald-100 p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date Sent From</label>
            <input type="date" aria-label="Date sent from" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date Sent To</label>
            <input type="date" aria-label="Date sent to" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <button onClick={() => { setStatusFilter('ALL'); setDateFrom(''); setDateTo('') }} className="text-xs text-emerald-600 hover:underline">Clear all</button>
        </div>
      )}

      <HaypDataTable
        data={paged}
        columns={columns}
        tableId="rfq"
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={[]}
        activeFilter=""
        onFilterChange={() => {} }
        totals={totals}
        filterLabel="All"
        bulkActions={[
          {
            label: 'Export selected',
            onClick: (_ids, selectedRows) => {
              csvDownload(`rfq-selected-${new Date().toISOString().slice(0, 10)}.csv`, ['RFQ #', 'Subject', 'Vendors', 'Date Sent', 'Closing Date', 'Status'], selectedRows.map((row) => [row.rfqNumber ?? '', row.subject ?? '', String(row.vendorCount ?? 0), row.dateSent ?? '', row.closingDate ?? '', row.status ?? '']))
              toast.success('Selected RFQs exported')
            },
          },
        ]}
        actions={actions}
        onRefresh={fetchRows}
        onExport={handleExportCSV}
        exportLabel="Export CSV"
        onActivityLog={() => router.push('/expenses/procurement/rfq/activity')}
        onRowClick={(row) => router.push(`/expenses/procurement/rfq/${row.id}/edit`)}
        emptyTitle={loading ? 'Loading...' : 'No RFQs found'}
        emptySubtitle="Adjust filters or create a new RFQ"
        loading={loading}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 text-xs text-gray-500">
          <span>{sorted.length} total</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="font-semibold text-gray-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
