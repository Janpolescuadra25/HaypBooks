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

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!merchant.trim()) { setError('Merchant is required'); return false }
    if (amount <= 0) { setError('Amount must be greater than zero'); return false }
    if (billable && !clientProject.trim()) { setError('Client/Project is required when billable'); return false }
    setError('')
    return true
  }

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

  const handleSave = async () => {
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
  }

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

  return (
    <div className="space-y-6 bg-slate-50 text-slate-900">
      <div className="overflow-y-auto">
        <div className="px-4 py-6 pb-6">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Receipt Date</label>
                <input type="date" value={receiptDate} onChange={(e) => { setReceiptDate(e.target.value); setExpenseDate(e.target.value) }} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Merchant / Vendor</label>
                <input value={merchant} onChange={(e) => setMerchant(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Merchant name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  {CATEGORIES.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  {PAYMENT_METHODS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Amount</label>
                <div className="mt-2 flex rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                  <span className="inline-flex items-center px-4 text-sm text-slate-500">{currency}</span>
                  <input type="number" value={amount} min={0} step="0.01" onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded-none border-0 bg-transparent px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Reference Number</label>
                <input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Transaction ID" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Expense Date</label>
                <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Account</label>
                <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  <option value="">Select account</option>
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.code ? `${account.code} — ${account.name}` : account.name}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input id="receipt-billable" type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <label htmlFor="receipt-billable" className="text-sm font-semibold text-slate-900">Billable to Client</label>
                </div>
                {billable && (
                  <input value={clientProject} onChange={(e) => setClientProject(e.target.value)} placeholder="Client / Project" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                )}
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-900">Description / Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
            </div>
          </section>
        </div>
      </div>

      </div>
    </div>
  )
})

export default ReceiptForm

