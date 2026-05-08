'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Plus, X, Check, FileText } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatCurrency } from '@/lib/format'
import { expensesService } from '@/services/expenses.service'
import { accountingService } from '@/services/accounting.service'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'
import LineItemTable from './LineItemTable'
import CustomerPickerField from '@/components/sales/CustomerPickerField'
import { NewVendorModal } from '@/components/shared/NewVendorModal'
import HaypSelect from '@/components/shared/HaypSelect'

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

interface Account {
  id: string
  code?: string
  name?: string
}

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PARTIAL_RECEIVED', label: 'Partially Received' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'CLOSED', label: 'Closed' },
]

const SHIPPING_METHODS = ['Standard', 'Express', 'Air Freight', 'Courier']
const TAX_RATES = [0, 5, 10, 12, 15, 20]
const today = new Date().toISOString().slice(0, 10)

const lineItemColumns = [
  { key: 'description', label: 'Item / Description', type: 'text', width: 320, minWidth: 220, placeholder: 'Item description', required: true },
  { key: 'account', label: 'Account', type: 'select', width: 180, minWidth: 140, required: true, options: [] },
  { key: 'quantity', label: 'Qty', type: 'number', width: 96, minWidth: 70, required: true },
  { key: 'unitPrice', label: 'Unit Price', type: 'number', width: 120, minWidth: 90, required: true },
  { key: 'taxRate', label: 'Tax %', type: 'number', width: 110, minWidth: 90 },
  { key: 'amount', label: 'Amount', type: 'calculated', width: 120, minWidth: 110 },
]

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
  const [converting, setConverting] = useState(false)
  const [showVendorModal, setShowVendorModal] = useState(false)

  const [accounts, setAccounts] = useState<Account[]>([])

  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')

  const { entries: activityEntries, loading: activityLoading } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    pageSize: 30,
    initialFilters: activeTab === 'activity' && poId ? { tableName: 'PurchaseOrder', recordId: poId } : undefined,
  })

  const isEdit = mode === 'edit'
  // Only lock PO number and vendor when editing a non-DRAFT status
  const lockIdFields = isEdit && status !== 'OPEN'
  const readonlyFields = false

  const vendorOptions = useMemo(() => vendors.map((v) => ({ id: v.id, name: v.displayName })), [vendors])

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
    
    accountingService.listAccounts(companyId, { includeInactive: false })
      .then((res) => {
        if (!active) return
        const data = res.data ?? []
        const list = Array.isArray(data) ? data : data.data ?? []
        setAccounts(list.map((a: any) => ({ id: a.id, code: a.code, name: a.name })))
      })
      .catch(() => {})
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
      router.push('/expenses/procurement/orders')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to save purchase order')
      toast.error('Unable to save purchase order')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConvert = async () => {
    if (!companyId || !poId) { toast.error('Company or purchase order not loaded'); return }
    if (!window.confirm('Convert PO #' + (poNumber ?? '') + ' to a bill? This will create a new bill.')) return
    setConverting(true)
    try {
      const res = await expensesService.convertPurchaseOrderToBill(companyId, poId)
      const data = res.data ?? res
      const billId = data?.id ?? data?.bill?.id ?? data?.billId
      if (billId) {
        toast.success('Bill created from PO #' + (poNumber ?? ''))
        router.push(`/expenses/bills-payments/bills/${billId}/edit`)
      } else {
        toast.error('Failed to convert PO to bill')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to convert PO to bill')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Purchase Order' : 'Edit Purchase Order'}</h1>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-sm text-slate-700">
              <div className="font-semibold">Status</div>
              <div>{STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
          {mode !== 'new' && (
            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-100">
              <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>
              <button type="button" onClick={() => setActiveTab('activity')} disabled={!poId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>
            </div>
          )}
        </div>
        <div className={mode !== 'new' && activeTab !== 'details' ? 'hidden' : ''}>
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8 pb-40">
            <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="poNumber" className="block text-[10px] font-bold text-slate-400 uppercase">PO Number</label>
                  <input id="poNumber" value={poNumber || 'Auto-generated'} readOnly={lockIdFields} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" />
                </div>
                <div>
                  <label htmlFor="orderDate" className="block text-[10px] font-bold text-slate-400 uppercase">Order Date</label>
                  <input id="orderDate" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} disabled={readonlyFields} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" />
                </div>
                <div>
                  <label htmlFor="expectedDate" className="block text-[10px] font-bold text-slate-400 uppercase">Expected Delivery</label>
                  <input id="expectedDate" type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} disabled={readonlyFields} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <CustomerPickerField
                    label="Vendor"
                    value={vendorId}
                    customers={vendorOptions}
                    placeholder="Search vendors…"
                    createLabel="+ New Vendor"
                    disabled={lockIdFields}
                    onChange={setVendorId}
                    onCreateNew={() => setShowVendorModal(true)}
                  />
                  {companyId && (
                    <NewVendorModal
                      open={showVendorModal}
                      companyId={companyId}
                      onClose={() => setShowVendorModal(false)}
                      onCreated={(v) => {
                        setVendors((prev) => [{ id: v.id, displayName: v.displayName }, ...prev])
                        setVendorId(v.id)
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <label htmlFor="status" className="block text-[10px] font-bold text-slate-400 uppercase">Status</label>
                <HaypSelect
                  id="status"
                  value={status}
                  onChange={setStatus}
                  options={STATUS_OPTIONS}
                  className="mt-2"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Line Items</h2>
                <p className="text-sm text-slate-500">Add items and pricing for this purchase order.</p>
              </div>
              <div className="mt-4">
                  <LineItemTable
                    columns={lineItemColumns.map((column) => column.key === 'account'
                      ? { ...column, options: accounts.map((account) => ({ value: account.id, label: account.code ? `${account.code} ${account.name}` : account.name ?? '' })) }
                      : column
                    )}
                    rows={lineItems}
                    onChange={setLineItems}
                    currency={currency ?? 'USD'}
                    calculatedColumns={{ amount: (row) => Number(row.quantity || 0) * Number(row.unitPrice || 0) }}
                    showDragHandle={!readonlyFields}
                    showCopyButton={!readonlyFields}
                    showDeleteButton={!readonlyFields}
                  />
                </div>
              </div>
            </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="space-y-2 text-right">
                  <div className="text-sm text-slate-600">Subtotal</div>
                  <div className="text-2xl font-semibold text-slate-900">{formatCurrency(subtotal, currency)}</div>
                  <div className="text-sm text-slate-600">Tax</div>
                  <div className="text-lg font-semibold text-slate-900">{formatCurrency(taxTotal, currency)}</div>
                  <div className="text-sm text-slate-600">Shipping</div>
                  <div className="text-lg font-semibold text-slate-900">{formatCurrency(shippingCost, currency)}</div>
                  <div className="text-sm text-slate-600">Total</div>
                  <div className="text-3xl font-semibold text-slate-900">{formatCurrency(total, currency)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label htmlFor="shippingCost" className="block text-[10px] font-bold text-slate-400 uppercase">Shipping Cost</label>
                  <input id="shippingCost" type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(Number(e.target.value))} disabled={readonlyFields} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" />
                  <div className="mt-4 text-sm text-slate-500">This value is included in the PO total and will update the order amount.</div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Ship To</label>
                <input value={shipTo.line1} onChange={(e) => setShipTo((prev) => ({ ...prev, line1: e.target.value }))} disabled={readonlyFields} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" placeholder="Street address" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">City</label>
                <input value={shipTo.city} onChange={(e) => setShipTo((prev) => ({ ...prev, city: e.target.value }))} disabled={readonlyFields} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" placeholder="City" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">State</label>
                <input value={shipTo.state} onChange={(e) => setShipTo((prev) => ({ ...prev, state: e.target.value }))} disabled={readonlyFields} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" placeholder="State" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Zip</label>
                <input value={shipTo.zip} onChange={(e) => setShipTo((prev) => ({ ...prev, zip: e.target.value }))} disabled={readonlyFields} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" placeholder="Zip" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Country</label>
                <input value={shipTo.country} onChange={(e) => setShipTo((prev) => ({ ...prev, country: e.target.value }))} disabled={readonlyFields} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" placeholder="Country" />
              </div>
              <div>
                <label htmlFor="shippingMethod" className="block text-[10px] font-bold text-slate-400 uppercase">Shipping Method</label>
                <HaypSelect
                  id="shippingMethod"
                  value={shippingMethod}
                  onChange={setShippingMethod}
                  options={SHIPPING_METHODS.map((m) => ({ value: m, label: m }))}
                  disabled={readonlyFields}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Tracking Number</label>
                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} disabled={readonlyFields} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" placeholder="Tracking number" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={readonlyFields} rows={4} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" placeholder="Customer-facing notes" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Internal Notes</label>
                <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} disabled={readonlyFields} rows={4} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/10 transition-all" placeholder="Internal use only" />
              </div>
              </div>
            </section>
            </div>
          </div>
        </div>
        <div className={activeTab !== 'activity' ? 'hidden' : ''}>
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] items-end">
            <div className="flex flex-wrap gap-2 justify-end">
              <button type="button" onClick={() => router.push('/expenses/procurement/orders')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><X size={16} /> Cancel</button>
              <button type="button" onClick={handleSave} disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
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
