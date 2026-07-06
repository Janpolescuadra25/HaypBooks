'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Zap, Pause, Play, X, AlertCircle, Loader2, RefreshCw, Download, Pencil, Trash2 } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useToast } from '@/components/ToastProvider'
import { ModalPortal } from '@/components/shared/ModalPortal'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn, HaypActionItem } from '@/components/shared/HaypDataTable.types'

interface RecurringRow {
  id: string
  description?: string
  templateName?: string
  customer?: string
  customerId?: string
  frequency: string
  nextRun?: string
  nextRunDate?: string
  status: string
  templateData?: { totalAmount?: number }
  amount?: number | string
  [key: string]: any
}

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly', BIWEEKLY: 'Bi-Weekly', MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly', ANNUALLY: 'Annually',
}

const STATUS_MAP: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAUSED: 'bg-amber-50 text-amber-700 border-amber-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
}

const getRowName = (r: RecurringRow) => r.description ?? r.templateName ?? '—'
const getRowAmount = (r: RecurringRow) => r.templateData?.totalAmount ?? (r.amount ? Number(r.amount) : 0)
const getRowNextRun = (r: RecurringRow) => r.nextRun ?? r.nextRunDate ?? '—'

export default function RecurringInvoicesPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<RecurringRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [freqFilter, setFreqFilter] = useState('ALL')
  const [detailItem, setDetailItem] = useState<RecurringRow | null>(null)
  const [generatedInvoices, setGeneratedInvoices] = useState<Record<string, any[]>>({})
  const [loadingGenerated, setLoadingGenerated] = useState<Record<string, boolean>>({})

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await salesService.listArRecurringInvoices(companyId)
      const data = response.data
      setItems(Array.isArray(data) ? data : data?.items ?? data?.records ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load recurring invoices')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const filteredItems = useMemo(() => {
    return items.filter((row) => {
      const query = search.toLowerCase()
      const name = getRowName(row).toLowerCase()
      const matchesSearch = !query || name.includes(query) || (row.customer ?? '').toLowerCase().includes(query) || row.frequency.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter
      const matchesFreq = freqFilter === 'ALL' || row.frequency === freqFilter
      return matchesSearch && matchesStatus && matchesFreq
    })
  }, [items, search, statusFilter, freqFilter])

  const handleGenerate = useCallback(async (id: string) => {
    if (!companyId) return
    try {
      await salesService.generateRecurringInvoice(companyId, id)
      toast.success('Invoice generated')
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to generate invoice')
    }
  }, [companyId, fetchItems, toast])

  const handleUpdateStatus = useCallback(async (row: RecurringRow, status: string) => {
    if (!companyId) return
    try {
      await salesService.updateRecurringInvoice(companyId, row.id, { status })
      toast.success(`Template ${status === 'PAUSED' ? 'paused' : 'resumed'}`)
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to update template')
    }
  }, [companyId, fetchItems, toast])

  const handleBatchDelete = useCallback(async (selectedIds: string[]) => {
    if (!companyId || selectedIds.length === 0) return
    if (!window.confirm(`Delete ${selectedIds.length} template(s)? This cannot be undone.`)) return
    try {
      await salesService.batchDeleteRecurringInvoices(companyId, selectedIds)
      toast.success(`${selectedIds.length} template(s) deleted`)
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to delete templates')
    }
  }, [companyId, fetchItems, toast])

  const loadGeneratedInvoices = useCallback(async (templateId: string) => {
    if (!companyId || generatedInvoices[templateId]) return
    setLoadingGenerated(prev => ({ ...prev, [templateId]: true }))
    try {
      const { data } = await salesService.listArInvoices(companyId, { recurringTemplateId: templateId })
      setGeneratedInvoices(prev => ({ ...prev, [templateId]: Array.isArray(data) ? data : data?.items ?? data?.data ?? [] }))
    } catch (e: any) {
      console.error('Failed to load generated invoices', e)
      setGeneratedInvoices(prev => ({ ...prev, [templateId]: [] }))
    } finally {
      setLoadingGenerated(prev => ({ ...prev, [templateId]: false }))
    }
  }, [companyId, generatedInvoices])

  const handleExport = useCallback(() => {
    const headers = ['Template', 'Customer', 'Frequency', 'Amount', 'Next Run', 'Status']
    const rows = filteredItems.map((row) => [
      getRowName(row),
      row.customer ?? '—',
      row.frequency,
      formatCurrency(getRowAmount(row), currency),
      getRowNextRun(row),
      row.status,
    ])
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'recurring-invoices.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }, [filteredItems, currency])

  const columns = useMemo<HaypColumn<RecurringRow>[]>(() => [
    {
      id: 'template',
      header: 'Template',
      accessorKey: 'templateName',
      size: 260,
      render: (_value, row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-900">{getRowName(row)}</div>
          <div className="text-xs text-slate-500">{FREQ_LABELS[row.frequency] ?? row.frequency}</div>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorKey: 'customer',
      size: 180,
    },
    {
      id: 'frequency',
      header: 'Frequency',
      accessorKey: 'frequency',
      size: 140,
      render: (value: any) => FREQ_LABELS[value] ?? value,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'templateData.totalAmount',
      size: 120,
      align: 'right',
      render: (_value, row) => (
        <span className="font-semibold text-slate-900">{formatCurrency(getRowAmount(row), currency)}</span>
      ),
    },
    {
      id: 'nextRun',
      header: 'Next Run',
      accessorKey: 'nextRun',
      size: 140,
      render: (_value, row) => getRowNextRun(row),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 120,
      render: (_value, row) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${STATUS_MAP[row.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {row.status}
        </span>
      ),
    },
  ], [currency])

  const filters = useMemo(
    () => [
      { value: 'ALL', label: 'All Status' },
      { value: 'ACTIVE', label: 'Active' },
      { value: 'PAUSED', label: 'Paused' },
      { value: 'CANCELLED', label: 'Cancelled' },
    ],
    [],
  )

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      onClick: (_rowId, row) => router.push(`/sales/billing/recurring/edit/${row.id}`),
    },
    {
      label: 'Generate Now',
      icon: <Zap size={14} />,
      onClick: async (_rowId, row) => { await handleGenerate(row.id) },
    },
    {
      label: 'Pause',
      icon: <Pause size={14} />,
      show: (row) => row.status === 'ACTIVE',
      onClick: async (_rowId, row) => { await handleUpdateStatus(row, 'PAUSED') },
    },
    {
      label: 'Resume',
      icon: <Play size={14} />,
      show: (row) => row.status !== 'ACTIVE',
      onClick: async (_rowId, row) => { await handleUpdateStatus(row, 'ACTIVE') },
    },
  ], [handleGenerate, handleUpdateStatus, router])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Filter by frequency"
        value={freqFilter}
        onChange={(e) => setFreqFilter(e.target.value)}
        className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-10 gap-2 px-3 cursor-pointer shadow-sm min-w-[140px] outline-none focus:outline-none"
      >
        <option value="ALL">All Frequencies</option>
        {Object.entries(FREQ_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => router.push('/sales/billing/recurring/new')}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <Plus size={14} /> New Template
      </button>
    </div>
  )

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading…</span>
      </div>
    )
  }

  if (cidError) {
    return <div className="p-6 text-red-600">{cidError}</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <HaypDataTable
        data={filteredItems}
        columns={columns}
        tableId="recurring-invoices"
        title="Recurring Invoices"
        description="Manage recurring invoice templates."
        loading={loading}
        searchPlaceholder="Search templates..."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={filters}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        headerActions={headerActions}
        bulkActions={[{
          label: 'Delete Selected',
          icon: <Trash2 size={14} />,
          onClick: handleBatchDelete,
        }]}
        actions={actions}
        onRowClick={(row) => { void loadGeneratedInvoices((row as RecurringRow).id); setDetailItem(row as RecurringRow) }}
        onRefresh={fetchItems}
        onExport={handleExport}
        emptyTitle="No recurring invoices"
        emptySubtitle="Create your first recurring invoice template to get started."
      />

      {detailItem && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex justify-end">
            <div className="fixed inset-0 z-[9998] bg-black/80" onClick={() => setDetailItem(null)} />
            <div className="relative z-[10000] bg-white w-full max-w-md shadow-2xl overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
                <h2 className="text-lg font-semibold text-gray-900">{getRowName(detailItem)}</h2>
                <button onClick={() => setDetailItem(null)} aria-label="Close details" className="p-1.5 rounded hover:bg-gray-100"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Customer', detailItem.customer ?? '—'],
                    ['Frequency', FREQ_LABELS[detailItem.frequency] ?? detailItem.frequency],
                    ['Next Run', getRowNextRun(detailItem)],
                    ['Amount', formatCurrency(getRowAmount(detailItem), currency)],
                    ['Status', detailItem.status],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { handleGenerate(detailItem.id); setDetailItem(null) }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">
                    <Zap size={15} /> Generate Now
                  </button>
                  <button onClick={() => { handleUpdateStatus(detailItem, detailItem.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'); setDetailItem(null) }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-semibold hover:bg-amber-100">
                    {detailItem.status === 'ACTIVE' ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Resume</>}
                  </button>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Generated invoices</p>
                      <p className="text-xs text-slate-500">Invoices created from this recurring template.</p>
                    </div>
                    {loadingGenerated[detailItem.id] && <span className="text-xs text-slate-500">Loading…</span>}
                  </div>
                  {loadingGenerated[detailItem.id] ? (
                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-slate-500">Loading generated invoices…</div>
                  ) : (
                    <div className="space-y-2">
                      {(generatedInvoices[detailItem.id] ?? []).length > 0 ? (
                        (generatedInvoices[detailItem.id] ?? []).map((inv) => (
                          <div key={inv.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center rounded-2xl bg-gray-50 p-3">
                            <div>
                              <div className="font-semibold text-slate-900">{inv.invoiceNumber ?? inv.id}</div>
                              <div className="text-xs text-slate-500">{inv.customerName ?? inv.customer ?? 'Customer'}</div>
                            </div>
                            <div className="text-right text-sm font-semibold text-slate-900">
                              {formatCurrency(Number(inv.totalAmount ?? inv.total ?? inv.amount ?? 0), currency)}
                            </div>
                            <div className="text-right text-xs text-slate-500">{inv.status ?? '—'}</div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl bg-gray-50 p-4 text-sm text-slate-500">No invoices generated yet.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
