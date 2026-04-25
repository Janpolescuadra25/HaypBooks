'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, X, Save, CheckSquare, Square } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { formatCurrency } from '@/lib/format'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'

const today = new Date().toISOString().slice(0, 10)
const PAYMENT_METHODS = ['Check', 'Bank Transfer', 'Credit Card', 'Cash', 'ACH']

interface Bill {
  id: string
  billNumber?: string
  vendorId?: string
  vendorName?: string
  dueDate?: string
  totalAmount?: number
  amountDue?: number
}

interface BillSelection {
  billId: string
  paymentAmount: number
  memo: string
}

interface PaymentRunFormProps { mode: 'new' | 'edit'; runId?: string }

export default function PaymentRunForm({ mode, runId }: PaymentRunFormProps) {
  const router = useRouter()
  const toast = useToast()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [bills, setBills] = useState<Bill[]>([])
  const [selections, setSelections] = useState<Map<string, BillSelection>>(new Map())
  const [loadingBills, setLoadingBills] = useState(true)
  const [paymentDate, setPaymentDate] = useState(today)
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer')
  const [bankAccount, setBankAccount] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')

  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && runId ? { tableName: 'PaymentRun', recordId: runId } : undefined,
  })

  const fetchBills = useCallback(async () => {
    if (!companyId) return
    setLoadingBills(true)
    try {
      const res = await expensesService.listBills(companyId, { status: 'PENDING', limit: 200 })
      const data = res.data ?? res
      const list = Array.isArray(data) ? data : data.bills ?? []
      setBills(list.map((b: Record<string, unknown>) => ({
        id: String(b.id),
        billNumber: b.billNumber ? String(b.billNumber) : undefined,
        vendorId: b.vendorId ? String(b.vendorId) : undefined,
        vendorName: b.vendorName ? String(b.vendorName) : undefined,
        dueDate: b.dueDate ? String(b.dueDate) : undefined,
        totalAmount: Number(b.totalAmount ?? b.amount ?? 0),
        amountDue: Number(b.amountDue ?? b.totalAmount ?? b.amount ?? 0),
      })))
    } catch { toast.error('Failed to load outstanding bills') }
    finally { setLoadingBills(false) }
  }, [companyId, toast])

  useEffect(() => { fetchBills() }, [fetchBills])

  // Pre-load existing run in edit mode
  useEffect(() => {
    if (mode !== 'edit' || !runId || !companyId) return
    let active = true
    expensesService.getPaymentRun(companyId, runId).then((res) => {
      if (!active) return
      const d = res.data ?? res
      setPaymentDate(d.paymentDate?.slice(0, 10) ?? today)
      setPaymentMethod(d.paymentMethod ?? 'Bank Transfer')
      setBankAccount(d.bankAccount ?? '')
      setReferenceNumber(d.referenceNumber ?? '')
      setMemo(d.memo ?? '')
      if (Array.isArray(d.bills)) {
        const map = new Map<string, BillSelection>()
        d.bills.forEach((b: Record<string, unknown>) => {
          map.set(String(b.billId), { billId: String(b.billId), paymentAmount: Number(b.paymentAmount ?? 0), memo: String(b.memo ?? '') })
        })
        setSelections(map)
      }
    }).catch(() => toast.error('Failed to load payment run'))
    return () => { active = false }
  }, [companyId, runId, mode, toast])

  const toggleBill = useCallback((bill: Bill) => {
    setSelections((prev) => {
      const next = new Map(prev)
      if (next.has(bill.id)) {
        next.delete(bill.id)
      } else {
        next.set(bill.id, { billId: bill.id, paymentAmount: bill.amountDue ?? 0, memo: '' })
      }
      return next
    })
  }, [])

  const updatePaymentAmount = useCallback((billId: string, value: number) => {
    setSelections((prev) => {
      const next = new Map(prev)
      const sel = next.get(billId)
      if (sel) next.set(billId, { ...sel, paymentAmount: value })
      return next
    })
  }, [])

  const updateLineMemo = useCallback((billId: string, value: string) => {
    setSelections((prev) => {
      const next = new Map(prev)
      const sel = next.get(billId)
      if (sel) next.set(billId, { ...sel, memo: value })
      return next
    })
  }, [])

  const selectedBills = useMemo(() => bills.filter((b) => selections.has(b.id)), [bills, selections])
  const totalAmount = useMemo(() => Array.from(selections.values()).reduce((sum, s) => sum + s.paymentAmount, 0), [selections])
  const vendorCount = useMemo(() => new Set(selectedBills.map((b) => b.vendorId)).size, [selectedBills])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!paymentDate) { setError('Payment date is required'); return false }
    if (!paymentMethod) { setError('Payment method is required'); return false }
    if (selections.size === 0) { setError('Select at least one bill to pay'); return false }
    if (Array.from(selections.values()).some((s) => s.paymentAmount <= 0)) {
      setError('All selected bills must have a payment amount greater than zero'); return false
    }
    setError(''); return true
  }

  const handleSave = async () => {
    if (!companyId || !validate()) return
    setSubmitting(true)
    try {
      const payload = {
        paymentDate,
        paymentMethod,
        bankAccount: bankAccount || null,
        referenceNumber: referenceNumber || null,
        memo,
        bills: Array.from(selections.values()),
      }
      if (mode === 'new') {
        await expensesService.createPaymentRun(companyId, payload)
        toast.success('Payment run created')
      }
      router.push('/expenses/bills-payments/payment-runs')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to save payment run'
      setError(msg); toast.error(msg)
    } finally { setSubmitting(false) }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push('/expenses/bills-payments/payment-runs')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
                <ArrowLeft size={16} /> Back to payment runs
              </button>
              <div className="mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Payment Run' : 'Edit Payment Run'}</h1>
                <p className="mt-1 text-sm text-slate-500">Select outstanding bills and process payments in bulk.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="inline-flex rounded-xl bg-white/50 p-1 border border-slate-100">
            <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
            <button type="button" onClick={() => setActiveTab('activity')} disabled={mode === 'new' || !runId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
          </div>
        </div>
        <div className={activeTab !== 'details' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-44 space-y-6">
          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          {/* Run header fields */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Payment Details</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Payment Date <span className="text-rose-500">*</span></label>
                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Payment Method <span className="text-rose-500">*</span></label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Bank Account</label>
                <input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Account number / name" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Reference Number</label>
                <input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Check # / Transaction ID" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div className="sm:col-span-2 xl:col-span-2">
                <label className="block text-sm font-semibold text-slate-900">Memo</label>
                <input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Payment run memo" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
            </div>
          </section>

          {/* Bill selection */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Outstanding Bills</h2>
                <p className="mt-1 text-sm text-slate-500">{loadingBills ? 'Loading…' : `${bills.length} bills available — select bills to include in this run`}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 w-12"></th>
                    <th className="px-4 py-3">Bill #</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Amount Due</th>
                    <th className="px-4 py-3 text-right">Payment Amount</th>
                    <th className="px-4 py-3">Memo</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBills ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">Loading bills…</td></tr>
                  ) : bills.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No outstanding bills found</td></tr>
                  ) : bills.map((bill) => {
                    const sel = selections.get(bill.id)
                    const isSelected = !!sel
                    return (
                      <tr key={bill.id} className={`border-t border-slate-200 ${isSelected ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'}`}>
                        <td className="px-4 py-3 align-middle">
                          <button type="button" onClick={() => toggleBill(bill)} className="text-gray-300 hover:text-emerald-600">
                            {isSelected ? <CheckSquare size={16} className="text-emerald-500" /> : <Square size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 align-middle font-semibold text-slate-800">{bill.billNumber ?? '—'}</td>
                        <td className="px-4 py-3 align-middle text-slate-700">{bill.vendorName ?? '—'}</td>
                        <td className="px-4 py-3 align-middle text-slate-500">{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 align-middle text-right font-medium text-slate-700 tabular-nums">{formatCurrency(bill.amountDue ?? 0, currency)}</td>
                        <td className="px-4 py-3 align-middle text-right">
                          {isSelected ? (
                            <input
                              type="number" min={0} step="0.01" value={sel.paymentAmount}
                              onChange={(e) => updatePaymentAmount(bill.id, Number(e.target.value))}
                              aria-label="Payment amount"
                              className="w-32 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-right text-slate-900 focus:border-emerald-400 focus:outline-none"
                            />
                          ) : (
                            <span className="text-slate-300 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          {isSelected ? (
                            <input
                              value={sel.memo} onChange={(e) => updateLineMemo(bill.id, e.target.value)}
                              placeholder="Optional" aria-label="Bill memo"
                              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                            />
                          ) : (
                            <span className="text-slate-300 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        </div>
        <div className={activeTab !== 'activity' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
                <div className="mt-4">
                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this payment run yet." />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky summary + actions */}
      <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Summary */}
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500">Bills selected: </span>
                <span className="font-semibold text-slate-900">{selections.size}</span>
              </div>
              <div>
                <span className="text-slate-500">Vendors: </span>
                <span className="font-semibold text-slate-900">{vendorCount}</span>
              </div>
              <div>
                <span className="text-slate-500">Total: </span>
                <span className="font-bold text-emerald-700 text-base">{formatCurrency(totalAmount, currency)}</span>
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {error && <p className="w-full text-sm font-medium text-rose-600 sm:w-auto">{error}</p>}
              <button type="button" onClick={() => router.push('/expenses/bills-payments/payment-runs')} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <X size={16} className="inline mr-1" />Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={submitting || selections.size === 0} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {mode === 'new' ? 'Create Payment Run' : 'Update Run'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
