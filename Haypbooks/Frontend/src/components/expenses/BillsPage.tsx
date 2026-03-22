'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Eye, X, AlertCircle, Loader2, FileText, Check, Ban } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface Bill {
  id: string; billNumber?: string; vendorId?: string; vendorName?: string; date: string; dueDate: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PARTIALLY_PAID' | 'PAID' | 'VOIDED'; total: number; amountDue?: number
  items?: { description: string; quantity: number; unitPrice: number; amount: number }[]
}

interface Vendor { id: string; name: string }

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-50 text-gray-700 border-gray-200', PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-blue-50 text-blue-700 border-blue-200', PARTIALLY_PAID: 'bg-orange-50 text-orange-700 border-orange-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200', VOIDED: 'bg-gray-50 text-gray-500 border-gray-200',
}

export default function BillsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [viewBill, setViewBill] = useState<Bill | null>(null)

  const fetchBills = useCallback(async () => {
    if (!companyId) return; setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/bills`)
      setBills(Array.isArray(data) ? data : data.bills ?? []); setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load bills') }
    finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchBills() }, [fetchBills])

  const filtered = useMemo(() => {
    let list = bills
    if (statusFilter !== 'ALL') list = list.filter(b => b.status === statusFilter)
    if (search) { const q = search.toLowerCase(); list = list.filter(b => (b.billNumber ?? '').toLowerCase().includes(q) || (b.vendorName ?? '').toLowerCase().includes(q)) }
    return list
  }, [bills, search, statusFilter])

  const handleApprove = async (id: string) => {
    if (!companyId) return
    try { await apiClient.post(`/companies/${companyId}/bills/${id}/approve`); fetchBills() }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to approve') }
  }

  const handleVoid = async (id: string) => {
    if (!companyId) return
    try { await apiClient.post(`/companies/${companyId}/bills/${id}/void`); fetchBills() }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to void') }
  }

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

  if (cidLoading || (loading && bills.length === 0)) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading bills…</span></div>
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-emerald-900">Bills</h1><p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} bills</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"><Plus size={16} /> New Bill</button>
      </div>

      <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input type="text" placeholder="Search bills…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
          <option value="ALL">All Status</option><option value="DRAFT">Draft</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="PAID">Paid</option><option value="VOIDED">Voided</option>
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={16} /> {error} <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button></div>}

      <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50/50 border-b border-emerald-100">
            <th className="text-left px-4 py-3 font-medium text-emerald-700">Bill #</th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700">Vendor</th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden md:table-cell">Date</th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700">Status</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700">Total</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700 w-28">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-emerald-400"><FileText size={24} className="mx-auto mb-2 opacity-50" />No bills found.</td></tr>
            ) : (
              filtered.map(bill => (
                <tr key={bill.id} className="border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-emerald-600">{bill.billNumber ?? bill.id.slice(0, 8)}</td>
                  <td className="px-4 py-2.5 font-medium text-emerald-900">{bill.vendorName ?? '—'}</td>
                  <td className="px-4 py-2.5 text-emerald-600/70 hidden md:table-cell">{fmtDate(bill.date)}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusStyles[bill.status] ?? ''}`}>{bill.status.replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-emerald-800">{fmt(bill.total)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewBill(bill)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600"><Eye size={14} /></button>
                      {(bill.status === 'DRAFT' || bill.status === 'PENDING') && <button onClick={() => handleApprove(bill.id)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600" title="Approve"><Check size={14} /></button>}
                      {bill.status !== 'VOIDED' && bill.status !== 'PAID' && <button onClick={() => handleVoid(bill.id)} className="p-1 rounded hover:bg-red-100 text-red-400" title="Void"><Ban size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {viewBill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setViewBill(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <div className="flex justify-between mb-4"><h2 className="text-lg font-bold text-emerald-900">Bill #{viewBill.billNumber ?? viewBill.id.slice(0, 8)}</h2><button onClick={() => setViewBill(null)} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button></div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><span className="text-emerald-600/60">Vendor:</span> <span className="font-medium">{viewBill.vendorName}</span></div>
                <div><span className="text-emerald-600/60">Status:</span> <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusStyles[viewBill.status]}`}>{viewBill.status}</span></div>
                <div><span className="text-emerald-600/60">Date:</span> {viewBill.date}</div><div><span className="text-emerald-600/60">Due:</span> {viewBill.dueDate}</div>
              </div>
              <p className="text-2xl font-bold text-emerald-800 text-center">{fmt(viewBill.total)}</p>
            </motion.div>
          </motion.div>
        )}
        {showForm && <BillFormModal companyId={companyId!} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchBills() }} />}
      </AnimatePresence>
    </div>
  )
}

function BillFormModal({ companyId, onClose, onSaved }: { companyId: string; onClose: () => void; onSaved: () => void }) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorId, setVendorId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0] })
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get(`/companies/${companyId}/vendors`).then(({ data }) => setVendors(Array.isArray(data) ? data : data.vendors ?? [])).catch(() => {})
  }, [companyId])

  const addItem = () => setItems(p => [...p, { description: '', quantity: 1, unitPrice: 0 }])
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i))
  const updateItem = (i: number, f: string, v: any) => setItems(p => p.map((item, idx) => idx === i ? { ...item, [f]: v } : item))
  const { currency } = useCompanyCurrency()
  const total = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unitPrice)), 0)
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const handleSave = async () => {
    if (!vendorId) { setError('Select a vendor.'); return }
    const validItems = items.filter(it => it.description.trim())
    if (validItems.length === 0) { setError('Add at least one item.'); return }
    setSaving(true); setError('')
    try {
      await apiClient.post(`/companies/${companyId}/ap/bills`, {
        vendorId, date, dueDate,
        items: validItems.map(it => ({ description: it.description, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice), amount: Number(it.quantity) * Number(it.unitPrice) })),
      })
      onSaved()
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to create bill') }
    finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-emerald-900">New Bill</h2><button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button></div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700"><AlertCircle size={14} className="inline mr-1" />{error}</div>}
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-emerald-700 mb-1">Vendor *</label><select value={vendorId} onChange={e => setVendorId(e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"><option value="">Select…</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-emerald-700 mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
            <div><label className="block text-xs font-medium text-emerald-700 mb-1">Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
          </div>
          <div className="border border-emerald-100 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-emerald-50/50"><th className="text-left px-3 py-2 text-emerald-700">Description</th><th className="text-right px-3 py-2 text-emerald-700 w-20">Qty</th><th className="text-right px-3 py-2 text-emerald-700 w-28">Price</th><th className="text-right px-3 py-2 text-emerald-700 w-28">Amount</th><th className="w-8"></th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-emerald-50">
                    <td className="px-3 py-1.5"><input value={it.description} onChange={e => updateItem(i, 'description', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-emerald-100 rounded" placeholder="Item" /></td>
                    <td className="px-3 py-1.5"><input type="number" min="1" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="w-full px-2 py-1.5 text-sm text-right border border-emerald-100 rounded" /></td>
                    <td className="px-3 py-1.5"><input type="number" min="0" step="0.01" value={it.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} className="w-full px-2 py-1.5 text-sm text-right border border-emerald-100 rounded" /></td>
                    <td className="px-3 py-1.5 text-right font-semibold text-emerald-800">{fmt(Number(it.quantity) * Number(it.unitPrice))}</td>
                    <td className="px-1">{items.length > 1 && <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-red-100 text-red-400"><X size={14} /></button>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="border-t-2 border-emerald-200"><td className="px-3 py-2"><button onClick={addItem} className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><Plus size={12} /> Add Item</button></td><td colSpan={2} className="px-3 py-2 text-right font-bold text-emerald-700">Total:</td><td className="px-3 py-2 text-right font-bold text-emerald-800">{fmt(total)}</td><td></td></tr></tfoot>
            </table>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5">{saving && <Loader2 size={14} className="animate-spin" />} Create Bill</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
