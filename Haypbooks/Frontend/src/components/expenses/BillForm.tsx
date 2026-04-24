'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, Send, Loader2, Check } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'
import { formatCurrency } from '@/lib/format'
import { expensesService } from '@/services/expenses.service'

const genId = () => Math.random().toString(36).slice(2, 9)

interface Vendor {
  id: string
  displayName: string
  email?: string
  phone?: string
  contact?: { displayName?: string }
}

interface LineItem {
  id: string
  description: string
  account?: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
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

const defaultWidths = {
  description: 320,
  account: 180,
  quantity: 96,
  unitPrice: 120,
  taxRate: 110,
  amount: 120,
}

export default function BillForm({ mode, billId }: BillFormProps) {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [vendorEmail, setVendorEmail] = useState('')
  const [vendorPhone, setVendorPhone] = useState('')
  const [billNumber, setBillNumber] = useState('')
  const [date, setDate] = useState(today)
  const [dueDate, setDueDate] = useState(defaultDue)
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [description, setDescription] = useState('')
  const [memo, setMemo] = useState('')
  const [terms, setTerms] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()])
  const [discountType, setDiscountType] = useState<'pct' | 'flat'>('pct')
  const [discountValue, setDiscountValue] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'DRAFT' | 'PENDING' | 'APPROVED' | string>('DRAFT')
  const [error, setError] = useState('')

  const filteredVendors = useMemo(() => {
    if (!vendorSearch) return vendors
    const q = vendorSearch.toLowerCase()
    return vendors.filter(v => v.displayName.toLowerCase().includes(q) || String(v.email ?? '').toLowerCase().includes(q) || String(v.phone ?? '').toLowerCase().includes(q))
  }, [vendorSearch, vendors])

  const vendor = useMemo(() => vendors.find(v => v.id === vendorId), [vendorId, vendors])

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
        setVendors(Array.isArray(data) ? data : data.data ?? [])
      } catch {
        toast.error('Failed to load vendors')
      }
    }
    load()
    return () => { cancelled = true }
  }, [companyId, toast])

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
          setLineItems(data.items.map((item: any) => ({
            id: genId(),
            description: item.description ?? '',
            account: item.accountId ?? '',
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

  const [colWidths, setColWidths] = useState(defaultWidths)
  const colWidthsRef = useRef(colWidths)
  useEffect(() => { colWidthsRef.current = colWidths }, [colWidths])
  const saveColWidths = useCallback((next: typeof defaultWidths) => {
    setColWidths(next)
    try { localStorage.setItem('bill-form-line-cols-v1', JSON.stringify(next)) } catch {}
  }, [])
  const { containerRef: lineItemsTableRef, startResize: startLineResize, isOverflowing: lineItemsOverflowing } = useFixedWidthResizableMap({
    widths: colWidths,
    widthsRef: colWidthsRef,
    order: ['description', 'account', 'quantity', 'unitPrice', 'taxRate', 'amount'],
    saveWidths: saveColWidths,
    fixedWidth: 64,
    minWidth: { description: 220, account: 140, quantity: 70, unitPrice: 90, taxRate: 90, amount: 110 },
  })

  const subtotal = useMemo(() => lineItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0), [lineItems])
  const taxTotal = useMemo(() => lineItems.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0) * (Number(line.taxRate || 0) / 100), 0), [lineItems])
  const discountAmount = useMemo(() => discountType === 'pct' ? subtotal * (discountValue / 100) : discountValue, [discountType, discountValue, subtotal])
  const total = Math.max(0, subtotal + taxTotal - discountAmount)

  const updateLine = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(items => items.map(item => item.id === id ? {
      ...item,
      [field]: field === 'description' || field === 'account' ? String(value) : Number(value),
      amount: field === 'description' || field === 'account'
        ? item.amount
        : field === 'quantity'
          ? Number(value) * item.unitPrice
          : field === 'unitPrice'
            ? item.quantity * Number(value)
            : field === 'taxRate'
              ? item.amount
              : item.amount,
    } : item))
  }, [])

  const addLine = useCallback(() => setLineItems(items => [...items, defaultLineItem()]), [])
  const removeLine = useCallback((id: string) => setLineItems(items => items.filter(item => item.id !== id)), [])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!vendorId) { setError('Please choose a vendor'); return false }
    if (!lineItems.length) { setError('At least one line item is required'); return false }
    if (lineItems.some(line => !line.description.trim())) { setError('Each line item requires a description'); return false }
    if (lineItems.some(line => line.quantity <= 0)) { setError('Quantity must be at least 1'); return false }
    if (lineItems.some(line => line.unitPrice < 0)) { setError('Unit price cannot be negative'); return false }
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
        lines: lineItems.map(line => ({
          description: line.description,
          accountId: line.account || null,
          quantity: line.quantity,
          rate: line.unitPrice,
          amount: line.quantity * line.unitPrice,
          taxRate: line.taxRate,
        })),
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
      router.push('/expenses/bills')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to save bill')
      toast.error('Unable to save bill')
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'new' ? 'New Bill' : 'Edit Bill'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push('/expenses/bills')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
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

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-40">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Bill Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Vendor</h2>
                  <p className="mt-1 text-sm text-slate-500">Select a vendor for this bill.</p>
                </div>
                <div className="max-w-xs">
                  <label className="sr-only" htmlFor="vendor-search">Search vendor</label>
                  <input id="vendor-search" value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} placeholder="Search vendors" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px]">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Vendor</label>
                  <select value={vendorId} onChange={e => setVendorId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    <option value="">Select vendor</option>
                    {filteredVendors.map(v => (
                      <option key={v.id} value={v.id}>{v.displayName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Payment Terms</label>
                  <input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Net 30" />
                </div>
              </div>

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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Line Items</h2>
                  <p className="mt-1 text-sm text-slate-500">Add each expense line and the bill will update automatically.</p>
                </div>
                <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  <Plus size={16} /> Add row
                </button>
              </div>

              <div className={`mt-6 overflow-x-auto rounded-3xl border border-slate-200 ${lineItemsOverflowing ? 'shadow-sm' : ''}`} ref={lineItemsTableRef}>
                <table className="min-w-full table-fixed text-sm border-collapse">
                  <colgroup>
                    <col style={{ width: colWidths.description }} />
                    <col style={{ width: colWidths.account }} />
                    <col style={{ width: colWidths.quantity }} />
                    <col style={{ width: colWidths.unitPrice }} />
                    <col style={{ width: colWidths.taxRate }} />
                    <col style={{ width: colWidths.amount }} />
                    <col style={{ width: 56 }} />
                  </colgroup>
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Unit Price</th>
                      <th className="px-4 py-3">Tax %</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map(line => (
                      <tr key={line.id} className="border-t border-slate-200">
                        <td className="px-4 py-3">
                          <input value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)} placeholder="Item or description" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                        </td>
                        <td className="px-4 py-3">
                          <input value={line.account} onChange={e => updateLine(line.id, 'account', e.target.value)} placeholder="Account" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" min="1" value={line.quantity} onChange={e => updateLine(line.id, 'quantity', Number(e.target.value))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={e => updateLine(line.id, 'unitPrice', Number(e.target.value))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" min="0" max="100" step="0.1" value={line.taxRate} onChange={e => updateLine(line.id, 'taxRate', Number(e.target.value))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(line.quantity * line.unitPrice, currency)}</td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" onClick={() => removeLine(line.id)} className="text-slate-400 hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Terms & Conditions</label>
                  <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Internal Notes</label>
                  <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={7} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <label className="block text-sm font-semibold text-slate-900">Notes</label>
              <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
                <div className="flex items-center justify-between text-sm text-slate-600"><span>Tax total</span><span>{formatCurrency(taxTotal, currency)}</span></div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Discount</span>
                    <select value={discountType} onChange={e => setDiscountType(e.target.value as 'pct' | 'flat')}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 focus:outline-none">
                      <option value="pct">%</option>
                      <option value="flat">Fixed</option>
                    </select>
                  </div>
                  <input type="number" min="0" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="w-24 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-base font-semibold text-slate-900"><span>Total</span><span>{formatCurrency(total, currency)}</span></div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.08)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-end gap-2">
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
  </div>
  )
}
