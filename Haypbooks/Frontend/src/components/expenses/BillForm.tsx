'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Save, Send, Loader2, Check, X } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import LineItemTable from './LineItemTable'
import { formatCurrency } from '@/lib/format'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import ActivityLog from '@/components/ui/ActivityLog'
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
}

interface Account {
  id: string
  code?: string
  name?: string
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
  const [terms, setTerms] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [discountType, setDiscountType] = useState<'pct' | 'flat'>('pct')
  const [discountValue, setDiscountValue] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'DRAFT' | 'PENDING' | 'APPROVED' | string>('DRAFT')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')

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
      console.error(err)
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
        setAccounts(list.map((a: any) => ({ id: a.id, code: a.code, name: a.name })))
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
        setDate((data.date ?? today) as string)
        setDueDate((data.dueDate ?? defaultDue()) as string)
        setDescription((data.description ?? '') as string)
        setMemo((data.memo ?? data.description ?? '') as string)
        setTerms((data.terms ?? '') as string)
        setInternalNotes((data.internalNotes ?? '') as string)
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
        console.error(err)
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

  const handleLineItemsChange = useCallback((rows: LineItem[]) => {
    setLineItems(rows)
  }, [])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!vendorId) { setError('Please choose a vendor'); return false }
    if (!lineItems.length) { setError('At least one line item is required'); return false }
    if (lineItems.some(line => !line.description.trim())) { setError('Each line item requires a description'); return false }
    if (lineItems.some(line => line.quantity <= 0)) { setError('Quantity must be at least 1'); return false }
    if (lineItems.some(line => line.unitPrice < 0)) { setError('Unit price cannot be negative'); return false }
    if (lineItems.some(line => line.taxRate < 0)) { setError('Tax percentage cannot be negative'); return false }
    setError('')
    return true
  }

  const handleSave = async (action: 'draft' | 'submit') => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload: any = {
        vendorId,
        dueAt: dueDate,
        description: memo,
        currency,
        paymentTermId: paymentTerms,
        lines: lineItems.map(line => {
          const lineAmount = Number(line.quantity || 0) * Number(line.unitPrice || 0)
          const taxAmount = Number(line.taxRate || 0) / 100 * lineAmount
          return {
            description: line.description,
            accountId: line.account || null,
            quantity: line.quantity,
            rate: line.unitPrice,
            amount: Number((lineAmount + taxAmount).toFixed(2)),
          }
        }),
      }

      if (mode === 'new') {
        const response = await expensesService.createBill(companyId, payload)
        const created = response.data ?? response
        if (action === 'submit') {
          await expensesService.approveBill(companyId, created.id)
        }
        toast.success(action === 'submit' ? 'Bill submitted' : 'Draft saved')
      } else if (billId) {
        await expensesService.updateBill(companyId, billId, payload)
        if (action === 'submit' && status === 'DRAFT') {
          await expensesService.approveBill(companyId, billId)
        }
        toast.success(action === 'submit' ? 'Bill updated and submitted' : 'Draft updated')
      }
      router.push('/expenses/bills-payments/bills')
    } catch (err: any) {
      console.error(err)
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push('/expenses/bills-payments/bills')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
                <ArrowLeft size={16} /> Back to bills
              </button>
              <div className="mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
                <p className="mt-1 text-sm text-slate-500">Create or edit a bill with vendor details, line items, and totals.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-28">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          {mode !== 'new' && (
            <div className="inline-flex rounded-xl bg-white/50 p-1 border border-slate-100">
              <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
              <button type="button" onClick={() => setActiveTab('activity')} disabled={!billId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
            </div>
          )}
        </div>
        <div className={mode !== 'new' && activeTab !== 'details' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-40">
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="billNumber" className="block text-sm font-semibold text-slate-900">Bill #</label>
                    <input id="billNumber" value={billNumber || 'Auto-generated'} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" />
                  </div>
                  <div>
                    <label htmlFor="billDate" className="block text-sm font-semibold text-slate-900">Bill Date</label>
                    <input id="billDate" type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-900">Due Date</label>
                    <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Vendor</h2>
                    <p className="mt-1 text-sm text-slate-500">Select a vendor for this bill.</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px]">
                  <div>
                    <CustomerPickerField
                      label="Vendor"
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Payment Terms</label>
                    <input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Net 30" />
                  </div>
                </div>

                {showVendorModal && (
                  <ModalPortal>
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/60" onClick={() => setShowVendorModal(false)} />
                      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
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

                {vendor && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Vendor</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{vendor.displayName}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Email</p>
                      <p className="mt-2 text-sm text-slate-700">{vendorEmail || '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Phone</p>
                      <p className="mt-2 text-sm text-slate-700">{vendorPhone || '—'}</p>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <LineItemTable
                  columns={[
                    { key: 'description', label: 'Description', type: 'text', width: 320, minWidth: 220, placeholder: 'Item or description', required: true },
                    { key: 'account', label: 'Account', type: 'select', width: 180, minWidth: 140, required: true, options: accounts.map((a) => ({ value: a.id, label: a.code ? `${a.code} ${a.name}` : a.name ?? '' })) },
                    { key: 'quantity', label: 'Quantity', type: 'number', width: 96, minWidth: 70, required: true },
                    { key: 'unitPrice', label: 'Rate', type: 'number', width: 120, minWidth: 90, required: true },
                    { key: 'taxRate', label: 'Tax %', type: 'number', width: 110, minWidth: 90 },
                    { key: 'amount', label: 'Amount', type: 'calculated', width: 120, minWidth: 110 },
                  ]}
                  rows={lineItems}
                  onChange={handleLineItemsChange}
                  currency={currency ?? 'USD'}
                  calculatedColumns={{ amount: (row) => Number(row.quantity || 0) * Number(row.unitPrice || 0) }}
                />
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end border-t border-slate-200 pt-4">
                  <div className="text-sm text-slate-600">Subtotal: <span className="font-semibold text-slate-900">{formatCurrency(subtotal, currency)}</span></div>
                  <div className="text-sm text-slate-600">Tax: <span className="font-semibold text-slate-900">{formatCurrency(taxTotal, currency)}</span></div>
                  <div className="text-sm text-slate-600">Total: <span className="font-semibold text-slate-900">{formatCurrency(total, currency)}</span></div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="terms" className="block text-sm font-semibold text-slate-900">Terms & Conditions</label>
                    <textarea id="terms" value={terms} onChange={e => setTerms(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="internalNotes" className="block text-sm font-semibold text-slate-900">Internal Notes</label>
                    <textarea id="internalNotes" value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={7} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <label htmlFor="memo" className="block text-sm font-semibold text-slate-900">Notes</label>
                <textarea id="memo" value={memo} onChange={e => setMemo(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </section>
            </div>
          </div>
        </div>
        <div className={mode === 'new' || activeTab !== 'activity' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-40">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
                  <div className="mt-4">
                    <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this bill yet." />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.08)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => router.push('/expenses/bills-payments/bills')} disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={() => handleSave('draft')} disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Draft
            </button>
            <button type="button" onClick={() => handleSave('submit')} disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit
            </button>
            {mode === 'edit' && status === 'DRAFT' && (
              <button type="button" onClick={() => handleSave('submit')} disabled={submitting}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-600 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50">
                <Check size={16} /> Approve
              </button>
            )}
          </div>
        </div>
      </div>

      {(error || submitting) && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
            {error || 'Saving bill...'}
          </div>
        </div>
      )}
    </div>
  )
}
