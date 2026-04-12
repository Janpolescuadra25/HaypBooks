'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

const CREDIT_REASONS = [
  'Returned Goods',
  'Billing Error',
  'Discount Adjustment',
  'Price Correction',
  'Service Issue',
  'Other',
]

const STATUS_OPTIONS = ['', 'DRAFT', 'ISSUED', 'APPLIED', 'VOID']

function statusBadge(status: string) {
  switch (status) {
    case 'ISSUED':  return 'text-sky-700 bg-sky-50 border-sky-200'
    case 'APPLIED': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'VOID':    return 'text-rose-700 bg-rose-50 border-rose-200'
    default:        return 'text-slate-600 bg-slate-50 border-slate-200'
  }
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return iso }
}

export default function CreditNotesPage() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

  // Customers for select
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [custLoading, setCustLoading] = useState(false)

  // New Credit Note form state
  const [nc, setNc] = useState({
    customerId: '',
    totalAmount: '',
    reason: CREDIT_REASONS[0],
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)
      const { data } = await apiClient.get(`/companies/${companyId}/ar/credit-notes?${params}`)
      setItems(Array.isArray(data) ? data : data?.items || data?.records || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load credit notes')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter, search])

  useEffect(() => { fetchData() }, [fetchData])

  const loadCustomers = useCallback(async () => {
    if (!companyId || customers.length > 0) return
    setCustLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers`)
      const raw: any[] = Array.isArray(data) ? data : data?.items || []
      setCustomers(raw.map((c: any) => ({ id: c.id || c.contactId, name: c.name || c.displayName || '—' })))
    } catch {
      // non-blocking
    } finally {
      setCustLoading(false)
    }
  }, [companyId, customers.length])

  function openModal() {
    setNc({ customerId: '', totalAmount: '', reason: CREDIT_REASONS[0] })
    setSaveError('')
    setNewOpen(true)
    loadCustomers()
  }

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((row) =>
      (row.creditNoteNumber || '').toLowerCase().includes(q) ||
      (row.customer || '').toLowerCase().includes(q) ||
      (row.invoiceNumber || '').toLowerCase().includes(q) ||
      (row.memo || row.reason || '').toLowerCase().includes(q) ||
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
        customerId: nc.customerId,
        totalAmount: parseFloat(nc.totalAmount),
        reason: nc.reason,
      })
      setNewOpen(false)
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
              onClick={openModal}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              New Credit Note
            </button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Credit Notes" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

        <div className="px-6 pb-4 flex flex-wrap gap-3">
          <input
            title="Search credit notes"
            placeholder="Search by number, customer, reason…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm w-64"
          />
          <select
            title="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s || 'All Statuses'}</option>
            ))}
          </select>
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
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Reason</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
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
                    <td className="px-4 py-3 font-medium text-slate-900">{row.creditNoteNumber || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.customer || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.invoiceNumber || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(row.date)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{fmt(Number(row.amount ?? 0))}</td>
                    <td className="px-4 py-3 text-slate-600">{row.memo || row.reason || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${statusBadge(row.status)}`}>
                        {row.status || 'DRAFT'}
                      </span>
                    </td>
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
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">New Credit Note</h2>
              <button onClick={() => setNewOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={submitNewCreditNote} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
                <select
                  required
                  value={nc.customerId}
                  onChange={e => setNc(p => ({ ...p, customerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  disabled={custLoading}
                >
                  <option value="">{custLoading ? 'Loading customers…' : 'Select customer'}</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
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
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={nc.totalAmount}
                  onChange={e => setNc(p => ({ ...p, totalAmount: e.target.value }))}
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
                <li>Apply credits against open invoices to reduce what the customer owes.</li>
                <li>Void a credit note to cancel it without applying it.</li>
                <li>Track status: Draft → Issued → Applied or Void.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
