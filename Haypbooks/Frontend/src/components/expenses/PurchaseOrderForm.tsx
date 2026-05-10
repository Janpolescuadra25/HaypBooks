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

import HaypDatePicker from '@/components/shared/HaypDatePicker'

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

    <div className="flex h-full flex-col bg-slate-50 text-slate-900 overflow-hidden">

      <div className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl z-30">

        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-2.5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <h1 className="text-lg font-bold tracking-tight text-slate-900">

                {mode === 'new' ? 'New Purchase Order' : 'Edit Purchase Order'}

              </h1>

            </div>

            <div className="flex items-center gap-2">

              <div className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100">

                {STATUS_OPTIONS.find(o => o.value === status)?.label ?? status}

              </div>

            </div>

          </div>

        </div>

      </div>



      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">

        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">

          {mode !== 'new' && (

            <div className="inline-flex rounded-xl bg-white p-1 border border-slate-100 mb-4">

              <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-semibold rounded-l-lg ${activeTab === 'details' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Details</button>

              <button type="button" onClick={() => setActiveTab('activity')} disabled={!poId} className={`px-4 py-2 text-sm font-semibold rounded-r-lg ${activeTab === 'activity' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Activity</button>

            </div>

          )}



          <div className={activeTab === 'details' ? 'space-y-4' : 'hidden'}>

            <section>

              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">

                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">

                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />

                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Order Information</h2>

                </div>

                <div className="px-4 pb-4 sm:px-5 lg:px-6">

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">

                    <div className="space-y-1.5">

                      <label htmlFor="poNumber" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">PO Number</label>

                      <input 

                        id="poNumber" 

                        value={poNumber || 'Auto-generated'} 

                        readOnly 

                        className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500 outline-none" 

                      />

                    </div>

                    <div className="space-y-1.5">

                      <HaypDatePicker

                        id="orderDate"

                        label="Order Date"

                        value={orderDate}

                        onChange={setOrderDate}

                        disabled={readonlyFields}

                      />

                    </div>

                    <div className="space-y-1.5">

                      <HaypDatePicker

                        id="expectedDate"

                        label="Expected Delivery"

                        value={expectedDate}

                        onChange={setExpectedDate}

                        disabled={readonlyFields}

                      />

                    </div>

                    <div className="space-y-1.5">

                      <label htmlFor="status" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>

                      <HaypSelect

                        id="status"

                        value={status}

                        onChange={setStatus}

                        options={STATUS_OPTIONS}

                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"

                      />

                    </div>

                  </div>

                  <div className="space-y-1.5">

                    <CustomerPickerField

                      label="Vendor"

                      value={vendorId}

                      customers={vendorOptions}

                      placeholder="Search vendors…"

                      createLabel="New Vendor"

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

              </div>

            </section>



            <section>

              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

                <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">

                  <div className="flex items-center gap-3">

                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />

                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Line Items</h2>

                  </div>

                  {!readonlyFields && (

                    <button type="button" onClick={addLine} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95">

                      <Plus size={16} /> Add Line

                    </button>

                  )}

                </div>

                <div className="px-4 pb-4 sm:px-5 lg:px-6">

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

            </section>



            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">

              <div className="lg:col-span-2 space-y-4">

                <section>

                  <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">

                    <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">

                      <div className="w-1 h-6 bg-slate-300 rounded-full" />

                      <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Shipping Details</h2>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 px-4 pb-4 sm:px-5 lg:px-6">

                      <div className="space-y-1.5">

                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipping Method</label>

                        <HaypSelect

                          id="shippingMethod"

                          value={shippingMethod}

                          onChange={setShippingMethod}

                          options={SHIPPING_METHODS.map((m) => ({ value: m, label: m }))}

                          disabled={readonlyFields}

                          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"

                        />

                      </div>

                      <div className="space-y-1.5">

                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tracking Number</label>

                        <input 

                          value={trackingNumber} 

                          onChange={(e) => setTrackingNumber(e.target.value)} 

                          disabled={readonlyFields} 

                          className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all" 

                          placeholder="Tracking #" 

                        />

                      </div>

                      <div className="sm:col-span-2 space-y-1.5">

                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ship To Address</label>

                        <input 

                          value={shipTo.line1} 

                          onChange={(e) => setShipTo((prev) => ({ ...prev, line1: e.target.value }))} 

                          disabled={readonlyFields} 

                          className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all mb-2" 

                          placeholder="Street address" 

                        />

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                          <input value={shipTo.city} onChange={(e) => setShipTo((prev) => ({ ...prev, city: e.target.value }))} placeholder="City" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold" />

                          <input value={shipTo.state} onChange={(e) => setShipTo((prev) => ({ ...prev, state: e.target.value }))} placeholder="State" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold" />

                          <input value={shipTo.zip} onChange={(e) => setShipTo((prev) => ({ ...prev, zip: e.target.value }))} placeholder="Zip" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold" />

                          <input value={shipTo.country} onChange={(e) => setShipTo((prev) => ({ ...prev, country: e.target.value }))} placeholder="Country" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold" />

                        </div>

                      </div>

                    </div>

                  </div>

                </section>



                <section>

                  <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">

                    <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">

                      <div className="w-1 h-6 bg-slate-300 rounded-full" />

                      <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Notes</h2>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 px-4 pb-4 sm:px-5 lg:px-6">

                      <div className="space-y-1.5">

                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor Notes (Public)</label>

                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={readonlyFields} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all" />

                      </div>

                      <div className="space-y-1.5">

                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal Notes (Private)</label>

                        <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} disabled={readonlyFields} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all" />

                      </div>

                    </div>

                  </div>

                </section>

              </div>



              <div className="space-y-4">

                <section>

                  <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">

                    <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">

                      <div className="w-1 h-6 bg-emerald-500 rounded-full" />

                      <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Summary</h2>

                    </div>

                    <div className="px-4 pb-4 sm:px-5 lg:px-6 space-y-4">

                      <div className="flex justify-between text-sm">

                        <span className="text-slate-500">Subtotal</span>

                        <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(subtotal, currency)}</span>

                      </div>

                      <div className="flex justify-between text-sm">

                        <span className="text-slate-500">Tax</span>

                        <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(taxTotal, currency)}</span>

                      </div>

                      <div className="space-y-1.5 pt-2">

                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipping Cost</label>

                        <input 

                          type="number" 

                          value={shippingCost} 

                          onChange={(e) => setShippingCost(Number(e.target.value))} 

                          disabled={readonlyFields} 

                          className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all text-right" 

                        />

                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">

                        <span className="text-sm font-bold text-slate-900">Total</span>

                        <span className="text-2xl font-black text-emerald-600 tabular-nums">{formatCurrency(total, currency)}</span>

                      </div>

                    </div>

                  </div>

                </section>



                {isEdit && (

                  <button 

                    type="button" 

                    onClick={handleConvert} 

                    disabled={converting}

                    className="w-full p-6 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all group flex flex-col items-center gap-2 text-center"

                  >

                    <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">

                      {converting ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}

                    </div>

                    <span className="text-sm font-bold text-emerald-700">Convert to Bill</span>

                    <span className="text-xs text-emerald-600/70">Create a vendor bill from this purchase order</span>

                  </button>

                )}

              </div>

            </div>

          </div>



          <div className={activeTab === 'activity' ? 'space-y-4' : 'hidden'}>

            <section>

              <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm">

                <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">

                  <div className="w-1 h-6 bg-emerald-500 rounded-full" />

                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Activity Log</h2>

                </div>

                <div className="px-4 pb-4 sm:px-5 lg:px-6">

                  <ActivityLog entries={activityEntries} loading={activityLoading} emptyMessage="No activity recorded for this order." />

                </div>

              </div>

            </section>

          </div>

        </div>

      </main>



      <div className="z-40 shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.05)]">

        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">

          <div className="flex items-center justify-end gap-3">

              <button 

                type="button" 

                onClick={() => router.push('/expenses/procurement/orders')} 

                className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"

              >

                Cancel

              </button>

              <button 

                type="button" 

                onClick={handleSave} 

                disabled={submitting} 

                className="h-10 px-8 rounded-xl bg-emerald-600 text-sm font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"

              >

                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}

                {isEdit ? 'Update Order' : 'Create Order'}

              </button>

            </div>

          </div>



          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg">
              {error}
            </div>
          )}

        </div>

      )}

    </div>

  )

}

