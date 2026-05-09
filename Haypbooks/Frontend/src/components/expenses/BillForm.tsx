'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Send, Loader2, Check, X } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import LineItemTable from './LineItemTable'
import { getPostingRulesForTransaction } from '@/lib/gl-posting-rules'
import { formatCurrency } from '@/lib/format'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import ActivityLog from '@/components/ui/ActivityLog'
import HaypSelect from '@/components/shared/HaypSelect'
import HaypFileUpload, { AttachmentMeta } from '@/components/shared/HaypFileUpload'
import { ModalPortal } from '@/components/shared/ModalPortal'
import { NewAccountModal } from '@/components/shared/NewAccountModal'
import { useActivityLog } from '@/hooks/useActivityLog'

const genId = () => Math.random().toString(36).slice(2, 9)

interface Vendor {
  id: string
  contactId?: string
  displayName: string
  email?: string
  phone?: string
  contact?: { displayName?: string }
}

const normalizeVendor = (vendor: any): Vendor => ({
  id: String(vendor.id ?? vendor.contactId ?? vendor.contact?.id ?? ''),
  contactId: vendor.contactId ?? vendor.contact?.id,
  displayName: String(vendor.displayName ?? vendor.name ?? vendor.contact?.displayName ?? ''),
  email: String(vendor.email ?? vendor.contact?.contactEmails?.[0]?.email ?? ''),
  phone: String(vendor.phone ?? vendor.contact?.contactPhones?.[0]?.phone ?? ''),
  contact: vendor.contact ? { displayName: String(vendor.contact.displayName ?? '') } : undefined,
})

interface LineItem {
  id: string
  description: string
  account?: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
}

interface Account {
  id: string
  code?: string
  name?: string
  type?: string
}

interface RecurrenceSchedule {
  frequency?: string
  startDate?: string
  endDate?: string | null
  maxOccurrences?: number | null
  daysInAdvance?: number | null
}

interface BillFormProps {
  mode: 'new' | 'edit'
  billId?: string
  title?: string
  onClose?: () => void
  onSaved?: () => void
  saveBill?: (companyId: string, payload: Record<string, unknown>, action: 'draft' | 'submit', mode: 'new' | 'edit', billId?: string) => Promise<any>
  loadBill?: (companyId: string, billId: string) => Promise<any>
  buildPayloadExtras?: (payload: Record<string, unknown>) => Record<string, unknown>
  isRecurringTemplate?: boolean
}

const today = new Date().toISOString().slice(0, 10)
const defaultDue = () => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

const defaultLineItem = (): LineItem => ({
  id: genId(),
  description: '',
  account: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  amount: 0,
})

export default function BillForm({ mode, billId, title, onClose, onSaved, saveBill, loadBill, buildPayloadExtras, isRecurringTemplate }: BillFormProps) {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorId, setVendorId] = useState('')
  const [vendorEmail, setVendorEmail] = useState('')
  const [vendorPhone, setVendorPhone] = useState('')
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [newVendorName, setNewVendorName] = useState('')
  const [newVendorEmail, setNewVendorEmail] = useState('')
  const [newVendorPhone, setNewVendorPhone] = useState('')
  const [creatingVendor, setCreatingVendor] = useState(false)
  const [billNumber, setBillNumber] = useState('')
  const [date, setDate] = useState(today)
  const [dueDate, setDueDate] = useState(defaultDue)
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [description, setDescription] = useState('')
  const [memo, setMemo] = useState('')
  const [billType, setBillType] = useState('Regular')
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [terms, setTerms] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([])
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<Array<{ id: string; poNumber?: string; status?: string }>>([])
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [newAccountRowId, setNewAccountRowId] = useState<string | null>(null)
  const expenseAccounts = useMemo(
    () => accounts.filter((a) => {
      const type = a.type?.toLowerCase() ?? ''
      return !a.type || type === 'expense' || type === 'asset'
    }),
    [accounts],
  )
  const [discountType, setDiscountType] = useState<'pct' | 'flat'>('pct')
  const [discountValue, setDiscountValue] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'DRAFT' | 'PENDING' | 'APPROVED' | string>('DRAFT')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')
  
  // Recurring fields
  const [isRecurring, setIsRecurring] = useState(isRecurringTemplate || false)
  const [templateName, setTemplateName] = useState('')
  const [frequency, setFrequency] = useState('MONTHLY')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState('')
  const [maxOccurrences, setMaxOccurrences] = useState<number | null>(null)
  const [daysInAdvance, setDaysInAdvance] = useState(0)

  const vendorOptions = useMemo(() => vendors.map((v) => ({ id: v.id, name: v.displayName, email: v.email })), [vendors])

  const vendor = useMemo(() => vendors.find(v => v.id === vendorId), [vendorId, vendors])

  useEffect(() => {
    if (mode === 'new') {
      setVendorId('')
      setVendorEmail('')
      setVendorPhone('')
    }
  }, [mode])

  const handleCreateVendor = useCallback(async () => {
    if (!companyId) return
    if (!newVendorName.trim()) { setError('Vendor name is required'); return }
    setCreatingVendor(true)
    try {
      const payload = {
        name: newVendorName.trim(),
        displayName: newVendorName.trim(),
        status: 'ACTIVE',
        email: newVendorEmail || undefined,
        phone: newVendorPhone || undefined,
      }
      const response = await expensesService.createVendor(companyId, payload)
      const saved = response.data ?? response
      const createdVendor = normalizeVendor(saved)
      if (!createdVendor.id) {
        throw new Error('Created vendor response missing id')
      }
      setVendors((prev) => [createdVendor, ...prev])
      setVendorId(createdVendor.id)
      setVendorEmail(createdVendor.email ?? '')
      setVendorPhone(createdVendor.phone ?? '')
      setShowVendorModal(false)
      setNewVendorName('')
      setNewVendorEmail('')
      setNewVendorPhone('')
      toast.success('Vendor created')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to create vendor')
      toast.error('Unable to create vendor')
    } finally {
      setCreatingVendor(false)
    }
  }, [companyId, newVendorEmail, newVendorName, newVendorPhone, toast])

  // Vendor contact fields are mirrored from the selected vendor.
  // If the vendor object contains null values, coerce them to empty strings.
  useEffect(() => {
    if (vendor) {
      setVendorEmail((vendor.email ?? '') as string)
      setVendorPhone((vendor.phone ?? '') as string)
    }
  }, [vendor])

  useEffect(() => {
    if (!companyId) return
    const companyIdValue = companyId
    let cancelled = false
    async function load() {
      try {
        const { data } = await expensesService.listVendors(companyIdValue)
        if (cancelled) return
        const list = Array.isArray(data) ? data : data.data ?? []
        setVendors(list.map(normalizeVendor).filter((vendor: Vendor) => Boolean(vendor.id)))
      } catch {
        toast.error('Failed to load vendors')
      }
    }
    load()
    return () => { cancelled = true }
  }, [companyId, toast, mode])

  useEffect(() => {
    if (!companyId) return
    let active = true
    accountingService.listAccounts(companyId, { includeInactive: false })
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const list = Array.isArray(data) ? data : data.data ?? []
        setAccounts(list.map((a: any) => ({ id: a.id, code: a.code, name: a.name, type: a.type })))
      })
      .catch(() => {})

    expensesService.listPurchaseOrders(companyId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const list = Array.isArray(data) ? data : data.data ?? []
        setPurchaseOrders(list.map((po: any) => ({ id: po.id, poNumber: po.poNumber ?? po.poId ?? '', status: po.status ?? '' })))
      })
      .catch(() => {})

    return () => { active = false }
  }, [companyId])

  useEffect(() => {
    if (mode !== 'edit' || !billId || !companyId) return
    const companyIdValue = companyId
    const billIdValue = billId
    let cancelled = false
    async function loadBill() {
      try {
        const loadBillFn = loadBill ?? ((companyIdParam: string, id: string) => expensesService.getBill(companyIdParam, id))
    const { data } = await loadBillFn(companyIdValue, billIdValue)
        if (cancelled) return
        setBillNumber((data.billNumber ?? '') as string)
        setVendorId((data.vendorId ?? '') as string)
        setPurchaseOrderId((data.purchaseOrderId ?? '') as string)
        setBillType((data.billType ?? 'Regular') as string)
        setDate((data.date ?? today) as string)
        setDueDate((data.dueDate ?? defaultDue()) as string)
        setDescription((data.description ?? data.templateName ?? '') as string)
        setMemo((data.memo ?? data.description ?? data.templateName ?? '') as string)
        setTerms((data.terms ?? '') as string)
        setInternalNotes((data.internalNotes ?? '') as string)
        setAttachments(Array.isArray(data.attachments) ? data.attachments.map((attachment: any, index: number) => ({
          id: attachment.id ?? `att-${index}`,
          fileName: attachment.fileName ?? attachment.name ?? 'Attachment',
          contentType: attachment.contentType ?? null,
          size: attachment.size ?? null,
          url: attachment.url ?? attachment.fileUrl ?? undefined,
        })) : [])
        setStatus(data.status ?? 'DRAFT')
        
        if (data.frequency || data.templateName) {
          setIsRecurring(true)
          setTemplateName(String(data.templateName ?? ''))
          setFrequency(String(data.frequency ?? 'MONTHLY'))
          setStartDate(String(data.startDate?.slice?.(0, 10) ?? today))
          setEndDate(String(data.endDate?.slice?.(0, 10) ?? ''))
          setMaxOccurrences(data.maxOccurrences == null ? null : Number(data.maxOccurrences))
          setDaysInAdvance(data.daysInAdvance == null ? 0 : Number(data.daysInAdvance))
        }

        if (Array.isArray(data.items) && data.items.length > 0) {
          interface RawBillLine { description?: unknown; accountId?: unknown; quantity?: unknown; unitPrice?: unknown; rate?: unknown; taxRate?: unknown; amount?: unknown }
          setLineItems((data.items as RawBillLine[]).map((item) => ({
            id: genId(),
            description: String(item.description ?? ''),
            account: String(item.accountId ?? ''),
            quantity: Number(item.quantity ?? 1),
            unitPrice: Number(item.unitPrice ?? item.rate ?? 0),
            taxRate: Number(item.taxRate ?? 0),
            amount: Number(item.amount ?? (Number(item.quantity ?? 1) * Number(item.unitPrice ?? item.rate ?? 0))),
          })))
        }
      } catch (err) {
        toast.error('Failed to load bill')
      }
    }
    loadBill()
    return () => { cancelled = true }
  }, [billId, companyId, mode, toast])


  const subtotal = useMemo(() => lineItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0), [lineItems])
  const taxTotal = useMemo(() => lineItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0) * (Number(line.taxRate || 0) / 100), 0), [lineItems])
  const discountAmount = useMemo(() => discountType === 'pct' ? subtotal * (discountValue / 100) : discountValue, [discountType, discountValue, subtotal])
  const total = Math.max(0, subtotal + taxTotal - discountAmount)

  const postingRules = useMemo(() => getPostingRulesForTransaction('bill'), [])
  const lineItemAccountOptions = useMemo(() => [
    { value: '__new_account__', label: '+ New Account' },
    ...expenseAccounts.map((a) => ({ value: a.id, label: a.code ? `${a.code} ${a.name}` : a.name ?? a.id })),
  ], [expenseAccounts])



  const handleLineItemsChange = useCallback((rows: LineItem[]) => {
    setLineItems(rows)
  }, [])

  const handleAccountSelect = useCallback((rowId: string, accountId: string) => {
    if (accountId !== '__new_account__') return
    setNewAccountRowId(rowId)
    setLineItems((rows) => rows.map((row) => row.id === rowId ? { ...row, account: '' } : row))
    setShowAccountModal(true)
  }, [])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!vendorId) { setError('Please choose a vendor'); return false }
    if (!lineItems.length) { setError('At least one line item is required'); return false }
    if (lineItems.some(line => !line.description.trim())) { setError('Each line item requires a description'); return false }
    if (lineItems.some(line => !line.account?.trim())) { setError('Each line item must have an expense account assigned'); return false }
    if (lineItems.some(line => line.quantity <= 0)) { setError('Quantity must be at least 1'); return false }
    if (lineItems.some(line => line.unitPrice < 0)) { setError('Unit price cannot be negative'); return false }
    if (lineItems.some(line => line.taxRate < 0)) { setError('Tax percentage cannot be negative'); return false }
    setError('')
    return true
  }

  const buildPayload = () => {
    return {
      billNumber: billNumber || undefined,
      vendorId,
      purchaseOrderId: purchaseOrderId || null,
      billType,
      date,
      dueAt: dueDate,
      description: memo,
      currency,
      paymentTermId: paymentTerms,
      terms,
      internalNotes,
      attachments,
      lines: lineItems.map(line => {
        const lineAmount = Number(line.quantity || 0) * Number(line.unitPrice || 0)
        const taxAmount = Number(line.taxRate || 0) / 100 * lineAmount
        return {
          description: line.description,
          accountId: line.account || null,
          quantity: line.quantity,
          rate: line.unitPrice,
          taxRate: line.taxRate,
          amount: Number((lineAmount + taxAmount).toFixed(2)),
        }
      }),
      ...(isRecurring ? {
        templateName: templateName.trim() || memo || 'Recurring Bill',
        frequency,
        startDate,
        endDate: endDate || null,
        maxOccurrences: maxOccurrences ?? null,
        daysInAdvance: daysInAdvance ?? null,
      } : {})
    }
  }

  const handleSave = async (action: 'draft' | 'submit') => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      let payload = buildPayload()
      if (buildPayloadExtras) payload = buildPayloadExtras(payload)

      if (mode === 'new') {
        if (saveBill) {
          await saveBill(companyId, payload, action, mode)
        } else if (isRecurring) {
          await expensesService.createRecurringBill(companyId, payload)
          toast.success('Recurring bill template created')
        } else {
          const result = await expensesService.createBill(companyId, payload)
          const billId = result.data?.id ?? (result as any)?.id
          if (action === 'submit') {
            if (!billId) throw new Error('Created bill id missing')
            await expensesService.approveBill(companyId, billId)
            toast.success('Bill submitted')
          } else {
            toast.success('Draft saved')
          }
        }
      } else if (billId) {
        if (saveBill) {
          await saveBill(companyId, payload, action, mode, billId)
        } else if (isRecurring) {
          await expensesService.updateRecurringBill(companyId, billId, payload)
          toast.success('Recurring bill template updated')
        } else {
          await expensesService.updateBill(companyId, billId, payload)
          if (action === 'submit' && status === 'DRAFT') {
            await expensesService.approveBill(companyId, billId)
            toast.success('Bill submitted')
          } else {
            toast.success(action === 'submit' ? 'Bill updated' : 'Draft updated')
          }
        }
      }

      if (onSaved) {
        onSaved()
      } else if (onClose) {
        onClose()
      } else {
        router.push(isRecurring ? '/expenses/bills-payments/recurring-bills' : '/expenses/bills-payments/bills')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to save bill')
      toast.error('Unable to save bill')
    } finally {
      setSubmitting(false)
    }
  }

  const titleText = title ?? (mode === 'new' ? 'New Bill' : 'Edit Bill')

  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && billId ? { tableName: 'Bill', recordId: billId } : undefined,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSave('submit')
      }}
      className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden"
    >
      <div className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl z-30">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">{titleText}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100">
                {status}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-4">
          {mode !== 'new' && (
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-100">
              <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
              <button type="button" onClick={() => setActiveTab('activity')} disabled={!billId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
            </div>
          )}
        </div>
        <div className={mode === 'new' || activeTab === 'details' ? '' : 'hidden'}>
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 space-y-4">
            {isRecurring && (
              <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-full bg-white rounded-3xl border border-amber-100 shadow-sm shadow-amber-500/5">
                  <div className="flex items-center gap-2 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                    <div className="w-1 h-6 bg-amber-500 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Recurrence Schedule</h2>
                  </div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 pb-4 sm:px-5 lg:px-6">
                  <div className="space-y-1.5">
                    <label htmlFor="templateName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Template Name</label>
                    <input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g. Monthly SaaS Subscription"
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500/50 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="frequency" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</label>
                    <HaypSelect
                      id="frequency"
                      value={frequency}
                      onChange={setFrequency}
                      options={[
                        { value: 'WEEKLY', label: 'Weekly' },
                        { value: 'BI_WEEKLY', label: 'Bi-Weekly' },
                        { value: 'MONTHLY', label: 'Monthly' },
                        { value: 'QUARTERLY', label: 'Quarterly' },
                        { value: 'YEARLY', label: 'Yearly' },
                      ]}
                      className="mt-1 h-12 rounded-xl bg-slate-50 px-4 py-2 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="startDate" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500/50 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="endDate" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date (Optional)</label>
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500/50 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="maxOccurrences" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Occurrences</label>
                    <input
                      id="maxOccurrences"
                      type="number"
                      min="0"
                      value={maxOccurrences === null ? '' : String(maxOccurrences)}
                      onChange={(e) => setMaxOccurrences(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Unlimited"
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500/50 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="daysInAdvance" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Create days in advance</label>
                    <input
                      id="daysInAdvance"
                      type="number"
                      min="0"
                      value={daysInAdvance}
                      onChange={(e) => setDaysInAdvance(Number(e.target.value))}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500/50 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="nextDueDatePreview" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Due Date (preview)</label>
                    <input
                      id="nextDueDatePreview"
                      type="text"
                      readOnly
                      value={startDate || '—'}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-amber-50/50 px-4 py-2 text-sm font-bold text-amber-700 outline-none cursor-default"
                    />
                  </div>
                  </div>
                </div>
              </section>
            )}
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Bill Information</h2>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 pb-4 sm:px-5 lg:px-6">
                <div className="space-y-1.5">
                  <label htmlFor="billNumber" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill #</label>
                  <input 
                    id="billNumber" 
                    value={billNumber || 'Auto-generated'} 
                    readOnly 
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500 outline-none shadow-inner" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="billDate" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill Date</label>
                  <input 
                    id="billDate" 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="dueDate" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
                  <input 
                    id="dueDate" 
                    type="date" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none" 
                  />
                </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Vendor Selection</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <CustomerPickerField
                      label="Select Vendor"
                      value={vendorId}
                      customers={vendorOptions}
                      placeholder="Search vendors by name or email…"
                      createLabel="New Vendor"
                      onChange={(id) => {
                        setVendorId(id)
                        setShowVendorModal(false)
                      }}
                      onCreateNew={() => {
                        setShowVendorModal(true)
                        setNewVendorName('')
                        setNewVendorEmail('')
                        setNewVendorPhone('')
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="billType" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill Type</label>
                      <HaypSelect
                        id="billType"
                        value={billType}
                        onChange={setBillType}
                        options={['Regular', 'Credit', 'Prepaid', 'Other'].map((t) => ({ value: t, label: t }))}
                        className="mt-2 h-12 rounded-xl bg-slate-50 px-4 py-2 font-bold"
                      />
                    </div>
                    <div>
                      <label htmlFor="purchaseOrderId" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">PO Reference</label>
                      <HaypSelect
                        id="purchaseOrderId"
                        value={purchaseOrderId}
                        onChange={setPurchaseOrderId}
                        options={purchaseOrders.map((po) => ({ value: po.id, label: `${po.poNumber || po.id}${po.status ? ` · ${po.status}` : ''}` }))}
                        placeholder="Select purchase order"
                        className="mt-2 h-12 rounded-xl bg-slate-50 px-4 py-2 font-bold"
                      />
                    </div>
                    <div>
                      <label htmlFor="paymentTerms" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Terms</label>
                      <input 
                        id="paymentTerms"
                        value={paymentTerms} 
                        onChange={e => setPaymentTerms(e.target.value)} 
                        className="mt-2 w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none" 
                        placeholder="Net 30" 
                      />
                    </div>
                  </div>
                </div>

                {vendor && (
                  <div className="pt-6 border-t border-slate-50 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{vendor.displayName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{vendorEmail || '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{vendorPhone || '—'}</p>
                    </div>
                  </div>
                )}
              </div>

              {showVendorModal && (
                <ModalPortal>
                  <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setShowVendorModal(false)} />
                    <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">New Vendor</h2>
                          <p className="text-sm text-slate-500">Create a vendor and select it for this bill.</p>
                        </div>
                        <button type="button" aria-label="Close vendor modal" onClick={() => setShowVendorModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="space-y-4 px-6 py-6">
                        {error && (
                          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Vendor Name</label>
                          <input
                            autoFocus
                            value={newVendorName}
                            onChange={(e) => setNewVendorName(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                            placeholder="Vendor name"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={newVendorEmail}
                              onChange={(e) => setNewVendorEmail(e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                              placeholder="email@example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input
                              value={newVendorPhone}
                              onChange={(e) => setNewVendorPhone(e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                              placeholder="(123) 456-7890"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                        <button type="button" onClick={() => setShowVendorModal(false)} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                          Cancel
                        </button>
                        <button type="button" onClick={handleCreateVendor} disabled={creatingVendor} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                          {creatingVendor ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                </ModalPortal>
              )}
              </div>
            </section>

            {companyId && (
              <NewAccountModal
                open={showAccountModal}
                companyId={companyId}
                onClose={() => {
                  setShowAccountModal(false)
                  setNewAccountRowId(null)
                }}
                onCreated={(account) => {
                  setAccounts((prev) => [{ id: account.id, code: account.code, name: account.name, type: account.type }, ...prev])
                  if (newAccountRowId) {
                    setLineItems((rows) => rows.map((row) => row.id === newAccountRowId ? { ...row, account: account.id } : row))
                  }
                  setShowAccountModal(false)
                  setNewAccountRowId(null)
                }}
              />
            )}

            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Line Items</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <LineItemTable
                    columns={[
                      { key: 'description', label: 'Description', type: 'text', width: 320, minWidth: 220, placeholder: 'Item or description', required: true },
                      { key: 'account', label: 'Account', type: 'select', width: 180, minWidth: 140, required: true, options: lineItemAccountOptions },
                      { key: 'quantity', label: 'Quantity', type: 'number', width: 96, minWidth: 70, required: true },
                      { key: 'unitPrice', label: 'Rate', type: 'number', width: 120, minWidth: 90, required: true },
                      { key: 'taxRate', label: 'Tax %', type: 'number', width: 110, minWidth: 90 },
                      { key: 'amount', label: 'Amount', type: 'calculated', width: 120, minWidth: 110 },
                    ]}
                    rows={lineItems}
                    onChange={handleLineItemsChange}
                    onAccountSelect={handleAccountSelect}
                    currency={currency ?? 'USD'}
                    calculatedColumns={{ amount: (row) => Number(row.quantity || 0) * Number(row.unitPrice || 0) }}
                  />
                </div>
              </div>
            </section>

            {postingRules.length > 0 ? (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
                <div className="font-semibold text-emerald-900">GL posting guidance</div>
                <p className="mt-2">{postingRules[0].description}</p>
              </section>
            ) : null}

            <section className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end text-right">
                <div className="px-4 text-sm font-medium text-slate-500">Subtotal: <span className="ml-2 font-bold text-slate-900 tabular-nums">{formatCurrency(subtotal, currency)}</span></div>
                <div className="px-4 text-sm font-medium text-slate-500">Tax: <span className="ml-2 font-bold text-slate-900 tabular-nums">{formatCurrency(taxTotal, currency)}</span></div>
                <div className="px-4 text-sm font-medium text-slate-500">Total: <span className="ml-2 text-xl font-black text-emerald-600 tabular-nums">{formatCurrency(total, currency)}</span></div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-slate-300 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Terms &amp; Notes</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6 space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="terms" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terms &amp; Conditions</label>
                    <textarea 
                      id="terms" 
                      value={terms} 
                      onChange={e => setTerms(e.target.value)} 
                      rows={3} 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500/50 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="memo" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Public Notes (Memo)</label>
                    <textarea 
                      id="memo" 
                      value={memo} 
                      onChange={e => setMemo(e.target.value)} 
                      rows={3} 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500/50 transition-all outline-none" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-rose-400 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Internal Use</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6 space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="internalNotes" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Private Internal Notes</label>
                    <textarea 
                      id="internalNotes" 
                      value={internalNotes} 
                      onChange={e => setInternalNotes(e.target.value)} 
                      rows={9} 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-rose-400/50 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <HaypFileUpload
                      attachments={attachments}
                      onChange={setAttachments}
                      label="Bill Attachments"
                      description="Attach supporting files for this bill record."
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className={mode === 'new' || activeTab !== 'activity' ? 'hidden' : ''}>
          <div className="w-full px-4 sm:px-6 lg:px-8 py-3 space-y-4">
            <section>
              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
                  <div className="w-1 h-6 bg-slate-300 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Activity Log</h2>
                </div>
                <div className="px-4 pb-4 sm:px-5 lg:px-6">
                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this bill yet." />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 z-40 shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.05)]">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => onClose ? onClose() : router.push('/expenses/bills-payments/bills')} 
                disabled={submitting}
                className="h-12 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              
              {!isRecurring ? (
                <>
                  <button 
                    type="button" 
                    onClick={() => setIsRecurring(true)} 
                    disabled={submitting}
                    className="h-12 px-6 rounded-xl border border-emerald-100 bg-emerald-50 text-sm font-bold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    Make recurring
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleSave('draft')} 
                    disabled={submitting}
                    className="h-12 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin text-emerald-600" /> : <Save size={18} className="text-slate-400" />}
                    Save Draft
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="h-12 px-8 rounded-xl bg-emerald-600 text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    Submit
                  </button>
                  {mode === 'edit' && status === 'DRAFT' && (
                    <button 
                      type="button" 
                      onClick={() => handleSave('submit')} 
                      disabled={submitting}
                      className="h-12 px-8 rounded-xl border-2 border-emerald-600 bg-white text-sm font-bold text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Check size={18} /> Approve
                    </button>
                  )}
                </>
              ) : (
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="h-12 px-8 rounded-xl bg-emerald-600 text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Template
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {(error || submitting) && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
            {error || 'Saving bill...'}
          </div>
        </div>
      )}
    </form>
  )
}
