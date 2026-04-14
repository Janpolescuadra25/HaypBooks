'use client'

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { ArrowUpDown, Ban, Plus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'
import CustomerPickerField from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'

const PAGE_SIZE = 20

interface PaymentRow {
  id: string
  paymentNumber: string
  customer: string
  date: string
  method: string
  amount: number
  appliedTo: string
}

interface CustomerOption {
  id: string
  name: string
  email: string
}

interface InvoiceOption {
  id: string
  invoiceNumber: string
  amountDue: number
  total: number
}

const METHOD_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CHECK', label: 'Check' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'OTHER', label: 'Other' },
]

function normalizeRow(r: any): PaymentRow {
  return {
    id: r.id,
    paymentNumber: r.paymentNumber || r.referenceNumber || r.id?.slice(0, 8) || '—',
    customer: r.customerName || r.customer?.contact?.displayName || '—',
    date: r.date || r.paymentDate || '',
    method: r.method || r.paymentMethodId || '—',
    amount: Number(r.amount ?? r.totalAmount ?? 0),
    appliedTo:
      (r.InvoicePaymentApplication ?? [])
        .map((a: any) => a.invoice?.invoiceNumber)
        .filter(Boolean)
        .join(', ') || '—',
  }
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return d
  }
}

type SortDirection = 'asc' | 'desc'
type SortKey = 'paymentNumber' | 'customer' | 'date' | 'method' | 'amount' | 'appliedTo'

function comparePayments(a: PaymentRow, b: PaymentRow, key: SortKey, dir: SortDirection): number {
  const asc = dir === 'asc' ? 1 : -1
  if (key === 'amount') {
    return a.amount === b.amount ? 0 : a.amount > b.amount ? asc : -asc
  }
  if (key === 'date') {
    const ad = a.date ? new Date(a.date).getTime() : 0
    const bd = b.date ? new Date(b.date).getTime() : 0
    return ad === bd ? 0 : ad > bd ? asc : -asc
  }
  const av = String((a as any)[key] ?? '').toLowerCase()
  const bv = String((b as any)[key] ?? '').toLowerCase()
  if (av === bv) return 0
  return av > bv ? asc : -asc
}

interface ColDef { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right' }
const DEFAULT_CP_COLS: ColDef[] = [
  { key: 'paymentNumber', label: 'Payment #', visible: true, width: 120, align: 'left' },
  { key: 'customer', label: 'Customer', visible: true, width: 180, align: 'left' },
  { key: 'date', label: 'Date', visible: true, width: 110, align: 'left' },
  { key: 'method', label: 'Method', visible: true, width: 120, align: 'left' },
  { key: 'amount', label: 'Amount', visible: true, width: 110, align: 'right' },
  { key: 'appliedTo', label: 'Applied To', visible: true, width: 160, align: 'left' },
]
function loadCPCols(): ColDef[] {
  try {
    const s = localStorage.getItem('customer-payments-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as ColDef[]
      return DEFAULT_CP_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_CP_COLS
}

export default function CustomerPaymentsPage() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  // List state
  const [items, setItems] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [voidingId, setVoidingId] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [methodFilter, setMethodFilter] = useState('All')

  // Form state
  const [newPaymentOpen, setNewPaymentOpen] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [invoices, setInvoices] = useState<InvoiceOption[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [form, setForm] = useState({
    customerId: '',
    invoiceId: '',
    amount: '',
    method: 'CASH',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    memo: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const [cols, setCols] = useState<ColDef[]>(() => loadCPCols())
  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])
  const saveCols = (next: ColDef[]) => { setCols(next); try { localStorage.setItem('customer-payments-cols-v1', JSON.stringify(next)) } catch { /* ignore */ } }
  const { containerRef, startResize, isOverflowing: customerPaymentsIsOverflowing } = useFixedWidthResizableColumns({
    columns: cols,
    columnsRef: colsRef,
    saveColumns: saveCols,
    fixedWidth: 80,
  })

  // ─── Fetch payments ──────────────────────────────────────────────────────────

  const fetchPayments = useCallback(async (pg: number) => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/payments`, {
        params: { limit: PAGE_SIZE, offset: pg * PAGE_SIZE },
      })
      const raw: any[] = Array.isArray(data) ? data : data?.items || data?.records || []
      setItems(raw.map(normalizeRow))
      setHasMore(raw.length === PAGE_SIZE)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchPayments(0) }, [fetchPayments])

  // ─── Load customers for dropdown ─────────────────────────────────────────────

  const loadCustomers = useCallback(async () => {
    if (!companyId) return
    setCustomersLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers`)
      const raw: any[] = Array.isArray(data) ? data : data?.data ?? data?.items ?? []
      setCustomers(
        raw.map((c: any) => ({
          id: c.id || c.contactId,
          name: c.name || c.displayName || c.contact?.displayName || '—',
          email: c.email || '',
        }))
      )
    } catch {
      // non-blocking
    } finally {
      setCustomersLoading(false)
    }
  }, [companyId])

  // ─── Load open invoices when customer selected ────────────────────────────────

  useEffect(() => {
    if (!companyId || !form.customerId) {
      setInvoices([])
      return
    }
    setInvoicesLoading(true)
    apiClient
      .get(`/companies/${companyId}/ar/invoices`, {
        params: { customerId: form.customerId, limit: 100 },
      })
      .then(({ data }) => {
        const raw: any[] = Array.isArray(data) ? data : data?.items || []
        setInvoices(
          raw
            .filter((i: any) =>
              ['SENT', 'PARTIALLY_PAID', 'PARTIAL', 'OVERDUE'].includes(i.status)
            )
            .map((i: any) => ({
              id: i.id,
              invoiceNumber: i.invoiceNumber || i.id?.slice(0, 8),
              amountDue: Number(i.amountDue ?? i.balance ?? 0),
              total: Number(i.total ?? i.totalAmount ?? 0),
            }))
        )
      })
      .catch(() => setInvoices([]))
      .finally(() => setInvoicesLoading(false))
  }, [companyId, form.customerId])

  // ─── Pre-fill amount when invoice selected ───────────────────────────────────

  useEffect(() => {
    if (!form.invoiceId) return
    const inv = invoices.find((i) => i.id === form.invoiceId)
    if (inv) {
      setForm((f) => ({ ...f, amount: String(inv.amountDue > 0 ? inv.amountDue : inv.total) }))
    }
  }, [form.invoiceId, invoices])

  // ─── Modal open / close ───────────────────────────────────────────────────────

  function openModal() {
    setForm({
      customerId: '',
      invoiceId: '',
      amount: '',
      method: 'CASH',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      memo: '',
    })
    setInvoices([])
    setSaveError('')
    setNewPaymentOpen(true)
    loadCustomers()
  }

  function closeModal() {
    setNewPaymentOpen(false)
    setSaveError('')
  }

  // ─── Submit new payment ───────────────────────────────────────────────────────

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    const parsedAmount = parseFloat(form.amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSaveError('Enter a valid amount greater than 0')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/payments`, {
        customerId: form.customerId || undefined,
        invoiceId: form.invoiceId || undefined,
        amount: parsedAmount,
        paymentDate: form.date,
        method: form.method,
        referenceNumber: form.reference || undefined,
        memo: form.memo || undefined,
      })
      closeModal()
      setPage(0)
      fetchPayments(0)
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  // ─── Void payment ─────────────────────────────────────────────────────────────

  async function handleVoid(id: string) {
    if (!companyId) return
    if (!window.confirm('Void this payment? This cannot be undone.')) return
    setVoidingId(id)
    try {
      await apiClient.post(`/companies/${companyId}/ar/payments/${id}/void`)
      fetchPayments(page)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to void payment')
    } finally {
      setVoidingId(null)
    }
  }

  // ─── Client-side filtering ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = items
    if (dateStart) list = list.filter((r) => r.date >= dateStart)
    if (dateEnd) list = list.filter((r) => r.date <= dateEnd)
    if (methodFilter !== 'All') list = list.filter((r) => r.method === methodFilter)
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(
      (r) =>
        r.paymentNumber.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.method.toLowerCase().includes(q) ||
        r.appliedTo.toLowerCase().includes(q) ||
        String(r.amount).includes(q)
    )
  }, [items, search, dateStart, dateEnd, methodFilter])

  const sorted = useMemo(() => {
    const next = [...filtered]
    next.sort((a, b) => comparePayments(a, b, sortKey, sortDir))
    return next
  }, [filtered, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'amount' || key === 'date' ? 'desc' : 'asc')
  }

  const totalAmount = items.reduce((s, r) => s + r.amount, 0)

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Payments</h1>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} payments</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPayments(page)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={openModal}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              <Plus size={16} /> New Payment
            </button>
          </div>
        </div>

        {/* Summary tiles */}
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

        {/* Filters */}
        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-4">
          <input
            placeholder="Search by payment, customer, method…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            aria-label="Start date"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            aria-label="End date"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            aria-label="Filter by payment method"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          >
            <option value="All">All Methods</option>
            {METHOD_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-5 flex-1">
        <div ref={containerRef} className={`bg-white rounded-xl border border-slate-200 ${customerPaymentsIsOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}`}>
          <table className="w-full text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              {cols.map(c => <col key={c.key} style={{ width: c.width }} />)}
              <col style={{ width: 80 }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                {cols.map(c => (
                  <th key={c.key} className="relative px-4 py-3 border-r border-slate-200 select-none overflow-hidden" style={{ width: c.width, minWidth: c.width, maxWidth: c.width, textAlign: c.align === 'right' ? 'right' : 'left' }} title={c.label}>
                    <button type="button" onClick={() => toggleSort(c.key as SortKey)} className="flex items-center gap-1 w-full min-w-0 overflow-hidden pr-2" style={{ justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start' }}>
                      <span className="truncate">{c.label}</span><ArrowUpDown size={12} className={`shrink-0 ${sortKey === c.key ? 'text-emerald-600' : 'text-slate-300'}`} />
                    </button>
                    <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startResize(e, c.key)} />
                  </th>
                ))}
                <th className="text-right px-4 py-3 w-20">Actions</th>
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
                    <button onClick={() => fetchPayments(page)} className="mt-2 text-sm text-emerald-600 hover:underline">
                      Try again
                    </button>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No payments found.
                  </td>
                </tr>
              ) : (
                sorted.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700 truncate border-r border-slate-100" title={row.paymentNumber ?? ''}>{row.paymentNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 truncate border-r border-slate-100" title={row.customer ?? ''}>{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600 truncate hidden md:table-cell border-r border-slate-100" title={fmtDate(row.date)}>{fmtDate(row.date)}</td>
                    <td className="px-4 py-3 text-slate-600 truncate hidden sm:table-cell border-r border-slate-100" title={row.method ?? ''}>{row.method}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-800 border-r border-slate-100">
                      {formatCurrency(row.amount, currency)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate hidden lg:table-cell border-r border-slate-100" title={row.appliedTo ?? ''}>{row.appliedTo}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleVoid(row.id)}
                        disabled={voidingId === row.id}
                        className="p-1.5 rounded hover:bg-rose-100 text-rose-400 disabled:opacity-40"
                        title="Void payment"
                      >
                        <Ban size={14} />
                      </button>
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
            <p className="text-sm text-slate-500">
              Page {page + 1}{hasMore ? '+' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const p = page - 1
                  setPage(p)
                  fetchPayments(p)
                }}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => {
                  const p = page + 1
                  setPage(p)
                  fetchPayments(p)
                }}
                disabled={!hasMore}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Payment Modal */}
      {newPaymentOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Record Payment</h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitPayment} className="p-4 space-y-4">
              <CustomerPickerField
                label="Customer *"
                value={form.customerId}
                customers={customers}
                loading={customersLoading}
                placeholder="Select customer..."
                createLabel="+ Create New Customer"
                onOpen={loadCustomers}
                onChange={(id) => setForm((f) => ({ ...f, customerId: id, invoiceId: '', amount: '' }))}
                onCreateNew={() => setShowQuickAddCustomer(true)}
              />

              {/* Invoice dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Invoice <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <select
                  value={form.invoiceId}
                  onChange={(e) => setForm((f) => ({ ...f, invoiceId: e.target.value }))}
                  disabled={!form.customerId || invoicesLoading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {!form.customerId
                      ? 'Select a customer first'
                      : invoicesLoading
                      ? 'Loading…'
                      : invoices.length === 0
                      ? 'No open invoices'
                      : 'Select invoice…'}
                  </option>
                  {invoices.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.invoiceNumber} — {formatCurrency(i.amountDue, currency)} due
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Method + Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    {METHOD_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference #</label>
                  <input
                    value={form.reference}
                    onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Check # or ref"
                  />
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Memo</label>
                <textarea
                  rows={2}
                  value={form.memo}
                  onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  placeholder="Optional memo…"
                />
              </div>

              {saveError && <p className="text-sm text-rose-500">{saveError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuickAddCustomer && companyId && (
        <QuickAddCustomerModal
          companyId={companyId}
          onClose={() => setShowQuickAddCustomer(false)}
          onCreated={(customer) => {
            const next = { id: customer.contactId, name: customer.name, email: customer.email }
            setCustomers((prev) => [next, ...prev.filter((p) => p.id !== next.id)])
            setForm((prev) => ({ ...prev, customerId: next.id, invoiceId: '', amount: '' }))
            setShowQuickAddCustomer(false)
          }}
        />
      )}
    </div>
  )
}
