'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Save, Loader2, Plus, X, Upload, FileText } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import apiClient from '@/lib/api-client'
import { expensesService, ExpenseReportPayload } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import HaypFileUpload, { AttachmentMeta } from '@/components/shared/HaypFileUpload'
import HaypSelect from '@/components/shared/HaypSelect'

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
  vendor: string
  description: string
  accountId: string
  amount: number
  receiptName: string
  receiptUrl: string | null
  billable: boolean
}

const defaultLine = (): ExpenseLine => ({
  id: Math.random().toString(36).slice(2, 9),
  date: today,
  category: 'Travel',
  vendor: '',
  description: '',
  accountId: '',
  amount: 0,
  receiptName: '',
  receiptUrl: null,
  billable: false,
})

export default function ExpenseReportForm({ mode, expenseId }: ExpenseReportFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const companyQuery = searchParams.get('company')
  const expensesReturnPath = companyQuery ? `/expenses/employee-expenses/expenses?company=${companyQuery}` : '/expenses/employee-expenses/expenses'
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [reportName, setReportName] = useState('')
  const [businessPurpose, setBusinessPurpose] = useState('')
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [departmentId, setDepartmentId] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [lines, setLines] = useState<ExpenseLine[]>([defaultLine()])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [vendors, setVendors] = useState<Array<{ id: string; displayName: string }>>([])
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([])
  const [advancePayment, setAdvancePayment] = useState(0)
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([])
  const [activeTab, setActiveTab] = useState<'notes' | 'policy' | 'attachments'>('notes')
  const [uploadingLineId, setUploadingLineId] = useState<string | null>(null)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const attachmentInputRef = useRef<HTMLInputElement | null>(null)
  const [attachmentUploading, setAttachmentUploading] = useState(false)
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

    expensesService.listVendors(companyId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const items = Array.isArray(data) ? data : data.data ?? []
        setVendors(items.map((vendor: any) => ({ id: vendor.id, displayName: vendor.displayName ?? vendor.name ?? vendor.id })))
      })
      .catch(() => {})

    apiClient.get(`/companies/${companyId}/organization/departments`)
      .then((res) => {
        if (!active) return
        const payload = res.data ?? res
        const list = Array.isArray(payload) ? payload : payload.data ?? []
        const normalized = list.map((dept: any) => ({ id: dept.id, name: dept.name }))
        setDepartments(normalized)
        if (!departmentId && normalized.length > 0) setDepartmentId(normalized[0].id)
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
  }, [companyId, employeeId, departmentId])

  useEffect(() => {
    if (!companyId || !isEdit || !expenseId) return
    let active = true

    expensesService.getExpenseReport(companyId, expenseId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setReportName(data.description ?? '')
        setBusinessPurpose(data.businessPurpose ?? '')
        setFromDate(data.fromDate ?? today)
        setToDate(data.toDate ?? today)
        setStatus(data.status ?? 'DRAFT')
        setEmployeeId(data.employeeId ?? '')
        setDepartmentId(data.departmentId ?? '')
        setAdvancePayment(Number(data.advancePayment ?? 0))
        setNotes(data.notes ?? '')
        setInternalNotes(data.internalNotes ?? '')
        if (Array.isArray(data.attachments) && data.attachments.length > 0) {
          setAttachments(data.attachments.map((attachment: any) => ({
            id: attachment.id ?? attachment.fileUrl ?? `${Date.now()}`,
            fileName: attachment.fileName ?? attachment.name ?? 'Attachment',
            contentType: attachment.mimeType ?? null,
            size: attachment.fileSize ?? null,
            url: attachment.fileUrl ?? attachment.url ?? undefined,
          })))
        }
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          interface ApiExpenseLine { id?: string; date?: string | null; category?: string | null; vendor?: string | null; description?: string | null; accountId?: string | null; amount?: number | null; receiptUrl?: string | null; billable?: boolean | null }
          setLines(data.lines.map((line: ApiExpenseLine) => ({
            id: Math.random().toString(36).slice(2, 9),
            date: line.date ?? today,
            category: line.category ?? 'Other',
            vendor: line.vendor ?? '',
            description: line.description ?? '',
            accountId: line.accountId ?? '',
            amount: Number(line.amount ?? 0),
            receiptName: line.receiptUrl ?? '',
            receiptUrl: line.receiptUrl ?? null,
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

  const createPayload = (): Omit<ExpenseReportPayload, 'status'> => ({
    employeeId,
    departmentId: departmentId || null,
    description: reportName,
    businessPurpose,
    fromDate,
    toDate,
    lines: lines.map((line) => ({
      date: line.date,
      category: line.category,
      vendor: line.vendor,
      description: line.description,
      accountId: line.accountId || null,
      amount: line.amount,
      receiptUrl: line.receiptUrl,
      receiptName: line.receiptName || null,
      billable: line.billable,
    })),
    advancePayment: Number(advancePayment || 0),
    notes,
    internalNotes,
    attachments: attachments.map((attachment) => ({
      fileUrl: attachment.url,
      fileName: attachment.fileName,
      mimeType: attachment.contentType,
      fileSize: attachment.size,
    })),
  })

  const handleSaveDraft = async () => {
    if (!companyId) return
    setSubmitting(true)
    try {
      const payload: ExpenseReportPayload = { ...createPayload(), status: 'DRAFT' as const }
      if (mode === 'edit' && expenseId) {
        await expensesService.updateExpenseReport(companyId, expenseId, payload)
        toast.success('Expense report updated as draft')
      } else {
        await expensesService.createExpenseReport(companyId, payload)
        toast.success('Expense report saved as draft')
      }
      router.push(expensesReturnPath)
    } catch (err: any) {
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
      const payload: ExpenseReportPayload = { ...createPayload(), status: 'SUBMITTED' as const }
      if (mode === 'edit' && expenseId) {
        await expensesService.updateExpenseReport(companyId, expenseId, payload)
      } else {
        await expensesService.createExpenseReport(companyId, payload)
      }
      toast.success('Expense report submitted for approval')
      router.push(expensesReturnPath)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to submit expense report')
      toast.error('Unable to submit expense report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitFromEdit = handleSubmitForApproval

  const handleUploadLineReceipt = async (lineId: string, file: File) => {
    if (!companyId) return
    setSubmitting(true)
    try {
      const response = await expensesService.uploadAttachment(companyId, file, 'expenseLine', lineId)
      const attachment = response.data ?? response
      setLines((current) => current.map((line) => line.id === lineId ? {
        ...line,
        receiptName: attachment.fileName || file.name,
        receiptUrl: attachment.fileUrl ?? null,
      } : line))
    } catch (err) {
      toast.error('Receipt upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLineFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !uploadingLineId) return
    handleUploadLineReceipt(uploadingLineId, file)
    event.target.value = ''
    setUploadingLineId(null)
  }

  const handleUploadAttachments = async (files: FileList | null) => {
    if (!companyId || !files?.length) return
    setAttachmentUploading(true)
    try {
      const uploaded: AttachmentMeta[] = []
      for (const file of Array.from(files)) {
        const response = await expensesService.uploadAttachment(companyId, file, 'expenseReport', 'draft')
        const attachment = response.data ?? response
        uploaded.push({
          id: attachment.id || `${Date.now()}-${file.name}`,
          fileName: attachment.fileName || file.name,
          contentType: attachment.mimeType ?? file.type,
          size: attachment.fileSize ?? file.size,
          url: attachment.fileUrl,
        })
      }
      setAttachments((current) => [...current, ...uploaded])
    } catch (err) {
      toast.error('Attachment upload failed')
    } finally {
      setAttachmentUploading(false)
    }
  }

  const handleAttachmentFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUploadAttachments(event.target.files)
    event.target.value = ''
  }

  const selectedEmployee = useMemo(() => employees.find((item) => item.id === employeeId), [employees, employeeId])

  return (
    <div className="min-h-full flex min-h-[100vh] flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Expense' : 'Edit Expense'}</h1>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-sm text-slate-700">
              <div className="font-semibold">Status</div>
              <div>{status}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 pb-40">
          <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <div>
                <label htmlFor="report-name" className="block text-sm font-semibold text-slate-900">Report Name</label>
                <input id="report-name" value={reportName} onChange={(e) => setReportName(e.target.value)} disabled={readOnly} className="mt-2 h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Report title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="report-from-date" className="block text-sm font-semibold text-slate-900">From Date</label>
                  <input id="report-from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} disabled={readOnly} className="mt-2 h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Report start date" title="Report start date" />
                </div>
                <div>
                  <label htmlFor="report-to-date" className="block text-sm font-semibold text-slate-900">To Date</label>
                  <input id="report-to-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} disabled={readOnly} className="mt-2 h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Report end date" title="Report end date" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="report-employee" className="block text-sm font-semibold text-slate-900">Employee</label>
                  <HaypSelect id="report-employee" value={employeeId} onChange={setEmployeeId} disabled={readOnly} options={employees.map((e) => ({ value: e.id, label: e.displayName }))} placeholder="Select employee" />
                </div>
                <div>
                  <label htmlFor="report-department" className="block text-sm font-semibold text-slate-900">Department</label>
                  <HaypSelect id="report-department" value={departmentId} onChange={setDepartmentId} disabled={readOnly} options={departments.map((d) => ({ value: d.id, label: d.name }))} placeholder="Select department" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <label htmlFor="business-purpose" className="block text-sm font-semibold text-slate-900">Business Purpose</label>
              <textarea
                id="business-purpose"
                value={businessPurpose}
                onChange={(e) => setBusinessPurpose(e.target.value)}
                disabled={readOnly}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                placeholder="Why is this report being submitted?"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Expense Lines</h2>
              </div>
              {!readOnly && (
                <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> Add Line</button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Vendor</th>
                    <th className="px-3 py-2">Account</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2">Receipt</th>
                    <th className="px-3 py-2">Billable</th>
                    {!readOnly && <th className="px-3 py-2" />}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-3 py-2"><input type="date" value={line.date} onChange={(e) => updateLine(line.id, 'date', e.target.value)} disabled={readOnly} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Expense line date" title="Expense line date" /></td>
                      <td className="px-3 py-2">
                        <HaypSelect value={line.category} onChange={(v) => updateLine(line.id, 'category', v)} disabled={readOnly} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
                      </td>
                      <td className="px-3 py-2"><input value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} disabled={readOnly} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Description" aria-label="Expense line description" title="Expense line description" /></td>
                      <td className="px-3 py-2">
                        <HaypSelect value={line.vendor} onChange={(v) => updateLine(line.id, 'vendor', v)} disabled={readOnly} options={vendors.map((v) => ({ value: v.displayName, label: v.displayName }))} placeholder="Select vendor" />
                      </td>
                      <td className="px-3 py-2"><HaypSelect value={line.accountId} onChange={(v) => updateLine(line.id, 'accountId', v)} disabled={readOnly} options={accounts.map((a) => ({ value: a.id, label: a.code ? `${a.code} • ${a.name}` : (a.name ?? '') }))} placeholder="Select account" /></td>
                      <td className="px-3 py-2 text-right"><input type="number" min="0" step="0.01" value={line.amount} onChange={(e) => updateLine(line.id, 'amount', Number(e.target.value))} disabled={readOnly} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Expense amount" title="Expense amount" /></td>
                      <td className="px-3 py-2">
                        <div className="space-y-2">
                          <input value={line.receiptName} onChange={(e) => updateLine(line.id, 'receiptName', e.target.value)} disabled={readOnly} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Receipt description" aria-label="Expense receipt description" title="Expense receipt description" />
                          <button type="button" onClick={() => { if (!readOnly) { setUploadingLineId(line.id); uploadInputRef.current?.click() } }} disabled={readOnly} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <Upload size={12} /> {line.receiptUrl ? 'Replace' : 'Upload'}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center"><input type="checkbox" checked={line.billable} onChange={(e) => updateLine(line.id, 'billable', e.target.checked)} disabled={readOnly} className="h-4 w-4 text-emerald-600" aria-label="Billable expense" title="Billable expense" /></td>
                      {!readOnly && <td className="px-3 py-2 text-right"><button type="button" onClick={() => removeLine(line.id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100" aria-label="Remove expense line" title="Remove expense line"><X size={14} /></button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              <input
                ref={uploadInputRef}
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleLineFileSelection}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm text-slate-600">Total Expenses</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(totalExpenses, currency)}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm text-slate-600">Advance Payment</div>
                <input type="number" min="0" step="0.01" value={advancePayment} onChange={(e) => setAdvancePayment(Number(e.target.value))} disabled={readOnly} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" aria-label="Advance payment amount" title="Advance payment amount" />
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm text-slate-600">Net Amount Owed</div>
                <div className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(netAmount, currency)}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {mode !== 'new' && (
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                {['notes', 'policy', 'attachments'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab as 'notes' | 'policy' | 'attachments')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {tab === 'notes' ? 'Notes' : tab === 'policy' ? 'Policy' : 'Attachments'}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6">
              {(mode === 'new' || activeTab === 'notes') && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900">Business Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={readOnly} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="What should approvers know?" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900">Internal Notes</label>
                    <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} disabled={readOnly} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Private notes for accounting" />
                  </div>
                </div>
              )}
              {(mode === 'new' || activeTab === 'policy') && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                  <div className="text-sm font-semibold text-slate-900">Expense Policy</div>
                  <p className="mt-3">All expense lines must comply with company policy. Receipts are required for amounts over $25, and travel expenses should be pre-approved.</p>
                  <ul className="mt-3 space-y-2 list-disc pl-5 text-slate-600">
                    <li>Include vendor and business purpose for every line.</li>
                    <li>Upload receipts for each line item.</li>
                    <li>Non-reimbursable items are subject to review.</li>
                  </ul>
                </div>
              )}
              {(mode === 'new' || activeTab === 'attachments') && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => attachmentInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <Upload size={16} /> Upload attachments
                    </button>
                    {attachmentUploading && <span className="text-sm text-slate-500">Uploading files…</span>}
                  </div>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleAttachmentFileSelection}
                  />
                  <HaypFileUpload
                    attachments={attachments}
                    onChange={(next) => setAttachments(next)}
                    label="Report attachments"
                    description="Uploaded files are saved to this report and referenced on final submission."
                    multiple
                  />
                </div>
              )}
            </div>
          </section>
            </div>
          </div>
        </div>

      <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_12px_rgb(15,23,42/0.08)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-end">
            <div className="text-sm text-slate-600">Report owner: {selectedEmployee?.displayName ?? '—'}</div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button type="button" onClick={() => router.push(expensesReturnPath)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><X size={16} /> Cancel</button>
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

