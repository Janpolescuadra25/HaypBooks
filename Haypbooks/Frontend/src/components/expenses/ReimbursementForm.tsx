'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Plus, X, FileText, History, Send } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'
import HaypDatePicker from '@/components/shared/HaypDatePicker'
import HaypSelect from '@/components/shared/HaypSelect'

interface ReimbursementFormProps {
  mode: 'new' | 'edit'
  reimbursementId?: string
}

interface Employee {
  id: string
  displayName: string
}

interface Account {
  id: string
  code?: string
  name?: string
}

interface ReimbursementLine {
  id: string
  date: string
  category: string
  description: string
  accountId: string
  amount: number
}

const CATEGORIES = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Other']
const today = new Date().toISOString().slice(0, 10)

const defaultLine = (): ReimbursementLine => ({
  id: Math.random().toString(36).slice(2, 9),
  date: today,
  category: 'Travel',
  description: '',
  accountId: '',
  amount: 0,
})

export default function ReimbursementForm({ mode, reimbursementId }: ReimbursementFormProps) {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [description, setDescription] = useState('')
  const [businessPurpose, setBusinessPurpose] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER')
  const [status, setStatus] = useState('DRAFT')
  const [lines, setLines] = useState<ReimbursementLine[]>([defaultLine()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const isEdit = mode === 'edit'
  const isReadOnly = isEdit && status !== 'DRAFT' && status !== 'REJECTED'

  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')

  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && reimbursementId ? { tableName: 'Reimbursement', recordId: reimbursementId } : undefined,
  })

  useEffect(() => {
    if (!companyId) return
    let active = true

    expensesService.listEmployees(companyId, { limit: 100 })
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const items = Array.isArray(data) ? data : data.data ?? []
            interface ApiEmployee { id: string; displayName?: string | null; name?: string | null }
            const mapped = items.map((item: ApiEmployee) => ({ id: item.id, displayName: item.displayName ?? item.name ?? item.id }))
        setEmployees(mapped)
        if (!employeeId && mapped.length > 0) setEmployeeId(mapped[0].id)
      })
      .catch(() => {})

    return () => { active = false }
  }, [companyId, employeeId])

  useEffect(() => {
    if (!companyId) return
    let active = true

    accountingService.listAccounts(companyId, { includeInactive: false })
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const list = Array.isArray(data) ? data : data.data ?? []
        setAccounts(list.map((account: any) => ({ id: account.id, code: account.code, name: account.name })))
      })
      .catch(() => {})

    return () => { active = false }
  }, [companyId])

  useEffect(() => {
    if (!companyId || !isEdit || !reimbursementId) return
    let active = true

    expensesService.getReimbursement(companyId, reimbursementId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setDescription(data.description ?? '')
        setBusinessPurpose(data.businessPurpose ?? '')
        setNotes(data.notes ?? '')
        setStatus(data.status ?? 'DRAFT')
        setEmployeeId(data.employeeId ?? '')
        setPaymentMethod(data.paymentMethod ?? 'BANK_TRANSFER')
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          interface ApiReimLine { id?: string; date?: string | null; category?: string | null; description?: string | null; accountId?: string | null; amount?: number | null }
          setLines(data.lines.map((line: ApiReimLine) => ({
            id: Math.random().toString(36).slice(2, 9),
            date: line.date ?? today,
            category: line.category ?? 'Other',
            description: line.description ?? '',
            accountId: line.accountId ?? '',
            amount: Number(line.amount ?? 0),
          })))
        }
      })
      .catch(() => toast.error('Failed to load reimbursement'))

    return () => { active = false }
  }, [companyId, isEdit, reimbursementId, toast])

  const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + Number(line.amount || 0), 0), [lines])

  const updateLine = useCallback((id: string, field: keyof ReimbursementLine, value: string | number) => {
    setLines((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }, [])

  const addLine = useCallback(() => setLines((items) => [...items, defaultLine()]), [])
  const removeLine = useCallback((id: string) => setLines((items) => items.filter((item) => item.id !== id)), [])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!employeeId) { setError('Select an employee'); return false }
    if (!description.trim()) { setError('Description is required'); return false }
    if (!lines.length) { setError('Add at least one line item'); return false }
    if (lines.some((line) => !line.description.trim())) { setError('Each line needs a description'); return false }
    if (lines.some((line) => line.amount <= 0)) { setError('Amounts must be greater than zero'); return false }
    setError('')
    return true
  }

  const payload = () => ({
    employeeId,
    description,
    businessPurpose,
    notes,
    paymentMethod,
    status,
    attachments: attachments.map((file) => ({ name: file.name })),
    lines: lines.map((line) => ({
      date: line.date,
      category: line.category,
      description: line.description,
      accountId: line.accountId || null,
      amount: Number(line.amount),
    })),
  })

  const saveDraft = async () => {
    if (isReadOnly) return
    if (!validate()) return
    if (!companyId) return
    setSubmitting(true)
    try {
      const data = payload()
      data.status = 'DRAFT'
      if (isEdit && reimbursementId) {
        await expensesService.updateReimbursement(companyId, reimbursementId, data)
      } else {
        await expensesService.createReimbursement(companyId, data)
      }
      toast.success('Reimbursement saved as draft')
      router.push('/expenses/employee-expenses/reimbursements')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to save reimbursement')
      toast.error('Unable to save reimbursement')
    } finally {
      setSubmitting(false)
    }
  }

  const submitForApproval = async () => {
    if (isReadOnly) return
    if (!validate()) return
    if (!companyId) return
    setSubmitting(true)
    try {
      const data = payload()
      data.status = 'SUBMITTED'
      if (isEdit && reimbursementId) {
        await expensesService.updateReimbursement(companyId, reimbursementId, data)
      } else {
        await expensesService.createReimbursement(companyId, data)
      }
      toast.success('Reimbursement submitted for approval')
      router.push('/expenses/employee-expenses/reimbursements')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to submit reimbursement')
      toast.error('Unable to submit reimbursement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl z-30">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Reimbursement' : 'Edit Reimbursement'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                {status}
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
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Reimbursement Info</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-4">
                    <div className="space-y-1.5">
                      <label htmlFor="reimbursement-employee" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee</label>
                      <HaypSelect 
                        id="reimbursement-employee" 
                        value={employeeId} 
                        onChange={setEmployeeId} 
                        disabled={isReadOnly} 
                        options={employees.map((e) => ({ value: e.id, label: e.displayName }))} 
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="reimbursement-payment-method" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Method Preference</label>
                      <HaypSelect 
                        id="reimbursement-payment-method" 
                        value={paymentMethod} 
                        onChange={setPaymentMethod} 
                        disabled={isReadOnly} 
                        options={[{ value: 'BANK_TRANSFER', label: 'Bank Transfer' }, { value: 'CHECK', label: 'Check' }]} 
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="reimbursement-description" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                      <input 
                        id="reimbursement-description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        disabled={isReadOnly}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        placeholder="Brief description of the reimbursement request"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="reimbursement-business-purpose" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Purpose</label>
                      <input 
                        id="reimbursement-business-purpose" 
                        value={businessPurpose} 
                        onChange={(e) => setBusinessPurpose(e.target.value)} 
                        disabled={isReadOnly}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        placeholder="Reason for these expenses"
                      />
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
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Expense Items</h2>
                  </div>
                  {!isReadOnly && (
                    <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
                      <Plus size={16} /> Add Expense
                    </button>
                  )}
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="space-y-3">
                    {lines.map((line) => (
                      <div key={line.id} className="group relative p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:border-emerald-200 hover:bg-white">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
                          <div className="space-y-1.5">
                            <HaypDatePicker
                              id={`line-date-${line.id}`}
                              label="Date"
                              value={line.date}
                              onChange={(value) => updateLine(line.id, 'date', value)}
                              disabled={isReadOnly}
                              className="w-full h-9 text-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor={`line-category-${line.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                            <HaypSelect 
                              id={`line-category-${line.id}`} 
                              value={line.category} 
                              onChange={(v) => updateLine(line.id, 'category', v)} 
                              disabled={isReadOnly} 
                              options={CATEGORIES.map((c) => ({ value: c, label: c }))} 
                              className="h-9 text-xs disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-1.5 lg:col-span-1">
                            <label htmlFor={`line-description-${line.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                            <input 
                              id={`line-description-${line.id}`} 
                              value={line.description} 
                              onChange={(e) => updateLine(line.id, 'description', e.target.value)} 
                              disabled={isReadOnly} 
                              placeholder="What was this for?"
                              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 focus:border-emerald-500 transition-all outline-none disabled:opacity-50" 
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1 space-y-1.5">
                              <label htmlFor={`line-amount-${line.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{currency}</span>
                                <input 
                                  id={`line-amount-${line.id}`} 
                                  type="number" 
                                  min={0} 
                                  step={0.01} 
                                  value={line.amount || ''} 
                                  onChange={(e) => updateLine(line.id, 'amount', Number(e.target.value))} 
                                  disabled={isReadOnly} 
                                  className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs font-bold text-slate-900 text-right focus:border-emerald-500 transition-all outline-none disabled:opacity-50" 
                                />
                              </div>
                            </div>
                            {!isReadOnly && lines.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => removeLine(line.id)} 
                                className="h-9 w-9 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                        <div className="mt-4 space-y-1.5">
                          <label htmlFor={`line-account-${line.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account</label>
                          <select
                            id={`line-account-${line.id}`}
                            value={line.accountId || ''}
                            onChange={(e) => updateLine(line.id, 'accountId', e.target.value)}
                            disabled={isReadOnly}
                            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none disabled:opacity-50"
                          >
                            <option value="">Select account</option>
                            {accounts.map((account) => (
                              <option key={account.id} value={account.id}>{account.code ? `${account.code} ${account.name}` : account.name ?? account.id}</option>
                            ))}
                          </select>
                        </div>
                </div>
              </div>
            </section>

            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Attachments</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="space-y-4">
                    <label htmlFor="reimbursementAttachments" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attachments</label>
                    <div className="mt-1">
                      <input
                        id="reimbursementAttachments"
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm h-full">
                  <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                    <div className="w-1 h-6 bg-slate-300 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Notes & Comments</h2>
                  </div>
                  <div className="px-4 pb-4 sm:px-5 lg:px-6">
                    <textarea 
                      id="reimbursement-notes" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      disabled={isReadOnly} 
                      rows={4} 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      placeholder="Additional information or justification..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm h-full">
                  <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Summary</h2>
                  </div>
                  <div className="px-4 pb-4 sm:px-5 lg:px-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Expenses</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(totalAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Advance Applied</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(0, currency)}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-900">Amount Due</span>
                      <span className="text-2xl font-black text-emerald-600 tabular-nums">{formatCurrency(totalAmount, currency)}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className={activeTab === 'activity' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Activity Log</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity recorded for this reimbursement." />
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
                onClick={() => router.push('/expenses/employee-expenses/reimbursements')} 
                disabled={submitting}
                className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              
              {!isReadOnly && (
                <>
                  <button 
                    type="button" 
                    onClick={saveDraft} 
                    disabled={submitting}
                    className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Draft
                  </button>
                  <button 
                    type="button" 
                    onClick={submitForApproval} 
                    disabled={submitting} 
                    className="h-10 px-8 rounded-xl bg-emerald-600 text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    Submit for Approval
                  </button>
                </>
              )}
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
