'use client'

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpDown, Ban, Plus, RefreshCw, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'
import CustomerPickerField from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'
import { BankAccountPickerField } from './pickers'

const PAGE_SIZE = 20

interface PaymentRow {
  id: string
  customerId: string
  bankAccountId?: string
  bankAccountName?: string
  referenceNumber: string
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
  isDeposited: boolean
  depositStatus: 'UNDEPOSITED' | 'DEPOSITED'
  depositDate?: string
  depositNumber?: string
  depositId?: string
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

type DepositDestination = 'UNDEPOSITED_FUNDS' | 'BANK_ACCOUNT'

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
  const isDeposited = Boolean(r.isDeposited ?? (String(r.depositStatus ?? '').toUpperCase() === 'DEPOSITED'))
  const depositStatus: 'UNDEPOSITED' | 'DEPOSITED' = String(r.depositStatus ?? '').toUpperCase() === 'DEPOSITED' || isDeposited
    ? 'DEPOSITED'
    : 'UNDEPOSITED'
  const depositNumber = String(r.depositNumber ?? '').trim()
  const rawDepositDate = r.depositDate ?? ''
  const depositDate = rawDepositDate ? String(rawDepositDate) : ''
  const bankAccountId = String(r.bankAccountId ?? r.bankAccount?.id ?? '').trim()
  const bankAccountName = String(r.bankAccountName ?? r.bankAccount?.name ?? '').trim()
  const allocationCount = allocations.filter((a) => a.amount > 0).length

  let appliedTo = 'Unapplied'
  if (allocationCount === 1) {
    appliedTo = allocations[0]?.invoiceNumber ?? '1 invoice'
  } else if (allocationCount > 1) {
    appliedTo = `${allocationCount} invoices`
  }

  return {
    id: r.id,
    customerId: r.customerId || r.customer?.contactId || r.customer?.id || '',
    referenceNumber: r.referenceNumber || '',
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
    isDeposited,
    depositStatus,
    depositDate,
    depositNumber,
    depositId: String(r.depositId ?? '').trim(),
    bankAccountId,
    bankAccountName,
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
type SortKey = 'paymentNumber' | 'customer' | 'date' | 'method' | 'depositStatus' | 'amount' | 'unappliedAmount' | 'appliedTo'

function comparePayments(a: PaymentRow, b: PaymentRow, key: SortKey, dir: SortDirection): number {
  const asc = dir === 'asc' ? 1 : -1
  if (key === 'amount' || key === 'unappliedAmount') {
    const av = key === 'amount' ? a.amount : a.unappliedAmount
    const bv = key === 'amount' ? b.amount : b.unappliedAmount
    return av === bv ? 0 : av > bv ? asc : -asc
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
  { key: 'depositStatus', label: 'Deposit Status', visible: true, width: 170, align: 'left' },
  { key: 'amount', label: 'Amount', visible: true, width: 110, align: 'right' },
  { key: 'unappliedAmount', label: 'Unapplied', visible: true, width: 130, align: 'right' },
  { key: 'appliedTo', label: 'Applied To', visible: true, width: 220, align: 'left' },
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
  const router = useRouter()
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
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
  const [form, setForm] = useState({
    customerId: '',
    amount: '',
    method: 'CASH',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    memo: '',
    depositDestination: 'UNDEPOSITED_FUNDS' as DepositDestination,
    bankAccountId: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [amountAutoFromAllocations, setAmountAutoFromAllocations] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const isReallocationMode = Boolean(editingPaymentId)

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

  const loadInvoicesForCustomer = useCallback((customerId: string) => {
    if (!companyId || !customerId) {
      setInvoices([])
      return Promise.resolve()
    }

    setInvoicesLoading(true)
    return apiClient
      .get(`/companies/${companyId}/ar/invoices`, {
        params: { customerId, limit: 100 },
      })
      .then(({ data }) => {
        const raw: any[] = Array.isArray(data) ? data : data?.items || []
        setInvoices(
          raw
            .filter((i: any) =>
              ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(i.status)
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
  }, [companyId])

  useEffect(() => {
    if (!form.customerId) {
      setInvoices([])
      return
    }
    loadInvoicesForCustomer(form.customerId)
  }, [form.customerId, loadInvoicesForCustomer])

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

  useEffect(() => {
    if (!newPaymentOpen || !amountAutoFromAllocations) return
    const nextAmount = totalAllocatedDraft > 0 ? totalAllocatedDraft.toFixed(2) : ''
    setForm((current) => (current.amount === nextAmount ? current : { ...current, amount: nextAmount }))
  }, [amountAutoFromAllocations, newPaymentOpen, totalAllocatedDraft])

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

  const toggleAllocation = useCallback((invoice: InvoiceOption, checked: boolean) => {
    setDraftAllocations((prev) => {
      if (!checked) {
        return prev.filter((allocation) => allocation.invoiceId !== invoice.id)
      }
      if (prev.some((item) => item.invoiceId === invoice.id)) return prev
      return [
        ...prev,
        {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          remainingBalance: Number(invoice.remainingBalance.toFixed(2)),
          amount: Number(invoice.remainingBalance.toFixed(2)),
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

  const fillRemainingAcrossChecked = useCallback(() => {
    setDraftAllocations((prev) =>
      prev.map((allocation) =>
        ({ ...allocation, amount: Number(allocation.remainingBalance.toFixed(2)) }),
      ),
    )
  }, [])

  const clearAllAllocations = useCallback(() => {
    setDraftAllocations([])
  }, [])

  // ─── Modal open / close ───────────────────────────────────────────────────────

  function openModal() {
    setEditingPaymentId(null)
    setForm({
      customerId: '',
      amount: '',
      method: 'CASH',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      memo: '',
      depositDestination: 'UNDEPOSITED_FUNDS',
      bankAccountId: '',
    })
    setInvoices([])
    setAllocationSearch('')
    setDraftAllocations([])
    setSaveError('')
    setAmountAutoFromAllocations(true)
    setNewPaymentOpen(true)
    loadCustomers()
  }

  function closeModal() {
    setNewPaymentOpen(false)
    setEditingPaymentId(null)
    setSaveError('')
  }

  function clearSelectedCustomer() {
    setForm((current) => ({ ...current, customerId: '', amount: '' }))
    setInvoices([])
    setAllocationSearch('')
    setDraftAllocations([])
    setSaveError('')
    setAmountAutoFromAllocations(true)
  }

  function handlePaymentFormKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key !== 'Enter') return
    const target = e.target as HTMLElement
    const tagName = target.tagName.toLowerCase()
    if (tagName === 'textarea' || tagName === 'button') return
    e.preventDefault()
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
    if (!isReallocationMode && form.depositDestination === 'BANK_ACCOUNT' && !form.bankAccountId) {
      setSaveError('Select a destination bank account or switch destination to Undeposited Funds.')
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
      if (editingPaymentId) {
        await apiClient.put(`/companies/${companyId}/ar/payments/${editingPaymentId}`, {
          allocations: payloadAllocations,
        })
      } else {
        await apiClient.post(`/companies/${companyId}/ar/payments`, {
          customerId: form.customerId || undefined,
          amount: parsedAmount,
          paymentDate: form.date,
          method: form.method,
          referenceNumber: form.reference || undefined,
          memo: form.memo || undefined,
          depositDestination: form.depositDestination,
          bankAccountId: form.depositDestination === 'BANK_ACCOUNT' ? form.bankAccountId : undefined,
          allocations: payloadAllocations,
        })
      }
      closeModal()
      if (!editingPaymentId) {
        setPage(0)
        fetchPayments(0)
      } else {
        fetchPayments(page)
      }
    } catch (err: any) {
      setSaveError(extractApiErrorMessage(err, editingPaymentId ? 'Failed to reallocate payment' : 'Failed to record payment'))
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

  const openReallocateEditor = (row: PaymentRow) => {
    if (!row.customerId) {
      setError('Unable to reallocate payment because customer details are missing.')
      return
    }

    const parsedDate = row.date ? String(row.date).split('T')[0] : new Date().toISOString().split('T')[0]
    const draftFromExisting: DraftAllocation[] = row.allocations
      .filter((allocation) => Number(allocation.amount) > 0)
      .map((allocation) => ({
        invoiceId: allocation.invoiceId,
        invoiceNumber: allocation.invoiceNumber,
        date: '',
        // Existing allocations need their currently-applied amount added back to be editable.
        remainingBalance: Number((Number(allocation.remainingBalance ?? 0) + Number(allocation.amount ?? 0)).toFixed(2)),
        amount: Number(Number(allocation.amount ?? 0).toFixed(2)),
      }))

    setEditingPaymentId(row.id)
    setForm({
      customerId: row.customerId,
      amount: Number(row.amount || 0).toFixed(2),
      method: row.method || 'CASH',
      reference: row.referenceNumber || row.paymentNumber,
      date: parsedDate,
      memo: '',
      depositDestination: row.isDeposited && row.bankAccountId ? 'BANK_ACCOUNT' : 'UNDEPOSITED_FUNDS',
      bankAccountId: row.bankAccountId ?? '',
    })
    setInvoices([])
    setAllocationSearch('')
    setDraftAllocations(draftFromExisting)
    setSaveError('')
    setAmountAutoFromAllocations(false)
    setDrawerPayment(null)
    setNewPaymentOpen(true)
    loadCustomers()
    loadInvoicesForCustomer(row.customerId)
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
        r.depositStatus.toLowerCase().includes(q) ||
        (r.depositNumber ?? '').toLowerCase().includes(q) ||
        (r.bankAccountName ?? '').toLowerCase().includes(q) ||
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
    setSortDir(key === 'amount' || key === 'date' || key === 'unappliedAmount' ? 'desc' : 'asc')
  }

  const totalAmount = items.reduce((s, r) => s + r.amount, 0)

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
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
              onClick={() => router.push('/sales/collections/payments/activity')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              <Clock size={15} /> Activity Log
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
                  <td colSpan={cols.length + 1} className="px-4 py-10 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={cols.length + 1} className="px-4 py-10 text-center">
                    <p className="text-rose-500 font-medium">{error}</p>
                    <button onClick={() => fetchPayments(page)} className="mt-2 text-sm text-emerald-600 hover:underline">
                      Try again
                    </button>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={cols.length + 1} className="px-4 py-10 text-center text-slate-500">
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
                    <td className="px-4 py-3 border-r border-slate-100">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${row.depositStatus === 'DEPOSITED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {row.depositStatus === 'DEPOSITED' ? 'Deposited' : 'Undeposited'}
                      </span>
                      {(row.depositNumber || row.depositDate) && (
                        <p className="mt-1 truncate text-xs text-slate-500" title={row.depositNumber || fmtDate(row.depositDate || '')}>
                          {row.depositNumber || fmtDate(row.depositDate || '')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-800 border-r border-slate-100">
                      {formatCurrency(row.amount, currency)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums border-r border-slate-100 ${row.unappliedAmount > 0.009 ? 'text-amber-700' : 'text-slate-700'}`}>
                      {formatCurrency(Math.max(0, row.unappliedAmount), currency)}
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Invoices Allocated</p>
                        <p className="text-lg font-semibold text-slate-900">{drawerPayment.allocationCount}</p>
                      </div>
                      <div className={`rounded-lg border px-3 py-2 ${drawerPayment.unappliedAmount > 0.009 ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                        <p className="text-xs text-slate-500">Unapplied Amount</p>
                        <p className={`text-lg font-semibold ${drawerPayment.unappliedAmount > 0.009 ? 'text-amber-800' : 'text-slate-900'}`}>
                          {formatCurrency(Math.max(0, drawerPayment.unappliedAmount), currency)}
                        </p>
                      </div>
                      <div className={`rounded-lg border px-3 py-2 ${drawerPayment.depositStatus === 'DEPOSITED' ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
                        <p className="text-xs text-slate-500">Deposit Status</p>
                        <p className={`text-lg font-semibold ${drawerPayment.depositStatus === 'DEPOSITED' ? 'text-emerald-800' : 'text-amber-800'}`}>
                          {drawerPayment.depositStatus === 'DEPOSITED' ? 'Deposited' : 'Undeposited'}
                        </p>
                        {(drawerPayment.depositNumber || drawerPayment.depositDate || drawerPayment.bankAccountName) && (
                          <p className="mt-1 text-xs text-slate-600">
                            {drawerPayment.depositNumber ? `#${drawerPayment.depositNumber}` : ''}
                            {drawerPayment.depositDate ? `${drawerPayment.depositNumber ? ' • ' : ''}${fmtDate(drawerPayment.depositDate)}` : ''}
                            {drawerPayment.bankAccountName ? `${(drawerPayment.depositNumber || drawerPayment.depositDate) ? ' • ' : ''}${drawerPayment.bankAccountName}` : ''}
                          </p>
                        )}
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
                      onClick={() => openReallocateEditor(drawerPayment)}
                      className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      Reallocate
                    </button>
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

      {/* New Payment Fullscreen */}
      {newPaymentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50">
          <div className="flex h-full flex-col">
            <div className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{isReallocationMode ? 'Reallocate Payment' : 'Record Payment'}</h2>
                  <p className="text-xs text-slate-500">
                    {isReallocationMode
                      ? 'Update invoice allocations for this payment. Payment amount and customer stay locked.'
                      : 'Check invoices to auto-fill allocations. Adjust only when you need partial payments.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="record-payment-form"
                    disabled={saving}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : (isReallocationMode ? 'Save Reallocation' : 'Record Payment')}
                  </button>
                </div>
              </div>
            </div>

            <form id="record-payment-form" onSubmit={submitPayment} onKeyDown={handlePaymentFormKeyDown} className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6">
                {saveError && (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{saveError}</p>
                )}

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="space-y-2">
                      <CustomerPickerField
                        label="Customer *"
                        value={form.customerId}
                        customers={customers}
                        loading={customersLoading}
                        disabled={isReallocationMode}
                        placeholder="Select customer..."
                        createLabel="Create New Customer"
                        onOpen={loadCustomers}
                        onChange={(id) => {
                          setForm((f) => ({ ...f, customerId: id, amount: '' }))
                          setAllocationSearch('')
                          setDraftAllocations([])
                          setSaveError('')
                          setAmountAutoFromAllocations(true)
                        }}
                        onCreateNew={isReallocationMode ? undefined : () => setShowQuickAddCustomer(true)}
                      />
                      {form.customerId && !isReallocationMode && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={clearSelectedCustomer}
                            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Clear customer
                          </button>
                        </div>
                      )}
                    </div>

                    {form.customerId ? (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700">Open Invoices</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={fillRemainingAcrossChecked}
                              disabled={draftAllocations.length === 0}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-40"
                            >
                              Allocate full
                            </button>
                            <button
                              type="button"
                              onClick={clearAllAllocations}
                              disabled={draftAllocations.length === 0}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40"
                            >
                              Clear all
                            </button>
                          </div>
                        </div>

                        <input
                          value={allocationSearch}
                          onChange={(e) => setAllocationSearch(e.target.value)}
                          disabled={invoicesLoading}
                          placeholder={invoicesLoading ? 'Loading open invoices…' : 'Search open invoices by number, date, or balance'}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                        />

                        <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                          {!form.customerId ? null : invoicesLoading ? (
                            <p className="px-3 py-4 text-sm text-slate-500">Loading invoices…</p>
                          ) : filteredOpenInvoices.length === 0 ? (
                            <p className="px-3 py-4 text-sm text-slate-500">No open invoices match your search.</p>
                          ) : (
                            filteredOpenInvoices.map((invoice) => {
                              const isSelected = selectedAllocationIds.has(invoice.id)
                              return (
                                <label key={invoice.id} className="flex cursor-pointer items-start gap-3 border-t border-slate-100 px-3 py-2 first:border-t-0 hover:bg-slate-50">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => toggleAllocation(invoice, e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">{invoice.invoiceNumber}</p>
                                    <p className="text-xs text-slate-500">{fmtDate(invoice.date)} • {formatCurrency(invoice.remainingBalance, currency)} remaining</p>
                                  </div>
                                  <p className={`text-xs font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    {isSelected ? 'Checked' : 'Open'}
                                  </p>
                                </label>
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
                                  <div className="mt-2">
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
                  </section>

                  <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <label className="block text-sm font-medium text-slate-700">Amount *</label>
                          <button
                            type="button"
                            onClick={() => setAmountAutoFromAllocations(true)}
                            disabled={isReallocationMode}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-40"
                          >
                            Auto from allocations
                          </button>
                        </div>
                        <input
                          required
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={form.amount}
                          disabled={isReallocationMode}
                          onChange={(e) => {
                            setAmountAutoFromAllocations(false)
                            setForm((f) => ({ ...f, amount: e.target.value }))
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                          placeholder="0.00"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          {isReallocationMode
                            ? 'Amount is locked during reallocation.'
                            : (amountAutoFromAllocations ? 'Auto-calculated from checked invoices. Edit to keep unapplied cash.' : 'Manual override active.')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                        <input
                          required
                          type="date"
                          value={form.date}
                          disabled={isReallocationMode}
                          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                          aria-label="Payment date"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-100 disabled:text-slate-500"
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
                      <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
                        Total allocated cannot exceed payment amount.
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                        <select
                          value={form.method}
                          disabled={isReallocationMode}
                          onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                          aria-label="Payment method"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-100 disabled:text-slate-500"
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
                          disabled={isReallocationMode}
                          onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                          placeholder="Check # or ref"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Deposit Destination</label>
                      <div className="grid gap-2">
                        <label className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${form.depositDestination === 'UNDEPOSITED_FUNDS' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                          <input
                            type="radio"
                            name="deposit-destination"
                            value="UNDEPOSITED_FUNDS"
                            checked={form.depositDestination === 'UNDEPOSITED_FUNDS'}
                            disabled={isReallocationMode}
                            onChange={() => setForm((f) => ({ ...f, depositDestination: 'UNDEPOSITED_FUNDS', bankAccountId: '' }))}
                            className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-medium text-slate-700">Undeposited Funds</span>
                        </label>
                        <div className={`rounded-lg border px-3 py-2 text-sm ${form.depositDestination === 'BANK_ACCOUNT' ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                          <p className="mb-2 font-medium text-slate-700">Direct to Bank Account</p>
                          <BankAccountPickerField
                            companyId={companyId || ''}
                            value={form.depositDestination === 'BANK_ACCOUNT' ? (form.bankAccountId || null) : null}
                            placeholder="Search and select bank account..."
                            disabled={isReallocationMode}
                            onChange={(id) => {
                              setForm((f) => ({
                                ...f,
                                depositDestination: id ? 'BANK_ACCOUNT' : 'UNDEPOSITED_FUNDS',
                                bankAccountId: id,
                              }))
                            }}
                          />
                          <p className="mt-1 text-xs text-slate-500">Selecting a bank account marks this payment as deposited immediately.</p>
                        </div>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {form.depositDestination === 'BANK_ACCOUNT'
                          ? 'Payment is marked as deposited immediately into the selected bank account.'
                          : 'Payment stays in Undeposited Funds until included in a bank deposit.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Memo</label>
                      <textarea
                        rows={4}
                        value={form.memo}
                        onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-y"
                        placeholder="Optional memo…"
                      />
                    </div>
                  </section>
                </div>
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
            setForm((prev) => ({ ...prev, customerId: next.id, amount: '' }))
            setAllocationSearch('')
            setDraftAllocations([])
            setSaveError('')
            setAmountAutoFromAllocations(true)
            setShowQuickAddCustomer(false)
          }}
        />
      )}
    </div>
  )
}
