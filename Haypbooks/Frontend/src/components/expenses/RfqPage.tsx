'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Filter, Clock, FileText, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react'
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

  const dateFiltered = useMemo(() => {
    let list = rows
    if (dateFrom) list = list.filter((row) => (row.dateSent ?? '') >= dateFrom)
    if (dateTo) list = list.filter((row) => (row.dateSent ?? '') <= dateTo)
    return list
  }, [rows, dateFrom, dateTo])

  const exportRows = useMemo(() => {
    let list = dateFiltered
    if (statusFilter !== 'ALL') list = list.filter((row) => row.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((row) => (row.rfqNumber ?? '').toLowerCase().includes(q) || (row.subject ?? '').toLowerCase().includes(q))
    }
    return list
  }, [dateFiltered, statusFilter, search])

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
      exportRows.map((row) => [row.rfqNumber ?? '', row.subject ?? '', String(row.vendorCount ?? 0), row.dateSent ?? '', row.closingDate ?? '', row.status ?? '']),
    )
    toast.success('CSV exported')
  }, [exportRows, toast])

  const activeFilterCount = [statusFilter !== 'ALL', dateFrom, dateTo].filter(Boolean).length

  const stats = useMemo(() => [
    { icon: FileText, label: 'Total RFQs', value: rows.length, color: 'blue' },
    { icon: Clock, label: 'Open', value: rows.filter(r => r.status === 'SENT').length, color: 'amber' },
    { icon: CheckCircle, label: 'Awarded', value: rows.filter(r => r.status === 'AWARDED').length, color: 'emerald' },
    { icon: XCircle, label: 'Closed', value: rows.filter(r => r.status === 'CLOSED').length, color: 'rose' },
  ], [rows])

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <HaypDataTable
        data={dateFiltered}
        columns={columns}
        tableId="rfq"
        title="Requests for Quote"
        description="Manage RFQs and track vendor responses."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={STATUSES.map((status) => ({ value: status, label: status === 'ALL' ? 'All' : status }))}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterLabel="Status"
        dateRange={{ start: dateFrom ? new Date(dateFrom) : new Date('1970-01-01'), end: dateTo ? new Date(dateTo) : new Date('9999-12-31') }}
        onDateRangeChange={({ start, end }) => {
          setDateFrom(start.toISOString().slice(0, 10))
          setDateTo(end.toISOString().slice(0, 10))
        }}
        totals={totals}
        stats={stats}
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
      </div>
    </div>
  )
}
