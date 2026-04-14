'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, ChevronLeft, ChevronRight, Clock, Download, Loader2, Plus, RefreshCw, X } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import CustomerPickerField from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'

const PAGE_SIZE = 25

const STATUS_FILTERS = ['All', 'DRAFT', 'SENT', 'ACCEPTED', 'EXPIRED', 'REJECTED', 'CONVERTED'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

interface QuoteRow {
  id: string
  quoteNumber: string
  customer: string
  customerId: string
  date: string | null
  expiryDate: string | null
  amount: number
  status: string
  lineCount: number
  convertedToInvoiceId: string | null
}

interface CustomerOption { id: string; name: string; email?: string }
interface LineItem { description: string; quantity: string; unitPrice: string }

interface ColDef {
  key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right'
}

type SortDirection = 'asc' | 'desc'
type SortKey = 'quoteNumber' | 'customer' | 'date' | 'expiryDate' | 'amount' | 'status'

const DEFAULT_COLS: ColDef[] = [
  { key: 'quoteNumber', label: 'Quote #', visible: true, width: 120, align: 'left' },
  { key: 'customer', label: 'Customer', visible: true, width: 200, align: 'left' },
  { key: 'date', label: 'Date', visible: true, width: 110, align: 'left' },
  { key: 'expiryDate', label: 'Expiry', visible: true, width: 110, align: 'left' },
  { key: 'amount', label: 'Amount', visible: true, width: 120, align: 'right' },
  { key: 'status', label: 'Status', visible: true, width: 100, align: 'left' },
]

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem('quotes-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as ColDef[]
      return DEFAULT_COLS.map(d => {
        const sc = saved.find(c => c.key === d.key)
        return sc ? { ...d, visible: sc.visible, width: sc.width } : d
      })
    }
  } catch { /* ignore */ }
  return DEFAULT_COLS
}

function normalizeQuote(q: any): QuoteRow {
  return {
    id: q.id,
    quoteNumber: q.quoteNumber ?? `QT-${q.id?.slice(0, 8)}`,
    customer: q.customer ?? q.customerName ?? '—',
    customerId: q.customerId ?? '',
    date: q.date ?? q.issuedAt ?? null,
    expiryDate: q.expiryDate ?? null,
    amount: Number(q.amount ?? q.totalAmount ?? 0),
    status: q.status ?? 'DRAFT',
    lineCount: q.lineCount ?? 0,
    convertedToInvoiceId: q.convertedToInvoiceId ?? null,
  }
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

function statusColor(status: string) {
  switch (status) {
    case 'ACCEPTED': return 'text-emerald-700 bg-emerald-50'
    case 'SENT': return 'text-sky-700 bg-sky-50'
    case 'EXPIRED': return 'text-rose-700 bg-rose-50'
    case 'REJECTED': return 'text-red-700 bg-red-50'
    case 'CONVERTED': return 'text-violet-700 bg-violet-50'
    default: return 'text-amber-700 bg-amber-50'
  }
}

function statusLabel(s: string) {
  const m: Record<string, string> = {
    DRAFT: 'Draft', SENT: 'Sent', ACCEPTED: 'Accepted',
    EXPIRED: 'Expired', REJECTED: 'Rejected', CONVERTED: 'Converted',
  }
  return m[s] ?? s
}

function compareQuotes(a: QuoteRow, b: QuoteRow, key: SortKey, dir: SortDirection): number {
  const asc = dir === 'asc' ? 1 : -1
  if (key === 'amount') {
    return a.amount === b.amount ? 0 : a.amount > b.amount ? asc : -asc
  }
  if (key === 'date' || key === 'expiryDate') {
    const ad = a[key] ? new Date(a[key] as string).getTime() : 0
    const bd = b[key] ? new Date(b[key] as string).getTime() : 0
    return ad === bd ? 0 : ad > bd ? asc : -asc
  }
  const av = String((a as any)[key] ?? '').toLowerCase()
  const bv = String((b as any)[key] ?? '').toLowerCase()
  if (av === bv) return 0
  return av > bv ? asc : -asc
}

function emptyLine(): LineItem { return { description: '', quantity: '1', unitPrice: '' } }

export default function QuotesEstimatesPage() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [items, setItems] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Detail drawer
  const [drawerQuote, setDrawerQuote] = useState<QuoteRow | null>(null)
  const [drawerTab, setDrawerTab] = useState<'details' | 'activity'>('details')
  interface ActivityEntry { id: string; action: string; recordId: string; changes: any; createdAt: string; user: { id: string; name: string; email: string } }
  const [drawerActivity, setDrawerActivity] = useState<ActivityEntry[]>([])
  const [drawerActivityLoading, setDrawerActivityLoading] = useState(false)

  useEffect(() => {
    setDrawerTab('details')
    setDrawerActivity([])
  }, [drawerQuote?.id])

  useEffect(() => {
    if (drawerTab !== 'activity' || !drawerQuote?.id || !companyId) return
    setDrawerActivityLoading(true)
    apiClient.get(`/companies/${companyId}/ar/quotes/${drawerQuote.id}/activity`)
      .then(({ data }) => setDrawerActivity(data.data ?? []))
      .catch(() => setDrawerActivity([]))
      .finally(() => setDrawerActivityLoading(false))
  }, [drawerTab, drawerQuote?.id, companyId])

  // Create/Edit modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [custLoading, setCustLoading] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)
  const [form, setForm] = useState({ customerId: '', expiryDate: '' })
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  // Column defs
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const [showColMenu, setShowColMenu] = useState(false)
  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const saveCols = (next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('quotes-cols-v1', JSON.stringify(next)) } catch { /* ignore */ }
  }

  // Column resize
  const resizingRef = useRef<{ colKey: string; startX: number; startW: number } | null>(null)

  const onResizeStart = (e: React.MouseEvent, colKey: string, startW: number) => {
    e.preventDefault()
    resizingRef.current = { colKey, startX: e.clientX, startW }
    const onMove = (me: MouseEvent) => {
      if (!resizingRef.current) return
      const { colKey: k, startX, startW: sw } = resizingRef.current
      const delta = me.clientX - startX
      const newW = Math.max(80, sw + delta)
      saveCols(colsRef.current.map(c => c.key === k ? { ...c, width: newW } : c))
    }
    const onUp = () => {
      resizingRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const searchRef = useRef(search)
  useEffect(() => { searchRef.current = search }, [search])

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchQuotes = useCallback(async (pg: number, status: StatusFilter) => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string | number> = { limit: PAGE_SIZE, offset: pg * PAGE_SIZE }
      if (status !== 'All') params.status = status
      const { data } = await apiClient.get(`/companies/${companyId}/ar/quotes`, { params })
      const raw: any[] = Array.isArray(data) ? data : data?.items || data?.records || []
      setItems(raw.map(normalizeQuote))
      setHasMore(raw.length === PAGE_SIZE)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchQuotes(0, statusFilter) }, [fetchQuotes, statusFilter])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  // ─── Selection ────────────────────────────────────────────────────────────

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(r => r.id)))
  }

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  // ─── Batch ops ────────────────────────────────────────────────────────────

  async function handleBatchDelete() {
    if (!companyId || selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} quote(s)? This cannot be undone.`)) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/quotes/batch/delete`, { ids: Array.from(selectedIds) })
      setSelectedIds(new Set())
      fetchQuotes(page, statusFilter)
      showToast(`Deleted ${selectedIds.size} quote(s)`)
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Batch delete failed')
    } finally {
      setBatchLoading(false)
    }
  }

  async function handleBatchStatus(status: string) {
    if (!companyId || selectedIds.size === 0) return
    setBatchLoading(true)
    try {
      await apiClient.patch(`/companies/${companyId}/ar/quotes/batch/status`, { ids: Array.from(selectedIds), status })
      setSelectedIds(new Set())
      fetchQuotes(page, statusFilter)
      showToast(`Updated ${selectedIds.size} quote(s) to ${statusLabel(status)}`)
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Batch update failed')
    } finally {
      setBatchLoading(false)
    }
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  async function handleExport() {
    if (!companyId) return
    setExportLoading(true)
    try {
      const params: Record<string, string> = {}
      if (statusFilter !== 'All') params.status = statusFilter
      const { data } = await apiClient.get(`/companies/${companyId}/ar/quotes/export`, { params })
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'quotes-export.csv'; a.click()
      URL.revokeObjectURL(url)
      showToast('Export downloaded')
    } catch {
      showToast('Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  // ─── Single delete ────────────────────────────────────────────────────────

  async function handleDelete(quoteId: string) {
    if (!companyId) return
    if (!window.confirm('Delete this quote? This cannot be undone.')) return
    setActioningId(quoteId)
    try {
      await apiClient.delete(`/companies/${companyId}/ar/quotes/${quoteId}`)
      setDrawerQuote(null)
      fetchQuotes(page, statusFilter)
      showToast('Quote deleted')
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Delete failed')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Status action ────────────────────────────────────────────────────────

  async function handleStatusChange(quoteId: string, status: string) {
    if (!companyId) return
    setActioningId(quoteId)
    try {
      await apiClient.patch(`/companies/${companyId}/ar/quotes/${quoteId}/status`, { status })
      fetchQuotes(page, statusFilter)
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update status')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Convert to invoice ───────────────────────────────────────────────────

  async function handleConvert(quoteId: string) {
    if (!companyId) return
    if (!window.confirm('Convert this quote to an invoice?')) return
    setActioningId(quoteId)
    try {
      await apiClient.post(`/companies/${companyId}/ar/quotes/${quoteId}/convert`)
      fetchQuotes(page, statusFilter)
      showToast('Quote converted to invoice successfully')
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to convert quote')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Load customers ───────────────────────────────────────────────────────

  const loadCustomers = useCallback(async () => {
    if (!companyId) return
    setCustLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers`)
      const raw: any[] = Array.isArray(data) ? data : data?.data ?? data?.items ?? []
      setCustomers(raw.map((c: any) => ({
        id: c.id || c.contactId,
        name: c.name || c.displayName || '—',
        email: c.email || c.contact?.email || '',
      })))
    } catch { /* non-blocking */ }
    finally { setCustLoading(false) }
  }, [companyId])

  // ─── Open create/edit modal ───────────────────────────────────────────────

  function openCreate() {
    setEditingId(null)
    setForm({ customerId: '', expiryDate: '' })
    setLines([emptyLine()])
    setSaveError('')
    setModalOpen(true)
    loadCustomers()
  }

  function openEdit(row: QuoteRow) {
    setEditingId(row.id)
    setForm({ customerId: row.customerId, expiryDate: row.expiryDate ?? '' })
    setLines([emptyLine()])
    setSaveError('')
    setModalOpen(true)
    loadCustomers()
  }

  // ─── Line helpers ─────────────────────────────────────────────────────────

  function setLine(idx: number, field: keyof LineItem, value: string) {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }
  function addLine() { setLines(prev => [...prev, emptyLine()]) }
  function removeLine(idx: number) { setLines(prev => prev.filter((_, i) => i !== idx)) }

  const lineTotal = lines.reduce((s, l) => {
    const qty = parseFloat(l.quantity) || 0
    const price = parseFloat(l.unitPrice) || 0
    return s + qty * price
  }, 0)

  // ─── Save ─────────────────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    if (!form.customerId) { setSaveError('Select a customer'); return }
    const validLines = lines.filter(l => l.description.trim())
    if (!validLines.length) { setSaveError('Add at least one line item'); return }
    setSaving(true); setSaveError('')
    try {
      const payload = {
        customerId: form.customerId,
        expiryDate: form.expiryDate || undefined,
        lines: validLines.map(l => {
          const qty = parseFloat(l.quantity) || 1
          const price = parseFloat(l.unitPrice) || 0
          return { description: l.description.trim(), quantity: qty, unitPrice: price, amount: qty * price }
        }),
      }
      if (editingId) {
        await apiClient.put(`/companies/${companyId}/ar/quotes/${editingId}`, payload)
        showToast('Quote updated')
      } else {
        await apiClient.post(`/companies/${companyId}/ar/quotes`, payload)
        showToast('Quote created')
      }
      setModalOpen(false)
      setPage(0)
      fetchQuotes(0, statusFilter)
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to save quote')
    } finally {
      setSaving(false)
    }
  }

  // ─── Client-side search ───────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(r =>
      r.quoteNumber?.toLowerCase().includes(q) ||
      r.customer?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
    )
  }, [items, search])

  const sorted = useMemo(() => {
    const next = [...filtered]
    next.sort((a, b) => compareQuotes(a, b, sortKey, sortDir))
    return next
  }, [filtered, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'date' || key === 'expiryDate' || key === 'amount' ? 'desc' : 'asc')
  }

  const visibleCols = cols.filter(c => c.visible)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quotes & Estimates</h1>
            <p className="text-sm text-slate-500 mt-1">Create and manage customer quotes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              title="Export CSV"
            >
              <Download size={15} /> {exportLoading ? 'Exporting…' : 'Export'}
            </button>
            <button
              onClick={() => fetchQuotes(page, statusFilter)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            {/* Column visibility */}
            <div className="relative">
              <button
                onClick={() => setShowColMenu(v => !v)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Columns
              </button>
              {showColMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-40 py-2">
                  {cols.map(c => (
                    <label key={c.key} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.visible}
                        onChange={() => saveCols(cols.map(col => col.key === c.key ? { ...col, visible: !col.visible } : col))}
                        className="accent-emerald-600"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              <Plus size={16} /> New Quote
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="px-6 pb-3 flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0); setSelectedIds(new Set()) }}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'}`}
            >
              {s === 'All' ? 'All' : statusLabel(s)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <input
            placeholder="Search by quote number, customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Batch bar */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-700 text-white px-6 py-2.5 flex items-center gap-3 text-sm font-medium">
          <span>{selectedIds.size} selected</span>
          <button
            onClick={handleBatchDelete}
            disabled={batchLoading}
            className="px-3 py-1 bg-rose-500 hover:bg-rose-600 rounded text-white text-xs font-semibold disabled:opacity-50"
          >
            Delete
          </button>
          {(['SENT', 'ACCEPTED', 'EXPIRED'] as const).map(s => (
            <button
              key={s}
              onClick={() => handleBatchStatus(s)}
              disabled={batchLoading}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold disabled:opacity-50"
            >
              Mark {statusLabel(s)}
            </button>
          ))}
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto p-1 hover:bg-white/20 rounded">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="px-6 py-5 flex-1">
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: 650 }}>
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="px-3 py-3 w-10 border-r border-slate-200">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleAll}
                    className="accent-emerald-600"
                  />
                </th>
                {visibleCols.map((col, ci) => (
                  <th
                    key={col.key}
                    style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                    className={`px-4 py-3 font-semibold text-xs uppercase tracking-wide relative select-none border-r border-slate-200 overflow-hidden ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    title={col.label}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key as SortKey)}
                      className={`inline-flex items-center gap-1 w-full min-w-0 overflow-hidden pr-2 ${col.align === 'right' ? 'justify-end' : ''}`}
                    >
                      <span className="truncate">{col.label}</span>
                      <ArrowUpDown size={11} className={`shrink-0 ${sortKey === col.key ? 'text-emerald-600' : 'text-slate-300'}`} />
                    </button>
                    {ci < visibleCols.length - 1 && (
                      <span
                        onMouseDown={e => onResizeStart(e, col.key, col.width)}
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-emerald-400/30"
                      />
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center">
                    <p className="text-rose-500 font-medium">{error}</p>
                    <button onClick={() => fetchQuotes(page, statusFilter)} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-slate-500">No quotes found.</td>
                </tr>
              ) : (
                sorted.map(row => (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${selectedIds.has(row.id) ? 'bg-emerald-50' : ''}`}
                  >
                    <td className="px-3 py-3 border-r border-slate-100">
                      <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} className="accent-emerald-600" />
                    </td>
                    {visibleCols.map(col => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 truncate cursor-pointer border-r border-slate-100 ${col.align === 'right' ? 'text-right tabular-nums' : ''}`}
                        onClick={() => setDrawerQuote(row)}
                      >
                        {col.key === 'quoteNumber' && <span className="font-mono text-xs text-slate-700">{row.quoteNumber}</span>}
                        {col.key === 'customer' && <span className="font-medium text-slate-900">{row.customer}</span>}
                        {col.key === 'date' && <span className="text-slate-600">{fmtDate(row.date)}</span>}
                        {col.key === 'expiryDate' && <span className="text-slate-600">{fmtDate(row.expiryDate)}</span>}
                        {col.key === 'amount' && <span className="font-semibold text-slate-800">{formatCurrency(row.amount, currency)}</span>}
                        {col.key === 'status' && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(row.status)}`}>
                            {statusLabel(row.status)}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => openEdit(row)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">·</span>
                        {row.status === 'DRAFT' && (
                          <>
                            <button
                              disabled={actioningId === row.id}
                              onClick={() => handleStatusChange(row.id, 'SENT')}
                              className="text-xs font-semibold text-sky-700 hover:underline disabled:opacity-40"
                            >
                              Send
                            </button>
                            <span className="text-slate-300">·</span>
                          </>
                        )}
                        {row.status === 'SENT' && (
                          <>
                            <button disabled={actioningId === row.id} onClick={() => handleStatusChange(row.id, 'ACCEPTED')} className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-40">Accept</button>
                            <span className="text-slate-300">·</span>
                            <button disabled={actioningId === row.id} onClick={() => handleStatusChange(row.id, 'REJECTED')} className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-40">Reject</button>
                            <span className="text-slate-300">·</span>
                          </>
                        )}
                        {(row.status === 'SENT' || row.status === 'ACCEPTED') && (
                          <>
                            <button disabled={actioningId === row.id} onClick={() => handleConvert(row.id)} className="text-xs font-semibold text-violet-700 hover:underline disabled:opacity-40">Convert</button>
                            <span className="text-slate-300">·</span>
                          </>
                        )}
                        <button
                          disabled={actioningId === row.id}
                          onClick={() => handleDelete(row.id)}
                          className="text-xs font-semibold text-rose-500 hover:underline disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">Page {page + 1}{hasMore ? '+' : ''} · {filtered.length} shown</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { const p = page - 1; setPage(p); fetchQuotes(p, statusFilter) }}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => { const p = page + 1; setPage(p); fetchQuotes(p, statusFilter) }}
                disabled={!hasMore}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {drawerQuote && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawerQuote(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{drawerQuote.quoteNumber}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{drawerQuote.customer}</p>
              </div>
              <button onClick={() => setDrawerQuote(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="flex border-b border-slate-200 bg-white px-4">
              {(['details', 'activity'] as const).map(tab => (
                <button key={tab} onClick={() => setDrawerTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${drawerTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  {tab === 'details' ? <Download size={11} /> : <Clock size={11} />}
                  {tab === 'details' ? 'Details' : 'Activity'}
                </button>
              ))}
            </div>
            {drawerTab === 'details' && (
            <div className="px-5 py-4 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Date</p>
                  <p className="font-semibold text-slate-800">{fmtDate(drawerQuote.date)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Expiry</p>
                  <p className="font-semibold text-slate-800">{fmtDate(drawerQuote.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Amount</p>
                  <p className="font-bold text-xl text-slate-900">{formatCurrency(drawerQuote.amount, currency)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(drawerQuote.status)}`}>
                    {statusLabel(drawerQuote.status)}
                  </span>
                </div>
              </div>
              {drawerQuote.convertedToInvoiceId && (
                <div className="text-sm bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 text-violet-700">
                  Converted to Invoice ID: <span className="font-mono">{drawerQuote.convertedToInvoiceId.slice(0, 12)}…</span>
                </div>
              )}
              <div className="text-sm text-slate-500">
                {drawerQuote.lineCount > 0 ? `${drawerQuote.lineCount} line item(s)` : 'No line item details available'}
              </div>
            </div>
            )}
            {drawerTab === 'activity' && (
              <div className="px-5 py-4 flex-1">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Clock size={14} className="text-emerald-600" /> Audit Log
                </h3>
                {drawerActivityLoading ? (
                  <div className="flex items-center justify-center py-10 text-slate-400">
                    <Loader2 size={18} className="animate-spin mr-2" /> Loading activity…
                  </div>
                ) : drawerActivity.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">No activity recorded yet.</div>
                ) : (
                  <div className="space-y-3">
                    {drawerActivity.map(entry => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-xs">
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Clock size={11} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-slate-800">{entry.user?.name ?? entry.user?.email ?? 'System'}</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono uppercase text-[10px]">{entry.action}</span>
                          </div>
                          <p className="text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
                          {entry.changes && Object.keys(entry.changes).length > 0 && (
                            <pre className="mt-1 text-[10px] text-slate-400 bg-white rounded p-1.5 border border-slate-100 overflow-x-auto">{JSON.stringify(entry.changes, null, 2)}</pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="px-5 py-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => { openEdit(drawerQuote); setDrawerQuote(null) }}
                className="flex-1 px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Edit Quote
              </button>
              <button
                onClick={() => handleDelete(drawerQuote.id)}
                disabled={actioningId === drawerQuote.id}
                className="px-4 py-2 text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-lg disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Quote' : 'New Quote'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <CustomerPickerField
                  label="Customer *"
                  value={form.customerId}
                  customers={customers}
                  loading={custLoading}
                  placeholder="Select customer..."
                  createLabel="+ Create New Customer"
                  onOpen={loadCustomers}
                  onChange={(id) => setForm((f) => ({ ...f, customerId: id }))}
                  onCreateNew={() => setShowQuickAddCustomer(true)}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Line Items *</label>
                  <button type="button" onClick={addLine} className="text-xs font-semibold text-emerald-700 hover:underline">+ Add line</button>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-slate-600">Description</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600 w-20">Qty</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600 w-28">Unit Price</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600 w-24">Amount</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l, i) => {
                        const qty = parseFloat(l.quantity) || 0
                        const price = parseFloat(l.unitPrice) || 0
                        return (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-2 py-1">
                              <input value={l.description} onChange={e => setLine(i, 'description', e.target.value)} placeholder="Description" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm" />
                            </td>
                            <td className="px-2 py-1">
                              <input type="number" min="0" step="1" value={l.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm" />
                            </td>
                            <td className="px-2 py-1">
                              <input type="number" min="0" step="0.01" value={l.unitPrice} onChange={e => setLine(i, 'unitPrice', e.target.value)} placeholder="0.00" className="w-full px-2 py-1.5 border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm" />
                            </td>
                            <td className="px-3 py-1 text-right tabular-nums text-slate-700 text-sm">{formatCurrency(qty * price, currency)}</td>
                            <td className="px-1 py-1 text-center">
                              {lines.length > 1 && (
                                <button type="button" onClick={() => removeLine(i)} className="text-rose-400 hover:text-rose-600 text-lg leading-none">×</button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-2 pr-10 text-sm font-semibold text-slate-800">
                  Total: {formatCurrency(lineTotal, currency)}
                </div>
              </div>

              {saveError && <p className="text-sm text-rose-500">{saveError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60">
                  {saving ? 'Saving…' : editingId ? 'Update Quote' : 'Save as Draft'}
                </button>
              </div>
            </form>
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
            setForm((prev) => ({ ...prev, customerId: next.id }))
            setShowQuickAddCustomer(false)
          }}
        />
      )}
    </div>
  )
}
