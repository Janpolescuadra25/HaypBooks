'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, X, Loader2, Save, Send, ArrowLeft, History, Paperclip } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import HaypSelect from '@/components/shared/HaypSelect'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import { NewAccountModal } from '@/components/shared/NewAccountModal'

const today = new Date().toISOString().slice(0, 10)
const STATUS_OPTIONS = ['DRAFT', 'SUBMITTED', 'PROCESSED', 'REJECTED']
const PAYMENT_METHODS = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'OTHER']
const CATEGORIES = ['MEALS', 'TRAVEL', 'OFFICE_SUPPLIES', 'SOFTWARE', 'UTILITIES', 'OTHER']

interface Account { id: string; code: string; name: string }

interface ReceiptFormProps {
  mode: 'new' | 'edit'
  receiptId?: string
  onClose?: () => void
  onSaved?: () => void
}

export default function ReceiptForm({ mode, receiptId, onClose, onSaved }: ReceiptFormProps) {
  const toast = useToast()
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [receiptDate, setReceiptDate] = useState(today)
  const [expenseDate, setExpenseDate] = useState(today)
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState(0)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [referenceNumber, setReferenceNumber] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [notes, setNotes] = useState('')
  const [billable, setBillable] = useState(false)
  const [clientProject, setClientProject] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [accountId, setAccountId] = useState('')

  const [employees, setEmployees] = useState<Array<{ id: string; displayName: string }>>([])
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadedAttachmentId, setUploadedAttachmentId] = useState<string | null>(null)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!companyId) return
    accountingService.listAccounts(companyId, { limit: 1000 })
      .then((res) => {
        const items = res.data ?? res
        setAccounts(items.map((a: any) => ({ id: a.id, code: a.code, name: a.name })))
      })
      .catch(() => {})
  }, [companyId])

  useEffect(() => {
    if (mode !== 'edit' || !receiptId || !companyId) return
    expensesService.getReceipt(companyId, receiptId)
      .then((res) => {
        const data = res.data ?? res
        setReceiptDate(data.receiptDate?.slice(0, 10) ?? today)
        setExpenseDate(data.expenseDate?.slice(0, 10) ?? today)
        setMerchant(data.merchant ?? '')
        setAmount(Number(data.amount ?? 0))
        setCategory(data.category ?? CATEGORIES[0])
        setPaymentMethod(data.paymentMethod ?? PAYMENT_METHODS[0])
        setReferenceNumber(data.referenceNumber ?? '')
        setStatus(data.status ?? 'DRAFT')
        setNotes(data.notes ?? '')
        setBillable(data.billable ?? false)
        setClientProject(data.clientProject ?? '')
        setAccountId(data.accountId ?? '')
        setUploadedAttachmentId(data.attachmentId ?? null)
        if (data.attachmentUrl) setReceiptPreviewUrl(data.attachmentUrl)
      })
      .catch(() => toast.error('Failed to load receipt'))
  }, [companyId, receiptId, mode, toast])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !companyId) return

    setUploadingFile(true)
    try {
      const res = await expensesService.uploadReceipt(companyId, file)
      setUploadedAttachmentId(res.attachmentId)
      setReceiptPreviewUrl(URL.createObjectURL(file))
      toast.success('File uploaded successfully')
    } catch (err) {
      toast.error('Failed to upload file')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSave = async () => {
    if (!companyId) return
    if (!merchant.trim()) { setError('Merchant is required'); return }
    if (amount <= 0) { setError('Amount must be greater than zero'); return }
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        receiptDate,
        expenseDate,
        merchant,
        amount,
        currency,
        category,
        employeeId,
        departmentId,
        paymentMethod,
        referenceNumber,
        status,
        notes,
        billable,
        clientProject,
        accountId,
        attachmentId: uploadedAttachmentId,
      }

      if (mode === 'new') {
        await expensesService.createReceipt(companyId, payload)
        toast.success('Receipt created')
      } else if (receiptId) {
        await expensesService.updateReceipt(companyId, receiptId, payload)
        toast.success('Receipt updated')
      }
      if (onSaved) onSaved()
      else if (onClose) onClose()
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Failed to save receipt'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const accountOptions = accounts.map((a) => ({ id: a.id, name: `${a.code} - ${a.name}` }))

  const handleCancel = useCallback(() => {
    if (onClose) onClose()
    else router.back()
  }, [onClose, router])

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="h-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <div className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <h1 className="text-xl font-semibold text-slate-900">{mode === 'new' ? 'New Receipt' : 'Edit Receipt'}</h1>
        </div>
      </div>
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="space-y-6">
            {/* Upload */}
      <div className="relative group rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-all hover:border-emerald-300 hover:bg-emerald-50/30">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
          <FileText size={28} />
        </div>
        <div className="mt-4 text-base font-bold text-slate-900 uppercase tracking-tight">Upload Receipt</div>
        <p className="mt-1 text-xs font-medium text-slate-500">Drag and drop a receipt image or PDF, or click to browse</p>
        
        <label htmlFor="receipt-file" className="mt-4 inline-flex cursor-pointer items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
          <Upload size={16} /> {uploadingFile ? 'Uploading…' : 'Choose File'}
        </label>
        <input id="receipt-file" type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={uploadingFile} />
        
        {receiptPreviewUrl ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Receipt Preview
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded border border-emerald-100">Ready</span>
            </div>
            {receiptPreviewUrl.endsWith('.pdf') ? (
              <div className="flex items-center justify-center h-32 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-400">PDF Document Attached</div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                <img src={receiptPreviewUrl} alt="Receipt preview" className="w-full max-h-[300px] object-contain" />
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4">
        <section>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Transaction Details</h2>
            </div>
            <div className="px-4 pb-4 sm:px-5 lg:px-6">
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div className="space-y-1.5">
                  <label htmlFor="receiptDate" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Receipt Date</label>
                  <input id="receiptDate" type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="status" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                  <HaypSelect id="status" value={status} onChange={setStatus} options={STATUS_OPTIONS.map((o) => ({ value: o, label: o }))} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div className="space-y-1.5">
                  <label htmlFor="merchant" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Merchant / Vendor</label>
                  <input id="merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Who did you pay?" className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="receiptAmount" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{currency}</span>
                    <input id="receiptAmount" type="number" min="0" step="0.01" value={amount !== 0 ? amount : ''} onChange={(e) => setAmount(Number(e.target.value) || 0)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 py-2 text-sm font-black text-slate-900 text-right focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="expenseDate" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expense Date</label>
                  <input id="expenseDate" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="paymentMethod" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Method</label>
                  <HaypSelect id="paymentMethod" value={paymentMethod} onChange={setPaymentMethod} options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <label htmlFor="referenceNumber" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reference Number</label>
                <input id="referenceNumber" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Transaction ref #" className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Classification</h2>
            </div>
            <div className="px-4 pb-4 sm:px-5 lg:px-6">
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div className="space-y-1.5">
                  <label htmlFor="receiptCategory" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                  <HaypSelect id="receiptCategory" value={category} onChange={setCategory} options={CATEGORIES.map((o) => ({ value: o, label: o }))} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="receiptEmployee" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee</label>
                  <select id="receiptEmployee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none mt-1">
                    <option value="">Select employee</option>
                    {/* TODO: fetch employees from API */}
                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.displayName}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="receiptDepartment" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</label>
                  <select id="receiptDepartment" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none mt-1">
                    <option value="">Select department</option>
                    {/* TODO: fetch departments from API */}
                    {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <CustomerPickerField
                    label="Account"
                    value={accountId}
                    customers={accountOptions}
                    placeholder="Search accounts…"
                    createLabel="New Account"
                    onChange={setAccountId}
                    onCreateNew={() => setShowAccountModal(true)}
                  />
                  {companyId && (
                    <NewAccountModal
                      open={showAccountModal}
                      companyId={companyId}
                      onClose={() => setShowAccountModal(false)}
                      onCreated={(a) => {
                        setAccounts((prev) => [{ id: a.id, code: a.code, name: a.name }, ...prev])
                        setAccountId(a.id)
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input id="billable" type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} className="h-5 w-5 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all" />
                  <label htmlFor="billable" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Billable to Client</label>
                </div>
                {billable && <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-white px-2 py-1 rounded border border-emerald-100 shadow-sm">Project Selected</div>}
              </div>
              {billable && (
                <div className="space-y-1.5">
                  <label htmlFor="clientProject" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client / Project</label>
                  <input id="clientProject" value={clientProject} onChange={(e) => setClientProject(e.target.value)} placeholder="Project name or code" className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
              <div className="w-1 h-6 bg-slate-300 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Notes</h2>
            </div>
            <div className="px-4 pb-4 sm:px-5 lg:px-6">
              <textarea id="receiptNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add justifications or internal comments..." className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none resize-none" />
            </div>
          </div>
        </section>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
          </div>
        </div>
      </main>
      <div className="sticky bottom-0 z-40 shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.05)]">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={handleCancel} className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
            <button type="submit" disabled={submitting} className="h-10 px-6 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20">{submitting ? 'Saving...' : mode === 'new' ? 'Save Receipt' : 'Update Receipt'}</button>
          </div>
        </div>
      </div>
    </form>
  )
}
