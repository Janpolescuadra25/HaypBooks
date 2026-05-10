'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Save, Loader2, Plus, X, Upload, FileText, Send, Trash2 } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { expensesService, ExpenseReportPayload } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import { getPolicyGuidanceText } from '@/config/expense-policies'
import HaypFileUpload, { AttachmentMeta } from '@/components/shared/HaypFileUpload'
import HaypAccountPicker from './HaypAccountPicker'
import { NewAccountModal } from '@/components/shared/NewAccountModal'
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
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [newAccountRowId, setNewAccountRowId] = useState<string | null>(null)
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

    expensesService.listDepartments(companyId)
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
    <div className="h-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl z-30">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                {mode === 'new' ? 'New Expense Report' : 'Edit Expense Report'}
              </h1>
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
              <button type="button" onClick={() => setActiveTab('notes')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'notes' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Notes</button>
              <button type="button" onClick={() => setActiveTab('policy')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'policy' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Policy</button>
              <button type="button" onClick={() => setActiveTab('attachments')} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'attachments' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Attachments</button>
            </div>
          )}

          <div className={activeTab === 'notes' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Report Details</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="mb-4 space-y-1.5">
                    <label htmlFor="report-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Name</label>
                    <input 
                      id="report-name" 
                      value={reportName} 
                      onChange={(e) => setReportName(e.target.value)} 
                      disabled={readOnly} 
                      className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" 
                      placeholder="e.g. Q4 Sales Trip to Tokyo" 
                    />
                  </div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                      <label htmlFor="report-from-date" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">From Date</label>
                      <input 
                        id="report-from-date" 
                        type="date" 
                        value={fromDate} 
                        onChange={(e) => setFromDate(e.target.value)} 
                        disabled={readOnly} 
                        className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="report-to-date" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Date</label>
                      <input 
                        id="report-to-date" 
                        type="date" 
                        value={toDate} 
                        onChange={(e) => setToDate(e.target.value)} 
                        disabled={readOnly} 
                        className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="report-employee" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee</label>
                      <HaypSelect 
                        id="report-employee" 
                        value={employeeId} 
                        onChange={setEmployeeId} 
                        disabled={readOnly} 
                        options={employees.map((e) => ({ value: e.id, label: e.displayName }))} 
                        placeholder="Select employee" 
                        className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="report-department" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
                      <HaypSelect 
                        id="report-department" 
                        value={departmentId} 
                        onChange={setDepartmentId} 
                        disabled={readOnly} 
                        options={departments.map((d) => ({ value: d.id, label: d.name }))} 
                        placeholder="Select department" 
                        className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <label htmlFor="business-purpose" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Purpose</label>
                    <textarea
                      id="business-purpose"
                      value={businessPurpose}
                      onChange={(e) => setBusinessPurpose(e.target.value)}
                      disabled={readOnly}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                      placeholder="Detailed purpose of the expenses..."
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Expense Lines</h2>
                  </div>
                  {!readOnly && (
                    <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
                      <Plus size={16} /> Add Line
                    </button>
                  )}
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Receipt</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Billable</th>
                          {!readOnly && <th className="px-4 py-3" />}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {lines.map((line) => (
                          <tr key={line.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-2 py-2 min-w-[140px]">
                              <input type="date" value={line.date} onChange={(e) => updateLine(line.id, 'date', e.target.value)} disabled={readOnly} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold focus:bg-white focus:border-emerald-500 outline-none" />
                            </td>
                            <td className="px-2 py-2 min-w-[140px]">
                              <HaypSelect value={line.category} onChange={(v) => updateLine(line.id, 'category', v)} disabled={readOnly} options={CATEGORIES.map((c) => ({ value: c, label: c }))} className="h-10 text-xs rounded-lg border border-slate-200" />
                            </td>
                            <td className="px-2 py-2 min-w-[200px]">
                              <input value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} disabled={readOnly} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold focus:bg-white focus:border-emerald-500 outline-none" placeholder="Description" />
                            </td>
                            <td className="px-2 py-2 min-w-[160px]">
                              <HaypSelect value={line.vendor} onChange={(v) => updateLine(line.id, 'vendor', v)} disabled={readOnly} options={vendors.map((v) => ({ value: v.displayName, label: v.displayName }))} placeholder="Vendor" className="h-10 text-xs rounded-lg border border-slate-200" />
                            </td>
                            <td className="px-2 py-2 min-w-[160px]">
                              <HaypAccountPicker
                                value={line.accountId}
                                accounts={accounts}
                                placeholder="Search accounts…"
                                onChange={(v) => updateLine(line.id, 'accountId', v)}
                                onCreateNew={() => {
                                  setNewAccountRowId(line.id)
                                  setShowAccountModal(true)
                                }}
                                disabled={readOnly}
                              />
                            </td>
                            <td className="px-2 py-2 min-w-[120px]">
                              <input type="number" value={line.amount} onChange={(e) => updateLine(line.id, 'amount', Number(e.target.value))} disabled={readOnly} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-right focus:bg-white focus:border-emerald-500 outline-none" />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button type="button" onClick={() => { if (!readOnly) { setUploadingLineId(line.id); uploadInputRef.current?.click() } }} className={`p-2 rounded-lg transition-colors ${line.receiptUrl ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}>
                                <Upload size={16} />
                              </button>
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input type="checkbox" checked={line.billable} onChange={(e) => updateLine(line.id, 'billable', e.target.checked)} disabled={readOnly} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                            </td>
                            {!readOnly && (
                              <td className="px-2 py-2 text-right">
                                <button type="button" onClick={() => removeLine(line.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {companyId && (
                    <NewAccountModal
                      open={showAccountModal}
                      companyId={companyId}
                      onClose={() => setShowAccountModal(false)}
                      onCreated={(account) => {
                        setAccounts((prev) => [{ id: account.id, code: account.code, name: account.name }, ...prev])
                        if (newAccountRowId) {
                          setLines((rows) => rows.map((row) => row.id === newAccountRowId ? { ...row, accountId: account.id } : row))
                        }
                        setShowAccountModal(false)
                        setNewAccountRowId(null)
                      }}
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <label htmlFor="advancePayment" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Advance Payment</label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{currency}</span>
                  <input
                    id="advancePayment"
                    type="number"
                    min="0"
                    step="0.01"
                    value={advancePayment || ''}
                    onChange={(e) => setAdvancePayment(Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 py-2 text-sm font-black text-slate-900 text-right focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>
            </section>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <section>
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                    <div className="w-1 h-6 bg-slate-300 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Notes</h2>
                  </div>
                  <div className="px-4 pb-4 sm:px-5 lg:px-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Notes (Public)</label>
                      <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        disabled={readOnly} 
                        rows={3} 
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal Notes (Private)</label>
                      <textarea 
                        value={internalNotes} 
                        onChange={(e) => setInternalNotes(e.target.value)} 
                        disabled={readOnly} 
                        rows={3} 
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-rose-400/50 focus:ring-2 focus:ring-rose-400/10 transition-all outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="w-full bg-amber-50 rounded-3xl border border-amber-100 shadow-sm h-full">
                  <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Policy Guidance</h2>
                  </div>
                  <div className="px-4 pb-4 sm:px-5 lg:px-6">
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-3">Important Policy Reminders</div>
                    <p className="text-sm text-amber-800">{getPolicyGuidanceText()}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className={activeTab === 'policy' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-amber-400 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Company Expense Policy</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6 text-slate-600 space-y-4">
                  <p className="font-bold text-slate-900">Standard Reimbursement Rules:</p>
                  <p>All expense claims must be submitted within 30 days of the transaction date. Original itemized receipts are mandatory for all transactions exceeding $25.00 USD.</p>
                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Allowable Expenses</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Business travel and accommodation</li>
                        <li>Client entertainment (pre-approved)</li>
                        <li>Professional development</li>
                        <li>Office supplies and software</li>
                      </ul>
                    </div>
                    <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100">
                      <p className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">Non-Allowable Expenses</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-rose-800/70">
                        <li>Personal grooming or attire</li>
                        <li>Traffic fines or parking tickets</li>
                        <li>Alcohol (unless client dinner)</li>
                        <li>Commuting costs to home office</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className={activeTab === 'attachments' ? 'space-y-4' : 'hidden'}>
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Report Attachments</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <HaypFileUpload
                    attachments={attachments}
                    onChange={setAttachments}
                    label="Supporting Documents"
                    description="Upload PDFs, receipts, or other proof of expense."
                    multiple
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 z-40 shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.05)]">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <div className="flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={() => router.push(expensesReturnPath)} 
                className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveDraft} 
                disabled={submitting || readOnly} 
                className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin text-emerald-600" /> : <Save size={18} className="text-slate-400" />}
                Save Draft
              </button>
              <button 
                type="button" 
                onClick={handleSubmitForApproval} 
                disabled={submitting || readOnly} 
                className="h-10 px-8 rounded-xl bg-emerald-600 text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Submit for Approval
              </button>
            </div>
          </div>
      </div>

      <input
        ref={uploadInputRef}
        type="file"
        className="hidden"
        accept="image/*,application/pdf"
        onChange={handleLineFileSelection}
      />

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
