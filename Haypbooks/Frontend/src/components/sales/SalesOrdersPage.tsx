'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Search, Trash2, X, AlertCircle, Loader2, RefreshCw,
  Download, Eye, FileText, FileX, ArrowUpDown,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import CustomerPickerField, { type CustomerPickerOption } from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

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
}

interface ColDef { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right' }

const DEFAULT_COLS: ColDef[] = [
  { key: 'orderNumber', label: 'Order #', visible: true, width: 120, align: 'left' },
  { key: 'customer', label: 'Customer', visible: true, width: 180, align: 'left' },
  { key: 'orderDate', label: 'Order Date', visible: true, width: 110, align: 'left' },
  { key: 'shipDate', label: 'Ship Date', visible: true, width: 110, align: 'left' },
  { key: 'total', label: 'Total', visible: true, width: 110, align: 'right' },
  { key: 'status', label: 'Status', visible: true, width: 120, align: 'left' },
]

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem('sales-orders-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as ColDef[]
      return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, visible: sc.visible, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_COLS
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  FULFILLED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-purple-50 text-purple-700 border-purple-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

interface SOFormData {
  customerId: string
  orderDate: string
  shipDate: string
  lines: SalesOrderLine[]
}

type SortDirection = 'asc' | 'desc'
type SortKey = 'orderNumber' | 'customer' | 'orderDate' | 'shipDate' | 'total' | 'status'

function compareSalesOrders(a: SalesOrder, b: SalesOrder, key: SortKey, dir: SortDirection): number {
  const asc = dir === 'asc' ? 1 : -1

  if (key === 'total') {
    const av = Number(a.total ?? 0)
    const bv = Number(b.total ?? 0)
    return av === bv ? 0 : av > bv ? asc : -asc
  }

  if (key === 'orderDate' || key === 'shipDate') {
    const ad = a[key] ? new Date(a[key] as string).getTime() : 0
    const bd = b[key] ? new Date(b[key] as string).getTime() : 0
    return ad === bd ? 0 : ad > bd ? asc : -asc
  }

  const av = String(a[key] ?? '').toLowerCase()
  const bv = String(b[key] ?? '').toLowerCase()
  if (av === bv) return 0
  return av > bv ? asc : -asc
}

const emptyLine = (): SalesOrderLine => ({ description: '', quantity: 1, unitPrice: 0 })

export default function SalesOrdersPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const toast = useToast()

  const [items, setItems] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const [showColMenu, setShowColMenu] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SalesOrder | null>(null)
  const [detailItem, setDetailItem] = useState<SalesOrder | null>(null)
  const [formData, setFormData] = useState<SOFormData>({ customerId: '', orderDate: new Date().toISOString().split('T')[0], shipDate: '', lines: [emptyLine()] })
  const [formSaving, setFormSaving] = useState(false)
  const [customers, setCustomers] = useState<CustomerPickerOption[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('orderDate')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const saveCols = (next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('sales-orders-cols-v1', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/sales-orders`)
      const list: SalesOrder[] = Array.isArray(data) ? data : data?.items || data?.records || []
      setItems(list)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load sales orders')
    } finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const loadCustomers = useCallback(async () => {
    if (!companyId) return
    setCustomersLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers`)
      const raw: any[] = Array.isArray(data) ? data : data?.data ?? data?.items ?? data?.records ?? []
      setCustomers(raw.map((c: any) => ({
        id: c.id ?? c.contactId,
        name: c.name ?? c.displayName ?? c.contact?.displayName ?? '—',
        email: c.email ?? c.contact?.email ?? '',
      })))
    } catch {
      setCustomers([])
    } finally {
      setCustomersLoading(false)
    }
  }, [companyId])

  const filtered = useMemo(() => {
    return items.filter(row => {
      const q = search.toLowerCase()
      const matchSearch = !q || row.orderNumber?.toLowerCase().includes(q) || row.customer?.toLowerCase().includes(q)
      const matchStatus = !statusFilter || row.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  const sorted = useMemo(() => {
    const next = [...filtered]
    next.sort((a, b) => compareSalesOrders(a, b, sortKey, sortDir))
    return next
  }, [filtered, sortKey, sortDir])

  const paginated = sorted.slice(page * pageSize, page * pageSize + pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  const allSelected = paginated.length > 0 && paginated.every(r => selectedIds.has(r.id))
  const toggleAll = () => { if (allSelected) setSelectedIds(new Set()); else setSelectedIds(new Set(paginated.map(r => r.id))) }
  const toggleOne = (id: string) => { const n = new Set(selectedIds); if (n.has(id)) n.delete(id); else n.add(id); setSelectedIds(n) }

  const resizeRef = useRef<{ key: string; startX: number; startW: number } | null>(null)
  const startResize = (e: React.MouseEvent, key: string, w: number) => {
    e.preventDefault()
    resizeRef.current = { key, startX: e.clientX, startW: w }
    const onMove = (mv: MouseEvent) => {
      if (!resizeRef.current) return
      saveCols(colsRef.current.map(c => c.key === resizeRef.current!.key ? { ...c, width: Math.max(60, resizeRef.current!.startW + mv.clientX - resizeRef.current!.startX) } : c))
    }
    const onUp = () => { resizeRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }

  const handleDelete = async (id: string) => {
    if (!companyId || !window.confirm('Delete this sales order?')) return
    try { await apiClient.delete(`/companies/${companyId}/ar/sales-orders/${id}`); toast.success('Sales order deleted'); fetchItems() }
    catch (e: any) { toast.error(e?.response?.data?.message ?? 'Delete failed') }
  }

  const handleBatchDelete = async () => {
    if (!companyId || !selectedIds.size || !window.confirm(`Delete ${selectedIds.size} order(s)?`)) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/sales-orders/batch/delete`, { ids: [...selectedIds] })
      toast.success(`${selectedIds.size} order(s) deleted`); setSelectedIds(new Set()); fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Batch delete failed') }
    finally { setBatchLoading(false) }
  }

  const handleConvert = async (id: string) => {
    if (!companyId || !window.confirm('Convert this sales order to an invoice?')) return
    try {
      await apiClient.post(`/companies/${companyId}/ar/sales-orders/${id}/convert`)
      toast.success('Sales order converted to invoice')
      fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Conversion failed') }
  }

  const handleExport = () => {
    const headers = ['Order #', 'Customer', 'Order Date', 'Ship Date', 'Total', 'Status']
    const rows = filtered.map(r => [r.orderNumber, r.customer, r.orderDate, r.shipDate ?? '', r.total, r.status])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'sales-orders.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'orderDate' || key === 'shipDate' || key === 'total' ? 'desc' : 'asc')
  }

  const openCreate = () => {
    setEditing(null)
    setFormData({ customerId: '', orderDate: new Date().toISOString().split('T')[0], shipDate: '', lines: [emptyLine()] })
    setShowForm(true)
    loadCustomers()
  }

  const setLine = (i: number, field: keyof SalesOrderLine, value: string | number) =>
    setFormData(f => ({ ...f, lines: f.lines.map((l, idx) => idx === i ? { ...l, [field]: value } : l) }))

  const lineTotal = formData.lines.reduce((s, l) => s + (Number(l.quantity) * Number(l.unitPrice)), 0)

  const handleSave = async () => {
    if (!companyId || !formData.customerId) { toast.error('Customer ID is required'); return }
    if (formData.lines.some(l => !l.description)) { toast.error('All lines need a description'); return }
    setFormSaving(true)
    try {
      if (editing) {
        await apiClient.put(`/companies/${companyId}/ar/sales-orders/${editing.id}`, formData)
        toast.success('Order updated')
      } else {
        await apiClient.post(`/companies/${companyId}/ar/sales-orders`, formData)
        toast.success('Sales order created')
      }
      setShowForm(false); fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Save failed') }
    finally { setFormSaving(false) }
  }

  const visibleCols = cols.filter(c => c.visible)

  if (cidLoading || (!companyId && !cidError)) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading sales orders...</span></div>
  }

  if (!companyId && cidError) {
    return (
      <div className="p-6">
        <div className="max-w-xl mx-auto bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-red-700">Company Context Unavailable</h2>
          <p className="text-sm text-red-600 mt-1">{cidError}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => window.location.reload()} className="px-3 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Retry
            </button>
            <button onClick={() => window.location.assign('/home/setup-center')} className="px-3 py-2 text-sm font-semibold border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
              Open Setup Center
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Sales Orders</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchItems} title="Refresh" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors"><RefreshCw size={15} /></button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Download size={15} /> Export</button>
          <div className="relative">
            <button onClick={() => setShowColMenu(v => !v)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Eye size={15} /> Columns</button>
            {showColMenu && (
              <><div className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-emerald-100 rounded-xl shadow-lg p-2 min-w-[160px]">
                  {cols.filter(c => c.key !== 'orderNumber').map(c => (
                    <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-emerald-50 cursor-pointer">
                      <input type="checkbox" checked={c.visible} onChange={() => saveCols(cols.map(d => d.key === c.key ? { ...d, visible: !d.visible } : d))} className="accent-emerald-600" />{c.label}
                    </label>
                  ))}
                </div></>
            )}
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"><Plus size={16} /> New Order</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search orders…" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-700">
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-gray-500">Rows:</span>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}
            className="px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none">
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-emerald-600 text-white rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <button onClick={handleBatchDelete} disabled={batchLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/80 hover:bg-red-500 rounded-lg disabled:opacity-40 transition-colors font-semibold">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => { setError(''); fetchItems() }} className="ml-auto text-xs underline">Retry</button>
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: 650 }}>
          <colgroup>
            <col style={{ width: 44 }} />
            {visibleCols.map(c => <col key={c.key} style={{ width: c.width }} />)}
            <col style={{ width: 120 }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 border-r border-gray-200"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-blue-600" /></th>
              {visibleCols.map(c => (
                <th key={c.key} className="relative px-3 py-3 font-semibold text-gray-600 select-none border-r border-gray-200" style={{ textAlign: c.align === 'right' ? 'right' : 'left' }}>
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key as SortKey)}
                    className={`inline-flex items-center gap-1 ${c.align === 'right' ? 'ml-auto' : ''}`}
                  >
                    <span>{c.label}</span>
                    <ArrowUpDown size={12} className={sortKey === c.key ? 'text-emerald-600' : 'text-gray-300'} />
                  </button>
                  <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startResize(e, c.key, c.width)} />
                </th>
              ))}
              <th className="px-3 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  <td className="px-3 py-3"><div className="h-4 w-4 bg-gray-100 rounded" /></td>
                  {visibleCols.map(c => <td key={c.key} className="px-3 py-3"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>)}
                  <td className="px-3 py-3"><div className="h-4 w-20 bg-gray-100 rounded ml-auto" /></td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 2} className="px-4 py-16 text-center">
                  <FileX size={28} className="mx-auto mb-2 opacity-30 text-gray-400" />
                  <p className="font-medium text-gray-400">No sales orders found</p>
                  <p className="text-xs mt-1 text-gray-300">{search || statusFilter ? 'Adjust filters' : 'Create a sales order to get started'}</p>
                </td>
              </tr>
            ) : (
              paginated.map(row => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetailItem(row)}>
                  <td className="px-3 py-3 border-r border-gray-100" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} className="accent-blue-600" /></td>
                  {visibleCols.map(c => (
                    <td key={c.key} className="px-3 py-3 truncate border-r border-gray-100" style={{ textAlign: c.align === 'right' ? 'right' : 'left' }}>
                      {c.key === 'status' ? (
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[row.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>{row.status}</span>
                      ) : (row as any)[c.key] ?? '—'}
                    </td>
                  ))}
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {(row.status === 'CONFIRMED' || row.status === 'DRAFT') && !row.invoiceId && (
                        <button onClick={() => handleConvert(row.id)} title="Convert to Invoice"
                          className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"><FileText size={14} /></button>
                      )}
                      <button onClick={() => handleDelete(row.id)} title="Delete"
                        className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filtered.length} total, page {page + 1} of {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">← Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next →</button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Sales Order' : 'New Sales Order'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <CustomerPickerField
                label="Customer *"
                value={formData.customerId}
                customers={customers}
                loading={customersLoading}
                placeholder="Select customer..."
                createLabel="+ Create New Customer"
                onOpen={loadCustomers}
                onChange={(id) => setFormData((f) => ({ ...f, customerId: id }))}
                onCreateNew={() => setShowQuickAddCustomer(true)}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <input type="date" value={formData.orderDate} onChange={e => setFormData(f => ({ ...f, orderDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ship Date</label>
                  <input type="date" value={formData.shipDate} onChange={e => setFormData(f => ({ ...f, shipDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Line Items</label>
                  <button onClick={() => setFormData(f => ({ ...f, lines: [...f.lines, emptyLine()] }))}
                    className="text-xs text-emerald-600 hover:underline">+ Add line</button>
                </div>
                <div className="space-y-2">
                  {formData.lines.map((l, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_90px_28px] gap-1.5 items-center">
                      <input type="text" value={l.description} onChange={e => setLine(i, 'description', e.target.value)} placeholder="Description"
                        className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                      <input type="number" min="0" value={l.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} placeholder="Qty"
                        className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 text-right" />
                      <input type="number" min="0" step="0.01" value={l.unitPrice} onChange={e => setLine(i, 'unitPrice', e.target.value)} placeholder="Price"
                        className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 text-right" />
                      <button onClick={() => setFormData(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors" disabled={formData.lines.length === 1}><X size={14} /></button>
                    </div>
                  ))}
                </div>
                <div className="text-right text-sm font-semibold text-gray-700 mt-2">Total: {lineTotal.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={formSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">
                {formSaving ? <Loader2 size={15} className="animate-spin" /> : null}
                {editing ? 'Save Changes' : 'Create Order'}
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
            setCustomers((prev) => [next, ...prev.filter((p) => p.id !== next.id)])
            setFormData((prev) => ({ ...prev, customerId: next.id }))
            setShowQuickAddCustomer(false)
          }}
        />
      )}

      {/* Detail Drawer */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30" onClick={() => setDetailItem(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">{detailItem.orderNumber}</h2>
              <button onClick={() => setDetailItem(null)} className="p-1.5 rounded hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Customer', detailItem.customer],
                  ['Order Date', detailItem.orderDate],
                  ['Ship Date', detailItem.shipDate || '—'],
                  ['Total', detailItem.total],
                  ['Status', detailItem.status],
                  ['Invoice', detailItem.invoiceId ? 'Converted' : 'Not converted'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
                  </div>
                ))}
              </div>
              {(detailItem.status === 'CONFIRMED' || detailItem.status === 'DRAFT') && !detailItem.invoiceId && (
                <button onClick={() => { handleConvert(detailItem.id); setDetailItem(null) }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                  <FileText size={16} /> Convert to Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
