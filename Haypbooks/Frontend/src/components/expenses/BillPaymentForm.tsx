'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Save, Loader2, X, FileText, Paperclip, History, CheckCircle2 } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { expensesService } from '@/services/expenses.service'
import { bankingService } from '@/services/banking.service'
import ActivityLog from '@/components/ui/ActivityLog'
import HaypDatePicker from '@/components/shared/HaypDatePicker'
import HaypFileUpload, { AttachmentMeta } from '@/components/shared/HaypFileUpload'
import { useActivityLog } from '@/hooks/useActivityLog'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import { NewVendorModal } from '@/components/shared/NewVendorModal'
import HaypSelect from '@/components/shared/HaypSelect'

interface BillPaymentFormProps {
  mode: 'new' | 'edit'
  paymentId?: string
}

interface Vendor {
  id: string
  displayName: string
}

interface BankAccount {
  id: string
  displayName: string
}

interface OutstandingBill {
  id: string
  billNumber?: string
  date: string
  dueDate: string
  originalAmount: number
  amountDue: number
  vendorId: string
  vendorName: string
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
  vendorId?: string | null
  vendorName?: string | null
  vendor?: {
    id?: string | null
    displayName?: string | null
    name?: string | null
  }
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
  const searchParams = useSearchParams()
  const queryBillId = searchParams.get('billId') ?? ''
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorId, setVendorId] = useState('')
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [bankAccountId, setBankAccountId] = useState('')
  const [paymentDate, setPaymentDate] = useState(today)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [referenceNumber, setReferenceNumber] = useState('')
  const [memo, setMemo] = useState('')
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([])
  const [showOverdue, setShowOverdue] = useState(false)
  const [bills, setBills] = useState<OutstandingBill[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'memo' | 'attachments' | 'activity'>('details')

  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && paymentId ? { tableName: 'BillPayment', recordId: paymentId } : undefined,
  })

  useEffect(() => {
    if (!companyId) return
    let active = true
    bankingService.listBankAccounts(companyId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const accounts = Array.isArray(data) ? data : data.data ?? []
        const normalized = (accounts as any[]).map((account) => ({
          id: account.id,
          displayName: account.displayName ?? account.name ?? account.bankName ?? `Account ${account.id}`,
        }))
        setBankAccounts(normalized)
      })
      .catch(() => toast.error('Failed to load bank accounts'))
    return () => { active = false }
  }, [companyId, toast])

  useEffect(() => {
    if (!companyId) return
    let active = true
    expensesService.listVendors(companyId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const vendors = Array.isArray(data) ? data : data.data ?? []
        setVendors(vendors)
      })
      .catch(() => toast.error('Failed to load vendors'))
    return () => { active = false }
  }, [companyId, toast])

  useEffect(() => {
    if (!bankAccountId && bankAccounts.length > 0) {
      setBankAccountId(bankAccounts[0].id)
    }
  }, [bankAccounts, bankAccountId])

  useEffect(() => {
    if (!companyId || mode !== 'new') return
    if (!vendorId && !queryBillId) {
      setBills([])
      return
    }

    let active = true
    const listQuery: Record<string, any> = { status: 'APPROVED', limit: 100 }
    if (vendorId) {
      listQuery.vendorId = vendorId
    }

    expensesService.listBills(companyId, listQuery)
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const debts = Array.isArray(data) ? data : data.data ?? []
        const normalized = debts
          .filter((item: any) => item.status !== 'PAID' && item.status !== 'VOIDED')
          .map((item: any) => {
            const bill = item as ApiBill
            const original = Number(bill.total ?? bill.amountDue ?? 0)
            return {
              id: bill.id,
              billNumber: bill.billNumber ?? '',
              date: bill.date ?? '',
              dueDate: bill.dueDate ?? '',
              originalAmount: original,
              amountDue: Number(bill.amountDue ?? bill.total ?? 0),
              vendorId: String(bill.vendorId ?? bill.vendor?.id ?? ''),
              vendorName: String(bill.vendorName ?? bill.vendor?.displayName ?? bill.vendor?.name ?? ''),
              selected: false,
              paymentAmount: 0,
              memo: '',
            }
          })

        if (queryBillId) {
          const matched = normalized.find((bill) => bill.id === queryBillId)
          if (matched) {
            setVendorId(matched.vendorId)
            setBills(normalized.map((bill) => bill.id === queryBillId ? { ...bill, selected: true, paymentAmount: bill.amountDue } : bill))
            return
          }
        }

        setBills(normalized)
      })
      .catch(() => toast.error('Failed to load outstanding bills'))
    return () => { active = false }
  }, [companyId, vendorId, mode, queryBillId, toast])

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
        setBankAccountId(data.bankAccountId ?? '')
        setMemo(data.memo ?? '')
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
    setBills((items) => items.map((item) => item.id === id ? {
      ...item,
      selected: !item.selected,
      paymentAmount: item.selected ? 0 : item.paymentAmount || item.amountDue,
    } : item))
  }, [])

  const updateBill = useCallback((id: string, field: 'paymentAmount' | 'memo', value: string | number) => {
    setBills((items) => items.map((item) => {
      if (item.id !== id) return item
      if (field === 'memo') return { ...item, memo: String(value) }
      const amount = Number(value)
      return {
        ...item,
        selected: amount > 0,
        paymentAmount: Number.isNaN(amount) ? 0 : Math.min(amount, item.amountDue),
      }
    }))
  }, [])

  const visibleBills = useMemo(() => {
    const todayDate = new Date(today)
    return bills.filter((bill) => {
      const vendorMatch = !vendorId || bill.vendorId === vendorId
      const overdueMatch = !showOverdue || (bill.dueDate ? new Date(bill.dueDate) < todayDate : false)
      return vendorMatch && overdueMatch
    })
  }, [bills, showOverdue, vendorId])

  const selectedBills = useMemo(() => bills.filter((bill) => bill.selected), [bills])
  const totalPayment = useMemo(() => selectedBills.reduce((sum, bill) => sum + Number(bill.paymentAmount || 0), 0), [selectedBills])
  const vendorOptions = useMemo(() => vendors.map((v) => ({ id: v.id, name: v.displayName })), [vendors])
  const [showVendorModal, setShowVendorModal] = useState(false)

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!bankAccountId) { setError('Please choose a payment account'); return false }
    if (!selectedBills.length) { setError('Select at least one bill to pay'); return false }
    if (selectedBills.some((bill) => bill.paymentAmount <= 0)) { setError('Payment amount must be greater than zero'); return false }
    if (selectedBills.some((bill) => bill.paymentAmount > bill.amountDue)) { setError('Payment amount cannot exceed bill balance'); return false }
    setError('')
    return true
  }

  const handleSave = async () => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const firstBill = selectedBills[0]
      const selectedVendorIds = Array.from(new Set(selectedBills.map((bill) => bill.vendorId).filter((id) => Boolean(id))))
      const payloadVendorId = selectedVendorIds.length === 1 ? selectedVendorIds[0] : undefined
      const billsPayload = selectedBills.map((bill) => ({ billId: bill.id, paymentAmount: bill.paymentAmount }))
      const payload = {
        billId: firstBill.id,
        amount: totalPayment,
        paymentDate,
        method: paymentMethod,
        referenceNumber,
        bankAccountId: bankAccountId || null,
        currency,
        bills: billsPayload,
        applications: selectedBills.map((bill) => ({ billId: bill.id, amount: bill.paymentAmount, memo: bill.memo || null })),
        memo,
        attachments: attachments.length ? attachments : undefined,
        ...(payloadVendorId ? { vendorId: payloadVendorId } : {}),
      }
      await expensesService.recordBillPayment(companyId, payload)
      toast.success('Payment recorded')
      router.push('/expenses/bills-payments/bill-payments')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to record payment')
      toast.error('Unable to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedBill = useMemo(() => bills.find((bill) => bill.id === queryBillId), [bills, queryBillId])
  const pageTitle = mode === 'new'
    ? selectedBill?.billNumber
      ? `Record Payment for ${selectedBill.billNumber}`
      : 'Record Bill Payment'
    : 'Bill Payment Details'

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl z-30">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                {mode === 'edit' ? 'Posted' : 'Draft Payment'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          {mode !== 'new' && (
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-100 mb-4">
              <button 
                type="button" 
                onClick={() => setActiveTab('details')} 
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'details' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <FileText className="w-4 h-4" /> Details
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('attachments')} 
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'attachments' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Paperclip className="w-4 h-4" /> Attachments
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('activity')} 
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'activity' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <History className="w-4 h-4" /> Activity
              </button>
            </div>
          )}

          <div className={activeTab === 'details' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Payment Information</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment ID</label>
                      <input 
                        value={paymentId ? paymentId : 'Auto-generated'} 
                        readOnly 
                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <HaypDatePicker
                        id="paymentDate"
                        label="Payment Date"
                        value={paymentDate}
                        onChange={setPaymentDate}
                        disabled={mode === 'edit'}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</label>
                      <HaypSelect
                        value={paymentMethod}
                        onChange={setPaymentMethod}
                        options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
                        disabled={mode === 'edit'}
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment From</label>
                      <HaypSelect
                        value={bankAccountId}
                        onChange={setBankAccountId}
                        options={bankAccounts.map((a) => ({ value: a.id, label: a.displayName }))}
                        placeholder="Select account"
                        disabled={mode === 'edit'}
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <CustomerPickerField
                        label="Vendor"
                        value={vendorId}
                        customers={vendorOptions}
                        placeholder="Search vendors…"
                        createLabel="New Vendor"
                        disabled={mode === 'edit'}
                        onChange={setVendorId}
                        onCreateNew={() => setShowVendorModal(true)}
                      />
                    </div>
                    <div className="flex items-center gap-2 h-10 mt-auto px-4 rounded-xl border border-slate-200 bg-slate-50">
                      <input 
                        type="checkbox" 
                        id="showOverdue"
                        checked={showOverdue} 
                        disabled={mode === 'edit'} 
                        onChange={(e) => setShowOverdue(e.target.checked)} 
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                      />
                      <label htmlFor="showOverdue" className="text-sm font-bold text-slate-600 cursor-pointer">Show only overdue</label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Bills to Pay</h2>
                  </div>
                  <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-100">
                    Total Selection: {formatCurrency(totalPayment, currency)}
                  </div>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 w-12" />
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill #</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill Date</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Original</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Balance</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-40">Payment</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Memo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {visibleBills.length === 0 ? (
                          <tr><td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">No outstanding bills found.</td></tr>
                        ) : visibleBills.map((bill) => (
                          <tr key={bill.id} className={`hover:bg-slate-50 transition-colors ${bill.selected ? 'bg-emerald-50/30' : ''}`}>
                            <td className="px-4 py-2">
                              <input 
                                type="checkbox" 
                                checked={bill.selected} 
                                disabled={mode === 'edit'} 
                                onChange={() => toggleBill(bill.id)} 
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                              />
                            </td>
                            <td className="px-4 py-2 font-bold text-slate-900">{bill.billNumber || '—'}</td>
                            <td className="px-4 py-2 text-slate-500">{bill.date}</td>
                            <td className="px-4 py-2 text-slate-500">{bill.dueDate}</td>
                            <td className="px-4 py-2 text-right font-medium text-slate-500">{formatCurrency(bill.originalAmount, currency)}</td>
                            <td className="px-4 py-2 text-right font-bold text-emerald-700">{formatCurrency(bill.amountDue, currency)}</td>
                            <td className="px-4 py-2 text-right">
                              <input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                value={bill.paymentAmount} 
                                disabled={mode === 'edit' || !bill.selected} 
                                onChange={(e) => updateBill(bill.id, 'paymentAmount', Number(e.target.value))} 
                                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none text-right" 
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input 
                                value={bill.memo} 
                                disabled={mode === 'edit' || !bill.selected} 
                                onChange={(e) => updateBill(bill.id, 'memo', e.target.value)} 
                                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" 
                                placeholder="Memo" 
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <section>
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                    <div className="w-1 h-6 bg-slate-300 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Additional Details</h2>
                  </div>
                  <div className="px-4 pb-4 sm:px-5 lg:px-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference / Check #</label>
                      <input 
                        value={referenceNumber} 
                        onChange={(e) => setReferenceNumber(e.target.value)} 
                        disabled={mode === 'edit'} 
                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all" 
                        placeholder="Ref #" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal Memo</label>
                      <textarea 
                        value={memo} 
                        onChange={(e) => setMemo(e.target.value)} 
                        disabled={mode === 'edit'} 
                        rows={3} 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all" 
                        placeholder="Add a private note..." 
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Payment Summary</h2>
                  </div>
                  <div className="px-4 pb-4 sm:px-5 lg:px-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Selected Bills</span>
                      <span className="font-bold text-slate-900">{selectedBills.length}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-900">Total Payment</span>
                      <span className="text-2xl font-black text-emerald-600 tabular-nums">{formatCurrency(totalPayment, currency)}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className={activeTab === 'attachments' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Attachments</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <HaypFileUpload attachments={attachments} onChange={setAttachments} />
                </div>
              </div>
            </section>
          </div>

          <div className={activeTab === 'activity' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Activity Log</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity recorded for this payment." />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="z-40 shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.05)]">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <div className="flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={() => router.push('/expenses/bills-payments/bill-payments')} 
                className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSave} 
                disabled={mode === 'edit' || submitting || !selectedBills.length} 
                className="h-10 px-8 rounded-xl bg-emerald-600 text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}
