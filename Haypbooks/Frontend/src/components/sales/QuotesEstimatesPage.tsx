'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { Plus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'

const PAGE_SIZE = 20

const STATUS_FILTERS = ['All', 'DRAFT', 'SENT', 'ACCEPTED', 'EXPIRED', 'REJECTED', 'CONVERTED'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

interface QuoteRow {
  id: string
  quoteNumber: string
  customer: string
  customerId: string
  date: string | null
  expiryDate: string | null
  amount: number
  status: string
  convertedToInvoiceId: string | null
}

interface CustomerOption {
  id: string
  name: string
}

interface LineItem {
  description: string
  quantity: string
  unitPrice: string
}

function normalizeQuote(q: any): QuoteRow {
  return {
    id: q.id,
    quoteNumber: q.quoteNumber ?? `QT-${q.id?.slice(0, 8)}`,
    customer: q.customer ?? q.customerName ?? q.customer?.contact?.displayName ?? '—',
    customerId: q.customerId ?? '',
    date: q.date ?? q.issuedAt ?? null,
    expiryDate: q.expiryDate ?? null,
    amount: Number(q.amount ?? q.totalAmount ?? 0),
    status: q.status ?? 'DRAFT',
    convertedToInvoiceId: q.convertedToInvoiceId ?? null,
  }
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return d
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'ACCEPTED': return 'text-emerald-700 bg-emerald-50'
    case 'SENT': return 'text-sky-700 bg-sky-50'
    case 'EXPIRED': return 'text-rose-700 bg-rose-50'
    case 'REJECTED': return 'text-red-700 bg-red-50'
    case 'CONVERTED': return 'text-violet-700 bg-violet-50'
    default: return 'text-amber-700 bg-amber-50'
  }
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: 'Draft', SENT: 'Sent', ACCEPTED: 'Accepted',
    EXPIRED: 'Expired', REJECTED: 'Rejected', CONVERTED: 'Converted',
  }
  return labels[status] ?? status
}

function emptyLine(): LineItem {
  return { description: '', quantity: '1', unitPrice: '' }
}

export default function QuotesEstimatesPage() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  // List state
  const [items, setItems] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [actioningId, setActioningId] = useState<string | null>(null)

  // Create modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [custLoading, setCustLoading] = useState(false)
  const [form, setForm] = useState({
    customerId: '',
    expiryDate: '',
  })
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const searchRef = useRef(search)
  useEffect(() => { searchRef.current = search }, [search])

  // ─── Fetch quotes ─────────────────────────────────────────────────────────

  const fetchQuotes = useCallback(async (pg: number, status: StatusFilter) => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const params: Record<string, string | number> = { limit: PAGE_SIZE, offset: pg * PAGE_SIZE }
      if (status !== 'All') params.status = status
      const { data } = await apiClient.get(`/companies/${companyId}/ar/quotes`, { params })
      const raw: any[] = Array.isArray(data) ? data : data?.items || data?.records || []
      setItems(raw.map(normalizeQuote))
      setHasMore(raw.length === PAGE_SIZE)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchQuotes(0, statusFilter) }, [fetchQuotes, statusFilter])

  // ─── Toast helper ─────────────────────────────────────────────────────────

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  // ─── Status action ────────────────────────────────────────────────────────

  async function handleStatusChange(quoteId: string, status: string) {
    if (!companyId) return
    setActioningId(quoteId)
    try {
      await apiClient.patch(`/companies/${companyId}/ar/quotes/${quoteId}/status`, { status })
      fetchQuotes(page, statusFilter)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update status')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Convert to invoice ───────────────────────────────────────────────────

  async function handleConvert(quoteId: string) {
    if (!companyId) return
    if (!window.confirm('Convert this quote to an invoice? The quote will be marked as converted.')) return
    setActioningId(quoteId)
    try {
      await apiClient.post(`/companies/${companyId}/ar/quotes/${quoteId}/convert`)
      fetchQuotes(page, statusFilter)
      showToast('Quote converted to invoice successfully')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to convert quote to invoice')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Load customers ───────────────────────────────────────────────────────

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

  // ─── Open create modal ────────────────────────────────────────────────────

  function openModal() {
    setForm({ customerId: '', expiryDate: '' })
    setLines([emptyLine()])
    setSaveError('')
    setModalOpen(true)
    loadCustomers()
  }

  // ─── Line helpers ─────────────────────────────────────────────────────────

  function setLine(idx: number, field: keyof LineItem, value: string) {
    setLines((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  function addLine() { setLines((prev) => [...prev, emptyLine()]) }
  function removeLine(idx: number) { setLines((prev) => prev.filter((_, i) => i !== idx)) }

  const lineTotal = lines.reduce((s, l) => {
    const qty = parseFloat(l.quantity) || 0
    const price = parseFloat(l.unitPrice) || 0
    return s + qty * price
  }, 0)

  // ─── Save quote ───────────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    if (!form.customerId) { setSaveError('Select a customer'); return }
    const validLines = lines.filter((l) => l.description.trim())
    if (!validLines.length) { setSaveError('Add at least one line item with a description'); return }
    setSaving(true)
    setSaveError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/quotes`, {
        customerId: form.customerId,
        expiryDate: form.expiryDate || undefined,
        lines: validLines.map((l) => {
          const qty = parseFloat(l.quantity) || 1
          const price = parseFloat(l.unitPrice) || 0
          return { description: l.description.trim(), quantity: qty, unitPrice: price, amount: qty * price }
        }),
      })
      setModalOpen(false)
      setPage(0)
      fetchQuotes(0, statusFilter)
      showToast('Quote created successfully')
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to create quote')
    } finally {
      setSaving(false)
    }
  }

  // ─── Client-side search ───────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(
      (row) =>
        row.quoteNumber?.toLowerCase().includes(q) ||
        row.customer?.toLowerCase().includes(q) ||
        row.status?.toLowerCase().includes(q)
    )
  }, [items, search])

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quotes & Estimates</h1>
            <p className="text-sm text-slate-500 mt-1">Create and manage customer quotes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchQuotes(page, statusFilter)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={openModal}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              <Plus size={16} /> New Quote
            </button>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="px-6 pb-3 flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0) }}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
              }`}
            >
              {s === 'All' ? 'All' : statusLabel(s)}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="px-6 pb-4">
          <input
            placeholder="Search by quote number, customer, or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-5 flex-1">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Quote #</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Expiry</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
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
                    <button onClick={() => fetchQuotes(page, statusFilter)} className="mt-2 text-sm text-emerald-600 hover:underline">
                      Try again
                    </button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No quotes found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{row.quoteNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{fmtDate(row.date)}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{fmtDate(row.expiryDate)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-800">
                      {formatCurrency(row.amount, currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {row.status === 'DRAFT' && (
                          <button
                            disabled={actioningId === row.id}
                            onClick={() => handleStatusChange(row.id, 'SENT')}
                            className="text-xs font-semibold text-sky-700 hover:underline disabled:opacity-40"
                          >
                            Send
                          </button>
                        )}
                        {row.status === 'SENT' && (
                          <>
                            <button
                              disabled={actioningId === row.id}
                              onClick={() => handleStatusChange(row.id, 'ACCEPTED')}
                              className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-40"
                            >
                              Accept
                            </button>
                            <span className="text-slate-300">·</span>
                            <button
                              disabled={actioningId === row.id}
                              onClick={() => handleStatusChange(row.id, 'REJECTED')}
                              className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-40"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(row.status === 'SENT' || row.status === 'ACCEPTED') && (
                          <>
                            <span className="text-slate-300">·</span>
                            <button
                              disabled={actioningId === row.id}
                              onClick={() => handleStatusChange(row.id, 'EXPIRED')}
                              className="text-xs font-semibold text-slate-500 hover:underline disabled:opacity-40"
                            >
                              Expire
                            </button>
                          </>
                        )}
                        {row.status !== 'CONVERTED' && row.status !== 'EXPIRED' && row.status !== 'REJECTED' && (
                          <>
                            <span className="text-slate-300">·</span>
                            <button
                              disabled={actioningId === row.id}
                              onClick={() => handleConvert(row.id)}
                              className="text-xs font-semibold text-violet-700 hover:underline disabled:opacity-40"
                            >
                              Convert
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">Page {page + 1}{hasMore ? '+' : ''}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { const p = page - 1; setPage(p); fetchQuotes(p, statusFilter) }}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => { const p = page + 1; setPage(p); fetchQuotes(p, statusFilter) }}
                disabled={!hasMore}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Quote Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">New Quote</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              {/* Customer + Expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
                  <select
                    required
                    value={form.customerId}
                    onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="">{custLoading ? 'Loading…' : 'Select customer…'}</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Line Items *</label>
                  <button type="button" onClick={addLine} className="text-xs font-semibold text-emerald-700 hover:underline">
                    + Add line
                  </button>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-slate-600">Description</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600 w-20">Qty</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600 w-28">Unit Price</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600 w-24">Amount</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l, i) => {
                        const qty = parseFloat(l.quantity) || 0
                        const price = parseFloat(l.unitPrice) || 0
                        const lineAmt = qty * price
                        return (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-2 py-1">
                              <input
                                value={l.description}
                                onChange={(e) => setLine(i, 'description', e.target.value)}
                                placeholder="Description"
                                className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={l.quantity}
                                onChange={(e) => setLine(i, 'quantity', e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={l.unitPrice}
                                onChange={(e) => setLine(i, 'unitPrice', e.target.value)}
                                placeholder="0.00"
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                              />
                            </td>
                            <td className="px-3 py-1 text-right tabular-nums text-slate-700 text-sm">
                              {formatCurrency(lineAmt, currency)}
                            </td>
                            <td className="px-1 py-1 text-center">
                              {lines.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeLine(i)}
                                  className="text-rose-400 hover:text-rose-600 text-lg leading-none"
                                >
                                  ×
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-2 pr-10 text-sm font-semibold text-slate-800">
                  Total: {formatCurrency(lineTotal, currency)}
                </div>
              </div>

              {saveError && <p className="text-sm text-rose-500">{saveError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
