'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

type PaymentRow = {
  id: string
  paymentNumber: string
  customer: string
  date: string
  method: string
  amount: number
  appliedTo: string
  status: 'Completed' | 'Pending' | 'Failed' | 'Reversed'
}

export default function CustomerPaymentsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/payments`)
      const raw: any[] = Array.isArray(data) ? data : data?.items || data?.records || []
      setItems(raw.map((r: any) => ({
        id: r.id,
        paymentNumber: r.paymentNumber || r.referenceNumber || r.id?.slice(0, 8) || '—',
        customer: r.customerName || r.customer?.displayName || r.customer?.name || '—',
        date: r.date || r.paymentDate || '',
        method: r.paymentMethod || r.method || '—',
        amount: r.amount ?? r.totalAmount ?? 0,
        appliedTo: r.invoiceNumber || r.invoiceId?.slice(0, 8) || '—',
        status: r.status || 'Completed',
      })))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])
  const [search, setSearch] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [methodFilter, setMethodFilter] = useState('All')
  const [newPaymentOpen, setNewPaymentOpen] = useState(false)

  // New Payment form state
  const [np, setNp] = useState({
    customer: '',
    invoiceNumber: '',
    amount: '',
    paymentMethod: 'Cash',
    referenceNumber: '',
    date: new Date().toISOString().split('T')[0],
    memo: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function submitNewPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    setSaving(true)
    setSaveError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/payments`, {
        customer: np.customer,
        invoiceNumber: np.invoiceNumber,
        amount: parseFloat(np.amount),
        paymentMethod: np.paymentMethod,
        referenceNumber: np.referenceNumber,
        date: np.date,
        memo: np.memo,
      })
      setNewPaymentOpen(false)
      setNp({ customer: '', invoiceNumber: '', amount: '', paymentMethod: 'Cash', referenceNumber: '', date: new Date().toISOString().split('T')[0], memo: '' })
      fetchData()
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  // Data fetched from API (see fetchData above)

  const filtered = useMemo(() => {
    let list = items

    if (dateStart) list = list.filter((row) => row.date >= dateStart)
    if (dateEnd) list = list.filter((row) => row.date <= dateEnd)
    if (methodFilter !== 'All') list = list.filter((row) => row.method === methodFilter)

    if (!search) return list

    const q = search.toLowerCase()
    return list.filter((row) =>
      row.paymentNumber.toLowerCase().includes(q) ||
      row.customer.toLowerCase().includes(q) ||
      row.method.toLowerCase().includes(q) ||
      String(row.amount).includes(q) ||
      row.appliedTo.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  }, [items, search, dateStart, dateEnd, methodFilter])

  const totalAmount = items.reduce((s, r) => s + (r.amount || 0), 0)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Payments</h1>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} payments</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNewPaymentOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              New Payment
            </button>
          </div>
        </div>

        <div className="px-6 pb-3 grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 rounded-lg p-3">
            <p className="text-xs text-emerald-600/60">Total Payments</p>
            <p className="text-xl font-bold text-emerald-900">{items.length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600/60">Amount Collected</p>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(totalAmount, currency)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-500">Showing</p>
            <p className="text-xl font-bold text-slate-700">{filtered.length}</p>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-4">
          <input
            title="Search payments"
            placeholder="Search by payment, customer, method, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Start date"
          />
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="End date"
          />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            aria-label="Filter by payment method"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </select>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Payment #</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Applied To</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center">
                    <p className="text-rose-500 font-medium">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No payments found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.paymentNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{row.date}</td>
                    <td className="px-4 py-3 text-slate-600">{row.method}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-emerald-800">{formatCurrency(row.amount, currency)}</td>
                    <td className="px-4 py-3 text-slate-600">{row.appliedTo}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${
                      row.status === 'Completed' ? 'text-emerald-700' :
                      row.status === 'Pending' ? 'text-amber-700' :
                      row.status === 'Failed' ? 'text-rose-700' :
                      'text-slate-600'
                    }`}>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Payment Modal */}
      {newPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Record Payment</h2>
              <button onClick={() => setNewPaymentOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={submitNewPayment} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
                <input
                  required
                  value={np.customer}
                  onChange={e => setNp(p => ({ ...p, customer: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice # (optional)</label>
                <input
                  value={np.invoiceNumber}
                  onChange={e => setNp(p => ({ ...p, invoiceNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="INV-0001"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={np.amount}
                    onChange={e => setNp(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={np.date}
                    onChange={e => setNp(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={np.paymentMethod}
                    onChange={e => setNp(p => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="GCash">GCash</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference #</label>
                  <input
                    value={np.referenceNumber}
                    onChange={e => setNp(p => ({ ...p, referenceNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Check or ref number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Memo</label>
                <textarea
                  rows={2}
                  value={np.memo}
                  onChange={e => setNp(p => ({ ...p, memo: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  placeholder="Optional memo…"
                />
              </div>
              {saveError && <p className="text-sm text-rose-500">{saveError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNewPaymentOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60">
                  {saving ? 'Saving…' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
