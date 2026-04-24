'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { expensesService } from '@/services/expenses.service'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'

interface PurchaseOrderFormProps {
  mode: 'new' | 'edit'
  poId?: string
}

interface Vendor {
  id: string
  displayName: string
}

interface LineItem {
  id: string
  description: string
  account: string
  quantity: number
  unitPrice: number
  taxRate: number
  amount: number
}

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Draft' },
  { value: 'OPEN', label: 'Sent' },
  { value: 'PARTIAL_RECEIVED', label: 'Partially Received' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'CLOSED', label: 'Closed' },
]

const SHIPPING_METHODS = ['Standard', 'Express', 'Air Freight', 'Courier']
const TAX_RATES = [0, 5, 10, 12, 15, 20]
const today = new Date().toISOString().slice(0, 10)

const defaultLineItem = (): LineItem => ({
  id: Math.random().toString(36).slice(2, 9),
  description: '',
  account: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  amount: 0,
})

// API shape for a purchase order line
interface ApiLine {
  id?: string
  description?: string | null
  accountId?: string | null
  quantity?: number | null
  unitPrice?: number | null
  taxRate?: number | null
  amount?: number | null
}

export default function PurchaseOrderForm({ mode, poId }: PurchaseOrderFormProps) {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorId, setVendorId] = useState('')
  const [vendorSearch, setVendorSearch] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [orderDate, setOrderDate] = useState(today)
  const [expectedDate, setExpectedDate] = useState(today)
  const [status, setStatus] = useState('OPEN')
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0])
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shipTo, setShipTo] = useState({ line1: '', city: '', state: '', zip: '', country: '' })
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([defaultLineItem()])
  const [shippingCost, setShippingCost] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')

  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && poId ? { tableName: 'PurchaseOrder', recordId: poId } : undefined,
  })

  const isEdit = mode === 'edit'
  const readonlyFields = false

  const filteredVendors = useMemo(() => {
    if (!vendorSearch) return vendors
    const q = vendorSearch.toLowerCase()
    return vendors.filter((vendor) => vendor.displayName.toLowerCase().includes(q))
  }, [vendorSearch, vendors])

  useEffect(() => {
    if (!companyId) return
    let active = true
    expensesService.listVendors(companyId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        setVendors(Array.isArray(data) ? data : data.data ?? [])
      })
      .catch(() => toast.error('Failed to load vendors'))
    return () => { active = false }
  }, [companyId, toast])

  useEffect(() => {
    if (!isEdit || !poId || !companyId) return
    let active = true
    expensesService.getPurchaseOrder(companyId, poId)
      .then((res) => {
        if (!active) return
        const data = res.data ?? res
        setPoNumber(data.poNumber ?? '')
        setVendorId(data.vendorId ?? '')
        setOrderDate(data.date ?? today)
        setExpectedDate(data.expectedAt?.slice(0, 10) ?? today)
        setStatus(data.status ?? 'OPEN')
        setShippingMethod(data.shippingMethod ?? SHIPPING_METHODS[0])
        setTrackingNumber(data.trackingNumber ?? '')
        setShipTo({
          line1: data.shipTo?.line1 ?? '',
          city: data.shipTo?.city ?? '',
          state: data.shipTo?.state ?? '',
          zip: data.shipTo?.zip ?? '',
          country: data.shipTo?.country ?? '',
        })
        setNotes(data.notes ?? '')
        setInternalNotes(data.internalNotes ?? '')
        if (Array.isArray(data.lines) && data.lines.length > 0) {
          setLineItems(data.lines.map((line: ApiLine) => ({
            id: Math.random().toString(36).slice(2, 9),
            description: line.description ?? '',
            account: line.accountId ?? '',
            quantity: Number(line.quantity ?? 1),
            unitPrice: Number(line.unitPrice ?? 0),
            taxRate: Number(line.taxRate ?? 0),
            amount: Number(line.amount ?? 0),
          })))
        }
      })
      .catch(() => toast.error('Failed to load purchase order'))
    return () => { active = false }
  }, [companyId, isEdit, poId, toast])

  const subtotal = useMemo(() => lineItems.reduce((sum, item) => sum + Number(item.amount || 0), 0), [lineItems])
  const taxTotal = useMemo(() => lineItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) * (Number(item.taxRate) / 100)), 0), [lineItems])
  const total = useMemo(() => subtotal + taxTotal + Number(shippingCost || 0), [subtotal, taxTotal, shippingCost])

  const updateLine = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((items) => items.map((line) => {
      if (line.id !== id) return line
      const next = {
        ...line,
        [field]: field === 'description' || field === 'account' ? String(value) : Number(value),
      }
      if (field === 'quantity') {
        next.amount = Number(value) * next.unitPrice
      }
      if (field === 'unitPrice') {
        next.amount = next.quantity * Number(value)
      }
      return next
    }))
  }, [])

  const addLine = useCallback(() => setLineItems((items) => [...items, defaultLineItem()]), [])
  const removeLine = useCallback((id: string) => setLineItems((items) => items.filter((line) => line.id !== id)), [])

  const validate = () => {
    if (!companyId) { setError('Company not loaded'); return false }
    if (!vendorId) { setError('Please choose a vendor'); return false }
    if (!lineItems.length) { setError('At least one line item is required'); return false }
    if (lineItems.some((line) => !line.description.trim())) { setError('Each line item requires a description'); return false }
    if (lineItems.some((line) => line.quantity <= 0)) { setError('Quantity must be greater than zero'); return false }
    if (lineItems.some((line) => line.unitPrice < 0)) { setError('Unit price cannot be negative'); return false }
    setError('')
    return true
  }

  const handleSave = async () => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      if (mode === 'new') {
        const payload = {
          vendorId,
          date: orderDate,
          expectedAt: expectedDate,
          status,
          shippingMethod,
          trackingNumber,
          shipTo,
          notes,
          internalNotes,
          lines: lineItems.map((line) => ({
            description: line.description,
            accountId: line.account || null,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate,
            amount: line.amount,
          })),
        }
        await expensesService.createPurchaseOrder(companyId, payload)
        toast.success('Purchase order created')
      } else if (poId) {
        await expensesService.updatePurchaseOrderStatus(companyId, poId, { status })
        toast.success('Purchase order status updated')
      }
      router.push('/expenses/procurement/purchase-orders')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to save purchase order')
      toast.error('Unable to save purchase order')
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
              <button type="button" onClick={() => router.push('/expenses/procurement/purchase-orders')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
                <ArrowLeft size={16} /> Back to orders
              </button>
              <div className="mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Purchase Order' : 'Edit Purchase Order'}</h1>
                <p className="mt-1 text-sm text-slate-500">Create and manage purchase orders with shipping and line item details.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="font-semibold">Status</div>
              <div>{STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="inline-flex rounded-xl bg-white/50 p-1 border border-slate-100">
            <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
            <button type="button" onClick={() => setActiveTab('activity')} disabled={mode === 'new' || !poId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
          </div>
        </div>
        <div className={activeTab !== 'details' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-40">
            <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label htmlFor="poNumber" className="block text-sm font-semibold text-slate-900">PO Number</label>
                <input id="poNumber" value={poNumber || 'Auto-generated'} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" />
              </div>
              <div>
                <label htmlFor="orderDate" className="block text-sm font-semibold text-slate-900">Order Date</label>
                <input id="orderDate" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="expectedDate" className="block text-sm font-semibold text-slate-900">Expected Delivery</label>
                <input id="expectedDate" type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
              <div className="sm:col-span-2 xl:col-span-1">
                <label htmlFor="vendorId" className="block text-sm font-semibold text-slate-900">Vendor</label>
                <div className="mt-2 flex gap-2">
                  <input id="vendorSearch" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} disabled={readonlyFields} aria-label="Search vendors" placeholder="Search vendors" className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                  <button type="button" onClick={() => setVendorSearch('')} disabled={readonlyFields} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">Clear</button>
                </div>
                <select id="vendorId" value={vendorId} onChange={(e) => setVendorId(e.target.value)} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  <option value="">Select vendor</option>
                  {filteredVendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.displayName}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-slate-900">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  {STATUS_OPTIONS.map((option) => <option key={option.value + option.label} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Line Items</h2>
                    <p className="text-sm text-slate-500">Add items and pricing for this purchase order.</p>
                  </div>
                  {!readonlyFields && (
                    <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Plus size={16} /> Add Row</button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Item / Description</th>
                        <th className="px-4 py-3">Account</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3">Tax %</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        {!readonlyFields && <th className="px-4 py-3"> </th>}
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((line) => (
                        <tr key={line.id} className="border-b border-slate-200">
                          <td className="px-4 py-3">
                            <input value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} disabled={readonlyFields} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Item description" />
                          </td>
                          <td className="px-4 py-3">
                            <input value={line.account} onChange={(e) => updateLine(line.id, 'account', e.target.value)} disabled={readonlyFields} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Account" />
                          </td>
                          <td className="px-4 py-3 w-24"><input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(line.id, 'quantity', Number(e.target.value))} disabled={readonlyFields} aria-label="Quantity" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" /></td>
                          <td className="px-4 py-3 w-32"><input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(e) => updateLine(line.id, 'unitPrice', Number(e.target.value))} disabled={readonlyFields} aria-label="Unit price" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" /></td>
                          <td className="px-4 py-3 w-28"><select value={line.taxRate} onChange={(e) => updateLine(line.id, 'taxRate', Number(e.target.value))} disabled={readonlyFields} aria-label="Tax rate" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                            {TAX_RATES.map((tax) => <option key={tax} value={tax}>{tax}%</option>)}
                          </select></td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(line.amount, currency)}</td>
                          {!readonlyFields && <td className="px-4 py-3 text-right"><button type="button" title="Remove line item" aria-label="Remove line item" onClick={() => removeLine(line.id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"><X size={14} /></button></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-900">Order summary</div>
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>Tax</span><span>{formatCurrency(taxTotal, currency)}</span></div>
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>Shipping</span><span>{formatCurrency(shippingCost, currency)}</span></div>
                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-base font-semibold text-slate-900"><span>Total</span><span>{formatCurrency(total, currency)}</span></div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Ship To</label>
                <input value={shipTo.line1} onChange={(e) => setShipTo((prev) => ({ ...prev, line1: e.target.value }))} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Street address" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">City</label>
                <input value={shipTo.city} onChange={(e) => setShipTo((prev) => ({ ...prev, city: e.target.value }))} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">State</label>
                <input value={shipTo.state} onChange={(e) => setShipTo((prev) => ({ ...prev, state: e.target.value }))} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="State" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Zip</label>
                <input value={shipTo.zip} onChange={(e) => setShipTo((prev) => ({ ...prev, zip: e.target.value }))} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Zip" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Country</label>
                <input value={shipTo.country} onChange={(e) => setShipTo((prev) => ({ ...prev, country: e.target.value }))} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Country" />
              </div>
              <div>
                <label htmlFor="shippingMethod" className="block text-sm font-semibold text-slate-900">Shipping Method</label>
                <select id="shippingMethod" value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                  {SHIPPING_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Tracking Number</label>
                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Tracking number" />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={readonlyFields} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Customer-facing notes" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Internal Notes</label>
                <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} disabled={readonlyFields} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Internal use only" />
              </div>
              </div>
            </section>
            </div>
          </div>
        </div>
        <div className={activeTab !== 'activity' ? 'hidden' : ''}>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
                <div className="mt-4">
                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity for this purchase order yet." />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.08)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] items-end">
            <div>
              <label htmlFor="shippingCost" className="block text-sm font-semibold text-slate-900">Shipping Cost</label>
              <input id="shippingCost" type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(Number(e.target.value))} disabled={readonlyFields} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button type="button" onClick={() => router.push('/expenses/procurement/orders')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><X size={16} /> Cancel</button>
              <button type="button" onClick={handleSave} disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isEdit ? 'Update Status' : 'Save Draft'}
              </button>
            </div>
          </div>
          {error && <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        </div>
      </div>
    </div>
  )
}
