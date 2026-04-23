'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { expensesService } from '@/services/expenses.service'

interface ReimbursementFormProps {
  mode: 'new' | 'edit'
  reimbursementId?: string
}

interface Employee {
  id: string
  displayName: string
}

interface ReimbursementLine {
  id: string
  date: string
  category: string
  description: string
  amount: number
}

const CATEGORIES = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Other']
const today = new Date().toISOString().slice(0, 10)

const defaultLine = (): ReimbursementLine => ({
  id: Math.random().toString(36).slice(2, 9),
  date: today,
  category: 'Travel',
  description: '',
  amount: 0,
})

export default function ReimbursementForm({ mode, reimbursementId }: ReimbursementFormProps) {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER')
  const [status, setStatus] = useState('DRAFT')
  const [lines, setLines] = useState<ReimbursementLine[]>([defaultLine()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEdit = mode === 'edit'
  const isReadOnly = isEdit && status !== 'DRAFT' && status !== 'REJECTED'

  useEffect(() => {
    if (!companyId) return
    let active = true

    expensesService.listEmployees(companyId, { limit: 100 })
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const items = Array.isArray(data) ? data : data.data ?? []
        const mapped = items.map((item: any) => ({ id: item.id, displayName: item.displayName ?? item.name ?? item.id }))
        setEmployees(mapped)
        if (!employeeId && mapped.length > 0) setEmployeeId(mapped[0].id)
      })
      .catch(() => {})

    return () => { active = false }
  }, [companyId, employeeId])

  useEffect(() => {
    if (!companyId || !isEdit || !reimbursementId) return
    let active = true

    expensesService.getReimbursement(companyId, reimbursementId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setDescription(data.description ?? '')
        setStatus(data.status ?? 'DRAFT')
        setEmployeeId(data.employeeId ?? '')
        setPaymentMethod(data.paymentMethod ?? 'BANK_TRANSFER')
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          setLines(data.lines.map((line: any) => ({
            id: Math.random().toString(36).slice(2, 9),
            date: line.date ?? today,
            category: line.category ?? 'Other',
            description: line.description ?? '',
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
    paymentMethod,
    status,
    lines: lines.map((line) => ({
      date: line.date,
      category: line.category,
      description: line.description,
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
      router.push('/expenses/expense-capture/reimbursements')
    } catch (err: any) {
      console.error(err)
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
      router.push('/expenses/expense-capture/reimbursements')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to submit reimbursement')
      toast.error('Unable to submit reimbursement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push('/expenses/expense-capture/reimbursements')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
                <ArrowLeft size={16} /> Back to reimbursements
              </button>
              <div className="mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Reimbursement' : 'Edit Reimbursement'}</h1>
                <p className="mt-1 text-sm text-slate-500">Create and submit employee reimbursements.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="font-semibold">Status</div>
              <div>{status}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-40 space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div>
                <label htmlFor="reimbursement-employee" className="block text-sm font-semibold text-slate-700">Employee</label>
                <select id="reimbursement-employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} disabled={isReadOnly} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:ring-emerald-500/20">
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.displayName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="reimbursement-description" className="block text-sm font-semibold text-slate-700">Reimbursement description</label>
                <textarea id="reimbursement-description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isReadOnly} rows={3} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:ring-emerald-500/20" />
              </div>

              <div>
                <label htmlFor="reimbursement-payment-method" className="block text-sm font-semibold text-slate-700">Payment method</label>
                <select id="reimbursement-payment-method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={isReadOnly} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:ring-emerald-500/20">
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="CHECK">Check</option>
                </select>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-emerald-50/40 p-5 text-sm text-slate-700">
              <div className="font-semibold text-slate-800">Totals</div>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between"><span>Line total</span><span className="font-semibold text-emerald-800">{formatCurrency(totalAmount, currency)}</span></div>
                <div className="flex items-center justify-between"><span>Advance paid</span><span className="font-semibold text-slate-900">{formatCurrency(0, currency)}</span></div>
                <div className="rounded-3xl bg-white p-4 border border-slate-200"><div className="flex items-center justify-between text-slate-500"><span>Reimbursable amount</span><span className="font-semibold text-emerald-900">{formatCurrency(totalAmount, currency)}</span></div></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Line items</h2>
                <p className="text-sm text-slate-500">Add the expenses you want to reimburse.</p>
              </div>
              <button type="button" disabled={isReadOnly} onClick={addLine} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={14} /> Add line</button>
            </div>
            <div className="space-y-4">
              {lines.map((line) => (
                <div key={line.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] items-end">
                  <div>
                    <label htmlFor={`line-date-${line.id}`} className="block text-xs font-semibold text-slate-500">Date</label>
                    <input id={`line-date-${line.id}`} type="date" value={line.date} onChange={(e) => updateLine(line.id, 'date', e.target.value)} disabled={isReadOnly} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label htmlFor={`line-category-${line.id}`} className="block text-xs font-semibold text-slate-500">Category</label>
                    <select id={`line-category-${line.id}`} value={line.category} onChange={(e) => updateLine(line.id, 'category', e.target.value)} disabled={isReadOnly} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
                      {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`line-description-${line.id}`} className="block text-xs font-semibold text-slate-500">Description</label>
                    <input id={`line-description-${line.id}`} value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} disabled={isReadOnly} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                  </div>
                  <div className="grid gap-2">
                    <div>
                      <label htmlFor={`line-amount-${line.id}`} className="block text-xs font-semibold text-slate-500">Amount</label>
                      <input id={`line-amount-${line.id}`} type="number" min={0} step={0.01} value={line.amount} onChange={(e) => updateLine(line.id, 'amount', Number(e.target.value))} disabled={isReadOnly} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                    </div>
                    <button type="button" disabled={isReadOnly} onClick={() => removeLine(line.id)} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold">Next steps</p>
              <p>Save as a draft or submit for approval when ready.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={saveDraft} disabled={submitting || isReadOnly} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save draft
              </button>
              <button type="button" onClick={submitForApproval} disabled={submitting || isReadOnly} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Submit for approval
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
