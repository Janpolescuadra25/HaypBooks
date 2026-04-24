'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
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

    const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')

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

    const validate = () => {
      if (!companyId) { setError('Company not loaded'); return false }
      if (!vendorId) { setError('Vendor is required'); return false }
      if (!description.trim()) { setError('Description is required'); return false }
      if (amount <= 0) { setError('Amount must be greater than zero'); return false }
      if (!startDate) { setError('Start date is required'); return false }
      setError('')
      return true
    }

    const handleSave = async () => {
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
    }

    useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

    return (
      <div className="space-y-6 bg-slate-50 text-slate-900">
        <div className="overflow-y-auto">
          <div className="px-4 py-6 space-y-6">
            <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
              <div className="inline-flex rounded-xl bg-white/50 p-1 border border-slate-100">
                <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
                <button type="button" onClick={() => setActiveTab('activity')} disabled={mode === 'new' || !billId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
              </div>
            </div>
            <div className={activeTab !== 'details' ? 'hidden' : ''}>
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            )}

            {/* Header fields */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Vendor <span className="text-rose-500">*</span></label>
                  <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    <option value="">Select vendor</option>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.displayName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900">Description / Template Name <span className="text-rose-500">*</span></label>
                  <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Monthly SaaS subscription" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>
            </section>

            {/* Schedule */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Schedule</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Frequency</label>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {FREQUENCIES.map((f) => <option key={f} value={f}>{f.replace('_', '-')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Start Date <span className="text-rose-500">*</span></label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">End Date <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                {nextDueDate && (
                  <div className="sm:col-span-2 xl:col-span-3">
                    <p className="text-xs text-slate-500">Next bill will be generated on <strong className="text-slate-700">{nextDueDate}</strong></p>
                  </div>
                )}
              </div>
            </section>

            {/* Amount & Account */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Amount & Account</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Amount <span className="text-rose-500">*</span></label>
                  <div className="mt-2 flex rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                    <span className="inline-flex items-center px-4 text-sm text-slate-500">{currency}</span>
                    <input type="number" value={amount} min={0} step="0.01" onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded-none border-0 bg-transparent px-4 py-3 text-sm text-slate-900 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Expense Account</label>
                  <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    <option value="">Select account</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.code ? `${a.code} — ${a.name}` : a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Payment Terms</label>
                  <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {PAYMENT_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <label className="block text-sm font-semibold text-slate-900">Internal Notes</label>
              <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Internal notes (not shown on bills)" />
            </section>
            </div>
          </div>
          <div className={activeTab !== 'activity' ? 'hidden' : ''}>
            <div className="px-4 py-6">
              <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
                  <div className="mt-4">
                    <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this recurring bill yet." />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default RecurringBillForm
