'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

type CreditNoteRow = {
  id: string
  creditNoteNumber: string
  customer: string
  invoiceNumber: string
  date: string
  amount: string
  reason: string
  status: 'Issued' | 'Applied' | 'Void'
}

const CREDIT_REASONS = [
  'Returned Goods',
  'Billing Error',
  'Discount Adjustment',
  'Price Correction',
  'Service Issue',
  'Other',
]

export default function CreditNotesPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

  // New Credit Note form state
  const [nc, setNc] = useState({
    customer: '',
    invoiceNumber: '',
    amount: '',
    reason: CREDIT_REASONS[0],
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/invoices?status=credit_note`)
      setItems(Array.isArray(data) ? data : data?.items || data?.records || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((row) =>
      (row.creditNoteNumber || '').toLowerCase().includes(q) ||
      (row.customer || '').toLowerCase().includes(q) ||
      (row.invoiceNumber || '').toLowerCase().includes(q) ||
      (row.date || '').toLowerCase().includes(q) ||
      (row.amount || '').toLowerCase().includes(q) ||
      (row.reason || '').toLowerCase().includes(q) ||
      (row.status || '').toLowerCase().includes(q)
    )
  }, [search, items])

  async function submitNewCreditNote(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    setSaving(true)
    setSaveError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/credit-notes`, {
        customer: nc.customer,
        invoiceNumber: nc.invoiceNumber,
        amount: parseFloat(nc.amount),
        reason: nc.reason,
        date: nc.date,
        notes: nc.notes,
      })
      setNewOpen(false)
      setNc({ customer: '', invoiceNumber: '', amount: '', reason: CREDIT_REASONS[0], date: new Date().toISOString().split('T')[0], notes: '' })
      fetchData()
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to create credit note')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Credit Notes</h1>
            <p className="text-sm text-slate-500 mt-1">Manage customer credit notes and adjustments</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNewOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              New Credit Note
            </button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Credit Notes" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search credit notes"
            placeholder="Search by credit note, customer, invoice, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by number, customer, invoice, reason, or status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Credit Note #</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Invoice #</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Reason</th>
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
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No credit notes found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.creditNoteNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{row.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{row.date}</td>
                    <td className="px-4 py-3 text-slate-600">{row.amount}</td>
                    <td className="px-4 py-3 text-slate-600">{row.reason}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${
                      row.status === 'Issued' ? 'text-sky-700' :
                      row.status === 'Applied' ? 'text-emerald-700' :
                      'text-rose-700'
                    }`}>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Credit Note Modal */}
      {newOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">New Credit Note</h2>
              <button onClick={() => setNewOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={submitNewCreditNote} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
                <input
                  required
                  value={nc.customer}
                  onChange={e => setNc(p => ({ ...p, customer: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Customer name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Invoice # (optional)</label>
                  <input
                    value={nc.invoiceNumber}
                    onChange={e => setNc(p => ({ ...p, invoiceNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="INV-0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={nc.date}
                    onChange={e => setNc(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={nc.amount}
                    onChange={e => setNc(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                  <select
                    value={nc.reason}
                    onChange={e => setNc(p => ({ ...p, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    {CREDIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={nc.notes}
                  onChange={e => setNc(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  placeholder="Additional notes…"
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

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Credit Notes Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Issue and manage credit notes to adjust invoices and customer balances.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create credit notes for returned goods, billing errors, and discounts.</li>
                <li>Apply credits against open invoices or refund as necessary.</li>
                <li>Track status through issued, applied, or voided steps.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
