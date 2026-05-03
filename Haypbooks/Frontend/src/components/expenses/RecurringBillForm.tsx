'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState, useCallback } from 'react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'

const today = new Date().toISOString().slice(0, 10)
const FREQUENCIES = ['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']
const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt']
const STATUS_OPTIONS = ['ACTIVE', 'PAUSED', 'CANCELLED']

interface Vendor { id: string; displayName: string }
interface Account { id: string; code?: string; name?: string }

export interface RecurringBillFormHandle {
  save: () => Promise<void>
}

interface RecurringBillFormProps {
  mode: 'new' | 'edit'
  billId?: string
  onClose?: () => void
  onSaved?: () => void
}

const RecurringBillForm = forwardRef<RecurringBillFormHandle, RecurringBillFormProps>(
  function RecurringBillForm({ mode, billId, onClose, onSaved }, ref) {
    const toast = useToast()
    const { companyId } = useCompanyId()
    const { currency } = useCompanyCurrency()

    const [vendors, setVendors] = useState<Vendor[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [vendorId, setVendorId] = useState('')
    const [description, setDescription] = useState('')
    const [frequency, setFrequency] = useState('MONTHLY')
    const [startDate, setStartDate] = useState(today)
    const [endDate, setEndDate] = useState('')
    const [amount, setAmount] = useState(0)
    const [accountId, setAccountId] = useState('')
    const [paymentTerms, setPaymentTerms] = useState('Net 30')
    const [status, setStatus] = useState('ACTIVE')
    const [internalNotes, setInternalNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [activeTab, setActiveTab] = useState<'schedule' | 'details' | 'notes' | 'activity'>('schedule')

    const { entries: activityEntries, loading: activityLoading } = useActivityLog({
      companyId: activeTab === 'activity' ? companyId : null,
      pageSize: 30,
      initialFilters: activeTab === 'activity' && billId ? { tableName: 'RecurringBill', recordId: billId } : undefined,
    })

    // Compute next due date from startDate + frequency (approximate display only)
    const nextDueDate = useMemo(() => {
      try {
        const d = new Date(startDate)
        if (isNaN(d.getTime())) return ''
        switch (frequency) {
          case 'WEEKLY':    d.setDate(d.getDate() + 7); break
          case 'BI_WEEKLY': d.setDate(d.getDate() + 14); break
          case 'MONTHLY':   d.setMonth(d.getMonth() + 1); break
          case 'QUARTERLY': d.setMonth(d.getMonth() + 3); break
          case 'YEARLY':    d.setFullYear(d.getFullYear() + 1); break
        }
        return d.toISOString().slice(0, 10)
      } catch { return '' }
    }, [startDate, frequency])

    useEffect(() => {
      if (!companyId) return
      let active = true
      expensesService.listVendors(companyId)
        .then((res) => {
          if (!active) return
          const data = res.data ?? res
          const list = Array.isArray(data) ? data : data.data ?? []
          setVendors(list.map((v: Record<string, unknown>) => ({ id: String(v.id), displayName: String(v.displayName ?? v.name ?? v.id) })))
        }).catch(() => {})
      accountingService.listAccounts(companyId, { includeInactive: false })
        .then((res) => {
          if (!active) return
          const data = res.data ?? res
          const list = Array.isArray(data) ? data : data.data ?? []
          setAccounts(list.map((a: Record<string, unknown>) => ({ id: String(a.id), code: a.code ? String(a.code) : undefined, name: a.name ? String(a.name) : undefined })))
        }).catch(() => {})
      return () => { active = false }
    }, [companyId])

    useEffect(() => {
      if (mode !== 'edit' || !billId || !companyId) return
      let active = true
      expensesService.getRecurringBill(companyId, billId)
        .then((res) => {
          if (!active) return
          const data = res.data ?? res
          setVendorId(data.vendorId ?? '')
          setDescription(data.description ?? data.templateName ?? '')
          setFrequency(data.frequency ?? 'MONTHLY')
          setStartDate(data.startDate?.slice(0, 10) ?? today)
          setEndDate(data.endDate?.slice(0, 10) ?? '')
          setAmount(Number(data.amount ?? 0))
          setAccountId(data.accountId ?? '')
          setPaymentTerms(data.paymentTerms ?? 'Net 30')
          setStatus(data.status ?? 'ACTIVE')
          setInternalNotes(data.internalNotes ?? '')
        })
        .catch(() => toast.error('Failed to load recurring bill'))
      return () => { active = false }
    }, [companyId, billId, mode, toast])

    const validate = useCallback(() => {
      if (!companyId) { setError('Company not loaded'); return false }
      if (!vendorId) { setError('Vendor is required'); return false }
      if (!description.trim()) { setError('Description is required'); return false }
      if (amount <= 0) { setError('Amount must be greater than zero'); return false }
      if (!startDate) { setError('Start date is required'); return false }
      setError('')
      return true
    }, [companyId, vendorId, description, amount, startDate])

    const handleSave = useCallback(async () => {
      if (!companyId) return
      if (!validate()) return
      setSubmitting(true)
      try {
        const payload = {
          vendorId,
          description,
          frequency,
          startDate,
          endDate: endDate || null,
          nextDueDate,
          amount,
          currency,
          accountId: accountId || null,
          paymentTerms,
          status,
          internalNotes,
        }
        if (mode === 'new') {
          await expensesService.createRecurringBill(companyId, payload)
          toast.success('Recurring bill template created')
        } else if (billId) {
          await expensesService.updateRecurringBill(companyId, billId, payload)
          toast.success('Recurring bill template updated')
        }
        if (onSaved) onSaved()
        else if (onClose) onClose()
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to save recurring bill'
        setError(msg)
        toast.error(msg)
      } finally {
        setSubmitting(false)
      }
    }, [companyId, validate, vendorId, description, frequency, startDate, endDate, nextDueDate, amount, currency, accountId, paymentTerms, status, internalNotes, mode, billId, onSaved, onClose, toast])

    useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

    return (
      <div className="space-y-6 text-slate-900">
        <div className="overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 py-6">
            <div className="space-y-8">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{mode === 'new' ? 'New Recurring Bill Template' : 'Edit Recurring Bill Template'}</h2>
                  <p className="mt-1 text-sm text-slate-500">Create a clean recurring bill template with schedule and payment details.</p>
                </div>
                <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-white p-1">
                  {(['schedule', 'details', 'notes'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === tab ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                      {tab === 'schedule' ? 'Schedule' : tab === 'details' ? 'Details' : 'Notes'}
                    </button>
                  ))}
                  {mode !== 'new' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('activity')}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                      Activity
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
                )}

                {activeTab === 'schedule' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 mb-4">Schedule</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="recurringFrequency" className="text-[10px] font-bold uppercase text-slate-400">Frequency</label>
                          <select
                            id="recurringFrequency"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            aria-label="Frequency"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
                          >
                            {FREQUENCIES.map((f) => <option key={f} value={f}>{f.replace('_', '-')}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="recurringStartDate" className="text-[10px] font-bold uppercase text-slate-400">Start Date</label>
                          <input
                            id="recurringStartDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            aria-label="Start Date"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="recurringEndDate" className="text-[10px] font-bold uppercase text-slate-400">End Date</label>
                          <input
                            id="recurringEndDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            aria-label="End Date"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                          />
                        </div>
                        {nextDueDate && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-slate-500">Next bill will be generated on <strong className="text-slate-700">{nextDueDate}</strong></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 mb-4">Vendor & Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="recurringVendor" className="text-[10px] font-bold uppercase text-slate-400">Vendor</label>
                          <select
                            id="recurringVendor"
                            value={vendorId}
                            onChange={(e) => setVendorId(e.target.value)}
                            aria-label="Vendor"
                            className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
                          >
                            <option value="">Select vendor</option>
                            {vendors.map((v) => <option key={v.id} value={v.id}>{v.displayName}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="recurringStatus" className="text-[10px] font-bold uppercase text-slate-400">Status</label>
                          <select
                            id="recurringStatus"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            aria-label="Status"
                            className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
                          >
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="recurringDescription" className="text-[10px] font-bold uppercase text-slate-400">Description / Template Name</label>
                          <input
                            id="recurringDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Monthly SaaS subscription"
                            aria-label="Description"
                            className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 mb-4">Line Item</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="recurringAmount" className="text-[10px] font-bold uppercase text-slate-400">Amount</label>
                          <div className="mt-2 flex rounded-lg overflow-hidden">
                            <span className="inline-flex items-center px-3 text-sm text-slate-500 bg-white border-r border-slate-200">{currency}</span>
                            <input
                              id="recurringAmount"
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
                          <label htmlFor="recurringAccount" className="text-[10px] font-bold uppercase text-slate-400">Expense Account</label>
                          <select
                            id="recurringAccount"
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            aria-label="Expense Account"
                            className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
                          >
                            <option value="">Select account</option>
                            {accounts.map((a) => <option key={a.id} value={a.id}>{a.code ? `${a.code} — ${a.name}` : a.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="recurringPaymentTerms" className="text-[10px] font-bold uppercase text-slate-400">Payment Terms</label>
                          <select
                            id="recurringPaymentTerms"
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                            aria-label="Payment Terms"
                            className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer"
                          >
                            {PAYMENT_TERMS.map((term) => <option key={term} value={term}>{term}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-900 mb-4">Notes</h3>
                    <textarea
                      id="recurringInternalNotes"
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      rows={4}
                      placeholder="Internal notes (not shown on bills)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all resize-y"
                    />
                  </div>
                )}

                {activeTab === 'activity' && mode !== 'new' && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-900 mb-4">Activity</h3>
                    <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this recurring bill yet." />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default RecurringBillForm
