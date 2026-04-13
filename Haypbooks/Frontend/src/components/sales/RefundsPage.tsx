'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Search, Trash2, X, AlertCircle, Loader2, RefreshCw,
  Download, Eye, CheckCircle, FileX, ArrowUpDown,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useToast } from '@/components/ToastProvider'
import CustomerPickerField, { type CustomerPickerOption } from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

interface RefundRow {
  id: string
  refundNumber: string
  customer: string
  customerId?: string
  invoiceNumber: string
  date: string
  amount: number | string
  method: string
  status: string
  reason: string
  approvalStatus?: string
  journalEntryId?: string | null
}

interface ColDef { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right' }

const DEFAULT_COLS: ColDef[] = [
  { key: 'refundNumber', label: 'Refund #', visible: true, width: 120, align: 'left' },
  { key: 'customer', label: 'Customer', visible: true, width: 180, align: 'left' },
  { key: 'invoiceNumber', label: 'Invoice #', visible: true, width: 120, align: 'left' },
  { key: 'date', label: 'Date', visible: true, width: 110, align: 'left' },
  { key: 'method', label: 'Method', visible: true, width: 100, align: 'left' },
  { key: 'amount', label: 'Amount', visible: true, width: 110, align: 'right' },
  { key: 'reason', label: 'Reason', visible: false, width: 200, align: 'left' },
  { key: 'status', label: 'Status', visible: true, width: 120, align: 'left' },
]

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem('refunds-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as ColDef[]
      return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, visible: sc.visible, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_COLS
}

const STATUS_MAP: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PROCESSED: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Processed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Failed: 'bg-red-50 text-red-700 border-red-200',
  Cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
}

interface RefundFormData { customerId: string; amount: string; method: string; refundDate: string; reason: string }

type SortDirection = 'asc' | 'desc'
type SortKey = 'refundNumber' | 'customer' | 'invoiceNumber' | 'date' | 'method' | 'amount' | 'reason' | 'status'

function compareRefundRows(a: RefundRow, b: RefundRow, key: SortKey, dir: SortDirection): number {
  const asc = dir === 'asc' ? 1 : -1

  if (key === 'amount') {
    const av = Number(a.amount ?? 0)
    const bv = Number(b.amount ?? 0)
    return av === bv ? 0 : av > bv ? asc : -asc
  }

  if (key === 'date') {
    const av = a.date ? new Date(a.date).getTime() : 0
    const bv = b.date ? new Date(b.date).getTime() : 0
    return av === bv ? 0 : av > bv ? asc : -asc
  }

  const av = String((a as any)[key] ?? '').toLowerCase()
  const bv = String((b as any)[key] ?? '').toLowerCase()
  if (av === bv) return 0
  return av > bv ? asc : -asc
}

export default function RefundsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<RefundRow[]>([])
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
  const [detailItem, setDetailItem] = useState<RefundRow | null>(null)
  const [formData, setFormData] = useState<RefundFormData>({ customerId: '', amount: '', method: 'BANK_TRANSFER', refundDate: new Date().toISOString().split('T')[0], reason: '' })
  const [formSaving, setFormSaving] = useState(false)
  const [customers, setCustomers] = useState<CustomerPickerOption[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const saveCols = (next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('refunds-cols-v1', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/refunds`)
      const list: RefundRow[] = Array.isArray(data) ? data : data?.items ?? data?.refunds ?? []
      setItems(list)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load refunds')
    } finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const loadCustomers = useCallback(async (force = false) => {
    if (!companyId || customersLoading) return
    if (!force && customers.length > 0) return
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
  }, [companyId, customers.length, customersLoading])

  const filtered = useMemo(() => {
    return items.filter(row => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        row.refundNumber?.toLowerCase().includes(q) ||
        row.customer?.toLowerCase().includes(q) ||
        row.invoiceNumber?.toLowerCase().includes(q) ||
        row.reason?.toLowerCase().includes(q)
      const matchStatus = !statusFilter || row.status === statusFilter || row.approvalStatus === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, search, statusFilter])

  const sorted = useMemo(() => {
    const next = [...filtered]
    next.sort((a, b) => compareRefundRows(a, b, sortKey, sortDir))
    return next
  }, [filtered, sortKey, sortDir])

  const paginated = sorted.slice(page * pageSize, page * pageSize + pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  const totalAmount = filtered.reduce((s, r) => s + Number(r.amount ?? 0), 0)

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

  const handleProcess = async (id: string) => {
    if (!companyId || !window.confirm('Process this refund? A GL entry will be created.')) return
    try {
      await apiClient.post(`/companies/${companyId}/ar/refunds/${id}/process`)
      toast.success('Refund processed — GL entry posted')
      fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Process failed') }
  }

  const handleBatchDelete = async () => {
    if (!companyId || !selectedIds.size || !window.confirm(`Delete ${selectedIds.size} refund(s)?`)) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/refunds/batch/delete`, { ids: [...selectedIds] })
      toast.success(`${selectedIds.size} refund(s) deleted`); setSelectedIds(new Set()); fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Batch delete failed') }
    finally { setBatchLoading(false) }
  }

  const handleExport = () => {
    const headers = ['Refund #', 'Customer', 'Invoice #', 'Date', 'Method', 'Amount', 'Status']
    const rows = filtered.map(r => [r.refundNumber, r.customer, r.invoiceNumber, r.date, r.method, String(r.amount), r.status])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'refunds.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'date' || key === 'amount' ? 'desc' : 'asc')
  }

  const handleSave = async () => {
    if (!companyId || !formData.customerId || !formData.amount) { toast.error('Customer and amount are required'); return }
    setFormSaving(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/refunds`, formData)
      toast.success('Refund created')
      setShowForm(false); fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Save failed') }
    finally { setFormSaving(false) }
  }

  const visibleCols = cols.filter(c => c.visible)

  if (cidLoading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading…</span></div>
  if (cidError) return <div className="p-6 text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Refunds</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} refund{filtered.length !== 1 ? 's' : ''} · {formatCurrency(totalAmount, currency)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchItems} title="Refresh" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors"><RefreshCw size={15} /></button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Download size={15} /> Export</button>
          <div className="relative">
            <button onClick={() => setShowColMenu(v => !v)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Eye size={15} /> Columns</button>
            {showColMenu && (
              <><div className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-emerald-100 rounded-xl shadow-lg p-2 min-w-[160px]">
                  {cols.filter(c => c.key !== 'refundNumber').map(c => (
                    <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-emerald-50 cursor-pointer">
                      <input type="checkbox" checked={c.visible} onChange={() => saveCols(cols.map(d => d.key === c.key ? { ...d, visible: !d.visible } : d))} className="accent-emerald-600" />{c.label}
                    </label>
                  ))}
                </div></>
            )}
          </div>
          <button onClick={() => { setShowForm(true); loadCustomers(true) }} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"><Plus size={16} /> New Refund</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Refunds', value: items.length },
          { label: 'Pending', value: items.filter(r => r.status === 'PENDING' || r.approvalStatus === 'PENDING').length },
          { label: 'Processed', value: items.filter(r => r.status === 'PROCESSED' || r.status === 'Processed' || r.approvalStatus === 'APPROVED').length },
          { label: 'Total Amount', value: formatCurrency(items.reduce((s, r) => s + Number(r.amount ?? 0), 0), currency), isAmount: true },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${c.isAmount ? 'text-emerald-700' : 'text-gray-900'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search refunds…" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-700">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="PROCESSED">Processed</option>
          <option value="REJECTED">Rejected</option>
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
            <col style={{ width: 90 }} />
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
                  <td className="px-3 py-3"><div className="h-4 w-16 bg-gray-100 rounded ml-auto" /></td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 2} className="px-4 py-16 text-center">
                  <FileX size={28} className="mx-auto mb-2 opacity-30 text-gray-400" />
                  <p className="font-medium text-gray-400">No refunds found</p>
                  <p className="text-xs mt-1 text-gray-300">{search || statusFilter ? 'Try adjusting your filters' : 'Create a refund to get started'}</p>
                </td>
              </tr>
            ) : (
              paginated.map(row => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetailItem(row)}>
                  <td className="px-3 py-3 border-r border-gray-100" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} className="accent-blue-600" /></td>
                  {visibleCols.map(c => (
                    <td key={c.key} className="px-3 py-3 truncate border-r border-gray-100" style={{ textAlign: c.align === 'right' ? 'right' : 'left' }}>
                      {c.key === 'status' ? (
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_MAP[row.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>{row.status}</span>
                      ) : c.key === 'amount' ? formatCurrency(Number(row.amount), currency)
                      : (row as any)[c.key] ?? '—'}
                    </td>
                  ))}
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {(row.status === 'PENDING' || row.approvalStatus === 'PENDING') && (
                        <button onClick={() => handleProcess(row.id)} title="Process Refund"
                          className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"><CheckCircle size={14} /></button>
                      )}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">New Refund</h2>
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
                onOpen={() => loadCustomers(true)}
                onChange={(id) => setFormData((f) => ({ ...f, customerId: id }))}
                onCreateNew={() => setShowQuickAddCustomer(true)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select value={formData.method} onChange={e => setFormData(f => ({ ...f, method: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHECK">Check</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Date</label>
                <input type="date" value={formData.refundDate} onChange={e => setFormData(f => ({ ...f, refundDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={formData.reason} onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))} rows={2} placeholder="Reason for refund…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={formSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">
                {formSaving ? <Loader2 size={15} className="animate-spin" /> : null} Create Refund
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
              <h2 className="text-lg font-semibold text-gray-900">{detailItem.refundNumber}</h2>
              <button onClick={() => setDetailItem(null)} className="p-1.5 rounded hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Customer', detailItem.customer],
                  ['Invoice #', detailItem.invoiceNumber || '—'],
                  ['Date', detailItem.date],
                  ['Method', detailItem.method],
                  ['Amount', formatCurrency(Number(detailItem.amount), currency)],
                  ['Status', detailItem.status],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              {detailItem.reason && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Reason</p>
                  <p className="text-sm text-gray-700">{detailItem.reason}</p>
                </div>
              )}
              {(detailItem.status === 'PENDING' || detailItem.approvalStatus === 'PENDING') && (
                <button onClick={() => { handleProcess(detailItem.id); setDetailItem(null) }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                  <CheckCircle size={16} /> Process Refund &amp; Post to GL
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

