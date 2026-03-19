'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Search, Eye, X, AlertCircle, Loader2, FileText, Send, Ban, DollarSign
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface Invoice {
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

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
  accountId?: string
}

interface Customer { id: string; name: string }

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-50 text-gray-700 border-gray-200',
  SENT: 'bg-blue-50 text-blue-700 border-blue-200',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200',
  VOIDED: 'bg-gray-50 text-gray-500 border-gray-200',
}

export default function InvoicesPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  const fetchInvoices = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/invoices`)
      setInvoices(Array.isArray(data) ? data : data.invoices ?? [])
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

  const handleSend = async (id: string) => {
    if (!companyId) return
    try { await apiClient.post(`/companies/${companyId}/ar/invoices/${id}/send`); fetchInvoices() }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to send') }
  }

  const handleVoid = async (id: string) => {
    if (!companyId) return
    try { await apiClient.post(`/companies/${companyId}/ar/invoices/${id}/void`); fetchInvoices() }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to void') }
  }

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return d
    }
  }

  if (cidLoading || (loading && invoices.length === 0)) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading invoices…</span></div>
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Invoices</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} invoices</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input type="text" placeholder="Search invoices…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="VOIDED">Voided</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error} <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-emerald-50/50 border-b border-emerald-100">
              <th className="text-left px-4 py-3 font-medium text-emerald-700">Invoice #</th>
              <th className="text-left px-4 py-3 font-medium text-emerald-700">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden lg:table-cell">Due Date</th>
              <th className="text-left px-4 py-3 font-medium text-emerald-700">Status</th>
              <th className="text-right px-4 py-3 font-medium text-emerald-700">Total</th>
              <th className="text-right px-4 py-3 font-medium text-emerald-700 w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-emerald-400">
                <FileText size={24} className="mx-auto mb-2 opacity-50" />No invoices found.
              </td></tr>
            ) : (
              filtered.map(inv => (
                <tr key={inv.id} className="border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-emerald-600">{inv.invoiceNumber ?? inv.id.slice(0, 8)}</td>
                  <td className="px-4 py-2.5 font-medium text-emerald-900">{inv.customerName ?? '—'}</td>
                  <td className="px-4 py-2.5 text-emerald-600/70 hidden md:table-cell">{fmtDate(inv.date)}</td>
                  <td className="px-4 py-2.5 text-emerald-600/70 hidden lg:table-cell">{fmtDate(inv.dueDate)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusStyles[inv.status] ?? ''}`}>
                      {inv.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-emerald-800">{fmt(inv.total)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewInvoice(inv)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600" title="View"><Eye size={14} /></button>
                      {inv.status === 'DRAFT' && (
                        <button onClick={() => handleSend(inv.id)} className="p-1 rounded hover:bg-blue-100 text-blue-500" title="Send"><Send size={14} /></button>
                      )}
                      {(inv.status === 'DRAFT' || inv.status === 'SENT') && (
                        <button onClick={() => handleVoid(inv.id)} className="p-1 rounded hover:bg-red-100 text-red-400" title="Void"><Ban size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
        {showForm && <InvoiceFormModal companyId={companyId!} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchInvoices() }} />}
      </AnimatePresence>
    </div>
  )
}

function InvoiceDetailModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-900">Invoice #{invoice.invoiceNumber ?? invoice.id.slice(0, 8)}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-emerald-600/60">Customer:</span> <span className="font-medium text-emerald-900">{invoice.customerName ?? '—'}</span></div>
            <div><span className="text-emerald-600/60">Status:</span> <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusStyles[invoice.status]}`}>{invoice.status}</span></div>
            <div><span className="text-emerald-600/60">Date:</span> {invoice.date}</div>
            <div><span className="text-emerald-600/60">Due:</span> {invoice.dueDate}</div>
          </div>
          {invoice.items && invoice.items.length > 0 && (
            <table className="w-full text-sm mt-4">
              <thead><tr className="border-b border-emerald-100"><th className="text-left py-2">Description</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Price</th><th className="text-right py-2">Amount</th></tr></thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-t border-emerald-50"><td className="py-1.5">{item.description}</td><td className="py-1.5 text-right">{item.quantity}</td><td className="py-1.5 text-right">{fmt(item.unitPrice)}</td><td className="py-1.5 text-right font-semibold">{fmt(item.amount)}</td></tr>
                ))}
              </tbody>
              <tfoot><tr className="border-t-2 border-emerald-200 font-bold"><td colSpan={3} className="py-2">Total</td><td className="py-2 text-right">{fmt(invoice.total)}</td></tr></tfoot>
            </table>
          )}
          {(!invoice.items || invoice.items.length === 0) && (
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-emerald-800">{fmt(invoice.total)}</p>
              <p className="text-xs text-emerald-500 mt-1">Amount Due: {fmt(invoice.amountDue ?? invoice.total)}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function InvoiceFormModal({ companyId, onClose, onSaved }: { companyId: string; onClose: () => void; onSaved: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]
  })
  const [memo, setMemo] = useState('')
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get(`/companies/${companyId}/ar/customers`).then(({ data }) => setCustomers(Array.isArray(data) ? data : data.customers ?? [])).catch(() => {})
  }, [companyId])

  const addItem = () => setItems(p => [...p, { description: '', quantity: 1, unitPrice: 0 }])
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i))
  const updateItem = (i: number, f: string, v: any) => setItems(p => p.map((item, idx) => idx === i ? { ...item, [f]: v } : item))

  const total = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unitPrice)), 0)
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const handleSave = async () => {
    if (!customerId) { setError('Select a customer.'); return }
    const validItems = items.filter(it => it.description.trim())
    if (validItems.length === 0) { setError('Add at least one item.'); return }
    setSaving(true); setError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/invoices`, {
        customerId, date, dueDate, memo,
        items: validItems.map(it => ({ description: it.description, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice), amount: Number(it.quantity) * Number(it.unitPrice) })),
      })
      onSaved()
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to create invoice') }
    finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-emerald-900">New Invoice</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Customer *</label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="">Select…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Memo</label>
            <input value={memo} onChange={e => setMemo(e.target.value)} placeholder="Optional"
              className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="border border-emerald-100 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-emerald-50/50"><th className="text-left px-3 py-2 text-emerald-700">Description</th><th className="text-right px-3 py-2 text-emerald-700 w-20">Qty</th><th className="text-right px-3 py-2 text-emerald-700 w-28">Price</th><th className="text-right px-3 py-2 text-emerald-700 w-28">Amount</th><th className="w-8"></th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-emerald-50">
                    <td className="px-3 py-1.5"><input value={it.description} onChange={e => updateItem(i, 'description', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-emerald-100 rounded" placeholder="Item description" /></td>
                    <td className="px-3 py-1.5"><input type="number" min="1" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="w-full px-2 py-1.5 text-sm text-right border border-emerald-100 rounded" /></td>
                    <td className="px-3 py-1.5"><input type="number" min="0" step="0.01" value={it.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} className="w-full px-2 py-1.5 text-sm text-right border border-emerald-100 rounded" /></td>
                    <td className="px-3 py-1.5 text-right font-semibold text-emerald-800">{fmt(Number(it.quantity) * Number(it.unitPrice))}</td>
                    <td className="px-1">{items.length > 1 && <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-red-100 text-red-400"><X size={14} /></button>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-emerald-200">
                  <td className="px-3 py-2"><button onClick={addItem} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"><Plus size={12} /> Add Item</button></td>
                  <td colSpan={2} className="px-3 py-2 text-right font-bold text-emerald-700">Total:</td>
                  <td className="px-3 py-2 text-right font-bold text-emerald-800">{fmt(total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />} Create Invoice
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
