'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, X } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { expensesService } from '@/services/expenses.service'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'

interface BillPaymentFormProps {
  mode: 'new' | 'edit'
  paymentId?: string
}

interface Vendor {
  id: string
  displayName: string
}

interface OutstandingBill {
  id: string
  billNumber?: string
  date: string
  dueDate: string
  amountDue: number
  selected: boolean
  paymentAmount: number
  memo: string
}

// API shapes used when mapping responses
interface ApiBill {
  id: string
  billNumber?: string | null
  date?: string | null
  dueDate?: string | null
  amountDue?: number | null
  total?: number | null
  status?: string | null
}

interface ApplicationApi {
  billId: string
  amount?: number | null
  bill?: ApiBill | null
}

const PAYMENT_METHODS = ['Check', 'Bank Transfer', 'Credit Card', 'Cash']
const today = new Date().toISOString().slice(0, 10)

export default function BillPaymentForm({ mode, paymentId }: BillPaymentFormProps) {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorId, setVendorId] = useState('')
  const [vendorSearch, setVendorSearch] = useState('')
  const [paymentDate, setPaymentDate] = useState(today)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [referenceNumber, setReferenceNumber] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [memo, setMemo] = useState('')
  const [notes, setNotes] = useState('')
  const [bills, setBills] = useState<OutstandingBill[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [readOnly, setReadOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')

  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && paymentId ? { tableName: 'BillPayment', recordId: paymentId } : undefined,
  })

  const filteredVendors = useMemo(() => {
    if (!vendorSearch) return vendors
    const q = vendorSearch.toLowerCase()
    return vendors.filter((vendor) => vendor.displayName.toLowerCase().includes(q))
  }, [vendorSearch, vendors])

  useEffect(() => {
    if (!companyId) return
    let active = true
    expensesService.listVendors(companyId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        setVendors(Array.isArray(data) ? data : data.data ?? [])
      })
      .catch(() => toast.error('Failed to load vendors'))
    return () => { active = false }
  }, [companyId, toast])

  useEffect(() => {
    if (!companyId || !vendorId || mode !== 'new') return
    let active = true
    expensesService.listBills(companyId, { vendorId, status: 'PENDING', limit: 100 })
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const debts = Array.isArray(data) ? data : data.data ?? []
        setBills(debts.filter((bill: ApiBill) => bill.status !== 'PAID' && bill.status !== 'VOIDED').map((bill: ApiBill) => ({
          id: bill.id,
          billNumber: bill.billNumber ?? '',
          date: bill.date ?? '',
          dueDate: bill.dueDate ?? '',
          amountDue: Number(bill.amountDue ?? bill.total ?? 0),
          selected: false,
          paymentAmount: Number(bill.amountDue ?? bill.total ?? 0),
          memo: '',
        })))
      })
      .catch(() => toast.error('Failed to load outstanding bills'))
    return () => { active = false }
  }, [companyId, vendorId, mode, toast])

  useEffect(() => {
    if (!companyId || mode !== 'edit' || !paymentId) return
    let active = true
    expensesService.getBillPayment(companyId, paymentId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setVendorId(data.vendorId ?? '')
        setPaymentDate((data.paymentDate ?? today).slice(0, 10))
        setPaymentMethod(data.method ?? PAYMENT_METHODS[0])
        setReferenceNumber(data.referenceNumber ?? '')
        setBankAccount(data.bankAccountId ?? '')
        setMemo(data.memo ?? '')
        setNotes(data.notes ?? '')
        setReadOnly(true)
        if (Array.isArray(data.applications)) {
          setBills(data.applications.map((app: ApplicationApi) => ({
            id: app.billId,
            billNumber: app.bill?.billNumber ?? '',
            date: app.bill?.date ?? '',
            dueDate: app.bill?.dueDate ?? '',
            amountDue: Number(app.bill?.amountDue ?? app.amount ?? 0),
            selected: true,
            paymentAmount: Number(app.amount ?? 0),
            memo: '',
          })))
        }
      })
      .catch(() => toast.error('Failed to load bill payment'))
    return () => { active = false }
  }, [companyId, mode, paymentId, toast])

  const toggleBill = useCallback((id: string) => {
    setBills((items) => items.map((item) => item.id === id ? { ...item, selected: !item.selected } : item))
  }, [])

  const updateBill = useCallback((id: string, field: 'paymentAmount' | 'memo', value: string | number) => {
    setBills((items) => items.map((item) => item.id === id ? { ...item, [field]: field === 'memo' ? String(value) : Number(value) } : item))
  }, [])

  const selectedBills = useMemo(() => bills.filter((bill) => bill.selected), [bills])
  const totalPayment = useMemo(() => selectedBills.reduce((sum, bill) => sum + Number(bill.paymentAmount || 0), 0), [selectedBills])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!vendorId) { setError('Please choose a vendor'); return false }
    if (!selectedBills.length) { setError('Select at least one bill to pay'); return false }
    if (selectedBills.some((bill) => bill.paymentAmount <= 0)) { setError('Payment amount must be greater than zero'); return false }
    setError('')
    return true
  }

  const handleSave = async () => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const firstBill = selectedBills[0]
      const payload = {
        billId: firstBill.id,
        amount: totalPayment,
        paymentDate,
        method: paymentMethod,
        referenceNumber,
        bankAccountId: bankAccount || null,
        currency,
        applications: selectedBills.map((bill, index) => ({ billId: bill.id, amount: bill.paymentAmount, memo: bill.memo || null })),
        memo,
      }
      await expensesService.recordBillPayment(companyId, payload)
      toast.success('Payment recorded')
      router.push('/expenses/bills-payments/bill-payments')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to record payment')
      toast.error('Unable to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  const vendorOptions = useMemo(() => filteredVendors, [filteredVendors])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push('/expenses/bills-payments/bill-payments')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
                <ArrowLeft size={16} /> Back to bill payments
              </button>
              <div className="mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Bill Payment' : 'Bill Payment Details'}</h1>
                <p className="mt-1 text-sm text-slate-500">Record vendor payments and apply them to outstanding bills.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-40">
          <div className="inline-flex rounded-xl bg-white/50 p-1 border border-slate-100 mb-4">
            <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
            <button type="button" onClick={() => setActiveTab('activity')} disabled={mode === 'new' || !paymentId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
          </div>

          <div className={activeTab !== 'details' ? 'hidden' : ''}>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Payment Number</label>
                  <input value={paymentId ? paymentId : 'Auto-generated'} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Payment Date</label>
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} disabled={mode === 'edit'} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={mode === 'edit'} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Vendor</label>
                  <div className="mt-2 flex gap-2">
                    <input value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} disabled={mode === 'edit'} placeholder="Search vendors" className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                    <button type="button" onClick={() => setVendorSearch('')} disabled={mode === 'edit'} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">Clear</button>
                  </div>
                  <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} disabled={mode === 'edit'} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    <option value="">Select vendor</option>
                    {vendorOptions.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.displayName}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mt-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Bills to Pay</h2>
                      <p className="mt-1 text-sm text-slate-500">Choose outstanding bills and enter payment amounts.</p>
                    </div>
                    {mode === 'new' && <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">Total: {formatCurrency(totalPayment, currency)}</div>}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 w-12" />
                          <th className="px-4 py-3">Bill #</th>
                          <th className="px-4 py-3">Bill Date</th>
                          <th className="px-4 py-3">Due Date</th>
                          <th className="px-4 py-3 text-right">Amount Due</th>
                          <th className="px-4 py-3 text-right">Payment</th>
                          <th className="px-4 py-3">Memo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bills.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">No outstanding bills found for this vendor.</td></tr>
                        ) : bills.map((bill) => (
                          <tr key={bill.id} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="px-4 py-3"><input type="checkbox" checked={bill.selected} disabled={mode === 'edit'} onChange={() => toggleBill(bill.id)} className="h-4 w-4 text-emerald-600" /></td>
                            <td className="px-4 py-3 font-semibold text-slate-900">{bill.billNumber || '—'}</td>
                            <td className="px-4 py-3 text-slate-500">{bill.date}</td>
                            <td className="px-4 py-3 text-slate-500">{bill.dueDate}</td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-800">{formatCurrency(bill.amountDue, currency)}</td>
                            <td className="px-4 py-3 text-right">
                              <input type="number" min="0" step="0.01" value={bill.paymentAmount} disabled={mode === 'edit' || !bill.selected} onChange={(e) => updateBill(bill.id, 'paymentAmount', Number(e.target.value))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                            </td>
                            <td className="px-4 py-3"><input value={bill.memo} disabled={mode === 'edit' || !bill.selected} onChange={(e) => updateBill(bill.id, 'memo', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Memo" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-900">Payment summary</div>
                    <div className="flex items-center justify-between text-sm text-slate-600"><span>Selected bills</span><span>{selectedBills.length}</span></div>
                    <div className="flex items-center justify-between text-sm text-slate-600"><span>Total payment</span><span>{formatCurrency(totalPayment, currency)}</span></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Reference / Check #</label>
                  <input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} disabled={mode === 'edit'} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Reference number" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Bank Account</label>
                  <input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} disabled={mode === 'edit'} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Bank account" />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-semibold text-slate-900">Memo</label>
                  <textarea value={memo} onChange={(e) => setMemo(e.target.value)} disabled={mode === 'edit'} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Payment memo" />
                </div>
              </div>
            </section>
          </div>

          <div className={activeTab !== 'activity' ? 'hidden' : ''}>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
              <div className="mt-4">
                <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this bill payment yet." />
              </div>
            </section>
          </div>

        </div>
      </main>

      <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.08)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-end">
            <button type="button" onClick={() => router.push('/expenses/bills-payments/bill-payments')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><X size={16} /> Cancel</button>
            <button type="button" onClick={handleSave} disabled={mode === 'edit' || submitting || !selectedBills.length} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Record Payment
            </button>
          </div>
          {error && <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        </div>
      </div>
    </div>
  )
}
