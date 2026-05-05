'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Upload, FileText } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import HaypSelect from '@/components/shared/HaypSelect'
import { NewAccountModal } from '@/components/shared/NewAccountModal'

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
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string>('')
  const [uploadedAttachmentUrl, setUploadedAttachmentUrl] = useState<string | null>(null)
  const [uploadedAttachmentId, setUploadedAttachmentId] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAccountModal, setShowAccountModal] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
        if (data.attachmentUrl) {
          setUploadedAttachmentUrl(data.attachmentUrl)
          setReceiptPreviewUrl(data.attachmentUrl)
        }
      })
      .catch(() => toast.error('Failed to load receipt'))

    return () => { active = false }
  }, [companyId, mode, receiptId, toast])

  useEffect(() => {
    if (!receiptFile) return
    const objectUrl = URL.createObjectURL(receiptFile)
    setReceiptPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [receiptFile])

  const validate = useCallback(() => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!receiptFile && !uploadedAttachmentUrl) { setError('Receipt file is required'); return false }
    if (!merchant.trim()) { setError('Vendor is required'); return false }
    if (amount <= 0) { setError('Amount must be greater than zero'); return false }
    if (billable && !clientProject.trim()) { setError('Client/Project is required when billable'); return false }
    setError('')
    return true
  }, [companyId, merchant, amount, billable, clientProject, receiptFile, uploadedAttachmentUrl])

  const handleReceiptUpload = async (file: File) => {
    if (!companyId) return
    setUploadingFile(true)
    try {
      const response = await expensesService.uploadAttachment(companyId, file, 'receipt', receiptId ?? `receipt-${Date.now()}`)
      const attachment = response.data ?? response
      setUploadedAttachmentUrl(attachment.fileUrl)
      setUploadedAttachmentId(attachment.id ?? null)
      setReceiptFile(file)
      setReceiptPreviewUrl(attachment.fileUrl || URL.createObjectURL(file))
      toast.success('Receipt uploaded')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Receipt upload failed')
      toast.error('Receipt upload failed')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    handleReceiptUpload(file)
    event.target.value = ''
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
    attachmentUrl: uploadedAttachmentUrl || null,
  }), [receiptDate, status, merchant, category, paymentMethod, amount, currency, referenceNumber, expenseDate, accountId, billable, clientProject, notes, uploadedAttachmentUrl])
  const accountOptions = useMemo(() => accounts.map((a) => ({ id: a.id, name: a.code ? `${a.code} — ${a.name}` : a.name ?? a.id })), [accounts])

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
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to save receipt')
      toast.error('Unable to save receipt')
    } finally {
      setSubmitting(false)
    }
  }, [companyId, mode, payload, receiptId, validate, toast, onSaved, onClose])

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

  return (
    <div className="px-6 py-4 space-y-6 text-slate-900">
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {/* Upload */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
          <FileText size={28} />
        </div>
        <div className="mt-4 text-base font-semibold text-slate-900">Upload receipt</div>
        <p className="mt-1 text-sm text-slate-500">Drag and drop a receipt image or PDF, or click to select</p>
        <label htmlFor="receipt-file" className="mt-4 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <Upload size={14} /> {uploadingFile ? 'Uploading…' : 'Choose file'}
        </label>
        <input id="receipt-file" type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={uploadingFile} />
        {receiptPreviewUrl ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-left">
            <div className="text-sm font-semibold text-slate-900">Receipt uploaded</div>
            <p className="mt-1 text-sm text-slate-500">{uploadedAttachmentId ? 'File uploaded successfully.' : 'File selected.'}</p>
            {receiptPreviewUrl.endsWith('.pdf') ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-100 p-3 text-xs text-slate-600">PDF preview not available.</div>
            ) : (
              <img src={receiptPreviewUrl} alt="Receipt preview" className="mt-3 w-full rounded-lg border border-slate-200 object-contain" />
            )}
          </div>
        ) : null}
      </div>

      {/* Receipt Details */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Receipt Details</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label htmlFor="receiptDate" className="text-[10px] font-bold uppercase text-slate-400">Receipt Date</label>
            <input id="receiptDate" type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" />
          </div>
          <div>
            <label htmlFor="status" className="text-[10px] font-bold uppercase text-slate-400">Status</label>
            <HaypSelect id="status" value={status} onChange={setStatus} options={STATUS_OPTIONS.map((o) => ({ value: o, label: o }))} />
          </div>
          <div>
            <label htmlFor="merchant" className="text-[10px] font-bold uppercase text-slate-400">Merchant</label>
            <input id="merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Enter merchant" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" />
          </div>
          <div>
            <label htmlFor="receiptAmount" className="text-[10px] font-bold uppercase text-slate-400">Total Amount</label>
            <div className="mt-1 flex rounded-lg border border-slate-200 bg-white">
              <span className="inline-flex items-center px-3 text-sm text-slate-500 border-r border-slate-200">{currency}</span>
              <input id="receiptAmount" type="number" min="0" step="0.01" value={amount !== 0 ? amount : ''} onChange={(e) => setAmount(Number(e.target.value) || 0)} className="w-full border-0 px-3 py-2 text-right text-sm text-slate-900 outline-none rounded-r-lg" />
            </div>
          </div>
          <div>
            <label htmlFor="expenseDate" className="text-[10px] font-bold uppercase text-slate-400">Expense Date</label>
            <input id="expenseDate" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" />
          </div>
          <div>
            <label htmlFor="paymentMethod" className="text-[10px] font-bold uppercase text-slate-400">Payment Method</label>
            <HaypSelect id="paymentMethod" value={paymentMethod} onChange={setPaymentMethod} options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))} />
          </div>
          <div className="col-span-2">
            <label htmlFor="referenceNumber" className="text-[10px] font-bold uppercase text-slate-400">Reference Number</label>
            <input id="referenceNumber" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Optional reference" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Classification */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Classification</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label htmlFor="receiptCategory" className="text-[10px] font-bold uppercase text-slate-400">Category</label>
            <HaypSelect id="receiptCategory" value={category} onChange={setCategory} options={CATEGORIES.map((o) => ({ value: o, label: o }))} />
          </div>
          <div>
            <CustomerPickerField
              label="Account"
              value={accountId}
              customers={accountOptions}
              placeholder="Search accounts…"
              createLabel="+ New Account"
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
          <div className="col-span-2 flex items-center gap-3">
            <input id="billable" type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            <label htmlFor="billable" className="text-sm text-slate-700">Billable to Client</label>
          </div>
          {billable && (
            <div className="col-span-2">
              <label htmlFor="clientProject" className="text-[10px] font-bold uppercase text-slate-400">Client / Project</label>
              <input id="clientProject" value={clientProject} onChange={(e) => setClientProject(e.target.value)} placeholder="Client or project name" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Notes */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Notes</p>
        <textarea id="receiptNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add extra detail for this receipt" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" />
      </div>
    </div>
  )
})

export default ReceiptForm
