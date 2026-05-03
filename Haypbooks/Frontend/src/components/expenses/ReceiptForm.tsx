'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, X } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { formatCurrency } from '@/lib/format'

const today = new Date().toISOString().slice(0, 10)
const CATEGORIES = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Hardware', 'Shipping', 'Other']
const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer']
const STATUS_OPTIONS = ['DRAFT', 'UNMATCHED', 'MATCHED', 'ATTACHED']

interface Account {
  id: string
  code?: string
  name?: string
}

export type ReceiptFormHandle = {
  save: () => Promise<void>
}

interface ReceiptFormProps {
  mode: 'new' | 'edit'
  receiptId?: string
  onClose?: () => void
  onSaved?: () => void
}

const ReceiptForm = forwardRef<ReceiptFormHandle, ReceiptFormProps>(function ReceiptForm({ mode, receiptId, onClose, onSaved }, ref) {
  const router = useRouter()
  const toast = useToast()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [accounts, setAccounts] = useState<Account[]>([])
  const [receiptNumber, setReceiptNumber] = useState('')
  const [receiptDate, setReceiptDate] = useState(today)
  const [status, setStatus] = useState('DRAFT')
  const [merchant, setMerchant] = useState('')
  const [category, setCategory] = useState('Travel')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [amount, setAmount] = useState(0)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [expenseDate, setExpenseDate] = useState(today)
  const [accountId, setAccountId] = useState('')
  const [billable, setBillable] = useState(false)
  const [clientProject, setClientProject] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!companyId) return
    let active = true
    accountingService.listAccounts(companyId, { includeInactive: false })
      .then((res) => {
        if (!active) return
        const payload = res.data ?? res
        const list = Array.isArray(payload) ? payload : payload.data ?? []
        setAccounts(list.map((account: any) => ({ id: account.id, code: account.code, name: account.name })))
      })
      .catch(() => {})
    return () => { active = false }
  }, [companyId])

  useEffect(() => {
    if (mode !== 'edit' || !receiptId || !companyId) return
    let active = true
    expensesService.getReceipt(companyId, receiptId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setReceiptNumber(data.receiptNumber ?? data.number ?? '')
        setReceiptDate(data.receiptDate?.slice(0, 10) ?? today)
        setStatus(data.status ?? 'DRAFT')
        setMerchant(data.merchant ?? '')
        setCategory(data.category ?? 'Travel')
        setPaymentMethod(data.paymentMethod ?? 'Cash')
        setAmount(Number(data.amount ?? 0))
        setReferenceNumber(data.referenceNumber ?? '')
        setExpenseDate(data.expenseDate?.slice(0, 10) ?? data.receiptDate?.slice(0, 10) ?? today)
        setAccountId(data.accountId ?? '')
        setBillable(Boolean(data.billable))
        setClientProject(data.clientProject ?? '')
        setNotes(data.notes ?? '')
      })
      .catch(() => toast.error('Failed to load receipt'))
    return () => { active = false }
  }, [companyId, mode, receiptId, toast])

  useEffect(() => {
    if (!billable) setClientProject('')
  }, [billable])

  const validate = useCallback(() => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!merchant.trim()) { setError('Merchant is required'); return false }
    if (amount <= 0) { setError('Amount must be greater than zero'); return false }
    if (billable && !clientProject.trim()) { setError('Client/Project is required when billable'); return false }
    setError('')
    return true
  }, [companyId, merchant, amount, billable, clientProject])

  const payload = useMemo(() => ({
    receiptDate,
    status,
    merchant,
    category,
    paymentMethod,
    amount,
    currency,
    referenceNumber: referenceNumber || null,
    expenseDate,
    accountId: accountId || null,
    billable,
    clientProject: billable ? clientProject : null,
    notes,
  }), [receiptDate, status, merchant, category, paymentMethod, amount, currency, referenceNumber, expenseDate, accountId, billable, clientProject, notes])

  const handleSave = useCallback(async () => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      if (mode === 'new') {
        await expensesService.createReceipt(companyId, payload)
        toast.success('Receipt created')
      } else if (receiptId) {
        await expensesService.updateReceipt(companyId, receiptId, payload)
        toast.success('Receipt updated')
      }
      if (onSaved) {
        onSaved()
      } else if (onClose) {
        onClose()
      } else {
        router.push('/expenses/employee-expenses/receipts')
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to save receipt')
      toast.error('Unable to save receipt')
    } finally {
      setSubmitting(false)
    }
  }, [companyId, mode, receiptId, payload, validate, toast, onSaved, onClose, router])

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

  return (
    <div className="space-y-6 text-slate-900">
      <div className="overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
          <div className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-4">Receipt Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="receiptDate" className="text-[10px] font-bold uppercase text-slate-400">Receipt Date</label>
                    <input
                      id="receiptDate"
                      type="date"
                      value={receiptDate}
                      onChange={(e) => { setReceiptDate(e.target.value); setExpenseDate(e.target.value) }}
                      aria-label="Receipt Date"
                      className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="receiptStatus" className="text-[10px] font-bold uppercase text-slate-400">Status</label>
                    <select
                      id="receiptStatus"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      aria-label="Status"
                      className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="merchantName" className="text-[10px] font-bold uppercase text-slate-400">Merchant / Vendor</label>
                    <input
                      id="merchantName"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      placeholder="Merchant name"
                      aria-label="Merchant / Vendor"
                      className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="receiptPaymentMethod" className="text-[10px] font-bold uppercase text-slate-400">Payment Method</label>
                    <select
                      id="receiptPaymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      aria-label="Payment Method"
                      className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
                    >
                      {PAYMENT_METHODS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="receiptAmount" className="text-[10px] font-bold uppercase text-slate-400">Amount</label>
                    <div className="mt-2 flex rounded-lg overflow-hidden">
                      <span className="inline-flex items-center px-3 text-sm text-slate-500 bg-white border-r border-slate-200">{currency}</span>
                      <input
                        id="receiptAmount"
                        type="text"
                        inputMode="decimal"
                        value={amount !== 0 ? amount : ''}
                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                        placeholder="0.00"
                        aria-label="Amount"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-right text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="expenseDate" className="text-[10px] font-bold uppercase text-slate-400">Expense Date</label>
                    <input
                      id="expenseDate"
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      aria-label="Expense Date"
                      className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 my-6" />

              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-4">Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="receiptCategory" className="text-[10px] font-bold uppercase text-slate-400">Category</label>
                    <select
                      id="receiptCategory"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      aria-label="Category"
                      className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
                    >
                      {CATEGORIES.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="receiptAccount" className="text-[10px] font-bold uppercase text-slate-400">Account</label>
                    <select
                      id="receiptAccount"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      aria-label="Account"
                      className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
                    >
                      <option value="">Select account</option>
                      {accounts.map((account) => <option key={account.id} value={account.id}>{account.code ? `${account.code} — ${account.name}` : account.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3">
                      <input
                        id="receipt-billable"
                        type="checkbox"
                        checked={billable}
                        onChange={(e) => setBillable(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="receipt-billable" className="text-[10px] font-bold uppercase text-slate-400">Billable to Client</label>
                    </div>
                    {billable && (
                      <input
                        id="receiptClientProject"
                        value={clientProject}
                        onChange={(e) => setClientProject(e.target.value)}
                        placeholder="Client / Project"
                        aria-label="Client/Project"
                        className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 my-6" />

              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-4">Notes</h3>
                <textarea
                  id="receiptNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Enter notes..."
                  aria-label="Notes"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all resize-y"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ReceiptForm

