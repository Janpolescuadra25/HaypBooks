'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, X, AlertCircle, Loader2, CreditCard, Ban } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface BillPayment {
  id: string; paymentNumber?: string; vendorId?: string; vendorName?: string; billId?: string; billNumber?: string
  date: string; amount: number; method?: string; reference?: string; status?: string
}
interface Bill { id: string; billNumber?: string; vendorName?: string; total: number; amountDue?: number; status: string }

export default function BillPaymentsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [payments, setPayments] = useState<BillPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const fetchPayments = useCallback(async () => {
    if (!companyId) return; setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ap/bill-payments`)
      setPayments(Array.isArray(data) ? data : data.payments ?? []); setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load payments') }
    finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const filtered = useMemo(() => {
    if (!search) return payments
    const q = search.toLowerCase()
    return payments.filter(p => (p.vendorName ?? '').toLowerCase().includes(q) || (p.paymentNumber ?? '').toLowerCase().includes(q) || (p.reference ?? '').toLowerCase().includes(q))
  }, [payments, search])

  const handleVoid = async (id: string) => {
    if (!companyId) return
    try { await apiClient.post(`/companies/${companyId}/ap/bill-payments/${id}/void`); fetchPayments() }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to void') }
  }

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

  if (cidLoading || (loading && payments.length === 0))
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading…</span></div>
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-emerald-900">Bill Payments</h1><p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} payments</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"><Plus size={16} /> Record Payment</button>
      </div>

      <div className="bg-white rounded-xl border border-emerald-100 p-3"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
        <input type="text" placeholder="Search payments…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div></div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={16} /> {error} <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button></div>}

      <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50/50 border-b border-emerald-100">
            <th className="text-left px-4 py-3 font-medium text-emerald-700">Payment #</th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700">Vendor</th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden md:table-cell">Date</th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden lg:table-cell">Method</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700">Amount</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700 w-20">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-emerald-400"><CreditCard size={24} className="mx-auto mb-2 opacity-50" />No payments found.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-emerald-600">{p.paymentNumber ?? p.id.slice(0, 8)}</td>
                <td className="px-4 py-2.5 font-medium text-emerald-900">{p.vendorName ?? '—'}</td>
                <td className="px-4 py-2.5 text-emerald-600/70 hidden md:table-cell">{fmtDate(p.date)}</td>
                <td className="px-4 py-2.5 text-emerald-600/70 hidden lg:table-cell">{p.method ?? 'N/A'}</td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-emerald-800">{fmt(p.amount)}</td>
                <td className="px-4 py-2.5 text-right">
                  {p.status !== 'VOIDED' && <button onClick={() => handleVoid(p.id)} className="p-1 rounded hover:bg-red-100 text-red-400" title="Void"><Ban size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showForm && <BillPaymentFormModal companyId={companyId!} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchPayments() }} />}
      </AnimatePresence>
    </div>
  )
}

function BillPaymentFormModal({ companyId, onClose, onSaved }: { companyId: string; onClose: () => void; onSaved: () => void }) {
  const [bills, setBills] = useState<Bill[]>([])
  const [billId, setBillId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [method, setMethod] = useState('BANK_TRANSFER')
  const [reference, setReference] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get(`/companies/${companyId}/ap/bills`).then(({ data }) => {
      const all = Array.isArray(data) ? data : data.bills ?? []
      setBills(all.filter((b: Bill) => ['APPROVED', 'PARTIALLY_PAID', 'PENDING'].includes(b.status)))
    }).catch(() => {})
  }, [companyId])

  const selectedBill = bills.find(b => b.id === billId)

  const handleSave = async () => {
    if (!billId) { setError('Select a bill.'); return }
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount.'); return }
    setSaving(true); setError('')
    try {
      await apiClient.post(`/companies/${companyId}/ap/bill-payments`, { billId, amount: Number(amount), date, method, reference })
      onSaved()
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to record payment') }
    finally { setSaving(false) }
  }

  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between"><h2 className="text-lg font-bold text-emerald-900">Record Bill Payment</h2><button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button></div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">{error}</div>}
          <div><label className="block text-xs font-medium text-emerald-700 mb-1">Bill *</label>
            <select value={billId} onChange={e => { setBillId(e.target.value); const b = bills.find(b => b.id === e.target.value); if (b) setAmount(String(b.amountDue ?? b.total)) }} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="">Select a bill…</option>{bills.map(b => <option key={b.id} value={b.id}>{b.billNumber ?? b.id.slice(0, 8)} — {b.vendorName} ({fmt(b.amountDue ?? b.total)})</option>)}
            </select>
            {selectedBill && <p className="text-xs text-emerald-500 mt-1">Due: {fmt(selectedBill.amountDue ?? selectedBill.total)}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-emerald-700 mb-1">Amount *</label><input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
            <div><label className="block text-xs font-medium text-emerald-700 mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-emerald-700 mb-1">Method</label><select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"><option value="CASH">Cash</option><option value="CHECK">Check</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="CREDIT_CARD">Credit Card</option></select></div>
            <div><label className="block text-xs font-medium text-emerald-700 mb-1">Reference</label><input value={reference} onChange={e => setReference(e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="Ref #" /></div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5">{saving && <Loader2 size={14} className="animate-spin" />} Record Payment</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
