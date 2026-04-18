'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, X, AlertCircle, Loader2, CreditCard, Ban } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'
import ColumnResizer from '@/components/ColumnResizer'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ui/Toast'

interface BillPayment {
  id: string; paymentNumber?: string; vendorId?: string; vendorName?: string; billId?: string; billNumber?: string
  date: string; amount: number; method?: string; reference?: string; status?: string
}
interface Bill { id: string; billNumber?: string; vendorName?: string; total: number; amountDue?: number; status: string }
interface PaymentCol { key: string; label: string; width: number; align?: 'left' | 'right' }
const PAYMENT_COLS: PaymentCol[] = [
  { key: 'paymentNumber', label: 'Payment #', width: 120, align: 'left' },
  { key: 'vendorName', label: 'Vendor', width: 180, align: 'left' },
  { key: 'date', label: 'Date', width: 120, align: 'left' },
  { key: 'method', label: 'Method', width: 140, align: 'left' },
  { key: 'amount', label: 'Amount', width: 120, align: 'right' },
  { key: 'actions', label: 'Actions', width: 96, align: 'right' },
]

export default function BillPaymentsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [payments, setPayments] = useState<BillPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cols, setCols] = useState<PaymentCol[]>(() => PAYMENT_COLS)
  const colsRef = useRef(cols)
  const { containerRef, startResize: onResizeStart, isOverflowing: paymentsIsOverflowing } = useFixedWidthResizableColumns({
    columns: cols,
    columnsRef: colsRef,
    saveColumns: (next) => setCols(next),
    fixedWidth: 80,
  })
  useEffect(() => { colsRef.current = cols }, [cols])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const fetchPayments = useCallback(async () => {
    if (!companyId) return; setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/bill-payments`)
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
    try {
      await apiClient.post(`/companies/${companyId}/bill-payments/${id}/void`)
      setPayments((prev) => prev.filter((payment) => payment.id !== id))
      toast.success('Payment voided')
    } catch (e: any) {
      const message = e?.response?.data?.message ?? 'Failed to void'
      setError(message)
      toast.error(message)
    }
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

      <div ref={containerRef} className={`bg-white rounded-xl border border-emerald-100 ${paymentsIsOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}`}>
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead><tr className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider">
            {cols.map((col, index) => (
              <th
                key={col.key}
                style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                className={`px-4 py-3 border-r border-slate-200 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                <div className="relative flex items-center justify-between gap-2">
                  <span>{col.label}</span>
                  {index < cols.length - 1 && (
                    <ColumnResizer
                      colKey={col.key}
                      width={col.width}
                      onChange={(_, next) => setCols(prev => prev.map(c => c.key === col.key ? { ...c, width: next } : c))}
                      min={80}
                    />
                  )}
                </div>
              </th>
            ))}
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
  const [billHistory, setBillHistory] = useState<BillPayment[]>([])

  useEffect(() => {
    apiClient.get(`/companies/${companyId}/bills`).then(({ data }) => {
      const all = Array.isArray(data) ? data : data.bills ?? []
      setBills(all.filter((b: Bill) => ['APPROVED', 'PARTIALLY_PAID', 'PENDING'].includes(b.status)))
    }).catch(() => {})
  }, [companyId])

  useEffect(() => {
    if (!companyId || !billId) {
      setBillHistory([])
      return
    }
    apiClient.get(`/companies/${companyId}/bill-payments`, { params: { billId } })
      .then(({ data }) => setBillHistory(Array.isArray(data) ? data : data.payments ?? []))
      .catch(() => setBillHistory([]))
  }, [companyId, billId])

  const selectedBill = bills.find(b => b.id === billId)
  const remainingBalance = selectedBill ? Number(selectedBill.amountDue ?? selectedBill.total) - Number(amount || 0) : 0
  const paymentStatus = selectedBill ? (remainingBalance <= 0 ? 'Paid' : remainingBalance < (selectedBill.amountDue ?? selectedBill.total) ? 'Partial' : 'Open') : 'Open'

  const handleSave = async () => {
    if (!billId) { setError('Select a bill.'); return }
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount.'); return }
    if (selectedBill && Number(amount) > Number(selectedBill.amountDue ?? selectedBill.total)) { setError('Amount cannot exceed balance due.'); return }
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Record Bill Payment</h2>
          <button onClick={onClose} className="p-2 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {selectedBill && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Balance Due</p>
                  <p className="text-xl font-semibold text-slate-900">{fmt(selectedBill.amountDue ?? selectedBill.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Remaining</p>
                  <p className={`text-xl font-semibold ${remainingBalance <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{fmt(Math.max(0, remainingBalance))}</p>
                </div>
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                    {paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedBill && billHistory.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Payment History</p>
                  <p className="text-sm text-slate-500">Total paid so far: {fmt(billHistory.reduce((sum, payment) => sum + payment.amount, 0))}</p>
                </div>
                <div className="text-sm text-slate-500">Remaining: {fmt(Math.max(0, (selectedBill.amountDue ?? selectedBill.total) - billHistory.reduce((sum, payment) => sum + payment.amount, 0)))}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold">
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Ref #</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-left">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billHistory.map(payment => (
                      <tr key={payment.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-slate-700">{new Date(payment.date).toLocaleDateString('en-US')}</td>
                        <td className="px-3 py-2 text-slate-600 truncate">{payment.reference ?? payment.paymentNumber ?? '—'}</td>
                        <td className="px-3 py-2 text-right text-slate-900 font-semibold">{fmt(payment.amount)}</td>
                        <td className="px-3 py-2 text-slate-600">{payment.method ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bill *</label>
            <select value={billId} onChange={e => {
              setBillId(e.target.value)
              const b = bills.find(bill => bill.id === e.target.value)
              if (b) setAmount(String(b.amountDue ?? b.total))
            }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
              <option value="">Select a bill…</option>
              {bills.map(b => <option key={b.id} value={b.id}>{b.billNumber ?? b.id.slice(0, 8)} — {b.vendorName} ({fmt(b.amountDue ?? b.total)})</option>)}
            </select>
            {selectedBill && <p className="text-sm text-slate-500 mt-1">Balance due: {fmt(selectedBill.amountDue ?? selectedBill.total)}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount *</label>
              <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
                <option value="CASH">Cash</option>
                <option value="CHECK">Check</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
              <input value={reference} onChange={e => setReference(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" placeholder="Reference #" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">{saving && <Loader2 size={14} className="animate-spin" />} Record Payment</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
