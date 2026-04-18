'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Trash2, X, AlertCircle, Loader2, RefreshCw,
  Download, Eye, Play, Pause, FileX, Zap, ArrowUpDown, Clock, Pencil,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'
import { useToast } from '@/components/ToastProvider'
import CustomerPickerField, { type CustomerPickerOption } from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

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
}

interface ColDef { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right' }

const DEFAULT_COLS: ColDef[] = [
  { key: 'name', label: 'Template', visible: true, width: 200, align: 'left' },
  { key: 'customer', label: 'Customer', visible: true, width: 180, align: 'left' },
  { key: 'frequency', label: 'Frequency', visible: true, width: 110, align: 'left' },
  { key: 'amount', label: 'Amount', visible: true, width: 110, align: 'right' },
  { key: 'nextRun', label: 'Next Run', visible: true, width: 120, align: 'left' },
  { key: 'status', label: 'Status', visible: true, width: 110, align: 'left' },
]

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem('recurring-invoices-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as ColDef[]
      return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, visible: sc.visible, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_COLS
}

const STATUS_MAP: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAUSED: 'bg-amber-50 text-amber-700 border-amber-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paused: 'bg-amber-50 text-amber-700 border-amber-200',
}

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly', BIWEEKLY: 'Bi-Weekly', MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly', ANNUALLY: 'Annually',
}

interface RecurringFormData { customerId: string; frequency: string; startDate: string; endDate: string; amount: string }

type SortDirection = 'asc' | 'desc'
type SortKey = 'name' | 'customer' | 'frequency' | 'amount' | 'nextRun' | 'status'

function compareRecurringRows(a: RecurringRow, b: RecurringRow, key: SortKey, dir: SortDirection): number {
  const asc = dir === 'asc' ? 1 : -1

  if (key === 'amount') {
    const av = getRowAmount(a)
    const bv = getRowAmount(b)
    return av === bv ? 0 : av > bv ? asc : -asc
  }

  if (key === 'nextRun') {
    const av = getRowNextRun(a)
    const bv = getRowNextRun(b)
    const ad = av && av !== '—' ? new Date(av).getTime() : 0
    const bd = bv && bv !== '—' ? new Date(bv).getTime() : 0
    return ad === bd ? 0 : ad > bd ? asc : -asc
  }

  const av = key === 'name' ? getRowName(a) : String((a as any)[key] ?? '')
  const bv = key === 'name' ? getRowName(b) : String((b as any)[key] ?? '')
  const al = av.toLowerCase()
  const bl = bv.toLowerCase()
  if (al === bl) return 0
  return al > bl ? asc : -asc
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
  const [statusFilter, setStatusFilter] = useState('')
  const [freqFilter, setFreqFilter] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const [showColMenu, setShowColMenu] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [detailItem, setDetailItem] = useState<RecurringRow | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<RecurringFormData>({ customerId: '', frequency: 'MONTHLY', startDate: new Date().toISOString().split('T')[0], endDate: '', amount: '' })
  const [formSaving, setFormSaving] = useState(false)
  const [customers, setCustomers] = useState<CustomerPickerOption[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('nextRun')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const saveCols = (next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('recurring-invoices-cols-v1', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const { containerRef, startResize, isOverflowing: recurringInvoicesIsOverflowing } = useFixedWidthResizableColumns({
    columns: cols,
    columnsRef: colsRef,
    saveColumns: saveCols,
    fixedWidth: 144,
  })

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/recurring-invoices`)
      setItems(Array.isArray(data) ? data : data?.items ?? data?.records ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load recurring invoices')
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
      const name = getRowName(row).toLowerCase()
      const matchSearch = !q || name.includes(q) || (row.customer ?? '').toLowerCase().includes(q) || row.frequency.toLowerCase().includes(q)
      const matchStatus = !statusFilter || row.status === statusFilter
      const matchFreq = !freqFilter || row.frequency === freqFilter
      return matchSearch && matchStatus && matchFreq
    })
  }, [items, search, statusFilter, freqFilter])

  const sorted = useMemo(() => {
    const next = [...filtered]
    next.sort((a, b) => compareRecurringRows(a, b, sortKey, sortDir))
    return next
  }, [filtered, sortKey, sortDir])

  const paginated = sorted.slice(page * pageSize, page * pageSize + pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)
  const allSelected = paginated.length > 0 && paginated.every(r => selectedIds.has(r.id))
  const toggleAll = () => { if (allSelected) setSelectedIds(new Set()); else setSelectedIds(new Set(paginated.map(r => r.id))) }
  const toggleOne = (id: string) => { const n = new Set(selectedIds); if (n.has(id)) n.delete(id); else n.add(id); setSelectedIds(n) }

  const handleGenerate = async (id: string) => {
    if (!companyId || !window.confirm('Generate an invoice now from this template?')) return
    try {
      await apiClient.post(`/companies/${companyId}/ar/recurring-invoices/${id}/generate`)
      toast.success('Invoice generated'); fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Generate failed') }
  }

  const handleTogglePause = async (row: RecurringRow) => {
    if (!companyId) return
    const newStatus = (row.status === 'ACTIVE' || row.status === 'Active') ? 'PAUSED' : 'ACTIVE'
    try {
      await apiClient.put(`/companies/${companyId}/ar/recurring-invoices/${row.id}`, { status: newStatus })
      toast.success(`Template ${newStatus === 'PAUSED' ? 'paused' : 'resumed'}`); fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Update failed') }
  }

  const handleBatchDelete = async () => {
    if (!companyId || !selectedIds.size || !window.confirm(`Delete ${selectedIds.size} template(s)?`)) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/recurring-invoices/batch/delete`, { ids: [...selectedIds] })
      toast.success(`${selectedIds.size} template(s) deleted`); setSelectedIds(new Set()); fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Batch delete failed') }
    finally { setBatchLoading(false) }
  }

  const handleExport = () => {
    const headers = ['Template', 'Customer', 'Frequency', 'Amount', 'Next Run', 'Status']
    const rows = filtered.map(r => [getRowName(r), r.customer ?? '—', r.frequency, String(getRowAmount(r)), getRowNextRun(r), r.status])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'recurring-invoices.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'amount' ? 'desc' : 'asc')
  }

  const handleSave = async () => {
    if (!companyId || !formData.customerId || !formData.amount) { toast.error('Customer and amount are required'); return }
    setFormSaving(true)
    try {
      if (editingId) {
        await apiClient.put(`/companies/${companyId}/ar/recurring-invoices/${editingId}`, {
          customerId: formData.customerId,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          templateData: { totalAmount: Number(formData.amount) },
        })
        toast.success('Recurring template updated'); setShowForm(false); fetchItems(); setEditingId(null)
      } else {
        await apiClient.post(`/companies/${companyId}/ar/recurring-invoices`, {
          customerId: formData.customerId,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          templateData: { totalAmount: Number(formData.amount) },
        })
        toast.success('Recurring template created'); setShowForm(false); fetchItems()
      }
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Save failed') }
    finally { setFormSaving(false) }
  }

  function openEditRecurring(row: RecurringRow) {
    setEditingId(row.id)
    setFormData({
      customerId: row.customerId ?? '',
      frequency: row.frequency ?? 'MONTHLY',
      startDate: row.nextRunDate ?? row.nextRun ?? new Date().toISOString().split('T')[0],
      endDate: '',
      amount: String(getRowAmount(row) ?? ''),
    })
    setShowForm(true)
    loadCustomers()
  }

  const visibleCols = cols.filter(c => c.visible)

  const renderCell = (c: ColDef, row: RecurringRow) => {
    if (c.key === 'name') return getRowName(row)
    if (c.key === 'amount') return formatCurrency(getRowAmount(row), currency)
    if (c.key === 'nextRun') return getRowNextRun(row)
    if (c.key === 'frequency') return FREQ_LABELS[row.frequency] ?? row.frequency
    if (c.key === 'status') return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_MAP[row.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>{row.status}</span>
    )
    return (row as any)[c.key] ?? '—'
  }

  if (cidLoading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading…</span></div>
  if (cidError) return <div className="p-6 text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Recurring Invoices</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchItems} title="Refresh" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors"><RefreshCw size={15} /></button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Download size={15} /> Export</button>
          <button onClick={() => router.push('/sales/billing/recurring/activity')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Clock size={15} /> Activity Log</button>
          <div className="relative">
            <button onClick={() => setShowColMenu(v => !v)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Eye size={15} /> Columns</button>
            {showColMenu && (
              <><div className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-emerald-100 rounded-xl shadow-lg p-2 min-w-[160px]">
                  {cols.filter(c => c.key !== 'name').map(c => (
                    <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-emerald-50 cursor-pointer">
                      <input type="checkbox" checked={c.visible} onChange={() => saveCols(cols.map(d => d.key === c.key ? { ...d, visible: !d.visible } : d))} className="accent-emerald-600" />{c.label}
                    </label>
                  ))}
                </div></>
            )}
          </div>
          <button onClick={() => { setShowForm(true); loadCustomers() }} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"><Plus size={16} /> New Template</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search templates…" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-700">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select value={freqFilter} onChange={e => { setFreqFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-700">
          <option value="">All Frequencies</option>
          {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
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

      <div ref={containerRef} className={`bg-white rounded-xl border border-gray-200 ${recurringInvoicesIsOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'} shadow-sm`}>
        <table className="w-full text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: 44 }} />
            {visibleCols.map(c => <col key={c.key} style={{ width: c.width }} />)}
            <col style={{ width: 100 }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 border-r border-gray-200"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-blue-600" /></th>
              {visibleCols.map(c => (
                <th key={c.key} className="relative px-3 py-3 font-semibold text-gray-600 select-none border-r border-gray-200 overflow-hidden" style={{ width: c.width, minWidth: c.width, maxWidth: c.width, textAlign: c.align === 'right' ? 'right' : 'left' }} title={c.label}>
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key as SortKey)}
                    className="flex items-center gap-1 w-full min-w-0 overflow-hidden pr-2"
                    style={{ justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start' }}
                  >
                    <span className="truncate">{c.label}</span>
                    <ArrowUpDown size={12} className={`shrink-0 ${sortKey === c.key ? 'text-emerald-600' : 'text-gray-300'}`} />
                  </button>
                  <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startResize(e, c.key)} />
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
                  <p className="font-medium text-gray-400">No templates found</p>
                  <p className="text-xs mt-1 text-gray-300">{search || statusFilter ? 'Try adjusting your filters' : 'Create a recurring template to get started'}</p>
                </td>
              </tr>
            ) : (
              paginated.map(row => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetailItem(row)}>
                  <td className="px-3 py-3 border-r border-gray-100" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} className="accent-blue-600" /></td>
                  {visibleCols.map(c => (
                    <td key={c.key} className="px-3 py-3 truncate border-r border-gray-100" style={{ textAlign: c.align === 'right' ? 'right' : 'left' }}>{renderCell(c, row)}</td>
                  ))}
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); openEditRecurring(row) }} title="Edit"
                        className="p-1.5 rounded hover:bg-gray-100 text-slate-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <span className="hidden sm:inline-block"> </span>
                      <button onClick={() => handleGenerate(row.id)} title="Generate Invoice Now"
                        className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"><Zap size={14} /></button>
                      <button onClick={() => handleTogglePause(row)} title={row.status === 'ACTIVE' || row.status === 'Active' ? 'Pause' : 'Resume'}
                        className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors">
                        {row.status === 'ACTIVE' || row.status === 'Active' ? <Pause size={14} /> : <Play size={14} />}
                      </button>
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">New Recurring Template</h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select value={formData.frequency} onChange={e => setFormData(f => ({ ...f, frequency: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                  {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Amount *</label>
                <input type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={formSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">
                {formSaving ? <Loader2 size={15} className="animate-spin" /> : null} Create Template
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

      {detailItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailItem(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">{getRowName(detailItem)}</h2>
              <button onClick={() => setDetailItem(null)} className="p-1.5 rounded hover:bg-gray-100"><X size={18} /></button>
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
                <button onClick={() => { handleTogglePause(detailItem); setDetailItem(null) }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-semibold hover:bg-amber-100">
                  {detailItem.status === 'ACTIVE' || detailItem.status === 'Active' ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Resume</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

