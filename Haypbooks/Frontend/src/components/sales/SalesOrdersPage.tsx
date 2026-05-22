'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, X, AlertCircle, Loader2, RefreshCw, FileText, Clock, Pencil } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypColumn, HaypFilterOption } from '@/components/shared/HaypDataTable.types'
import CustomerPickerField, { type CustomerPickerOption } from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'

interface SalesOrderLine {
  description: string
  quantity: number
  unitPrice: number
}

interface SalesOrder {
  id: string
  orderNumber: string
  customer: string
  customerId?: string
  orderDate: string
  shipDate?: string
  total: string
  status: string
  invoiceId?: string | null
  [key: string]: any
}

interface SOFormData {
  customerId: string
  orderDate: string
  shipDate: string
  lines: SalesOrderLine[]
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  FULFILLED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-purple-50 text-purple-700 border-purple-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
}

const statusFilters: HaypFilterOption[] = [
  { value: '', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'FULFILLED', label: 'Fulfilled' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const defaultFormData: SOFormData = {
  customerId: '',
  orderDate: new Date().toISOString().split('T')[0],
  shipDate: '',
  lines: [{ description: '', quantity: 1, unitPrice: 0 }],
}

const emptyLine = (): SalesOrderLine => ({ description: '', quantity: 1, unitPrice: 0 })

export default function SalesOrdersPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SalesOrder | null>(null)
  const [detailItem, setDetailItem] = useState<SalesOrder | null>(null)
  const [detailTab, setDetailTab] = useState<'details' | 'activity'>('details')
  const [orderActivity, setOrderActivity] = useState<any[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [formData, setFormData] = useState<SOFormData>(defaultFormData)
  const [formSaving, setFormSaving] = useState(false)
  const [customers, setCustomers] = useState<CustomerPickerOption[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await salesService.listArSalesOrders(companyId)
      const data = response.data as any
      setItems(Array.isArray(data) ? data : data?.items ?? data?.records ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load sales orders')
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

  const columns = useMemo<HaypColumn<SalesOrder>[]>(() => [
    { id: 'orderNumber', header: 'Order #', accessorKey: 'orderNumber', size: 160 },
    { id: 'customer', header: 'Customer', accessorKey: 'customer', size: 200 },
    { id: 'orderDate', header: 'Order Date', accessorKey: 'orderDate', size: 140 },
    { id: 'shipDate', header: 'Ship Date', accessorKey: 'shipDate', size: 140 },
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'total',
      size: 120,
      align: 'right',
      render: (_value, row) => formatCurrency(Number(row.total), currency),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 120,
      render: (_value, row) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${STATUS_STYLES[row.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {row.status}
        </span>
      ),
    },
  ], [currency])

  const handleCreate = useCallback(() => {
    setEditing(null)
    setFormData(defaultFormData)
    setShowForm(true)
    loadCustomers()
  }, [loadCustomers])

  const openEdit = useCallback((row: SalesOrder) => {
    setEditing(row)
    setFormData({
      customerId: row.customerId ?? '',
      orderDate: row.orderDate,
      shipDate: row.shipDate ?? '',
      lines: [{ description: row.orderNumber, quantity: 1, unitPrice: Number(row.total) }],
    })
    setShowForm(true)
    loadCustomers()
  }, [loadCustomers])

  const openDetail = useCallback((row: SalesOrder) => {
    setDetailItem(row)
    setDetailTab('details')
    setOrderActivity([])
  }, [])

  const handleSave = useCallback(async () => {
    if (!companyId) return
    if (!formData.customerId) {
      toast.error('Customer is required')
      return
    }
    setFormSaving(true)
    try {
      if (editing) {
        await salesService.updateArSalesOrder(companyId, editing.id, formData)
        toast.success('Sales order updated')
      } else {
        await salesService.createArSalesOrder(companyId, formData)
        toast.success('Sales order created')
      }
      setShowForm(false)
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Save failed')
    } finally {
      setFormSaving(false)
    }
  }, [companyId, editing, formData, fetchItems, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!companyId || !window.confirm('Delete this sales order?')) return
    try {
      await salesService.deleteArSalesOrder(companyId, id)
      toast.success('Sales order deleted')
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Delete failed')
    }
  }, [companyId, fetchItems, toast])

  const handleBatchDelete = useCallback(async (selectedIds: string[]) => {
    if (!companyId || selectedIds.length === 0 || !window.confirm(`Delete ${selectedIds.length} order(s)?`)) return
    try {
      await salesService.batchDeleteArSalesOrders(companyId, selectedIds)
      toast.success(`${selectedIds.length} order(s) deleted`)
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Batch delete failed')
    }
  }, [companyId, fetchItems, toast])

  const handleConvert = useCallback(async (id: string) => {
    if (!companyId || !window.confirm('Convert this sales order to an invoice?')) return
    try {
      await salesService.convertArSalesOrder(companyId, id)
      toast.success('Sales order converted to invoice')
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Conversion failed')
    }
  }, [companyId, fetchItems, toast])

  const loadActivity = useCallback(async (orderId: string) => {
    if (!companyId) return
    setActivityLoading(true)
    try {
      const response = await salesService.getArSalesOrderActivity(companyId, orderId)
      const data = response.data
      setOrderActivity(Array.isArray(data) ? data : data?.data ?? data?.items ?? [])
    } catch {
      setOrderActivity([])
    } finally {
      setActivityLoading(false)
    }
  }, [companyId])

  const handleExport = useCallback(() => {
    const headers = ['Order #', 'Customer', 'Order Date', 'Ship Date', 'Total', 'Status']
    const rows = items.map((row) => [row.orderNumber, row.customer, row.orderDate, row.shipDate ?? '', formatCurrency(Number(row.total), currency), row.status])
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'sales-orders.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }, [items, currency])

  const setLine = useCallback((index: number, field: keyof SalesOrderLine, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.map((line, idx) => idx === index ? { ...line, [field]: value } : line),
    }))
  }, [])

  const lineTotal = useMemo(() => formData.lines.reduce((sum, line) => sum + Number(line.quantity) * Number(line.unitPrice), 0), [formData.lines])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      show: (row) => row.status === 'DRAFT',
      onClick: (_rowId, row) => openEdit(row),
    },
    {
      label: 'Convert',
      icon: <FileText size={14} />,
      show: (row) => !row.invoiceId && (row.status === 'DRAFT' || row.status === 'CONFIRMED'),
      onClick: async (_rowId, row) => { await handleConvert(row.id) },
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      danger: true,
      show: () => true,
      onClick: async (_rowId, row) => { await handleDelete(row.id) },
    },
  ], [handleConvert, handleDelete, openEdit])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={fetchItems} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
        <RefreshCw size={14} /> Refresh
      </button>
      <button type="button" onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
        <Plus size={14} /> New Order
      </button>
    </div>
  )

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading sales orders…</span>
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

      <HaypDataTable
        data={items}
        columns={columns}
        tableId="sales-orders"
        title="Sales Orders"
        description="Track and convert sales orders to invoices."
        loading={loading}
        searchPlaceholder="Search orders..."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        headerActions={headerActions}
        actions={actions}
        bulkActions={[{
          label: 'Batch Delete',
          variant: 'danger',
          icon: <Trash2 size={14} />,
          onClick: handleBatchDelete,
        }]}
        onRowClick={openDetail}
        onRefresh={fetchItems}
        onExport={handleExport}
        emptyTitle="No sales orders found"
        emptySubtitle="Create a new order to get started"
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Edit Sales Order' : 'New Sales Order'}</h2>
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
                  <label htmlFor="orderDate" className="block text-sm font-medium text-slate-700 mb-1">Order Date</label>
                  <input id="orderDate" type="date" value={formData.orderDate} onChange={(e) => setFormData((prev) => ({ ...prev, orderDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div>
                  <label htmlFor="shipDate" className="block text-sm font-medium text-slate-700 mb-1">Ship Date</label>
                  <input id="shipDate" type="date" value={formData.shipDate} onChange={(e) => setFormData((prev) => ({ ...prev, shipDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700">Line Items</p>
                  <button onClick={() => setFormData((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }))}
                    type="button" className="text-sm text-emerald-600 hover:underline">+ Add line</button>
                </div>
                <div className="space-y-2">
                  {formData.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-[1.4fr_90px_110px_32px] gap-2 items-center">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => setLine(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => setLine(index, 'quantity', Number(e.target.value))}
                        placeholder="Qty"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-right"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => setLine(index, 'unitPrice', Number(e.target.value))}
                        placeholder="Price"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-right"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, lines: prev.lines.filter((_, idx) => idx !== index) }))}
                        className="p-2 text-slate-400 hover:text-rose-600"
                        disabled={formData.lines.length === 1}
                        aria-label="Remove line item"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-right text-sm font-semibold text-slate-900 mt-2">Total: {formatCurrency(lineTotal, currency)}</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-slate-50">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
              <button type="button" onClick={handleSave} disabled={formSaving}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {formSaving ? 'Saving…' : editing ? 'Save Changes' : 'Create Order'}
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

      {detailItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 z-[100] bg-black/80" onClick={() => setDetailItem(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-slate-900">{detailItem.orderNumber}</h2>
              <button onClick={() => setDetailItem(null)} aria-label="Close details" className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="flex border-b border-slate-200 bg-slate-50 px-6">
              {(['details', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setDetailTab(tab)
                    if (tab === 'activity' && orderActivity.length === 0) {
                      loadActivity(detailItem.id)
                    }
                  }}
                  className={`px-4 py-2.5 text-sm font-semibold transition-colors ${detailTab === tab ? 'border-b-2 border-emerald-500 text-emerald-700' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'}`}>
                  {tab === 'activity' ? <span className="flex items-center gap-1"><Clock size={13} />Activity</span> : 'Details'}
                </button>
              ))}
            </div>
            {detailTab === 'activity' ? (
              <div className="p-6 space-y-3">
                {activityLoading ? (
                  <div className="flex justify-center py-10"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
                ) : orderActivity.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-10">No activity available.</p>
                ) : orderActivity.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <Clock size={14} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{entry.user?.name ?? entry.user?.email ?? 'System'} · {new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Customer', detailItem.customer],
                    ['Order Date', detailItem.orderDate],
                    ['Ship Date', detailItem.shipDate || '—'],
                    ['Total', formatCurrency(Number(detailItem.total), currency)],
                    ['Status', detailItem.status],
                    ['Invoice', detailItem.invoiceId ? 'Converted' : 'Not converted'],
                  ].map(([label, value]) => (
                    <div key={label as string} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">{label}</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
                    </div>
                  ))}
                </div>
                {!detailItem.invoiceId && (detailItem.status === 'DRAFT' || detailItem.status === 'CONFIRMED') && (
                  <button onClick={() => { handleConvert(detailItem.id); setDetailItem(null) }} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                    <FileText size={15} /> Convert to Invoice
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
