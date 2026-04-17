'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Clock, Download, Loader2, Plus, RefreshCw, X } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'
import CustomerPickerField from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'

const CREDIT_REASONS = ['Returned Goods', 'Billing Error', 'Discount Adjustment', 'Price Correction', 'Service Issue', 'Other']
const STATUS_OPTIONS = ['', 'DRAFT', 'ISSUED', 'APPLIED', 'VOID']

interface CreditNoteRow {
  id: string
  creditNoteNumber: string
  customer: string
  customerId: string
  invoiceId: string | null
  invoiceNumber: string | null
  date: string | null
  amount: number
  status: string
  memo: string
}

interface CustomerOption { id: string; name: string }
interface InvoiceOption { id: string; invoiceNumber: string; balance: number }

interface ColDef {
  key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right'
}

const DEFAULT_COLS: ColDef[] = [
  { key: 'creditNoteNumber', label: 'CN #', visible: true, width: 120, align: 'left' },
  { key: 'customer', label: 'Customer', visible: true, width: 180, align: 'left' },
  { key: 'invoiceNumber', label: 'Invoice #', visible: true, width: 120, align: 'left' },
  { key: 'date', label: 'Date', visible: true, width: 110, align: 'left' },
  { key: 'amount', label: 'Amount', visible: true, width: 120, align: 'right' },
  { key: 'memo', label: 'Reason', visible: true, width: 160, align: 'left' },
  { key: 'status', label: 'Status', visible: true, width: 96, align: 'left' },
]

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem('credit-notes-cols-v1')
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

function normalizeCN(cn: any): CreditNoteRow {
  return {
    id: cn.id,
    creditNoteNumber: cn.creditNoteNumber ?? `CN-${cn.id?.slice(0, 8)}`,
    customer: cn.customer ?? cn.customerName ?? '—',
    customerId: cn.customerId ?? '',
    invoiceId: cn.invoiceId ?? null,
    invoiceNumber: cn.invoiceNumber ?? null,
    date: cn.date ?? cn.issuedAt ?? null,
    amount: Number(cn.amount ?? cn.totalAmount ?? 0),
    status: cn.status ?? 'DRAFT',
    memo: cn.memo ?? cn.reason ?? '',
  }
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

function statusBadge(status: string) {
  switch (status) {
    case 'ISSUED': return 'text-sky-700 bg-sky-50 border-sky-200'
    case 'APPLIED': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'VOID': return 'text-rose-700 bg-rose-50 border-rose-200'
    default: return 'text-slate-600 bg-slate-50 border-slate-200'
  }
}

function parseApplyAmount(value: string): number {
  const normalized = String(value ?? '').replace(/,/g, '').trim()
  if (!normalized) return Number.NaN
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function formatApplyAmount(value: string | number): string {
  const parsed = typeof value === 'number' ? value : parseApplyAmount(value)
  if (!Number.isFinite(parsed)) return ''
  return parsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type SortDirection = 'asc' | 'desc'
type SortKey = 'creditNoteNumber' | 'customer' | 'invoiceNumber' | 'date' | 'amount' | 'memo' | 'status'

function compareCreditNotes(a: CreditNoteRow, b: CreditNoteRow, key: SortKey, dir: SortDirection): number {
  const asc = dir === 'asc' ? 1 : -1
  if (key === 'amount') {
    return a.amount === b.amount ? 0 : a.amount > b.amount ? asc : -asc
  }
  if (key === 'date') {
    const ad = a.date ? new Date(a.date).getTime() : 0
    const bd = b.date ? new Date(b.date).getTime() : 0
    return ad === bd ? 0 : ad > bd ? asc : -asc
  }
  const av = String((a as any)[key] ?? '').toLowerCase()
  const bv = String((b as any)[key] ?? '').toLowerCase()
  if (av === bv) return 0
  return av > bv ? asc : -asc
}

export default function CreditNotesPage() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [items, setItems] = useState<CreditNoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toast, setToast] = useState('')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Detail drawer
  const [drawerCN, setDrawerCN] = useState<CreditNoteRow | null>(null)
  const [drawerTab, setDrawerTab] = useState<'details' | 'activity'>('details')
  const [cnActivity, setCnActivity] = useState<any[]>([])
  const [cnActivityLoading, setCnActivityLoading] = useState(false)

  // Create modal
  const [newOpen, setNewOpen] = useState(false)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [custLoading, setCustLoading] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)
  const [invoices, setInvoices] = useState<InvoiceOption[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [nc, setNc] = useState({ customerId: '', invoiceId: '', totalAmount: '', reason: CREDIT_REASONS[0] })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  // Apply to Invoice modal
  const [applyOpen, setApplyOpen] = useState(false)
  const [applyingCN, setApplyingCN] = useState<CreditNoteRow | null>(null)
  const [applyForm, setApplyForm] = useState({ invoiceId: '', amount: '' })
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [applyAmountFocused, setApplyAmountFocused] = useState(false)
  const [newAmountFocused, setNewAmountFocused] = useState(false)

  // Column defs
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const [showColMenu, setShowColMenu] = useState(false)
  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const saveCols = (next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('credit-notes-cols-v1', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const { containerRef, startResize: onResizeStart, isOverflowing: creditNotesIsOverflowing } = useFixedWidthResizableColumns({
    columns: cols,
    columnsRef: colsRef,
    saveColumns: saveCols,
    fixedWidth: 160,
  })

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true); setError('')
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      const { data } = await apiClient.get(`/companies/${companyId}/ar/credit-notes`, { params })
      const raw: any[] = Array.isArray(data) ? data : data?.items || []
      setItems(raw.map(normalizeCN))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load credit notes')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // ─── Selection ────────────────────────────────────────────────────────────

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(r => r.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  // ─── Batch ops ────────────────────────────────────────────────────────────

  async function handleBatchDelete() {
    if (!companyId || selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} credit note(s)?`)) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/credit-notes/batch/delete`, { ids: Array.from(selectedIds) })
      setSelectedIds(new Set())
      fetchData()
      showToast(`Deleted ${selectedIds.size} credit note(s)`)
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Batch delete failed')
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
      if (statusFilter) params.status = statusFilter
      const { data } = await apiClient.get(`/companies/${companyId}/ar/credit-notes/export`, { params })
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'credit-notes-export.csv'; a.click()
      URL.revokeObjectURL(url)
      showToast('Export downloaded')
    } catch {
      showToast('Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'date' || key === 'amount' ? 'desc' : 'asc')
  }

  // ─── Void ─────────────────────────────────────────────────────────────────

  async function handleVoid(cnId: string) {
    if (!companyId) return
    if (!window.confirm('Void this credit note? This will reverse the GL entry.')) return
    setActioningId(cnId)
    try {
      await apiClient.post(`/companies/${companyId}/ar/credit-notes/${cnId}/void`)
      fetchData()
      setDrawerCN(null)
      showToast('Credit note voided')
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to void credit note')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Apply to Invoice ─────────────────────────────────────────────────────

  function openApplyModal(cn: CreditNoteRow) {
    setApplyingCN(cn)
    setApplyForm({ invoiceId: cn.invoiceId ?? '', amount: String(cn.amount ?? '') })
    setApplyAmountFocused(false)
    setApplyError('')
    setApplyOpen(true)
    loadInvoicesForCustomer(cn.customerId)
  }

  const loadInvoicesForCustomer = async (customerId: string) => {
    if (!companyId || !customerId) return
    setInvoicesLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/invoices`, {
        params: { customerId, openOnly: true, limit: 50 },
      })
      const raw: any[] = Array.isArray(data) ? data : data?.items || []
      const openInvoices = raw.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber ?? inv.id?.slice(0, 8),
        balance: Number(inv.balance ?? inv.amountDue ?? inv.amount ?? 0),
      }))
      setInvoices(openInvoices)
      setApplyForm((prev) => ({
        ...prev,
        invoiceId: openInvoices.some((inv) => inv.id === prev.invoiceId) ? prev.invoiceId : '',
      }))
    } catch {
      setInvoices([])
      setApplyForm((prev) => ({ ...prev, invoiceId: '' }))
    } finally {
      setInvoicesLoading(false)
    }
  }

  async function submitApply(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId || !applyingCN) return
    if (!applyForm.invoiceId) { setApplyError('Select an invoice'); return }
    const applyAmount = parseApplyAmount(applyForm.amount)
    if (!Number.isFinite(applyAmount) || applyAmount <= 0) { setApplyError('Enter a valid amount'); return }
    setApplying(true); setApplyError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/credit-notes/${applyingCN.id}/apply`, {
        invoiceId: applyForm.invoiceId,
        amount: applyAmount,
      })
      setApplyOpen(false)
      fetchData()
      showToast('Credit note applied to invoice')
    } catch (err: any) {
      setApplyError(err?.response?.data?.message || 'Failed to apply credit note')
    } finally {
      setApplying(false)
    }
  }

  // ─── Load customers ───────────────────────────────────────────────────────

  const loadCustomers = useCallback(async () => {
    if (!companyId) return
    setCustLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers`)
      const raw: any[] = Array.isArray(data) ? data : data?.data ?? data?.items ?? []
      setCustomers(raw.map((c: any) => ({ id: c.id || c.contactId, name: c.name || c.displayName || '—' })))
    } catch { /* non-blocking */ }
    finally { setCustLoading(false) }
  }, [companyId])

  function openModal() {
    setNc({ customerId: '', invoiceId: '', totalAmount: '', reason: CREDIT_REASONS[0] })
    setSaveError('')
    setNewOpen(true)
    loadCustomers()
  }

  async function submitNewCreditNote(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    if (!nc.customerId) { setSaveError('Select a customer'); return }
    const newAmount = parseApplyAmount(nc.totalAmount)
    if (!Number.isFinite(newAmount) || newAmount <= 0) { setSaveError('Enter a valid amount'); return }
    setSaving(true); setSaveError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/credit-notes`, {
        customerId: nc.customerId,
        invoiceId: nc.invoiceId || undefined,
        totalAmount: newAmount,
        reason: nc.reason,
      })
      setNewOpen(false)
      fetchData()
      showToast('Credit note created')
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to create credit note')
    } finally {
      setSaving(false)
    }
  }

  // ─── Search filter ────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(r =>
      r.creditNoteNumber?.toLowerCase().includes(q) ||
      r.customer?.toLowerCase().includes(q) ||
      (r.invoiceNumber ?? '').toLowerCase().includes(q) ||
      r.memo?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
    )
  }, [search, items])

  const sorted = useMemo(() => {
    const next = [...filtered]
    next.sort((a, b) => compareCreditNotes(a, b, sortKey, sortDir))
    return next
  }, [filtered, sortKey, sortDir])

  const visibleCols = cols.filter(c => c.visible)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Credit Notes</h1>
            <p className="text-sm text-slate-500 mt-1">Manage customer credit notes and adjustments</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} disabled={exportLoading} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <Download size={15} /> {exportLoading ? 'Exporting…' : 'Export'}
            </button>
            <button onClick={fetchData} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="Refresh">
              <RefreshCw size={16} />
            </button>
            {/* Column visibility */}
            <div className="relative">
              <button onClick={() => setShowColMenu(v => !v)} className="px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Columns</button>
              {showColMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-40 py-2">
                  {cols.map(c => (
                    <label key={c.key} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={c.visible} onChange={() => saveCols(cols.map(col => col.key === c.key ? { ...col, visible: !col.visible } : col))} className="accent-emerald-600" />
                      {c.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button onClick={openModal} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">
              <Plus size={16} /> New Credit Note
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 flex flex-wrap gap-3">
          <input
            placeholder="Search by number, customer, reason…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm w-64"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
      </div>

      {/* Batch bar */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-700 text-white px-6 py-2.5 flex items-center gap-3 text-sm font-medium">
          <span>{selectedIds.size} selected</span>
          <button onClick={handleBatchDelete} disabled={batchLoading} className="px-3 py-1 bg-rose-500 hover:bg-rose-600 rounded text-white text-xs font-semibold disabled:opacity-50">Delete</button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto p-1 hover:bg-white/20 rounded"><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="px-6 py-5 flex-1">
        <div ref={containerRef} className={`bg-white rounded-xl border border-slate-200 ${creditNotesIsOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}`}>
          <table className="w-full text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="px-3 py-3 w-10 border-r border-slate-200">
                  <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleAll} className="accent-emerald-600" />
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
                      className="flex items-center gap-1 w-full min-w-0 overflow-hidden pr-2"
                      style={{ justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start' }}
                    >
                      <span className="truncate">{col.label}</span>
                      <ArrowUpDown size={11} className={`shrink-0 ${sortKey === col.key ? 'text-emerald-600' : 'text-slate-300'}`} />
                    </button>
                    {ci < visibleCols.length - 1 && (
                      <span onMouseDown={e => onResizeStart(e, col.key)} className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-emerald-400/30" />
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-slate-400">
                  <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />Loading…
                </td></tr>
              ) : error ? (
                <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center">
                  <p className="text-rose-500 font-medium">{error}</p>
                  <button onClick={fetchData} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                </td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-slate-500">No credit notes found.</td></tr>
              ) : (
                sorted.map(row => (
                  <tr key={row.id} className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${selectedIds.has(row.id) ? 'bg-emerald-50' : ''}`}>
                    <td className="px-3 py-3 border-r border-slate-100">
                      <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} className="accent-emerald-600" />
                    </td>
                    {visibleCols.map(col => (
                      <td key={col.key} className={`px-4 py-3 truncate cursor-pointer border-r border-slate-100 ${col.align === 'right' ? 'text-right tabular-nums' : ''}`} onClick={() => { setDrawerCN(row); setDrawerTab('details'); setCnActivity([]) }}>
                        {col.key === 'creditNoteNumber' && <span className="font-mono text-xs text-slate-700">{row.creditNoteNumber}</span>}
                        {col.key === 'customer' && <span className="font-medium text-slate-900">{row.customer}</span>}
                        {col.key === 'invoiceNumber' && <span className="text-slate-600">{row.invoiceNumber ?? '—'}</span>}
                        {col.key === 'date' && <span className="text-slate-600">{fmtDate(row.date)}</span>}
                        {col.key === 'amount' && <span className="font-semibold text-slate-800">{formatCurrency(row.amount, currency)}</span>}
                        {col.key === 'memo' && <span className="text-slate-600 truncate max-w-[140px] inline-block" title={row.memo}>{row.memo || '—'}</span>}
                        {col.key === 'status' && (
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${statusBadge(row.status)}`}>
                            {row.status}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {row.status !== 'VOID' && row.status !== 'APPLIED' && (
                          <>
                            <button
                              disabled={actioningId === row.id}
                              onClick={() => openApplyModal(row)}
                              className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-40"
                            >
                              Apply
                            </button>
                            <span className="text-slate-300">·</span>
                            <button
                              disabled={actioningId === row.id}
                              onClick={() => handleVoid(row.id)}
                              className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-40"
                            >
                              Void
                            </button>
                          </>
                        )}
                        {(row.status === 'VOID' || row.status === 'APPLIED') && (
                          <span className="text-xs text-slate-400 italic">{row.status === 'VOID' ? 'Voided' : 'Applied'}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {drawerCN && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawerCN(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{drawerCN.creditNoteNumber}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{drawerCN.customer}</p>
              </div>
              <button onClick={() => setDrawerCN(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-5 bg-slate-50">
              {(['details', 'activity'] as const).map(tab => (
                <button key={tab} type="button" onClick={() => {
                  setDrawerTab(tab)
                  if (tab === 'activity' && cnActivity.length === 0 && companyId) {
                    setCnActivityLoading(true)
                    apiClient.get(`/companies/${companyId}/ar/credit-notes/${drawerCN.id}/activity`)
                      .then(r => setCnActivity(r.data.data ?? []))
                      .catch(() => {})
                      .finally(() => setCnActivityLoading(false))
                  }
                }}
                  className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-colors ${
                    drawerTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}>
                  {tab === 'activity' ? <span className="flex items-center gap-1"><Clock size={13} />Activity</span> : 'Details'}
                </button>
              ))}
            </div>
            {drawerTab === 'activity' ? (
              <div className="px-5 py-4 space-y-3">
                {cnActivityLoading ? (
                  <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
                ) : cnActivity.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No activity recorded yet.</p>
                ) : cnActivity.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <Clock size={13} className="mt-0.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">{log.action}</span>
                      {log.user && <span className="text-slate-500"> by {log.user.name ?? log.user.email}</span>}
                      <span className="text-slate-400 ml-2">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <>
            <div className="px-5 py-4 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Date</p>
                  <p className="font-semibold text-slate-800">{fmtDate(drawerCN.date)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Amount</p>
                  <p className="font-bold text-xl text-slate-900">{formatCurrency(drawerCN.amount, currency)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${statusBadge(drawerCN.status)}`}>{drawerCN.status}</span>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Invoice #</p>
                  <p className="font-semibold text-slate-800">{drawerCN.invoiceNumber ?? '—'}</p>
                </div>
              </div>
              {drawerCN.memo && (
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Reason</p>
                  <p className="text-sm text-slate-700">{drawerCN.memo}</p>
                </div>
              )}
            </div>
            {drawerCN.status !== 'VOID' && drawerCN.status !== 'APPLIED' && (
              <div className="px-5 py-4 border-t border-slate-200 flex gap-2">
                <button
                  onClick={() => { openApplyModal(drawerCN); setDrawerCN(null) }}
                  className="flex-1 px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Apply to Invoice
                </button>
                <button
                  onClick={() => handleVoid(drawerCN.id)}
                  disabled={actioningId === drawerCN.id}
                  className="px-4 py-2 text-sm font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-50"
                >
                  Void
                </button>
              </div>
            )}
            </>
            )}
          </div>
        </div>
      )}

      {/* Apply to Invoice Modal */}
      {applyOpen && applyingCN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setApplyOpen(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Apply Credit Note</h2>
              <button onClick={() => setApplyOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"><X size={16} /></button>
            </div>
            <form onSubmit={submitApply} className="p-4 space-y-4">
              <p className="text-sm text-slate-600">Applying <strong>{applyingCN.creditNoteNumber}</strong> ({formatCurrency(applyingCN.amount, currency)}) to an invoice.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice *</label>
                <select
                  required
                  aria-label="Invoice to apply credit note"
                  value={applyForm.invoiceId}
                  onChange={e => setApplyForm(f => ({ ...f, invoiceId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="">{invoicesLoading ? 'Loading invoices…' : invoices.length === 0 ? 'No open invoices for this customer' : 'Select invoice…'}</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoiceNumber} (Balance: {formatCurrency(inv.balance, currency)})</option>
                  ))}
                </select>
                {!invoicesLoading && invoices.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">No open invoices for this customer</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Apply *</label>
                <input
                  required
                  type="text"
                  inputMode="decimal"
                  aria-label="Amount to apply"
                  value={applyAmountFocused ? applyForm.amount : formatApplyAmount(applyForm.amount)}
                  onFocus={() => setApplyAmountFocused(true)}
                  onBlur={() => setApplyAmountFocused(false)}
                  onChange={e => {
                    const normalized = e.target.value.replace(/,/g, '').replace(/[^\d.]/g, '')
                    if ((normalized.match(/\./g) ?? []).length > 1) return
                    setApplyForm(f => ({ ...f, amount: normalized }))
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              {applyError && <p className="text-sm text-rose-500">{applyError}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setApplyOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={applying} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60">
                  {applying ? 'Applying…' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {newOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setNewOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">New Credit Note</h2>
              <button onClick={() => setNewOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={submitNewCreditNote} className="p-4 space-y-4">
              <CustomerPickerField
                label="Customer *"
                value={nc.customerId}
                customers={customers}
                loading={custLoading}
                placeholder="Select customer..."
                createLabel="+ Create New Customer"
                onOpen={loadCustomers}
                onChange={(id) => { setNc((p) => ({ ...p, customerId: id })); setInvoices([]) }}
                onCreateNew={() => setShowQuickAddCustomer(true)}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                <select
                  required
                  value={nc.reason}
                  onChange={e => setNc(p => ({ ...p, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  {CREDIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                <input
                  required
                  type="text"
                  inputMode="decimal"
                  value={newAmountFocused ? nc.totalAmount : formatApplyAmount(nc.totalAmount)}
                  onFocus={() => setNewAmountFocused(true)}
                  onBlur={() => setNewAmountFocused(false)}
                  onChange={e => {
                    const normalized = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '')
                    if ((normalized.match(/\./g) ?? []).length > 1) return
                    setNc(p => ({ ...p, totalAmount: normalized }))
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="0.00"
                />
              </div>
              {saveError && <p className="text-sm text-rose-500">{saveError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNewOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60">
                  {saving ? 'Saving…' : 'Create Credit Note'}
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
            const next = { id: customer.contactId, name: customer.name }
            setCustomers((prev) => [next, ...prev.filter((p) => p.id !== next.id)])
            setNc((prev) => ({ ...prev, customerId: next.id }))
            setShowQuickAddCustomer(false)
          }}
        />
      )}
    </div>
  )
}

