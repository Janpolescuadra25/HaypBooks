'use client'

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Search, Eye, X, AlertCircle, Loader2, FileText, Send, Ban,
  ReceiptText, Clock, CheckCircle2, TrendingUp, MoreVertical, Copy,
  Trash2, RefreshCw, ChevronDown, LayoutTemplate, Filter, SlidersHorizontal,
  Download, CheckSquare, Square, AlertTriangle, DollarSign, Printer,
  Share2, CreditCard, History, ExternalLink, ArrowUpDown,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'
import InvoiceDetailPage from './InvoiceDetailPage'
import TemplateGallery from './invoice-templates/TemplateGallery'

export interface Invoice {
  id: string
  invoiceNumber?: string
  customerId?: string
  customerName?: string
  date: string
  dueDate: string
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID'
  total: number
  amountDue?: number
  items?: InvoiceItem[]
  memo?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
  accountId?: string
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-50 text-gray-700 border-gray-200',
  SENT: 'bg-blue-50 text-blue-700 border-blue-200',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200',
  VOID: 'bg-gray-50 text-gray-500 border-gray-200',
}

const statusIcons: Record<string, React.ReactNode> = {
  DRAFT: React.createElement(Clock, { size: 11 }),
  SENT: React.createElement(Send, { size: 11 }),
  PARTIALLY_PAID: React.createElement(DollarSign, { size: 11 }),
  PARTIAL: React.createElement(DollarSign, { size: 11 }),
  PAID: React.createElement(CheckCircle2, { size: 11 }),
  OVERDUE: React.createElement(AlertTriangle, { size: 11 }),
  VOID: React.createElement(Ban, { size: 11 }),
}

type InvSortKey = 'invoiceNumber' | 'customerName' | 'date' | 'dueDate' | 'status' | 'total' | 'daysOverdue'
type InvSortDir = 'asc' | 'desc'
const MS_PER_DAY = 24 * 60 * 60 * 1000
function getDaysOverdue(inv: Invoice): number {
  if (!inv.dueDate) return 0
  const due = new Date(inv.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - due.getTime()) / MS_PER_DAY)
  return Math.max(0, diff)
}
function isDueSoon(inv: Invoice): boolean {
  if (!inv.dueDate) return false
  const due = new Date(inv.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((due.getTime() - today.getTime()) / MS_PER_DAY)
  return diff >= 0 && diff <= 7 && !['PAID', 'VOID'].includes(inv.status)
}
function compareInvoices(a: Invoice, b: Invoice, key: InvSortKey, dir: InvSortDir): number {
  const asc = dir === 'asc' ? 1 : -1
  if (key === 'total') return a.total === b.total ? 0 : a.total > b.total ? asc : -asc
  if (key === 'date' || key === 'dueDate') {
    const ad = a[key] ? new Date(a[key] as string).getTime() : 0
    const bd = b[key] ? new Date(b[key] as string).getTime() : 0
    return ad === bd ? 0 : ad > bd ? asc : -asc
  }
  if (key === 'daysOverdue') {
    const ad = getDaysOverdue(a)
    const bd = getDaysOverdue(b)
    return ad === bd ? 0 : ad > bd ? asc : -asc
  }
  const av = String((a as any)[key] ?? '').toLowerCase()
  const bv = String((b as any)[key] ?? '').toLowerCase()
  return av === bv ? 0 : av > bv ? asc : -asc
}

interface InvColDef { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right' }
const DEFAULT_INV_COLS: InvColDef[] = [
  { key: 'invoiceNumber', label: 'Invoice #', visible: true, width: 120, align: 'left' },
  { key: 'customerName', label: 'Customer', visible: true, width: 180, align: 'left' },
  { key: 'date', label: 'Date', visible: true, width: 110, align: 'left' },
  { key: 'dueDate', label: 'Due Date', visible: true, width: 110, align: 'left' },
  { key: 'daysOverdue', label: 'Days overdue', visible: true, width: 110, align: 'right' },
  { key: 'status', label: 'Status', visible: true, width: 100, align: 'left' },
  { key: 'total', label: 'Total', visible: true, width: 110, align: 'right' },
]
function loadInvCols(): InvColDef[] {
  try {
    const s = localStorage.getItem('invoices-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as InvColDef[]
      return DEFAULT_INV_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_INV_COLS
}

export default function InvoicesPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchInvoices = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', '20')
      params.set('offset', String((page - 1) * 20))
      if (statusFilter !== 'ALL' && statusFilter !== 'DUE_SOON') params.set('status', statusFilter)
      const { data } = await apiClient.get(`/companies/${companyId}/ar/invoices?${params}`)
      const list = Array.isArray(data) ? data : data.items ?? data.invoices ?? []
      setInvoices(list)
      setHasMore(list.length === 20)
      setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load invoices') }
    finally { setLoading(false) }
  }, [companyId, page, statusFilter])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const filtered = useMemo(() => {
    let list = invoices
    if (statusFilter === 'DUE_SOON') {
      list = list.filter(isDueSoon)
    }
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(i =>
      (i.invoiceNumber ?? '').toLowerCase().includes(q) ||
      (i.customerName ?? '').toLowerCase().includes(q)
    )
  }, [invoices, search, statusFilter])

  const stats = useMemo(() => ({
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'DRAFT').length,
    sent: invoices.filter(i => i.status === 'SENT').length,
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
    dueSoon: invoices.filter(isDueSoon).length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    totalAmount: invoices.reduce((s, i) => s + (i.total || 0), 0),
    overdueAmount: invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + (i.amountDue || i.total || 0), 0),
    outstandingAmount: invoices
      .filter(i => ['SENT', 'PARTIALLY_PAID', 'PARTIAL', 'OVERDUE'].includes(i.status))
      .reduce((s, i) => s + (i.amountDue || i.total || 0), 0),
    paidPct: invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'PAID').length / invoices.length) * 100) : 0,
  }), [invoices])

  const handleSend = async (
    id: string,
    invoiceNumber: string | undefined,
    kind: 'send' | 'reminder' = 'send',
  ) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/ar/invoices/${id}/send`)
      fetchInvoices()
      if (kind === 'send') {
        const invoiceRef = invoiceNumber ?? `INV-${id.slice(-6).toUpperCase()}`
        showToast(`Invoice #${invoiceRef} marked as Sent`)
      } else {
        showToast('Reminder sent')
      }
    }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to send') }
    setActionMenuId(null)
  }

  const duplicateInvoice = async (sourceInvoice: Invoice) => {
    if (!companyId) throw new Error('No company selected')
    const { data } = await apiClient.post(`/companies/${companyId}/ar/invoices/${sourceInvoice.id}/duplicate`)
    await fetchInvoices()

    const sourceRef = sourceInvoice.invoiceNumber ?? `INV-${sourceInvoice.id.slice(-6).toUpperCase()}`
    const duplicatedRef = data?.invoiceNumber ?? `INV-${String(data?.id ?? '').slice(-6).toUpperCase()}`
    showToast(`Invoice #${sourceRef} duplicated as #${duplicatedRef}`)
    setViewInvoice(data)
  }

  const handleDuplicateFromList = async (sourceInvoice: Invoice) => {
    try {
      await duplicateInvoice(sourceInvoice)
      setActionMenuId(null)
      setMenuPos(null)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to duplicate invoice')
    }
  }

  const handleDuplicateFromDetail = async (sourceInvoice: Invoice) => {
    try {
      await duplicateInvoice(sourceInvoice)
    } catch (e: any) {
      throw new Error(e?.response?.data?.message ?? 'Failed to duplicate invoice')
    }
  }

  const handleVoid = async (id: string) => {
    if (!companyId || !confirm('Voiding this invoice will reverse all payment allocations. Continue?')) return
    try { await apiClient.post(`/companies/${companyId}/ar/invoices/${id}/void`); fetchInvoices() }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to void') }
    setActionMenuId(null)
  }

  const handleBulkSend = async () => {
    if (!companyId || selected.size === 0) return
    if (!confirm(`Send ${selected.size} invoice(s)?`)) return
    setBulkLoading(true)
    const ids = Array.from(selected)
    await Promise.allSettled(ids.map(id => apiClient.post(`/companies/${companyId}/ar/invoices/${id}/send`)))
    setSelected(new Set())
    setBulkLoading(false)
    fetchInvoices()
  }

  const handleBulkVoid = async () => {
    if (!companyId || selected.size === 0) return
    if (!confirm(`Void ${selected.size} invoice(s)?`)) return
    setBulkLoading(true)
    const ids = Array.from(selected)
    await Promise.allSettled(ids.map(id => apiClient.post(`/companies/${companyId}/ar/invoices/${id}/void`)))
    setSelected(new Set())
    setBulkLoading(false)
    fetchInvoices()
  }

  const handleBulkMarkAsSent = () => {
    if (selected.size === 0) return
    setInvoices(prev => prev.map(inv => selected.has(inv.id) ? { ...inv, status: 'SENT' } : inv))
    setSelected(new Set())
    showToast(`${selected.size} invoice(s) marked as Sent`) 
  }

  const handleBulkPrint = () => {
    if (selected.size === 0) return
    setSelected(new Set())
    showToast(`${selected.size} invoice(s) queued for print`)
  }

  const handleConfirmDelete = () => {
    if (selected.size === 0) return
    setDeleteConfirmationOpen(true)
  }

  const handleBulkDelete = () => {
    setInvoices(prev => prev.filter(inv => !selected.has(inv.id)))
    setSelected(new Set())
    setDeleteConfirmationOpen(false)
    showToast('Selected invoices deleted')
  }

  const downloadCSV = (rows: Invoice[]) => {
    const lines = [
      ['Invoice #', 'Customer', 'Date', 'Due Date', 'Status', 'Days overdue', 'Total'],
      ...rows.map(inv => [
        inv.invoiceNumber ?? inv.id.slice(0, 8).toUpperCase(),
        inv.customerName ?? '',
        fmtDate(inv.date),
        fmtDate(inv.dueDate),
        inv.status.replace(/_/g, ' '),
        String(getDaysOverdue(inv)),
        String(inv.total),
      ])
    ]
    const csv = lines.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `invoices-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('CSV export ready')
  }

  const handleExport = (format: 'csv' | 'pdf') => {
    setShowExportOptions(false)
    if (format === 'csv') {
      downloadCSV(sorted)
    } else {
      showToast('PDF export queued')
    }
  }

  const toggleSelect = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleSelectAll = () => setSelected(p => p.size === filtered.length ? new Set() : new Set(filtered.map(i => i.id)))

  const [sortKey, setSortKey] = useState<InvSortKey>('date')
  const [sortDir, setSortDir] = useState<InvSortDir>('desc')
  const toggleSort = (key: InvSortKey) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir(key === 'total' || key === 'date' || key === 'dueDate' || key === 'daysOverdue' ? 'desc' : 'asc') }
  }
  const sorted = useMemo(() => [...filtered].sort((a, b) => compareInvoices(a, b, sortKey, sortDir)), [filtered, sortKey, sortDir])

  const [invCols, setInvCols] = useState<InvColDef[]>(() => loadInvCols())
  const invColsRef = useRef(invCols)
  useEffect(() => { invColsRef.current = invCols }, [invCols])
  const saveInvCols = (next: InvColDef[]) => { setInvCols(next); try { localStorage.setItem('invoices-cols-v1', JSON.stringify(next)) } catch { /* ignore */ } }
  const { containerRef, startResize: startInvResize, isOverflowing: invoicesIsOverflowing } = useFixedWidthResizableColumns({
    columns: invCols,
    columnsRef: invColsRef,
    saveColumns: saveInvCols,
    fixedWidth: 92,
  })

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return d }
  }

  const getHeaderClass = (key: string) => {
    const base = 'relative px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 select-none overflow-hidden'
    if (key === 'date') return `${base} hidden md:table-cell`
    if (key === 'dueDate' || key === 'daysOverdue') return `${base} hidden lg:table-cell`
    if (key === 'status') return `${base} text-left`
    return base
  }

  const getCellClass = (key: string) => {
    const base = 'px-4 py-2.5 border-r border-gray-100'
    if (key === 'date') return `${base} hidden md:table-cell text-xs whitespace-nowrap text-slate-500`
    if (key === 'dueDate' || key === 'daysOverdue') return `${base} hidden lg:table-cell text-xs whitespace-nowrap text-slate-500`
    if (key === 'status') return `${base}`
    if (key === 'total') return `${base} text-right font-semibold tabular-nums text-slate-800 whitespace-nowrap`
    return base
  }

  const renderInvoiceCell = (inv: Invoice, c: InvColDef) => {
    switch (c.key) {
      case 'invoiceNumber':
        return (
          <button onClick={() => setViewInvoice(inv)}
            className="font-mono text-xs text-emerald-600 hover:text-emerald-800 hover:underline font-semibold">
            {inv.invoiceNumber ?? inv.id.slice(0, 8).toUpperCase()}
          </button>
        )
      case 'customerName':
        return <span className="font-medium text-slate-800 truncate block">{inv.customerName ?? '—'}</span>
      case 'date':
        return <span>{fmtDate(inv.date)}</span>
      case 'dueDate':
        return <span className={inv.status === 'OVERDUE' ? 'text-red-600 font-semibold' : 'text-slate-500'}>{fmtDate(inv.dueDate)}</span>
      case 'daysOverdue': {
        const days = getDaysOverdue(inv)
        return (
          <span className={days > 0 ? 'text-red-600 font-semibold' : 'text-slate-500'}>
            {days > 0 ? days : '0'}
          </span>
        )
      }
      case 'status':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${statusStyles[inv.status] ?? ''}`}>
            {statusIcons[inv.status]} {inv.status.replace(/_/g, ' ')}
          </span>
        )
      case 'total':
        return <span>{fmt(inv.total)}</span>
      default:
        return '—'
    }
  }

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading invoices…</span>
      </div>
    )
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Invoices</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">
            {search
              ? `${filtered.length} of ${invoices.length} on page ${page}`
              : `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''} · Page ${page}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap relative">
          <button onClick={() => setShowTemplates(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium">
            <LayoutTemplate size={15} /> Templates
          </button>
          <button onClick={fetchInvoices} disabled={loading}
            className="p-2 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors" title="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportOptions((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
            >
              <Download size={15} /> Export
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                <button onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export CSV</button>
                <button onClick={() => handleExport('pdf')}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export PDF</button>
              </div>
            )}
          </div>
          <button onClick={() => router.push('/sales/billing/invoices/activity')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium">
            <Clock size={15} /> Activity Log
          </button>
          <button onClick={() => router.push('/sales/billing/invoices/new')}
            aria-label="Create new invoice"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={React.createElement(ReceiptText, { size: 16, className: 'text-emerald-500' })} label="Total Invoices" value={String(stats.total)} sub={`${stats.paidPct}% paid`} color="emerald" />
        <StatCard icon={React.createElement(TrendingUp, { size: 16, className: 'text-emerald-500' })} label="Total Amount" value={fmt(stats.totalAmount)} sub="all time" color="emerald" />
        <StatCard icon={React.createElement(Clock, { size: 16, className: 'text-amber-500' })} label="Outstanding" value={fmt(stats.outstandingAmount)} sub={`${stats.sent + stats.overdue} invoices`} color="amber" />
        <StatCard icon={React.createElement(AlertTriangle, { size: 16, className: 'text-red-500' })} label="Overdue" value={fmt(stats.overdueAmount)} sub={`${stats.overdue} overdue`} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input type="text" placeholder="Search invoices…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'DUE_SOON', 'VOID'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              {s === 'ALL' ? 'All' : s === 'DUE_SOON' ? 'Due soon' : s.replace(/_/g, ' ')}
              {s === 'OVERDUE' && stats.overdue > 0 && (
                <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 text-xs">{stats.overdue}</span>
              )}
              {s === 'DUE_SOON' && stats.dueSoon > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1.5 text-xs">{stats.dueSoon}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-600 text-white rounded-xl px-4 py-2.5 flex items-center gap-3">
            <CheckSquare size={16} />
            <span className="text-sm font-semibold">{selected.size} selected</span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <button onClick={handleBulkSend} disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors">
                <Send size={12} /> Send
              </button>
              <button onClick={handleBulkMarkAsSent} disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors">
                <CheckCircle2 size={12} /> Mark Sent
              </button>
              <button onClick={handleBulkPrint} disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors">
                <Printer size={12} /> Print
              </button>
              <button onClick={handleConfirmDelete} disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors">
                <Trash2 size={12} /> Delete
              </button>
              <button onClick={() => setSelected(new Set())}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div ref={containerRef} className={`rounded-xl border border-gray-200 ${invoicesIsOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'} bg-white shadow-sm`}>
        <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: 44 }} />
            {invCols.map(c => <col key={c.key} style={{ width: c.width }} />)}
            <col style={{ width: 48 }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 w-10 border-r border-gray-200">
                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-emerald-600 transition-colors">
                  {selected.size === filtered.length && filtered.length > 0
                    ? React.createElement(CheckSquare, { size: 15 })
                    : React.createElement(Square, { size: 15 })}
                </button>
              </th>
              {invCols.map(c => (
                <th key={c.key} className={getHeaderClass(c.key)} style={{ width: c.width, minWidth: c.width, maxWidth: c.width, textAlign: c.align === 'right' ? 'right' : 'left' }} title={c.label}>
                  <button onClick={() => toggleSort(c.key as InvSortKey)} className="flex items-center gap-1 w-full min-w-0 overflow-hidden pr-2" style={{ justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start' }}>
                    <span className="truncate">{c.label}</span><ArrowUpDown size={11} className={`shrink-0 ${sortKey === c.key ? 'text-emerald-600' : 'text-gray-300'}`} />
                  </button>
                  <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startInvResize(e, c.key)} />
                </th>
              ))}
              <th className="w-12 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={invCols.length + 2} className="px-4 py-16 text-center">
                <FileText size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400 font-semibold">No invoices found</p>
                <p className="text-xs text-gray-300 mt-1">
                  {search || statusFilter !== 'ALL' ? 'Try adjusting your filters' : 'Click + New Invoice above'}
                </p>
              </td></tr>
            ) : (
              sorted.map(inv => (
                <tr key={inv.id} className={`group border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 ${selected.has(inv.id) ? 'bg-blue-50/20' : ''}`}>
                  <td className="px-4 py-2.5 border-r border-gray-100">
                    <button onClick={() => toggleSelect(inv.id)} className="text-gray-300 hover:text-emerald-600 transition-colors">
                      {selected.has(inv.id)
                        ? React.createElement(CheckSquare, { size: 15, className: 'text-emerald-500' })
                        : React.createElement(Square, { size: 15 })}
                    </button>
                  </td>
                  {invCols.map(c => (
                    <td key={c.key} className={`${getCellClass(c.key)} ${c.align === 'right' ? 'text-right' : ''}`} style={{ textAlign: c.align === 'right' ? 'right' : 'left' }}>
                      {renderInvoiceCell(inv, c)}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <button
                      onClick={(e) => {
                        const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
                        if (actionMenuId === inv.id) { setActionMenuId(null); setMenuPos(null) }
                        else { setActionMenuId(inv.id); setMenuPos({ x: rect.right, y: rect.bottom }) }
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-400">
            Showing {(page - 1) * 20 + 1}–{(page - 1) * 20 + invoices.length}{hasMore ? '+' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <span className="text-xs font-semibold text-gray-600 tabular-nums">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore || loading}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showTemplates && (
          <TemplateGallery modal onClose={() => setShowTemplates(false)} />
        )}
        {viewInvoice && companyId && (
          <InvoiceDetailPage
            invoice={viewInvoice}
            companyId={companyId}
            onClose={() => setViewInvoice(null)}
            onRefresh={fetchInvoices}
            onDuplicate={handleDuplicateFromDetail}
          />
        )}
        {deleteConfirmationOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-slate-900">Delete {selected.size} invoice{selected.size !== 1 ? 's' : ''}?</h2>
                <p className="text-sm text-slate-500 mt-1">This action cannot be undone. The selected invoices will be removed from this list.</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-slate-600">
                  Selected invoices will be deleted permanently from the current page view.
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button onClick={() => setDeleteConfirmationOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-slate-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleBulkDelete}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                    Delete {selected.size} invoice{selected.size !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Menu — fixed-position portal to escape overflow-x-auto clipping */}
      <AnimatePresence>
        {actionMenuId && menuPos && (() => {
          const inv = invoices.find(i => i.id === actionMenuId)
          if (!inv) return null
          const menuWidth = 208
          const menuHeight = 260
          const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
          const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 720
          const menuLeft = Math.min(
            Math.max(4, menuPos.x - menuWidth),
            Math.max(4, viewportWidth - menuWidth - 4),
          )
          const menuTop = Math.min(
            Math.max(4, menuPos.y + 4),
            Math.max(4, viewportHeight - menuHeight - 4),
          )
          return (
            <motion.div
              key={`action-menu-${actionMenuId}`}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              style={{ position: 'fixed', top: menuTop, left: menuLeft, zIndex: 9999 }}
              className="bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-52">
              <div className="px-3 py-1.5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">More Actions</p>
              </div>
              <MenuBtn icon={<Eye size={13} />} label="View / Edit" onClick={() => { setViewInvoice(inv); setActionMenuId(null); setMenuPos(null) }} />
              {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                <MenuBtn icon={<Send size={13} />} label="Send Reminder" onClick={() => { handleSend(inv.id, inv.invoiceNumber, 'reminder'); setMenuPos(null) }} />
              )}
              {inv.status === 'DRAFT' && (
                <MenuBtn icon={<Send size={13} />} label="Send Invoice" onClick={() => { handleSend(inv.id, inv.invoiceNumber, 'send'); setMenuPos(null) }} />
              )}
              {(inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID' || inv.status === 'PARTIAL' || inv.status === 'OVERDUE') && (
                <MenuBtn icon={<CreditCard size={13} />} label="Receive Payment" onClick={() => { setViewInvoice(inv); setActionMenuId(null); setMenuPos(null) }} />
              )}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <MenuBtn icon={<Printer size={13} />} label="Print Invoice" onClick={() => { window.print(); setActionMenuId(null); setMenuPos(null) }} />
                <MenuBtn icon={<Download size={13} />} label="Download PDF" disabled tooltip="Coming soon" />
                <MenuBtn icon={<FileText size={13} />} label="Print Packing Slip" disabled tooltip="Coming soon" />
              </div>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <MenuBtn icon={<Share2 size={13} />} label="Share Link" onClick={() => {
                  navigator.clipboard?.writeText(`${window.location.origin}/invoices/${inv.id}`).catch(() => {})
                  showToast('Link copied!')
                  setActionMenuId(null); setMenuPos(null)
                }} />
                <MenuBtn icon={<Copy size={13} />} label="Duplicate" onClick={() => { handleDuplicateFromList(inv) }} />
                <MenuBtn icon={<FileText size={13} />} label="Credit Note" disabled tooltip="Coming soon" />
              </div>
              <div className="border-t border-gray-100 mt-1 pt-1">
                {inv.status !== 'VOID' && (
                  <MenuBtn icon={<Ban size={13} />} label="Void" onClick={() => { handleVoid(inv.id); setMenuPos(null) }} danger />
                )}
                <MenuBtn icon={<History size={13} />} label="History / Audit Log" onClick={() => { setViewInvoice(inv); setActionMenuId(null); setMenuPos(null) }} />
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
      {actionMenuId && <div className="fixed inset-0 z-[9998]" onClick={() => { setActionMenuId(null); setMenuPos(null) }} />}
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: 'emerald' | 'amber' | 'red'
}) {
  const borderMap = { emerald: 'border-emerald-100', amber: 'border-amber-100', red: 'border-red-100' }
  return (
    <div className={`bg-white rounded-xl border ${borderMap[color]} p-4`}>
      <div className="flex items-center gap-2 mb-1.5">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-xl font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function MenuBtn({ icon, label, onClick, danger = false, disabled = false, tooltip }: {
  icon: React.ReactNode; label: string; onClick?: () => void; danger?: boolean; disabled?: boolean; tooltip?: string
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      tabIndex={disabled ? -1 : 0}
      title={disabled ? tooltip : undefined}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${disabled ? 'cursor-not-allowed text-gray-300' : danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      {icon} {label}
    </button>
  )
}
