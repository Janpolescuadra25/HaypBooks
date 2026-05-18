'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Eye, Check, Ban, X, ListOrdered, CheckCircle, Clock, Banknote } from 'lucide-react'
import { expensesService } from '@/services/expenses.service'
import HaypSelect from '@/components/shared/HaypSelect'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn, HaypActionItem, HaypBulkAction, HaypTotalsConfig } from '@/components/shared/HaypDataTable.types'
import { fmtDate, csvDownload, StatusPill } from './_helpers'

interface VendorCredit {
  id: string
  vendorId?: string
  creditNumber?: string
  vendorName?: string
  issueDate: string
  status?: string
  postingStatus?: string
  amount: number
  availableAmount?: number
}

const STATUSES = ['ALL', 'OPEN', 'PARTIALLY_USED', 'APPLIED', 'VOID'] as const
const POSTING_STATUSES = ['ALL', 'DRAFT', 'POSTED', 'VOIDED'] as const

export default function VendorCreditsPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [rows, setRows] = useState<VendorCredit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>('ALL')
  const [postingStatusFilter, setPostingStatusFilter] = useState<(typeof POSTING_STATUSES)[number]>('ALL')
  const [vendorFilter, setVendorFilter] = useState('ALL')
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([])
  const [isVoiding, setIsVoiding] = useState(false)

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchCredits = useCallback(async () => {
    if (!companyId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await expensesService.listVendorCredits(companyId, {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        postingStatus: postingStatusFilter !== 'ALL' ? postingStatusFilter : undefined,
      })
      const data = res.data ?? res
      setRows(Array.isArray(data) ? data : data.vendorCredits ?? [])
    } catch {
      setError('Failed to load vendor credits')
      toast.error('Failed to load vendor credits')
    } finally {
      setLoading(false)
    }
  }, [companyId, postingStatusFilter, statusFilter, toast])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  useEffect(() => {
    if (!companyId) return
    let active = true

    async function fetchVendors() {
      try {
        const res = await expensesService.listVendors(companyId)
        const data = res.data ?? res
        const list = Array.isArray(data) ? data : data.data ?? []
        const normalized = list.map((vendor: any) => ({
          id: String(vendor.id ?? vendor.contactId ?? vendor.contact?.id ?? ''),
          name: String(vendor.displayName ?? vendor.name ?? vendor.contact?.displayName ?? ''),
        })).filter((vendor: any) => Boolean(vendor.id))
        if (!active) return
        setVendors(normalized)
      } catch {
        // ignore vendor list failure for filter UI
      }
    }

    fetchVendors()
    return () => { active = false }
  }, [companyId])

  const handleApply = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await expensesService.applyVendorCredit(companyId, id)
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'APPLIED', postingStatus: 'POSTED', availableAmount: 0 } : row)))
      toast.success('Credit applied')
    } catch {
      toast.error('Failed to apply credit')
    }
  }, [companyId, toast])

  const handleVoid = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Are you sure you want to void this vendor credit? This will reverse the GL journal entries and cannot be undone.')) return

    setIsVoiding(true)
    try {
      await expensesService.voidVendorCredit(companyId, id)
      await fetchCredits()
      toast.success('Credit voided')
    } catch {
      toast.error('Failed to void credit')
    } finally {
      setIsVoiding(false)
    }
  }, [companyId, fetchCredits, toast])

  const renderCell = useCallback((value: any, key: string) => {
    switch (key) {
      case 'creditNumber':
        return <span className="font-semibold text-gray-800">{value ?? '—'}</span>
      case 'vendorName':
        return <span className="text-gray-700 truncate">{value ?? '—'}</span>
      case 'issueDate':
        return <span className="text-gray-500">{fmtDate(value)}</span>
      case 'status':
        return <StatusPill status={value ?? 'OPEN'} />
      case 'amount':
        return <span className="font-semibold text-emerald-800 tabular-nums">{fmt(value)}</span>
      case 'availableAmount':
        return <span className={`font-semibold tabular-nums ${(value ?? 0) > 0 ? 'text-blue-700' : 'text-gray-400'}`}>{fmt(value ?? 0)}</span>
      default:
        return <span className="truncate">{value ?? '—'}</span>
    }
  }, [fmt])

  const handleDeleteCredit = useCallback(async (id: string) => {
    if (!companyId) return
    if (!confirm('Delete this vendor credit? This action cannot be undone.')) return
    try {
      await expensesService.deleteVendorCredit(companyId, id)
      setRows((prev) => prev.filter((row) => row.id !== id))
      toast.success('Credit deleted')
    } catch {
      toast.error('Failed to delete credit')
    }
  }, [companyId, toast])

  const filtered = useMemo(() => {
    let list = rows
    if (vendorFilter !== 'ALL') {
      const selectedVendor = vendors.find((vendor) => vendor.id === vendorFilter)?.name
      list = list.filter((row) => row.vendorId === vendorFilter || row.vendorName === selectedVendor)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((row) =>
        (row.creditNumber ?? '').toLowerCase().includes(q) ||
        (row.vendorName ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [rows, search, vendorFilter, vendors])

  const columns = useMemo<HaypColumn<VendorCredit>[]>(() => [
    {
      id: 'creditNumber',
      accessorKey: 'creditNumber',
      header: 'Credit #',
      size: 140,
      minSize: 140,
      enableSorting: true,
      align: 'left',
      render: (value) => renderCell(value, 'creditNumber'),
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
      id: 'issueDate',
      accessorKey: 'issueDate',
      header: 'Issue Date',
      size: 115,
      minSize: 120,
      enableSorting: true,
      align: 'left',
      render: (value) => renderCell(value, 'issueDate'),
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
      id: 'postingStatus',
      accessorKey: 'postingStatus',
      header: 'Posting',
      size: 110,
      minSize: 100,
      enableSorting: true,
      align: 'left',
      render: (value) => <StatusPill status={value ?? 'DRAFT'} type="posting" />,
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
    {
      id: 'availableAmount',
      accessorKey: 'availableAmount',
      header: 'Remaining',
      size: 130,
      minSize: 120,
      enableSorting: true,
      align: 'right',
      render: (value) => renderCell(value, 'availableAmount'),
    },
  ], [fmt, renderCell])

  const totals = useMemo<HaypTotalsConfig>(() => ({
    enabled: true,
    sumColumns: ['amount', 'availableAmount'],
    formatValue: (value) => formatCurrency(Number(value ?? 0), currency),
  }), [currency])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit Credit',
      icon: <Eye size={14} />,
      onClick: (_rowId, row) => router.push(`/expenses/bills-payments/vendor-credits/${row.id}/edit`),
    },
    {
      label: '',
      onClick: () => {},
      divider: true,
    },
    {
      label: 'Apply Credit',
      icon: <Check size={14} />,
      show: (row) => row.status === 'OPEN' || row.status === 'PARTIALLY_USED',
      onClick: (_rowId, row) => handleApply(row.id),
    },
    {
      label: isVoiding ? 'Voiding...' : 'Void Credit',
      icon: <Ban size={14} />,
      danger: true,
      show: (row) => (row.postingStatus ?? '').toUpperCase() === 'POSTED',
      onClick: (_rowId, row) => handleVoid(row.id),
      disabled: isVoiding,
    },
    {
      label: 'Delete Credit',
      icon: <X size={14} />,
      danger: true,
      show: (row) => {
        const status = (row.status ?? '').toUpperCase()
        return status === 'VOID' || status === 'VOIDED'
      },
      onClick: (_rowId, row) => handleDeleteCredit(row.id),
    },
  ], [handleApply, handleDeleteCredit, handleVoid, isVoiding, router])

  const bulkActions = useMemo<HaypBulkAction[]>(() => [
    {
      label: 'Void Selected',
      variant: 'danger',
      onClick: (_selectedIds, selectedRows) => {
        if (!companyId || selectedRows.length === 0) return
        const voidable = selectedRows.filter((row) => {
          const status = (row.status ?? 'OPEN').toUpperCase()
          return row.id != null && status !== 'VOID' && status !== 'VOIDED'
        }) as VendorCredit[]
        if (voidable.length === 0) {
          toast.error('No selected credits can be voided')
          return
        }
        if (!confirm(`Void ${voidable.length} selected credit${voidable.length !== 1 ? 's' : ''}?`)) return
        setIsVoiding(true)
        Promise.all(voidable.map((row) => expensesService.voidVendorCredit(companyId, row.id)))
          .then(() => {
            setRows((prev) => prev.map((row) =>
              voidable.some((selected) => selected.id === row.id)
                ? { ...row, status: 'VOIDED', postingStatus: 'VOIDED', availableAmount: 0 }
                : row,
            ))
            toast.success(`${voidable.length} selected credit${voidable.length !== 1 ? 's' : ''} voided`)
          })
          .catch(() => toast.error('Failed to void selected credits'))
          .finally(() => setIsVoiding(false))
      },
      disabled: (_selectedIds, selectedRows) => isVoiding || selectedRows.length === 0 || selectedRows.every((row) => {
        const status = (row.status ?? 'OPEN').toUpperCase()
        return status === 'VOID' || status === 'VOIDED'
      }),
    },
    {
      label: 'Export Selected',
      icon: <Download size={14} />,
      onClick: (_selectedIds, selectedRows) => {
        if (selectedRows.length === 0) return
        csvDownload(`vendor-credits-selected-${new Date().toISOString().slice(0, 10)}.csv`,
          ['Credit #', 'Vendor', 'Issue Date', 'Status', 'Amount', 'Remaining'],
          selectedRows.map((row) => [row.creditNumber ?? '', row.vendorName ?? '', row.issueDate, row.status ?? '', String(row.amount), String(row.availableAmount ?? 0)]),
        )
        toast.success('Selected credits exported')
      },
    },
  ], [companyId, isVoiding, toast])

  const filterLabel = statusFilter === 'ALL' ? 'Status' : statusFilter.toLowerCase().replace(/_/g, ' ')

  const handleExportCSV = useCallback(() => {
    csvDownload(`vendor-credits-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Credit #', 'Vendor', 'Issue Date', 'Status', 'Amount', 'Remaining'],
      filtered.map((row) => [row.creditNumber ?? '', row.vendorName ?? '', row.issueDate, row.status ?? '', String(row.amount), String(row.availableAmount ?? 0)]),
    )
    toast.success('CSV exported')
  }, [filtered, toast])

  const stats = useMemo(() => [
    { icon: ListOrdered, label: 'Total Credits', value: rows.length, color: 'blue' },
    { icon: CheckCircle, label: 'Open Credits', value: rows.filter((row) => row.status === 'OPEN').length, color: 'emerald' },
    { icon: Clock, label: 'Applied Credits', value: rows.filter((row) => row.status === 'APPLIED').length, color: 'amber' },
    { icon: Banknote, label: 'Total Credit Value', value: formatCurrency(rows.reduce((sum, row) => sum + Number(row.amount || 0), 0), currency), color: 'rose' },
  ], [rows, currency])

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50/30 custom-scrollbar">
      <div className="min-h-full min-w-0 overflow-visible">
        <HaypDataTable
        tableId="vendor-credits"
        data={filtered}
        columns={columns}
        title="Vendor Credits"
        description="Manage credits from vendors and apply them to bills."
        stats={stats}
        headerActions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 w-full">
              <div className="w-full sm:w-64">
                <HaypSelect
                  value={vendorFilter}
                  onChange={setVendorFilter}
                  options={[
                    { value: 'ALL', label: 'All Vendors' },
                    ...vendors.map((vendor) => ({ value: vendor.id, label: vendor.name })),
                  ]}
                  placeholder="All vendors"
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-64">
                <HaypSelect
                  label="Posting Status"
                  value={postingStatusFilter}
                  onChange={(value) => setPostingStatusFilter(String(value) as (typeof POSTING_STATUSES)[number])}
                  options={POSTING_STATUSES.map((status) => ({ value: status, label: status === 'ALL' ? 'All Posting Statuses' : status }))}
                  className="w-full"
                />
              </div>
            </div>
            <button
              onClick={() => router.push('/expenses/bills-payments/vendor-credits/new')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} />
              New Vendor Credit
            </button>
          </div>
        }
        loading={loading || cidLoading}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        searchPlaceholder="Search credits..."
        filters={STATUSES.map((status) => ({ value: status.toLowerCase(), label: status === 'ALL' ? 'All' : status.replace(/_/g, ' ') }))}
        activeFilter={statusFilter.toLowerCase()}
        onFilterChange={(value: any) => setStatusFilter(String(value).toUpperCase() as (typeof STATUSES)[number])}
        filterLabel={filterLabel}
        onRefresh={fetchCredits}
        onExport={handleExportCSV}
        onActivityLog={() => router.push('/expenses/bills-payments/vendor-credits/activity')}
        actions={actions}
        bulkActions={bulkActions}
        totals={totals}
        emptyTitle="No credits found"
        emptySubtitle="Adjust your search or filter to see results"
      />
      </div>
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    </div>
  )
}
