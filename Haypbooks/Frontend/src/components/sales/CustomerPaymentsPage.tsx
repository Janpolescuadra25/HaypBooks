'use client'

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { ArrowUpDown, Ban, Plus, RefreshCw, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react'
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
  totalAllocated: number
  unappliedAmount: number
  allocationCount: number
  allocations: PaymentAllocationLine[]
  appliedTo: string
}

interface PaymentAllocationLine {
  invoiceId: string
  invoiceNumber: string
  amount: number
  remainingBalance: number
}

interface CustomerOption {
  id: string
  name: string
  email: string
}

interface InvoiceOption {
  id: string
  invoiceNumber: string
  date: string
  remainingBalance: number
  total: number
}

interface DraftAllocation {
  invoiceId: string
  invoiceNumber: string
  date: string
  remainingBalance: number
  amount: number
}

const METHOD_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CHECK', label: 'Check' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'OTHER', label: 'Other' },
]

function extractApiErrorMessage(err: any, fallback: string) {
  const unwrap = (value: any): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (Array.isArray(value)) return value.map((entry) => unwrap(entry)).filter(Boolean).join('; ')
    if (typeof value === 'object') {
      if (typeof value.message === 'string') return value.message
      if (Array.isArray(value.message)) return unwrap(value.message)
      if (typeof value.error === 'string') return value.error
    }
    return ''
  }

  const responseData = err?.response?.data
  if (typeof responseData === 'string') {
    try {
      const parsed = JSON.parse(responseData)
      return unwrap(parsed?.message ?? parsed?.error) || fallback
    } catch {
      return responseData || fallback
    }
  }

  return unwrap(responseData?.message ?? responseData?.error ?? err?.message) || fallback
}

function normalizeRow(r: any): PaymentRow {
  const toMoney = (value: any) => Number(Number(value ?? 0).toFixed(2))
  const legacyAllocations: PaymentAllocationLine[] = Array.isArray(r.InvoicePaymentApplication)
    ? r.InvoicePaymentApplication.map((a: any) => {
        const invoiceId = a.invoiceId ?? a.invoice?.id ?? ''
        return {
          invoiceId,
          invoiceNumber: a.invoice?.invoiceNumber ?? (invoiceId ? invoiceId.slice(0, 8) : '—'),
          amount: toMoney(a.amount),
          remainingBalance: toMoney(a.invoice?.balance ?? 0),
        }
      }).filter((a: PaymentAllocationLine) => !!a.invoiceId)
    : []

  const legacyById = new Map(legacyAllocations.map((a) => [a.invoiceId, a]))
  const normalizedAllocations: PaymentAllocationLine[] = Array.isArray(r.allocations)
    ? r.allocations.map((a: any) => {
        const invoiceId = String(a?.invoiceId ?? '').trim()
        const legacy = legacyById.get(invoiceId)
        return {
          invoiceId,
          invoiceNumber: legacy?.invoiceNumber ?? (invoiceId ? invoiceId.slice(0, 8) : '—'),
          amount: toMoney(a?.amount),
          remainingBalance: toMoney(a?.remainingBalance ?? legacy?.remainingBalance ?? 0),
        }
      }).filter((a: PaymentAllocationLine) => !!a.invoiceId)
    : []

  const allocations = normalizedAllocations.length > 0 ? normalizedAllocations : legacyAllocations
  const amount = toMoney(r.amount ?? r.totalAmount ?? 0)
  const totalAllocated = toMoney(r.totalAllocated ?? allocations.reduce((sum, a) => sum + toMoney(a.amount), 0))
  const unappliedAmount = toMoney(r.unappliedAmount ?? Math.max(0, amount - totalAllocated))
  const allocationCount = allocations.filter((a) => a.amount > 0).length

  let appliedTo = 'Unapplied'
  if (allocationCount === 1) {
    appliedTo = allocations[0]?.invoiceNumber ?? '1 invoice'
  } else if (allocationCount > 1) {
    appliedTo = `${allocationCount} invoices`
  }

  return {
    id: r.id,
    paymentNumber: r.paymentNumber || r.referenceNumber || r.id?.slice(0, 8) || '—',
    customer: r.customerName || r.customer?.contact?.displayName || '—',
    date: r.date || r.paymentDate || '',
    method: r.method || r.paymentMethodId || '—',
    amount,
    totalAllocated,
    unappliedAmount,
    allocationCount,
    allocations,
    appliedTo,
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
  { key: 'appliedTo', label: 'Applied To', visible: true, width: 240, align: 'left' },
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
  const [drawerPayment, setDrawerPayment] = useState<PaymentRow | null>(null)
  const [drawerTab, setDrawerTab] = useState<'details' | 'activity'>('details')
  const [paymentActivity, setPaymentActivity] = useState<any[]>([])
  const [paymentActivityLoading, setPaymentActivityLoading] = useState(false)

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
  const [allocationSearch, setAllocationSearch] = useState('')
  const [draftAllocations, setDraftAllocations] = useState<DraftAllocation[]>([])
  const [form, setForm] = useState({
    customerId: '',
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
              date: i.date ?? i.issuedAt ?? '',
              remainingBalance: Number(Number(i.amountDue ?? i.balance ?? 0).toFixed(2)),
              total: Number(i.total ?? i.totalAmount ?? 0),
            }))
        )
      })
      .catch(() => setInvoices([]))
      .finally(() => setInvoicesLoading(false))
  }, [companyId, form.customerId])

  const selectedAllocationIds = useMemo(() => new Set(draftAllocations.map((a) => a.invoiceId)), [draftAllocations])

  const filteredOpenInvoices = useMemo(() => {
    const q = allocationSearch.trim().toLowerCase()
    return invoices.filter((invoice) => {
      if (invoice.remainingBalance <= 0) return false
      if (!q) return true
      return (
        invoice.invoiceNumber.toLowerCase().includes(q) ||
        fmtDate(invoice.date).toLowerCase().includes(q) ||
        String(invoice.remainingBalance).includes(q)
      )
    })
  }, [invoices, allocationSearch])

  const parsedPaymentAmount = useMemo(() => {
    const value = Number(form.amount)
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0
  }, [form.amount])

  const totalAllocatedDraft = useMemo(
    () => Number(draftAllocations.reduce((sum, allocation) => sum + Number(allocation.amount || 0), 0).toFixed(2)),
    [draftAllocations],
  )
  const unappliedDraft = useMemo(() => Number((parsedPaymentAmount - totalAllocatedDraft).toFixed(2)), [parsedPaymentAmount, totalAllocatedDraft])
  const isOverAllocated = totalAllocatedDraft > parsedPaymentAmount + 0.01

  const allocationLineErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    for (const allocation of draftAllocations) {
      if (allocation.amount < 0) {
        errors[allocation.invoiceId] = 'Allocation amount cannot be negative.'
      } else if (allocation.amount > allocation.remainingBalance + 0.01) {
        errors[allocation.invoiceId] = `Allocation cannot exceed remaining balance (${formatCurrency(allocation.remainingBalance, currency)}).`
      }
    }
    return errors
  }, [currency, draftAllocations])

  const addAllocation = useCallback((invoice: InvoiceOption) => {
    setDraftAllocations((prev) => {
      if (prev.some((item) => item.invoiceId === invoice.id)) return prev
      return [
        ...prev,
        {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          remainingBalance: Number(invoice.remainingBalance.toFixed(2)),
          amount: 0,
        },
      ]
    })
  }, [])

  const removeAllocation = useCallback((invoiceId: string) => {
    setDraftAllocations((prev) => prev.filter((allocation) => allocation.invoiceId !== invoiceId))
  }, [])

  const updateAllocationAmount = useCallback((invoiceId: string, raw: string) => {
    const parsed = raw === '' ? 0 : Number(raw)
    const amount = Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : 0
    setDraftAllocations((prev) =>
      prev.map((allocation) => (allocation.invoiceId === invoiceId ? { ...allocation, amount } : allocation)),
    )
  }, [])

  const allocateFull = useCallback((invoiceId: string) => {
    setDraftAllocations((prev) =>
      prev.map((allocation) =>
        allocation.invoiceId === invoiceId
          ? { ...allocation, amount: Number(allocation.remainingBalance.toFixed(2)) }
          : allocation,
      ),
    )
  }, [])

  const clearAllAllocations = useCallback(() => {
    setDraftAllocations([])
  }, [])

  // ─── Modal open / close ───────────────────────────────────────────────────────

  function openModal() {
    setForm({
      customerId: '',
      amount: '',
      method: 'CASH',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      memo: '',
    })
    setInvoices([])
    setAllocationSearch('')
    setDraftAllocations([])
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
    if (!form.customerId) {
      setSaveError('Select a customer before recording payment.')
      return
    }
    const parsedAmount = parseFloat(form.amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSaveError('Enter a valid amount greater than 0')
      return
    }
    if (isOverAllocated) {
      setSaveError('Total allocated amount cannot exceed payment amount.')
      return
    }
    const firstLineError = Object.values(allocationLineErrors)[0]
    if (firstLineError) {
      setSaveError(firstLineError)
      return
    }

    const payloadAllocations = draftAllocations
      .filter((allocation) => allocation.amount > 0)
      .map((allocation) => ({
        invoiceId: allocation.invoiceId,
        amount: Number(allocation.amount.toFixed(2)),
      }))

    setSaving(true)
    setSaveError('')
    try {
      await apiClient.post(`/companies/${companyId}/ar/payments`, {
        customerId: form.customerId || undefined,
        amount: parsedAmount,
        paymentDate: form.date,
        method: form.method,
        referenceNumber: form.reference || undefined,
        memo: form.memo || undefined,
        allocations: payloadAllocations,
      })
      closeModal()
      setPage(0)
      fetchPayments(0)
    } catch (err: any) {
      setSaveError(extractApiErrorMessage(err, 'Failed to record payment'))
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

  const openDrawer = (row: PaymentRow) => {
    setDrawerPayment(row)
    setDrawerTab('details')
    setPaymentActivity([])
  }

  const loadPaymentActivity = useCallback(async (paymentId: string) => {
    if (!companyId) return
    setPaymentActivityLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/payments/${paymentId}/activity`)
      setPaymentActivity(Array.isArray(data) ? data : data?.data ?? data?.items ?? [])
    } catch {
      setPaymentActivity([])
    } finally {
      setPaymentActivityLoading(false)
    }
  }, [companyId])

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
        String(r.amount).includes(q) ||
        String(r.totalAllocated).includes(q) ||
        String(r.unappliedAmount).includes(q) ||
        r.allocations.some((allocation) => allocation.invoiceNumber.toLowerCase().includes(q))
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
                  <tr key={row.id} onClick={() => openDrawer(row)} className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700 truncate border-r border-slate-100" title={row.paymentNumber ?? ''}>{row.paymentNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 truncate border-r border-slate-100" title={row.customer ?? ''}>{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600 truncate hidden md:table-cell border-r border-slate-100" title={fmtDate(row.date)}>{fmtDate(row.date)}</td>
                    <td className="px-4 py-3 text-slate-600 truncate hidden sm:table-cell border-r border-slate-100" title={row.method ?? ''}>{row.method}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-800 border-r border-slate-100">
                      {formatCurrency(row.amount, currency)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell border-r border-slate-100">
                      <p className="truncate" title={row.appliedTo ?? ''}>{row.appliedTo}</p>
                      <p className="truncate text-xs text-slate-500" title={`${formatCurrency(row.totalAllocated, currency)} allocated, ${formatCurrency(Math.max(0, row.unappliedAmount), currency)} unapplied`}>
                        {formatCurrency(row.totalAllocated, currency)} allocated, {formatCurrency(Math.max(0, row.unappliedAmount), currency)} unapplied
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
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

        {drawerPayment && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/30" onClick={() => setDrawerPayment(null)} />
            <div className="flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{drawerPayment.paymentNumber}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{drawerPayment.customer}</p>
                </div>
                <button onClick={() => setDrawerPayment(null)} title="Close details" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
              </div>
              <div className="flex border-b border-slate-200 bg-slate-50 px-5">
                {(['details', 'activity'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setDrawerTab(tab)
                      if (tab === 'activity' && paymentActivity.length === 0) {
                        loadPaymentActivity(drawerPayment.id)
                      }
                    }}
                    className={`border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${drawerTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab === 'activity' ? <span className="flex items-center gap-1"><Clock size={13} />Activity</span> : 'Details'}
                  </button>
                ))}
              </div>
              {drawerTab === 'activity' ? (
                <div className="space-y-3 px-5 py-4">
                  {paymentActivityLoading ? (
                    <div className="flex justify-center py-8"><Clock size={18} className="animate-pulse text-slate-400" /></div>
                  ) : paymentActivity.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">No activity recorded yet.</p>
                  ) : paymentActivity.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <Clock size={13} className="mt-0.5 shrink-0 text-slate-400" />
                      <div>
                        <span className="font-semibold text-slate-700">{log.action}</span>
                        {log.user && <span className="text-slate-500"> by {log.user.name ?? log.user.email}</span>}
                        <span className="ml-2 text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-4 px-5 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Date</p>
                        <p className="font-semibold text-slate-800">{fmtDate(drawerPayment.date)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Method</p>
                        <p className="font-semibold text-slate-800">{drawerPayment.method}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Amount</p>
                        <p className="font-bold text-xl text-emerald-800">{formatCurrency(drawerPayment.amount, currency)}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Total Allocated</p>
                        <p className="font-semibold text-slate-800">{formatCurrency(drawerPayment.totalAllocated, currency)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Invoices Allocated</p>
                        <p className="text-lg font-semibold text-slate-900">{drawerPayment.allocationCount}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Unapplied Amount</p>
                        <p className="text-lg font-semibold text-slate-900">{formatCurrency(Math.max(0, drawerPayment.unappliedAmount), currency)}</p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Allocations</p>
                        <p className="text-xs text-slate-400">{drawerPayment.appliedTo}</p>
                      </div>
                      {drawerPayment.allocations.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">No invoice allocations. Payment is fully unapplied.</p>
                      ) : (
                        <div className="overflow-hidden rounded-lg border border-slate-200">
                          {drawerPayment.allocations.map((allocation) => (
                            <div key={allocation.invoiceId} className="flex items-center justify-between border-t border-slate-100 px-3 py-2 first:border-t-0">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{allocation.invoiceNumber}</p>
                                <p className="text-xs text-slate-500">Remaining balance: {formatCurrency(allocation.remainingBalance, currency)}</p>
                              </div>
                              <p className="text-sm font-semibold text-emerald-700">{formatCurrency(allocation.amount, currency)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-slate-200 px-5 py-4">
                    <button
                      onClick={() => handleVoid(drawerPayment.id)}
                      disabled={voidingId === drawerPayment.id}
                      className="flex-1 rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      Void Payment
                    </button>
                    <button
                      onClick={() => setDrawerPayment(null)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
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
                onChange={(id) => {
                  setForm((f) => ({ ...f, customerId: id }))
                  setAllocationSearch('')
                  setDraftAllocations([])
                  setSaveError('')
                }}
                onCreateNew={() => setShowQuickAddCustomer(true)}
              />

              {form.customerId ? (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Open Invoices</label>
                    <button
                      type="button"
                      onClick={clearAllAllocations}
                      disabled={draftAllocations.length === 0}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40"
                    >
                      Clear all
                    </button>
                  </div>

                  <input
                    value={allocationSearch}
                    onChange={(e) => setAllocationSearch(e.target.value)}
                    disabled={invoicesLoading}
                    placeholder={invoicesLoading ? 'Loading open invoices…' : 'Search open invoices by number, date, or balance'}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />

                  <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                    {!form.customerId ? null : invoicesLoading ? (
                      <p className="px-3 py-4 text-sm text-slate-500">Loading invoices…</p>
                    ) : filteredOpenInvoices.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-slate-500">No open invoices match your search.</p>
                    ) : (
                      filteredOpenInvoices.map((invoice) => {
                        const isSelected = selectedAllocationIds.has(invoice.id)
                        return (
                          <div key={invoice.id} className="flex items-center justify-between border-t border-slate-100 px-3 py-2 first:border-t-0">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{invoice.invoiceNumber}</p>
                              <p className="text-xs text-slate-500">{fmtDate(invoice.date)} • {formatCurrency(invoice.remainingBalance, currency)} remaining</p>
                            </div>
                            {isSelected ? (
                              <button
                                type="button"
                                onClick={() => removeAllocation(invoice.id)}
                                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addAllocation(invoice)}
                                className="rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  {draftAllocations.length > 0 && (
                    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Selected allocations</p>
                      {draftAllocations.map((allocation) => {
                        const lineError = allocationLineErrors[allocation.invoiceId]
                        return (
                          <div key={allocation.invoiceId} className="rounded-lg border border-slate-200 p-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{allocation.invoiceNumber}</p>
                                <p className="text-xs text-slate-500">{fmtDate(allocation.date)} • Remaining {formatCurrency(allocation.remainingBalance, currency)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAllocation(allocation.invoiceId)}
                                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                title="Remove allocation"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div className="mt-2 flex items-end gap-2">
                              <div className="flex-1">
                                <label className="mb-1 block text-xs font-medium text-slate-600">Allocated Amount</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={allocation.amount === 0 ? '' : allocation.amount}
                                  onChange={(e) => updateAllocationAmount(allocation.invoiceId, e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  placeholder="0.00"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => allocateFull(allocation.invoiceId)}
                                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                              >
                                Allocate full
                              </button>
                            </div>
                            {lineError && <p className="mt-1 text-xs font-medium text-rose-600">{lineError}</p>}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  Select a customer to search and allocate open invoices.
                </p>
              )}

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
                    aria-label="Payment date"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Payment Amount</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(parsedPaymentAmount, currency)}</p>
                </div>
                <div className={`rounded-lg border px-3 py-2 ${isOverAllocated ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                  <p className="text-xs text-slate-500">Total Allocated</p>
                  <p className={`font-semibold ${isOverAllocated ? 'text-rose-700' : 'text-slate-900'}`}>{formatCurrency(totalAllocatedDraft, currency)}</p>
                </div>
                <div className={`rounded-lg border px-3 py-2 ${unappliedDraft < -0.01 ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                  <p className="text-xs text-slate-500">Unapplied</p>
                  <p className={`font-semibold ${unappliedDraft < -0.01 ? 'text-rose-700' : 'text-slate-900'}`}>
                    {formatCurrency(Math.max(0, unappliedDraft), currency)}
                  </p>
                </div>
              </div>

              {isOverAllocated && (
                <p className="text-sm font-medium text-rose-600">
                  Total allocated cannot exceed payment amount.
                </p>
              )}

              {/* Method + Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                    aria-label="Payment method"
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
            setForm((prev) => ({ ...prev, customerId: next.id }))
            setAllocationSearch('')
            setDraftAllocations([])
            setShowQuickAddCustomer(false)
          }}
        />
      )}
    </div>
  )
}
