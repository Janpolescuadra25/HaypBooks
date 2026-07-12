'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, X, AlertCircle, Loader2, RefreshCw, FileText, CheckCircle, Clock, DollarSign, Pencil, Trash2 } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypColumn, HaypFilterOption } from '@/components/shared/HaypDataTable.types'
import CustomerPickerField, { type CustomerPickerOption } from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'

interface RefundRow {
  id: string
  refundNumber: string
  customer: string
  customerId?: string
  invoiceNumber: string
  date: string
  amount: number
  method: string
  status: string
  approvalStatus?: string
  reason: string
}

interface RefundFormData {
  customerId: string
  amount: string
  method: string
  refundDate: string
  reason: string
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PROCESSED: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
}

const statusFilters: HaypFilterOption[] = [
  { value: '', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PROCESSED', label: 'Processed' },
  { value: 'REJECTED', label: 'Rejected' },
]

const defaultFormData: RefundFormData = {
  customerId: '',
  amount: '',
  method: 'BANK_TRANSFER',
  refundDate: new Date().toISOString().split('T')[0],
  reason: '',
}

const methodOptions = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'CHECK', label: 'Check' },
]

export default function RefundsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<RefundRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RefundRow | null>(null)
  const [formData, setFormData] = useState<RefundFormData>(defaultFormData)
  const [formSaving, setFormSaving] = useState(false)
  const [customers, setCustomers] = useState<CustomerPickerOption[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)

  const filtered = useMemo(() => {
    if (!statusFilter) return items
    return items.filter((row) => row.status === statusFilter || row.approvalStatus === statusFilter)
  }, [items, statusFilter])

  const pendingCount = useMemo(() => items.filter((row) => row.status === 'PENDING' || row.approvalStatus === 'PENDING').length, [items])
  const processedCount = useMemo(() => items.filter((row) => row.status === 'PROCESSED' || row.approvalStatus === 'PROCESSED').length, [items])
  const totalAmount = useMemo(() => items.reduce((sum, row) => sum + Number(row.amount ?? 0), 0), [items])

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await salesService.listArRefunds(companyId)
      const data = response.data
      setItems(Array.isArray(data) ? data : data?.items ?? data?.refunds ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load refunds')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const loadCustomers = useCallback(async () => {
    if (!companyId) return
    setCustomersLoading(true)
    try {
      const response = await salesService.listArCustomers(companyId)
      const data = response.data as any
      const raw = Array.isArray(data) ? data : data?.items ?? data?.records ?? []
      setCustomers(raw.map((item: any) => ({
        id: item.id ?? item.contactId,
        name: item.name ?? item.displayName ?? item.contact?.displayName ?? '—',
        email: item.email ?? item.contact?.email ?? '',
      })))
    } catch {
      setCustomers([])
    } finally {
      setCustomersLoading(false)
    }
  }, [companyId])

  const openCreate = useCallback(() => {
    setEditing(null)
    setFormData(defaultFormData)
    setShowForm(true)
    loadCustomers()
  }, [loadCustomers])

  const openEdit = useCallback((row: RefundRow) => {
    setEditing(row)
    setFormData({
      customerId: row.customerId ?? '',
      amount: String(row.amount),
      method: row.method,
      refundDate: row.date,
      reason: row.reason,
    })
    setShowForm(true)
    loadCustomers()
  }, [loadCustomers])

  const handleSave = useCallback(async () => {
    if (!companyId || !formData.customerId || !formData.amount) {
      toast.error('Customer and amount are required')
      return
    }
    setFormSaving(true)
    try {
      if (editing) {
        await salesService.updateArRefund(companyId, editing.id, formData)
        toast.success('Refund updated')
      } else {
        await salesService.createArRefund(companyId, formData)
        toast.success('Refund created')
      }
      setShowForm(false)
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Save failed')
    } finally {
      setFormSaving(false)
    }
  }, [companyId, editing, formData, fetchItems, toast])

  const handleProcess = useCallback(async (id: string) => {
    if (!companyId || !window.confirm('Process this refund? A GL entry will be created.')) return
    try {
      await salesService.processArRefund(companyId, id)
      toast.success('Refund processed')
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Process failed')
    }
  }, [companyId, fetchItems, toast])

  const handleBatchDelete = useCallback(async (selectedIds: string[]) => {
    if (!companyId || selectedIds.length === 0 || !window.confirm(`Delete ${selectedIds.length} refund(s)?`)) return
    try {
      await salesService.batchDeleteArRefunds(companyId, selectedIds)
      toast.success(`${selectedIds.length} refund(s) deleted`)
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Batch delete failed')
    }
  }, [companyId, fetchItems, toast])

  const columns = useMemo<HaypColumn<RefundRow>[]>(() => [
    { id: 'refundNumber', header: 'Refund #', accessorKey: 'refundNumber', size: 140 },
    { id: 'customer', header: 'Customer', accessorKey: 'customer', size: 180 },
    { id: 'invoiceNumber', header: 'Invoice #', accessorKey: 'invoiceNumber', size: 140 },
    { id: 'date', header: 'Date', accessorKey: 'date', size: 120 },
    { id: 'method', header: 'Method', accessorKey: 'method', size: 110 },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      size: 110,
      align: 'right',
      render: (_value, row) => formatCurrency(Number(row.amount), currency),
    },
    { id: 'reason', header: 'Reason', accessorKey: 'reason', size: 200, enableHiding: true },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 110,
      render: (_value, row) => {
        const statusLabel = row.status || row.approvalStatus || 'Unknown'
        return (
          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${STATUS_STYLES[statusLabel] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {statusLabel}
          </span>
        )
      },
    },
  ], [currency])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      show: () => true,
      onClick: (_rowId, row) => openEdit(row),
    },
    {
      label: 'Process',
      icon: <CheckCircle size={14} />,
      show: (row) => row.status !== 'PROCESSED',
      onClick: async (_rowId, row) => { await handleProcess(row.id) },
    },
  ], [handleProcess, openEdit])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={fetchItems} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
        <RefreshCw size={14} /> Refresh
      </button>
      <button type="button" onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
        <Plus size={14} /> New Refund
      </button>
    </div>
  )

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading refunds…</span>
      </div>
    )
  }

  if (cidError) {
    return <div className="p-6 text-red-600">{cidError}</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3 text-slate-900">
            <FileText size={18} />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Refunds</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3 text-slate-900">
            <Clock size={18} />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Pending</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3 text-slate-900">
            <CheckCircle size={18} />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Processed</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{processedCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3 text-slate-900">
            <DollarSign size={18} />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Amount</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(totalAmount, currency)}</p>
            </div>
          </div>
        </div>
      </div>
      <HaypDataTable
        data={filtered}
        columns={columns}
        tableId="refunds"
        title="Refunds"
        description="Manage refund requests and processing."
        loading={loading}
        searchPlaceholder="Search refunds..."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        primaryAction={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={14} /> Create Refund
          </button>
        }
        actions={actions}
        bulkActions={[{
          label: 'Batch Delete',
          variant: 'danger',
          icon: <Trash2 size={14} />,
          onClick: handleBatchDelete,
        }]}
        onRefresh={fetchItems}
        onExport={() => {
          const headers = ['Refund #', 'Customer', 'Invoice #', 'Date', 'Method', 'Amount', 'Status']
          const rows = filtered.map((row) => {
            const statusLabel = row.status || row.approvalStatus || ''
            return [row.refundNumber, row.customer, row.invoiceNumber, row.date, row.method, formatCurrency(Number(row.amount), currency), statusLabel]
          })
          const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
          const blob = new Blob([csv], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = 'refunds.csv'
          anchor.click()
          URL.revokeObjectURL(url)
        }}
        emptyTitle="No refunds found"
        emptySubtitle="Create a refund to get started"
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Edit Refund' : 'New Refund'}</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close form" className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <CustomerPickerField
                label="Customer *"
                value={formData.customerId}
                customers={customers}
                loading={customersLoading}
                placeholder="Select customer..."
                createLabel="Create new customer"
                onOpen={loadCustomers}
                onChange={(value) => setFormData((prev) => ({ ...prev, customerId: value }))}
                onCreateNew={() => setShowQuickAddCustomer(true)}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="refundDate" className="block text-sm font-medium text-slate-700 mb-1">Refund Date</label>
                  <input
                    id="refundDate"
                    type="date"
                    value={formData.refundDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, refundDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label htmlFor="method" className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                  <select
                    id="method"
                    value={formData.method}
                    onChange={(e) => setFormData((prev) => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {methodOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea
                  id="reason"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-slate-50">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
              <button type="button" onClick={handleSave} disabled={formSaving}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {formSaving ? 'Saving…' : editing ? 'Save Refund' : 'Create Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuickAddCustomer && companyId && (
        <QuickAddCustomerModal
          companyId={companyId}
          onClose={() => setShowQuickAddCustomer(false)}
          onCreated={(customer) => {
            const next = { id: customer.contactId, name: customer.name, email: customer.email }
            setCustomers((prev) => [next, ...prev.filter((item) => item.id !== next.id)])
            setFormData((prev) => ({ ...prev, customerId: next.id }))
            setShowQuickAddCustomer(false)
          }}
        />
      )}
    </div>
  )
}
