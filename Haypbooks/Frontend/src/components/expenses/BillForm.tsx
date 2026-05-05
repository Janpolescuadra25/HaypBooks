'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Save, Send, Loader2, Check, X } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import LineItemTable from './LineItemTable'
import AccountSplitModal, { AccountSplitRow } from '@/components/shared/AccountSplitModal'
import { getPostingRulesForTransaction } from '@/lib/gl-posting-rules'
import { formatCurrency } from '@/lib/format'
import apiClient from '@/lib/api-client'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import ActivityLog from '@/components/ui/ActivityLog'
import HaypSelect from '@/components/shared/HaypSelect'
import HaypFileUpload, { AttachmentMeta } from '@/components/shared/HaypFileUpload'
import { ModalPortal } from '@/components/shared/ModalPortal'
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
  splits?: AccountSplitRow[]
}

interface Account {
  id: string
  code?: string
  name?: string
  type?: string
}

interface BillFormProps {
  mode: 'new' | 'edit'
  billId?: string
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

export default function BillForm({ mode, billId }: BillFormProps) {
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
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [splitRowId, setSplitRowId] = useState<string | null>(null)
  const [splitDraft, setSplitDraft] = useState<AccountSplitRow[]>([])

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
        const { data } = await expensesService.getBill(companyIdValue, billIdValue)
        if (cancelled) return
        setBillNumber((data.billNumber ?? '') as string)
        setVendorId((data.vendorId ?? '') as string)
        setPurchaseOrderId((data.purchaseOrderId ?? '') as string)
        setBillType((data.billType ?? 'Regular') as string)
        setDate((data.date ?? today) as string)
        setDueDate((data.dueDate ?? defaultDue()) as string)
        setDescription((data.description ?? '') as string)
        setMemo((data.memo ?? data.description ?? '') as string)
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

  const selectedSplitLine = useMemo(() => lineItems.find((line) => line.id === splitRowId) ?? null, [lineItems, splitRowId])
  const postingRules = useMemo(() => getPostingRulesForTransaction('bill'), [])
  const lineItemAccountOptions = useMemo(() => expenseAccounts.map((a) => ({ id: a.id, label: a.code ? `${a.code} ${a.name}` : a.name ?? a.id })), [expenseAccounts])

  const openSplitModal = useCallback((rowId: string) => {
    const line = lineItems.find((item) => item.id === rowId)
    setSplitRowId(rowId)
    setSplitDraft(line?.splits?.length ? [...line.splits] : [{ id: Math.random().toString(36).slice(2, 9), accountId: '', amount: Number(line?.amount ?? 0) }])
    setSplitModalOpen(true)
  }, [lineItems])

  const closeSplitModal = useCallback(() => {
    setSplitModalOpen(false)
    setSplitRowId(null)
    setSplitDraft([])
  }, [])

  const handleSplitSave = useCallback(() => {
    if (!splitRowId) {
      closeSplitModal()
      return
    }
    setLineItems((items) => items.map((item) => item.id === splitRowId ? { ...item, splits: splitDraft } : item))
    closeSplitModal()
  }, [closeSplitModal, splitDraft, splitRowId])

  const handleLineItemsChange = useCallback((rows: LineItem[]) => {
    setLineItems(rows)
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
    }
  }

  const handleSave = async (action: 'draft' | 'submit') => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = buildPayload()

      if (mode === 'new') {
        const result = await expensesService.createBill(companyId, payload)
        const billId = result.data?.id ?? (result as any)?.id
        if (action === 'submit') {
          if (!billId) throw new Error('Created bill id missing')
          await expensesService.approveBill(companyId, billId)
          toast.success('Bill submitted')
        } else {
          toast.success('Draft saved')
        }
      } else if (billId) {
        await expensesService.updateBill(companyId, billId, payload)
        if (action === 'submit' && status === 'DRAFT') {
          await expensesService.approveBill(companyId, billId)
          toast.success('Bill submitted')
        } else {
          toast.success(action === 'submit' ? 'Bill updated' : 'Draft updated')
        }
      }

      router.push('/expenses/bills-payments/bills')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to save bill')
      toast.error('Unable to save bill')
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'new' ? 'New Bill' : 'Edit Bill'

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
      <div className="shrink-0 border-b border-slate-200 bg-white z-30">
        <div className="mx-auto max-w-7xl px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">{title}</h1>
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
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          {mode !== 'new' && (
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-100">
              <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
              <button type="button" onClick={() => setActiveTab('activity')} disabled={!billId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
            </div>
          )}
        </div>
        <div className={mode === 'new' || activeTab === 'details' ? '' : 'hidden'}>
          <div className="mx-auto max-w-7xl px-6 py-3 space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Bill Information</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
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
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Vendor</h2>
              </div>
              <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <CustomerPickerField
                      label="Select Vendor"
                      value={vendorId}
                      customers={vendorOptions}
                      placeholder="Search vendors by name or email…"
                      createLabel="+ New Vendor"
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
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Line Items</h2>
              </div>
              <LineItemTable
                columns={[
                  { key: 'description', label: 'Description', type: 'text', width: 320, minWidth: 220, placeholder: 'Item or description', required: true },
                  { key: 'account', label: 'Account', type: 'select', width: 180, minWidth: 140, required: true, options: expenseAccounts.map((a) => ({ value: a.id, label: a.code ? `${a.code} ${a.name}` : a.name ?? '' })) },
                  { key: 'quantity', label: 'Quantity', type: 'number', width: 96, minWidth: 70, required: true },
                  { key: 'unitPrice', label: 'Rate', type: 'number', width: 120, minWidth: 90, required: true },
                  { key: 'taxRate', label: 'Tax %', type: 'number', width: 110, minWidth: 90 },
                  { key: 'amount', label: 'Amount', type: 'calculated', width: 120, minWidth: 110 },
                ]}
                rows={lineItems}
                onChange={handleLineItemsChange}
                currency={currency ?? 'USD'}
                calculatedColumns={{ amount: (row) => Number(row.quantity || 0) * Number(row.unitPrice || 0) }}
                showSplitButton
                onSplit={openSplitModal}
              />
            </section>

            {postingRules.length > 0 ? (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
                <div className="font-semibold text-emerald-900">GL posting guidance</div>
                <p className="mt-2">{postingRules[0].description}</p>
              </section>
            ) : null}

            <section className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end divide-x divide-slate-100">
                <div className="px-6 text-sm font-medium text-slate-500">Subtotal: <span className="ml-2 font-bold text-slate-900 tabular-nums">{formatCurrency(subtotal, currency)}</span></div>
                <div className="px-6 text-sm font-medium text-slate-500">Tax: <span className="ml-2 font-bold text-slate-900 tabular-nums">{formatCurrency(taxTotal, currency)}</span></div>
                <div className="px-6 text-sm font-medium text-slate-500">Total: <span className="ml-2 text-xl font-black text-emerald-600 tabular-nums">{formatCurrency(total, currency)}</span></div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-slate-300 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Terms & Notes</h2>
                </div>
                <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div className="space-y-1.5">
                    <label htmlFor="terms" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terms & Conditions</label>
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
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-rose-400 rounded-full" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Internal Use</h2>
                </div>
                <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
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
        <AccountSplitModal
          open={splitModalOpen}
          onClose={closeSplitModal}
          title={selectedSplitLine?.description ? `Split: ${selectedSplitLine.description}` : 'Split line item'}
          totalAmount={Number(selectedSplitLine?.amount ?? 0)}
          splits={splitDraft}
          accounts={lineItemAccountOptions}
          onChange={setSplitDraft}
          onSave={handleSplitSave}
        />
        <div className={mode === 'new' || activeTab !== 'activity' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-6 py-3 space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Activity Log</h2>
              </div>
              <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this bill yet." />
              </div>
            </section>
          </div>
        </div>
      </div>
      <div className="shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.05)] z-30">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <span>Total:</span>
                <span className="text-lg font-bold text-slate-900">{formatCurrency(total, currency)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => router.push('/expenses/bills-payments/bills')} 
                disabled={submitting}
                className="h-12 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
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
