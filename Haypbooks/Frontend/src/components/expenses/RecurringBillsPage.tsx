'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Filter, Eye, X, FileText, PauseCircle, PlayCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypBulkAction, HaypColumn, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
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

  const handleSaved = useCallback(async () => {
    await fetchRows()
  }, [fetchRows])

  const dateFiltered = useMemo(() => {
    return rows
      .filter((row) => (dateFrom ? (row.nextDate ?? '') >= dateFrom : true))
      .filter((row) => (dateTo ? (row.nextDate ?? '') <= dateTo : true))
  }, [rows, dateFrom, dateTo])

  const filtered = useMemo(() => {
    return dateFiltered
      .filter((row) => statusFilter === 'ALL' || row.status === statusFilter)
      .filter((row) => {
        const q = search.toLowerCase()
        return (
          row.templateName?.toLowerCase().includes(q) ||
          row.vendorName?.toLowerCase().includes(q)
        )
      })
  }, [dateFiltered, statusFilter, search])

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
    router.push(`/expenses/bills-payments/recurring-bills/edit/${id}`)
  }, [router])

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
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <HaypDataTable
          data={filtered}
          columns={columns}
          tableId="recurring-bills"
          title="Recurring Bills"
          description="Manage recurring bill templates and payment schedules."
          headerActions={
            <button onClick={() => router.push('/expenses/bills-payments/recurring-bills/new')} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> New Template</button>
          }
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          onActivityLog={() => router.push('/expenses/bills-payments/recurring-bills/activity')}
          filters={STATUSES.map((status) => ({ value: status, label: status === 'ALL' ? 'All' : status }))}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          filterLabel="Status"
          totals={totals}
          actions={actions}
          bulkActions={bulkActions}
          stats={stats}
          loading={loading}
        />
      </div>
    </div>
  )
}
