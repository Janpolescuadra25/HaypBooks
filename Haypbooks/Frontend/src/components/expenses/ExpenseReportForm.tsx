'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'

interface ExpenseReportFormProps {
  mode: 'new' | 'edit'
  expenseId?: string
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

const CATEGORIES = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Other']
const today = new Date().toISOString().slice(0, 10)

interface ExpenseLine {
  id: string
  date: string
  category: string
  description: string
  accountId: string
  amount: number
  receiptName: string
  billable: boolean
}

const defaultLine = (): ExpenseLine => ({
  id: Math.random().toString(36).slice(2, 9),
  date: today,
  category: 'Travel',
  description: '',
  accountId: '',
  amount: 0,
  receiptName: '',
  billable: false,
})

export default function ExpenseReportForm({ mode, expenseId }: ExpenseReportFormProps) {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [reportName, setReportName] = useState('')
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [status, setStatus] = useState('DRAFT')
  const [lines, setLines] = useState<ExpenseLine[]>([defaultLine()])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [advancePayment, setAdvancePayment] = useState(0)
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEdit = mode === 'edit'
  const readOnly = isEdit && status !== 'DRAFT'

  useEffect(() => {
    if (!companyId) return
    let active = true

    expensesService.listEmployees(companyId, { limit: 100 })
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const items = Array.isArray(data) ? data : data.data ?? []
          interface ApiEmployee { id: string; displayName?: string | null; name?: string | null }
          setEmployees(items.map((item: ApiEmployee) => ({ id: item.id, displayName: item.displayName ?? item.name ?? item.id })))
        if (!employeeId && items.length > 0) {
          setEmployeeId(items[0].id)
        }
      })
      .catch(() => {})

    accountingService.listAccounts(companyId, { includeInactive: false })
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const list = Array.isArray(data) ? data : data.data ?? []
        interface ApiAccount { id: string; code?: string | null; name?: string | null }
        setAccounts(list.map((account: ApiAccount) => ({ id: account.id, code: account.code, name: account.name })))
      })
      .catch(() => {})

    return () => { active = false }
  }, [companyId, employeeId])

  useEffect(() => {
    if (!companyId || !isEdit || !expenseId) return
    let active = true

    expensesService.getExpenseReport(companyId, expenseId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setReportName(data.description ?? '')
        setFromDate(data.fromDate ?? today)
        setToDate(data.toDate ?? today)
        setStatus(data.status ?? 'DRAFT')
        setEmployeeId(data.employeeId ?? '')
        setAdvancePayment(Number(data.advancePayment ?? 0))
        setNotes(data.notes ?? '')
        setInternalNotes(data.internalNotes ?? '')
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          interface ApiExpenseLine { id?: string; date?: string | null; category?: string | null; description?: string | null; accountId?: string | null; amount?: number | null; receiptUrl?: string | null; billable?: boolean | null }
          setLines(data.lines.map((line: ApiExpenseLine) => ({
            id: Math.random().toString(36).slice(2, 9),
            date: line.date ?? today,
            category: line.category ?? 'Other',
            description: line.description ?? '',
            accountId: line.accountId ?? '',
            amount: Number(line.amount ?? 0),
            receiptName: line.receiptUrl ?? '',
            billable: Boolean(line.billable),
          })))
        }
      })
      .catch(() => toast.error('Failed to load expense report'))

    return () => { active = false }
  }, [companyId, expenseId, isEdit, toast])

  const totalExpenses = useMemo(() => lines.reduce((sum, line) => sum + Number(line.amount || 0), 0), [lines])
  const netAmount = useMemo(() => Math.max(0, totalExpenses - Number(advancePayment || 0)), [totalExpenses, advancePayment])

  const updateLine = useCallback((id: string, field: keyof ExpenseLine, value: string | number | boolean) => {
    setLines((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }, [])

  const addLine = useCallback(() => setLines((items) => [...items, defaultLine()]), [])
  const removeLine = useCallback((id: string) => setLines((items) => items.filter((item) => item.id !== id)), [])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!employeeId) { setError('Please select an employee'); return false }
    if (!reportName.trim()) { setError('Report name is required'); return false }
    if (!lines.length) { setError('Please add at least one expense line'); return false }
    if (lines.some((line) => !line.description.trim())) { setError('Each expense line requires a description'); return false }
    if (lines.some((line) => line.amount <= 0)) { setError('Expense amounts must be greater than 0'); return false }
    setError('')
    return true
  }

  const createPayload = () => ({
    employeeId,
    description: reportName,
    fromDate,
    toDate,
    lines: lines.map((line) => ({
      date: line.date,
      category: line.category,
      description: line.description,
      accountId: line.accountId || null,
      amount: line.amount,
      receiptUrl: line.receiptName || null,
      billable: line.billable,
    })),
    advancePayment: Number(advancePayment || 0),
    notes,
    internalNotes,
  })

  const handleSaveDraft = async () => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = createPayload()
      await expensesService.createExpenseReport(companyId, payload)
      toast.success('Expense report saved as draft')
      router.push('/expenses/employee-expenses/expenses')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to save expense report')
      toast.error('Unable to save expense report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitForApproval = async () => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = createPayload()
      const res = await expensesService.createExpenseReport(companyId, payload)
      const id = res.data?.id ?? (res as any)?.id
      if (!id) throw new Error('Created report id missing')
      await expensesService.submitExpenseReport(companyId, id)
      toast.success('Expense report submitted for approval')
      router.push('/expenses/employee-expenses/expenses')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to submit expense report')
      toast.error('Unable to submit expense report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitFromEdit = async () => {
    if (!companyId || !expenseId) return
    setSubmitting(true)
    try {
      await expensesService.submitExpenseReport(companyId, expenseId)
      toast.success('Expense report submitted for approval')
      router.push('/expenses/employee-expenses/expenses')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to submit expense report')
      toast.error('Unable to submit expense report')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedEmployee = useMemo(() => employees.find((item) => item.id === employeeId), [employees, employeeId])

  return (
    <div className="min-h-full flex min-h-[100vh] flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push('/expenses/employee-expenses/expenses')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
                <ArrowLeft size={16} /> Back to expense reports
              </button>
              <div className="mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Expense Report' : 'Edit Expense Report'}</h1>
                <p className="mt-1 text-sm text-slate-500">Track expense receipts and approvals in one report.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="font-semibold">Status</div>
              <div>{status}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-40">
          <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="report-name" className="block text-sm font-semibold text-slate-900">Report Name</label>
                <input id="report-name" value={reportName} onChange={(e) => setReportName(e.target.value)} disabled={readOnly} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Report title" />
              </div>
              <div>
                <label htmlFor="report-from-date" className="block text-sm font-semibold text-slate-900">From Date</label>
                <input id="report-from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} disabled={readOnly} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Report start date" title="Report start date" />
              </div>
              <div>
                <label htmlFor="report-to-date" className="block text-sm font-semibold text-slate-900">To Date</label>
                <input id="report-to-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} disabled={readOnly} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Report end date" title="Report end date" />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="report-employee" className="block text-sm font-semibold text-slate-900">Employee</label>
                <select id="report-employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} disabled={readOnly} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Select employee" title="Select employee">
                  <option value="">Select employee</option>
                  {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.displayName}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Expense Lines</h2>
                <p className="mt-1 text-sm text-slate-500">Add each expense item with account and receipt details.</p>
              </div>
              {!readOnly && (
                <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> Add Line</button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Receipt</th>
                    <th className="px-4 py-3">Billable</th>
                    {!readOnly && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3"><input type="date" value={line.date} onChange={(e) => updateLine(line.id, 'date', e.target.value)} disabled={readOnly} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Expense line date" title="Expense line date" /></td>
                      <td className="px-4 py-3"><input value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} disabled={readOnly} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Description" aria-label="Expense line description" title="Expense line description" /></td>
                      <td className="px-4 py-3"><select value={line.accountId} onChange={(e) => updateLine(line.id, 'accountId', e.target.value)} disabled={readOnly} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Expense account" title="Expense account"><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.code ? `${account.code} • ${account.name}` : account.name}</option>)}</select></td>
                      <td className="px-4 py-3 text-right"><input type="number" min="0" step="0.01" value={line.amount} onChange={(e) => updateLine(line.id, 'amount', Number(e.target.value))} disabled={readOnly} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Expense amount" title="Expense amount" /></td>
                      <td className="px-4 py-3"><input value={line.receiptName} onChange={(e) => updateLine(line.id, 'receiptName', e.target.value)} disabled={readOnly} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Receipt link" aria-label="Expense receipt link" title="Expense receipt link" /></td>
                      <td className="px-4 py-3 text-center"><input type="checkbox" checked={line.billable} onChange={(e) => updateLine(line.id, 'billable', e.target.checked)} disabled={readOnly} className="h-4 w-4 text-emerald-600" aria-label="Billable expense" title="Billable expense" /></td>
                      {!readOnly && <td className="px-4 py-3 text-right"><button type="button" onClick={() => removeLine(line.id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100" aria-label="Remove expense line" title="Remove expense line"><X size={14} /></button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="text-sm text-slate-600">Total Expenses</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(totalExpenses, currency)}</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="text-sm text-slate-600">Advance Payment</div>
                <input type="number" min="0" step="0.01" value={advancePayment} onChange={(e) => setAdvancePayment(Number(e.target.value))} disabled={readOnly} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Advance payment amount" title="Advance payment amount" />
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="text-sm text-slate-600">Net Amount Owed</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(netAmount, currency)}</div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={readOnly} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Vendor-facing notes" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Internal Notes</label>
                <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} disabled={readOnly} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Internal notes" />
              </div>
            </div>
          </section>
            </div>
          </div>
        </div>

      <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.08)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-end">
            <div className="text-sm text-slate-600">Report owner: {selectedEmployee?.displayName ?? '—'}</div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button type="button" onClick={() => router.push('/expenses/employee-expenses/expenses')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><X size={16} /> Cancel</button>
              {mode === 'new' ? (
                <>
                  <button type="button" onClick={handleSaveDraft} disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed">Save Draft</button>
                  <button type="button" onClick={handleSubmitForApproval} disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Submit for Approval</button>
                </>
              ) : (
                <button type="button" onClick={handleSubmitFromEdit} disabled={submitting || status !== 'DRAFT'} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Submit for Approval</button>
              )}
            </div>
          </div>
          {error && <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        </div>
      </div>
    </div>
  </div>
  )
}

