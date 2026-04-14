'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, Trash2, X, AlertCircle, Loader2, RefreshCw,
  Download, Eye, Bell, BellRing, FileX, ChevronDown, ArrowUpDown,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useToast } from '@/components/ToastProvider'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

interface OverdueInvoice {
  id: string
  invoiceNumber: string
  customer?: string
  customerName?: string
  dueDate: string
  total?: number
  totalAmount?: number
  balanceDue?: number
  dunningLevel?: number
  status?: string
}

type SortKey = 'invoiceNumber' | 'customer' | 'dueDate' | 'daysOverdue' | 'amount' | 'dunningLevel'
type SortDirection = 'asc' | 'desc'

function compareOverdue(a: OverdueInvoice, b: OverdueInvoice, key: SortKey, dir: SortDirection): number {
  if (key === 'amount') {
    const av = getAmount(a); const bv = getAmount(b)
    return dir === 'asc' ? av - bv : bv - av
  }
  if (key === 'daysOverdue') {
    const av = calcDaysOverdue(a.dueDate); const bv = calcDaysOverdue(b.dueDate)
    return dir === 'asc' ? av - bv : bv - av
  }
  if (key === 'dunningLevel') {
    const av = getLevel(a); const bv = getLevel(b)
    return dir === 'asc' ? av - bv : bv - av
  }
  if (key === 'dueDate') {
    const av = new Date(a.dueDate).getTime() || 0; const bv = new Date(b.dueDate).getTime() || 0
    return dir === 'asc' ? av - bv : bv - av
  }
  if (key === 'customer') {
    const as = getCustomer(a).toLowerCase(); const bs = getCustomer(b).toLowerCase()
    return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
  }
  const as = String((a as any)[key] ?? '').toLowerCase(); const bs = String((b as any)[key] ?? '').toLowerCase()
  return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
}

interface ColDef { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right' }

const DEFAULT_COLS: ColDef[] = [
  { key: 'invoiceNumber', label: 'Invoice #', visible: true, width: 130, align: 'left' },
  { key: 'customer', label: 'Customer', visible: true, width: 200, align: 'left' },
  { key: 'dueDate', label: 'Due Date', visible: true, width: 110, align: 'left' },
  { key: 'daysOverdue', label: 'Days Overdue', visible: true, width: 120, align: 'right' },
  { key: 'amount', label: 'Amount Due', visible: true, width: 120, align: 'right' },
  { key: 'dunningLevel', label: 'Dunning Level', visible: true, width: 140, align: 'left' },
]

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem('dunning-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as ColDef[]
      return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, visible: sc.visible, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_COLS
}

const LEVEL_META: Record<number, { label: string; cls: string }> = {
  0: { label: 'None', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  1: { label: 'Reminder', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  2: { label: 'Warning', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  3: { label: 'Final Notice', cls: 'bg-red-50 text-red-700 border-red-200' },
}

function calcDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((now - due) / 86400000))
}

const getAmount = (r: OverdueInvoice) => r.balanceDue ?? r.totalAmount ?? r.total ?? 0
const getCustomer = (r: OverdueInvoice) => r.customerName ?? r.customer ?? '—'
const getLevel = (r: OverdueInvoice): number => r.dunningLevel ?? 0

export default function DunningManagementPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<OverdueInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | ''>('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const [showColMenu, setShowColMenu] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchLevel, setBatchLevel] = useState(1)

  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const saveCols = (next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('dunning-cols-v1', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/invoices?status=OVERDUE`)
      setItems(Array.isArray(data) ? data : data?.items ?? data?.invoices ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load overdue invoices')
    } finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const filtered = items.filter(row => {
    const q = search.toLowerCase()
    const matchSearch = !q || row.invoiceNumber?.toLowerCase().includes(q) || getCustomer(row).toLowerCase().includes(q)
    const matchLevel = levelFilter === '' || getLevel(row) === levelFilter
    return matchSearch && matchLevel
  })

  const [sortKey, setSortKey] = useState<SortKey>('dueDate')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir(key === 'daysOverdue' ? 'desc' : 'asc') }
  }
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compareOverdue(a, b, sortKey, sortDir)),
    [filtered, sortKey, sortDir] // eslint-disable-line react-hooks/exhaustive-deps
  )

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
      saveCols(colsRef.current.map(c => c.key === resizeRef.current!.key ? { ...c, width: Math.max(80, resizeRef.current!.startW + mv.clientX - resizeRef.current!.startX) } : c))
    }
    const onUp = () => { resizeRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }

  const handleSendReminder = async (invoiceId: string, level: number) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/ar/dunning/send`, { invoiceId, level })
      toast.success(`Level ${level} reminder sent`); fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Send failed') }
  }

  const handleUpdateLevel = async (invoiceId: string, level: number) => {
    if (!companyId) return
    try {
      await apiClient.patch(`/companies/${companyId}/ar/dunning/${invoiceId}/level`, { level })
      toast.success('Dunning level updated'); fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Update failed') }
  }

  const handleBatchSend = async () => {
    if (!companyId || !selectedIds.size) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/dunning/batch/send`, { invoiceIds: [...selectedIds], level: batchLevel })
      toast.success(`Reminders sent to ${selectedIds.size} invoice(s)`); setSelectedIds(new Set()); fetchItems()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Batch send failed') }
    finally { setBatchLoading(false) }
  }

  const handleExport = () => {
    const headers = ['Invoice #', 'Customer', 'Due Date', 'Days Overdue', 'Amount Due', 'Dunning Level']
    const rows = filtered.map(r => [r.invoiceNumber, getCustomer(r), r.dueDate, String(calcDaysOverdue(r.dueDate)), String(getAmount(r)), String(getLevel(r))])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'dunning-overdue.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const visibleCols = cols.filter(c => c.visible)

  const renderCell = (c: ColDef, row: OverdueInvoice) => {
    if (c.key === 'customer') return getCustomer(row)
    if (c.key === 'daysOverdue') return <span className="font-semibold text-red-600">{calcDaysOverdue(row.dueDate)}d</span>
    if (c.key === 'amount') return formatCurrency(getAmount(row), currency)
    if (c.key === 'dunningLevel') {
      const lvl = getLevel(row)
      const meta = LEVEL_META[lvl] ?? LEVEL_META[0]
      return <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${meta.cls}`}>{meta.label}</span>
    }
    return (row as any)[c.key] ?? '—'
  }

  if (cidLoading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading…</span></div>
  if (cidError) return <div className="p-6 text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Dunning Management</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} overdue invoice{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchItems} title="Refresh" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors"><RefreshCw size={15} /></button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Download size={15} /> Export</button>
          <div className="relative">
            <button onClick={() => setShowColMenu(v => !v)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Eye size={15} /> Columns</button>
            {showColMenu && (
              <><div className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-emerald-100 rounded-xl shadow-lg p-2 min-w-[160px]">
                  {cols.filter(c => c.key !== 'invoiceNumber').map(c => (
                    <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-emerald-50 cursor-pointer">
                      <input type="checkbox" checked={c.visible} onChange={() => saveCols(cols.map(d => d.key === c.key ? { ...d, visible: !d.visible } : d))} className="accent-emerald-600" />{c.label}
                    </label>
                  ))}
                </div></>
            )}
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Overdue', value: items.length, cls: 'text-red-600' },
          { label: 'No Reminder Sent', value: items.filter(r => getLevel(r) === 0).length, cls: 'text-gray-600' },
          { label: 'Warned (L2+)', value: items.filter(r => getLevel(r) >= 2).length, cls: 'text-orange-600' },
          { label: 'Total Overdue', value: formatCurrency(items.reduce((s, r) => s + getAmount(r), 0), currency), cls: 'text-emerald-700' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${c.cls}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search invoices…" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <select value={levelFilter} onChange={e => { setLevelFilter(e.target.value === '' ? '' : Number(e.target.value)); setPage(0) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-700">
          <option value="">All Levels</option>
          <option value="0">No Reminder</option>
          <option value="1">1 - Reminder</option>
          <option value="2">2 - Warning</option>
          <option value="3">3 - Final Notice</option>
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
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-80">Send as level:</span>
            <select value={batchLevel} onChange={e => setBatchLevel(Number(e.target.value))}
              className="px-2 py-1 text-xs bg-white/20 border border-white/30 rounded text-white focus:outline-none">
              <option value={1}>1 – Reminder</option>
              <option value={2}>2 – Warning</option>
              <option value={3}>3 – Final Notice</option>
            </select>
          </div>
          <div className="flex-1" />
          <button onClick={handleBatchSend} disabled={batchLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-40 transition-colors font-semibold">
            <BellRing size={13} /> Send Reminders
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
                    onClick={() => toggleSort(c.key as SortKey)}
                    className="flex items-center gap-1 w-full"
                    style={{ justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start' }}
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
                  <td className="px-3 py-3 border-r border-gray-100"><div className="h-4 w-4 bg-gray-100 rounded" /></td>
                  {visibleCols.map(c => <td key={c.key} className="px-3 py-3 border-r border-gray-100"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>)}
                  <td className="px-3 py-3"><div className="h-4 w-20 bg-gray-100 rounded ml-auto" /></td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 2} className="px-4 py-16 text-center">
                  <FileX size={28} className="mx-auto mb-2 opacity-30 text-gray-400" />
                  <p className="font-medium text-gray-400">No overdue invoices</p>
                  <p className="text-xs mt-1 text-gray-300">{search || levelFilter !== '' ? 'Try adjusting your filters' : 'All invoices are current'}</p>
                </td>
              </tr>
            ) : (
              paginated.map(row => {
                const level = getLevel(row)
                const meta = LEVEL_META[level] ?? LEVEL_META[0]
                return (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100"><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} className="accent-blue-600" /></td>
                    {visibleCols.map(c => (
                      <td key={c.key} className="px-3 py-3 truncate border-r border-gray-100" style={{ textAlign: c.align === 'right' ? 'right' : 'left' }}>{renderCell(c, row)}</td>
                    ))}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Level dropdown */}
                        <select
                          value={level}
                          onChange={e => handleUpdateLevel(row.id, Number(e.target.value))}
                          className="text-xs border border-gray-200 rounded px-1 py-1 bg-white focus:outline-none text-gray-600"
                          onClick={e => e.stopPropagation()}
                        >
                          <option value={0}>L0</option>
                          <option value={1}>L1</option>
                          <option value={2}>L2</option>
                          <option value={3}>L3</option>
                        </select>
                        <button onClick={e => { e.stopPropagation(); handleSendReminder(row.id, Math.max(1, level)) }} title="Send Reminder"
                          className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"><Bell size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })
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
    </div>
  )
}

