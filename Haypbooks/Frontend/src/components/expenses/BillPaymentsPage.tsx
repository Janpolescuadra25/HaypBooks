'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, X, AlertCircle, Loader2, CreditCard, Ban, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import DataPage from '@/components/shared/DataPage'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'
import ColumnResizer from '@/components/ColumnResizer'
import { useToast } from '@/components/ui/Toast'

interface Bill {
  id: string
  billNumber?: string
  vendorId?: string
  vendorName?: string
  status?: string
  amountDue?: number
  total: number
  date: string
}

interface BillPayment {
  id: string
  paymentNumber?: string
  vendorId?: string
  vendorName?: string
  billId?: string
  billNumber?: string
  date: string
  amount: number
  method?: string
  reference?: string
  status?: string
}

type SortKey = 'paymentNumber' | 'vendorName' | 'date' | 'method' | 'amount'

const PAYMENT_TABLE_ORDER: SortKey[] = ['paymentNumber', 'vendorName', 'date', 'method', 'amount']
const DEFAULT_PAYMENT_COL_WIDTHS: Record<SortKey, number> = {
  paymentNumber: 130,
  vendorName: 190,
  date: 120,
  method: 140,
  amount: 130,
}
const PAYMENT_COLUMNS_STORAGE_KEY = 'bill-payments-column-widths-v1'

function loadPaymentWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(PAYMENT_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_PAYMENT_COL_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_PAYMENT_COL_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => PAYMENT_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_PAYMENT_COL_WIDTHS
  }
}

function comparePayments(a: BillPayment, b: BillPayment, key: SortKey, dir: 'asc' | 'desc') {
  const left = a[key] ?? ''
  const right = b[key] ?? ''
  if (key === 'amount') {
    return dir === 'asc' ? Number(left) - Number(right) : Number(right) - Number(left)
  }
  return dir === 'asc'
    ? String(left).toLowerCase().localeCompare(String(right).toLowerCase())
    : String(right).toLowerCase().localeCompare(String(left).toLowerCase())
}

export default function BillPaymentsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [payments, setPayments] = useState<BillPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadPaymentWidthMap())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [showForm, setShowForm] = useState(false)
  const widthsRef = useRef(widths)

  useEffect(() => { widthsRef.current = widths }, [widths])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try { localStorage.setItem(PAYMENT_COLUMNS_STORAGE_KEY, JSON.stringify(next)) } catch { }
  }, [])

  const { containerRef } = useFixedWidthResizableMap({
    widths,
    widthsRef,
    order: PAYMENT_TABLE_ORDER,
    saveWidths,
    fixedWidth: 80,
    minWidth: 100,
    fallbackMinWidth: 100,
  })

  const fetchPayments = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/bill-payments`)
      setPayments(Array.isArray(data) ? data : data.payments ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const filtered = useMemo(() => {
    if (!search) return payments
    const q = search.toLowerCase()
    return payments.filter((p) =>
      (p.vendorName ?? '').toLowerCase().includes(q) ||
      (p.paymentNumber ?? '').toLowerCase().includes(q) ||
      (p.reference ?? '').toLowerCase().includes(q),
    )
  }, [payments, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => comparePayments(a, b, sortKey, sortDir))
  }, [filtered, sortKey, sortDir])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, pageSize, sorted.length])

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  const handleVoid = useCallback(async (id: string) => {
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
  }, [companyId, toast])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
  }

  const columns = useMemo(() => {
    const makeHeader = (label: string, key: SortKey, width: number) => (
      <div className="relative flex items-center gap-2">
        <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-2 text-left font-medium text-slate-800 hover:text-slate-900">
          {label}
          {sortKey === key ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
        </button>
        <ColumnResizer colKey={key} width={width} onChange={(_, next) => setWidths((prev) => ({ ...prev, [key]: next }))} min={80} />
      </div>
    )

    return [
      {
        accessorKey: 'paymentNumber',
        header: makeHeader('Payment #', 'paymentNumber', widths.paymentNumber),
        meta: { align: 'left', style: { width: widths.paymentNumber, minWidth: widths.paymentNumber, maxWidth: widths.paymentNumber } },
      },
      {
        accessorKey: 'vendorName',
        header: makeHeader('Vendor', 'vendorName', widths.vendorName),
        meta: { align: 'left', style: { width: widths.vendorName, minWidth: widths.vendorName, maxWidth: widths.vendorName } },
      },
      {
        accessorKey: 'date',
        header: makeHeader('Date', 'date', widths.date),
        meta: { align: 'left', style: { width: widths.date, minWidth: widths.date, maxWidth: widths.date } },
        cell: ({ getValue }) => <span>{fmtDate(String(getValue() ?? ''))}</span>,
      },
      {
        accessorKey: 'method',
        header: makeHeader('Method', 'method', widths.method),
        meta: { align: 'left', style: { width: widths.method, minWidth: widths.method, maxWidth: widths.method } },
      },
      {
        accessorKey: 'amount',
        header: makeHeader('Amount', 'amount', widths.amount),
        meta: { align: 'right', style: { width: widths.amount, minWidth: widths.amount, maxWidth: widths.amount } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 120, minWidth: 120, maxWidth: 120 } },
        cell: ({ row }) => {
          const payment = row.original as BillPayment
          return (
            <div className="flex items-center justify-end gap-1">
              {payment.status !== 'VOIDED' && (
                <button onClick={() => handleVoid(payment.id)} className="p-1 rounded hover:bg-red-100 text-red-400" data-no-row-toggle title="Void"><Ban size={14} /></button>
              )}
            </div>
          )
        },
      },
    ]
  }, [fmt, handleVoid, sortKey, sortDir, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  if (cidLoading || (loading && payments.length === 0)) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading…</span></div>
  }

  if (cidError) {
    return <div className="p-6 text-center text-red-600">{cidError}</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <DataPage
        title="Bill Payments"
        subtitle={`${sorted.length} payments`}
        primaryActionLabel="Record Payment"
        onPrimaryAction={() => setShowForm(true)}
        filters={(
          <div className="grid gap-3 lg:grid-cols-[1fr]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                placeholder="Search payments…"
                className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
        )}
        columns={columns}
        data={paged}
        isLoading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={sorted.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
        selectedIds={[]}
        onSelectionChange={() => {}}
        getRowId={(row) => row.id}
        emptyTitle="No payments found"
        emptyDescription="Try a different search or record a payment."
        emptyPrimaryAction="Record Payment"
        onEmptyPrimaryAction={() => setShowForm(true)}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

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
      setBills(all.filter((b: Bill) => ['APPROVED', 'PARTIALLY_PAID', 'PENDING'].includes(String(b.status))))
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

  const selectedBill = bills.find((b) => b.id === billId)
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
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                    {billHistory.map((payment) => (
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
            <select value={billId} onChange={(e) => {
              setBillId(e.target.value)
              const b = bills.find((bill) => bill.id === e.target.value)
              if (b) setAmount(String(b.amountDue ?? b.total))
            }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
              <option value="">Select a bill…</option>
              {bills.map((b) => <option key={b.id} value={b.id}>{b.billNumber ?? b.id.slice(0, 8)} — {b.vendorName} ({fmt(b.amountDue ?? b.total)})</option>)}
            </select>
            {selectedBill && <p className="text-sm text-slate-500 mt-1">Balance due: {fmt(selectedBill.amountDue ?? selectedBill.total)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount *</label>
              <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
                <option value="CASH">Cash</option>
                <option value="CHECK">Check</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
              <input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" placeholder="Reference #" />
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
