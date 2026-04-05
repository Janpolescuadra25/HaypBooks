'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Search, Eye, X, AlertCircle, Loader2, FileText, Send, Ban,
  ReceiptText, Clock, CheckCircle2, TrendingUp, MoreVertical, Copy,
  Trash2, RefreshCw, ChevronDown, LayoutTemplate, Filter, SlidersHorizontal,
  Download, CheckSquare, Square, AlertTriangle, DollarSign, Printer,
  Share2, CreditCard, History, ExternalLink,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import InvoiceDetailPage from './InvoiceDetailPage'
import TemplateGallery from './invoice-templates/TemplateGallery'

export interface Invoice {
  id: string
  invoiceNumber?: string
  customerId?: string
  customerName?: string
  date: string
  dueDate: string
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOIDED'
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
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200',
  VOIDED: 'bg-gray-50 text-gray-500 border-gray-200',
}

const statusIcons: Record<string, React.ReactNode> = {
  DRAFT: React.createElement(Clock, { size: 11 }),
  SENT: React.createElement(Send, { size: 11 }),
  PARTIALLY_PAID: React.createElement(DollarSign, { size: 11 }),
  PAID: React.createElement(CheckCircle2, { size: 11 }),
  OVERDUE: React.createElement(AlertTriangle, { size: 11 }),
  VOIDED: React.createElement(Ban, { size: 11 }),
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

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchInvoices = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/invoices`)
      setInvoices(Array.isArray(data) ? data : data.items ?? data.invoices ?? [])
      setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load invoices') }
    finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const filtered = useMemo(() => {
    let list = invoices
    if (statusFilter !== 'ALL') list = list.filter(i => i.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        (i.invoiceNumber ?? '').toLowerCase().includes(q) ||
        (i.customerName ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [invoices, search, statusFilter])

  const stats = useMemo(() => ({
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'DRAFT').length,
    sent: invoices.filter(i => i.status === 'SENT').length,
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    totalAmount: invoices.reduce((s, i) => s + (i.total || 0), 0),
    overdueAmount: invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + (i.amountDue || i.total || 0), 0),
    outstandingAmount: invoices
      .filter(i => ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status))
      .reduce((s, i) => s + (i.amountDue || i.total || 0), 0),
    paidPct: invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'PAID').length / invoices.length) * 100) : 0,
  }), [invoices])

  const handleSend = async (id: string) => {
    if (!companyId) return
    try { await apiClient.post(`/companies/${companyId}/ar/invoices/${id}/send`); fetchInvoices() }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to send') }
    setActionMenuId(null)
  }

  const handleVoid = async (id: string) => {
    if (!companyId || !confirm('Void this invoice?')) return
    try { await apiClient.post(`/companies/${companyId}/ar/invoices/${id}/void`); fetchInvoices() }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to void') }
    setActionMenuId(null)
  }

  const handleBulkAction = async (action: 'send' | 'void') => {
    if (!companyId || selected.size === 0) return
    if (!confirm(`${action === 'send' ? 'Send' : 'Void'} ${selected.size} invoice(s)?`)) return
    setBulkLoading(true)
    const ids = Array.from(selected)
    await Promise.allSettled(ids.map(id =>
      apiClient.post(`/companies/${companyId}/ar/invoices/${id}/${action}`)
    ))
    setSelected(new Set())
    setBulkLoading(false)
    fetchInvoices()
  }

  const toggleSelect = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleSelectAll = () => setSelected(p => p.size === filtered.length ? new Set() : new Set(filtered.map(i => i.id)))

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return d }
  }

  if (cidLoading || (loading && invoices.length === 0)) {
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
          <p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} of {invoices.length} invoices</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowTemplates(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-medium">
            <LayoutTemplate size={15} /> Templates
          </button>
          <button onClick={fetchInvoices} disabled={loading}
            className="p-2 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors" title="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => router.push('/sales/billing/invoices/new')}
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
          {['ALL', 'DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOIDED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
              {s === 'OVERDUE' && stats.overdue > 0 && (
                <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 text-xs">{stats.overdue}</span>
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
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => handleBulkAction('send')} disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors">
                <Send size={12} /> Send All
              </button>
              <button onClick={() => handleBulkAction('void')} disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors">
                <Ban size={12} /> Void All
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
      <div className="rounded-xl border border-gray-200 overflow-x-auto bg-white shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 w-10 border-r border-gray-200">
                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-emerald-600 transition-colors">
                  {selected.size === filtered.length && filtered.length > 0
                    ? React.createElement(CheckSquare, { size: 15 })
                    : React.createElement(Square, { size: 15 })}
                </button>
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 whitespace-nowrap">Invoice #</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200">Customer</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 hidden md:table-cell whitespace-nowrap">Date</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 hidden lg:table-cell whitespace-nowrap">Due Date</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200">Status</th>
              <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 whitespace-nowrap">Total</th>
              <th className="w-12 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-16 text-center">
                <FileText size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400 font-semibold">No invoices found</p>
                <p className="text-xs text-gray-300 mt-1">
                  {search || statusFilter !== 'ALL' ? 'Try adjusting your filters' : 'Click + New Invoice above'}
                </p>
              </td></tr>
            ) : (
              filtered.map(inv => (
                <tr key={inv.id} className={`group border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${selected.has(inv.id) ? 'bg-blue-50/20' : ''}`}>
                  <td className="px-4 py-2.5 border-r border-gray-100">
                    <button onClick={() => toggleSelect(inv.id)} className="text-gray-300 hover:text-emerald-600 transition-colors">
                      {selected.has(inv.id)
                        ? React.createElement(CheckSquare, { size: 15, className: 'text-emerald-500' })
                        : React.createElement(Square, { size: 15 })}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 border-r border-gray-100">
                    <button onClick={() => setViewInvoice(inv)}
                      className="font-mono text-xs text-emerald-600 hover:text-emerald-800 hover:underline font-semibold">
                      {inv.invoiceNumber ?? inv.id.slice(0, 8).toUpperCase()}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 border-r border-gray-100">
                    <span className="font-medium text-slate-800 max-w-[160px] truncate block">{inv.customerName ?? '—'}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell border-r border-gray-100 text-xs whitespace-nowrap">{fmtDate(inv.date)}</td>
                  <td className="px-4 py-2.5 hidden lg:table-cell border-r border-gray-100 text-xs whitespace-nowrap">
                    <span className={inv.status === 'OVERDUE' ? 'text-red-600 font-semibold' : 'text-slate-500'}>
                      {fmtDate(inv.dueDate)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 border-r border-gray-100">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${statusStyles[inv.status] ?? ''}`}>
                      {statusIcons[inv.status]} {inv.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-800 border-r border-gray-100 whitespace-nowrap">{fmt(inv.total)}</td>
                  <td className="px-4 py-2.5 relative">
                    <button onClick={() => setActionMenuId(prev => prev === inv.id ? null : inv.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                      {actionMenuId === inv.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          className="absolute right-2 top-full z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-52 mt-1">
                          <div className="px-3 py-1.5 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">More Actions</p>
                          </div>
                          <MenuBtn icon={<Eye size={13} />} label="View / Edit" onClick={() => { setViewInvoice(inv); setActionMenuId(null) }} />
                          {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                            <MenuBtn icon={<Send size={13} />} label="Send Reminder" onClick={() => { handleSend(inv.id); showToast('Reminder sent') }} />
                          )}
                          {inv.status === 'DRAFT' && (
                            <MenuBtn icon={<Send size={13} />} label="Send Invoice" onClick={() => handleSend(inv.id)} />
                          )}
                          {(inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID' || inv.status === 'OVERDUE') && (
                            <MenuBtn icon={<CreditCard size={13} />} label="Receive Payment" onClick={() => { setViewInvoice(inv); setActionMenuId(null) }} />
                          )}
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <MenuBtn icon={<Printer size={13} />} label="Print Invoice" onClick={() => { window.print(); setActionMenuId(null) }} />
                            <MenuBtn icon={<Download size={13} />} label="Download PDF" onClick={() => { showToast('PDF export coming soon'); setActionMenuId(null) }} />
                            <MenuBtn icon={<FileText size={13} />} label="Print Packing Slip" onClick={() => { showToast('Packing slip coming soon'); setActionMenuId(null) }} />
                          </div>
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <MenuBtn icon={<Share2 size={13} />} label="Share Link" onClick={() => {
                              navigator.clipboard?.writeText(`${window.location.origin}/invoices/${inv.id}`).catch(() => {})
                              showToast('Link copied!')
                              setActionMenuId(null)
                            }} />
                            <MenuBtn icon={<Copy size={13} />} label="Duplicate" onClick={() => { showToast('Duplicate coming soon'); setActionMenuId(null) }} />
                            <MenuBtn icon={<FileText size={13} />} label="Credit Note" onClick={() => { showToast('Credit note coming soon'); setActionMenuId(null) }} />
                          </div>
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            {(inv.status === 'DRAFT' || inv.status === 'SENT') && (
                              <MenuBtn icon={<Ban size={13} />} label="Void" onClick={() => handleVoid(inv.id)} danger />
                            )}
                            <MenuBtn icon={<History size={13} />} label="History / Audit Log" onClick={() => { setViewInvoice(inv); setActionMenuId(null) }} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
          />
        )}
      </AnimatePresence>

      {actionMenuId && <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />}
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

function MenuBtn({ icon, label, onClick, danger = false }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}>
      {icon} {label}
    </button>
  )
}
