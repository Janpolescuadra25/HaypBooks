'use client'
export const dynamic = 'force-dynamic'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft, Plus, Trash2, Loader2, AlertCircle, ChevronDown,
  Save, Send, LayoutTemplate, Search, Check, X, ChevronRight,
  FileText, Paperclip, Clock, RefreshCw, Printer, Download,
  MoreHorizontal, Info, MapPin, Link2, Copy, Ban, History,
  Mail, Phone, Settings,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { getAllTemplates, getDefaultTemplate, recordTemplateUsage } from '@/lib/invoice-templates/templateStorage'
import type { InvoiceTemplate } from '@/lib/invoice-templates/types'
import TemplateGallery from '@/components/sales/invoice-templates/TemplateGallery'

interface CustomerAddress { line1?: string; city?: string; state?: string; zip?: string; country?: string }
interface Customer {
  contactId: string
  name: string
  email: string
  phone: string
  balance: number
  billingAddress?: CustomerAddress
  shippingAddress?: CustomerAddress
  paymentTerms?: string
  taxRate?: number
}

interface LineItem {
  id: string
  itemId?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

interface CatalogItem {
  id: string
  name: string
  type: string
  sku: string | null
  salesPrice: number | null
}

const genId = () => Math.random().toString(36).slice(2, 9)

export default function InvoiceCreatePage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  // Template
  const [template, setTemplate] = useState<InvoiceTemplate>(getDefaultTemplate)
  const [showGallery, setShowGallery] = useState(false)
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [allTemplates, setAllTemplates] = useState<InvoiceTemplate[]>([])

  useEffect(() => { setAllTemplates(getAllTemplates()) }, [])

  // Customer
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDD, setShowCustomerDD] = useState(false)
  const customerSearchRef = useRef<HTMLInputElement>(null)

  // Invoice fields
  const today = new Date().toISOString().split('T')[0]
  const inThirty = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0] }
  const [date, setDate] = useState(today)
  const [dueDate, setDueDate] = useState(inThirty)
  const [poNumber, setPoNumber] = useState('')
  const [memo, setMemo] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([
    { id: genId(), description: '', quantity: 1, unitPrice: 0, taxRate: template.defaults.defaultTaxRate },
  ])

  // Discount
  const [discountType, setDiscountType] = useState<'pct' | 'flat'>('pct')
  const [discountValue, setDiscountValue] = useState(0)

  // Options
  const [makeRecurring, setMakeRecurring] = useState(false)
  const [scheduleSend, setScheduleSend] = useState(false)
  const [applyLateFee, setApplyLateFee] = useState(false)
  const [enablePartialPayments, setEnablePartialPayments] = useState(false)
  const [requirePO, setRequirePO] = useState(false)
  const [enableDeposit, setEnableDeposit] = useState(false)

  // Address & contact auto-fill
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [billAddress, setBillAddress] = useState({ line1: '', city: '', state: '', zip: '' })
  const [shipSameAsBill, setShipSameAsBill] = useState(true)
  const [shipAddress, setShipAddress] = useState({ line1: '', city: '', state: '', zip: '' })

  // Catalog (products & services for line item picker)
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [activeCatalogRow, setActiveCatalogRow] = useState<string | null>(null)

  // State
  const [saving, setSaving] = useState(false)
  const [saveAction, setSaveAction] = useState<'draft' | 'send'>('draft')
  const [error, setError] = useState('')
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showSaveDraftMenu, setShowSaveDraftMenu] = useState(false)
  const [showSendMenu, setShowSendMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  // Fetch catalog items (products & services)
  useEffect(() => {
    if (!companyId) return
    apiClient.get(`/companies/${companyId}/inventory/items?limit=200`)
      .then(({ data }) => {
        const list: any[] = Array.isArray(data) ? data : data.items ?? []
        setCatalogItems(list.map(i => ({
          id: i.id,
          name: i.name,
          type: i.type,
          sku: i.sku ?? null,
          salesPrice: i.salesPrice != null ? Number(i.salesPrice) : null,
        })))
      })
      .catch(() => {})
  }, [companyId])

  // Fetch customers and update memo when template changes
  useEffect(() => {
    if (!companyId) return
    apiClient.get(`/companies/${companyId}/customers`)
      .then(({ data }) => {
        const list: any[] = Array.isArray(data) ? data : data.items ?? data.customers ?? []
        setCustomers(list.map(c => ({
          contactId: c.contactId ?? c.id,
          name: c.name ?? c.displayName ?? '',
          email: c.email ?? '',
          phone: c.phone ?? c.phoneNumber ?? '',
          balance: Number(c.balance ?? 0),
          billingAddress: c.billingAddress ?? c.address,
          shippingAddress: c.shippingAddress,
          paymentTerms: c.paymentTerms ?? c.terms,
          taxRate: c.taxRate != null ? Number(c.taxRate) : undefined,
        })))
      })
      .catch(() => {})
  }, [companyId])

  useEffect(() => {
    setMemo(template.defaultMessage)
    setItems(p => p.map(it => ({ ...it, taxRate: template.defaults.defaultTaxRate })))
  }, [template])

  // Auto-fill from selected customer
  useEffect(() => {
    if (!customerId) return
    const c = customers.find(x => x.contactId === customerId)
    if (!c) return
    if (c.email) setCustomerEmail(c.email)
    if (c.phone) setCustomerPhone(c.phone)
    if (c.paymentTerms) setPaymentTerms(c.paymentTerms)
    if (c.billingAddress) setBillAddress({
      line1: c.billingAddress.line1 ?? '',
      city: c.billingAddress.city ?? '',
      state: c.billingAddress.state ?? '',
      zip: c.billingAddress.zip ?? '',
    })
    if (c.shippingAddress) setShipAddress({
      line1: c.shippingAddress.line1 ?? '',
      city: c.shippingAddress.city ?? '',
      state: c.shippingAddress.state ?? '',
      zip: c.shippingAddress.zip ?? '',
    })
  }, [customerId, customers])

  const selectedCustomer = customers.find(c => c.contactId === customerId)
  const recentCustomers = customers.slice(0, 5)
  const filteredCustomers = customerSearch
    ? customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(customerSearch.toLowerCase()))
    : recentCustomers

  // Calculations
  const subtotal = items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0)
  const discountAmt = discountType === 'pct'
    ? subtotal * (Number(discountValue) / 100)
    : Number(discountValue)
  const taxable = subtotal - discountAmt
  const taxAmt = template.defaults.taxTreatment !== 'none'
    ? items.reduce((s, it) => s + (it.quantity * it.unitPrice * it.taxRate / 100), 0) * (1 - Number(discountValue) / (discountType === 'pct' ? 100 : Math.max(subtotal, 1)) * (discountType === 'pct' ? 1 : 0))
    : 0
  const taxTotal = template.defaults.taxTreatment !== 'none'
    ? (subtotal - (discountType === 'pct' ? subtotal * Number(discountValue) / 100 : Number(discountValue))) *
      (items.reduce((s, it) => s + it.taxRate * it.unitPrice * it.quantity, 0) /
       Math.max(subtotal, 0.001) / 100)
    : 0
  const total = template.defaults.taxTreatment === 'inclusive'
    ? subtotal - discountAmt
    : subtotal - discountAmt + taxTotal

  const addItem = () => setItems(p => [...p, { id: genId(), description: '', quantity: 1, unitPrice: 0, taxRate: template.defaults.defaultTaxRate }])
  const removeItem = (id: string) => setItems(p => p.filter(it => it.id !== id))
  const updateItem = (id: string, f: keyof Omit<LineItem, 'id'>, v: string | number) =>
    setItems(p => p.map(it => it.id === id ? { ...it, [f]: v } : it))

  const pickCatalogItem = (rowId: string, cat: CatalogItem) => {
    setItems(p => p.map(it => it.id === rowId ? {
      ...it,
      itemId: cat.id,
      description: cat.name,
      unitPrice: cat.salesPrice ?? it.unitPrice,
    } : it))
    setActiveCatalogRow(null)
  }

  const handleSave = async (action: 'draft' | 'send') => {
    if (!customerId) { setError('Please select a customer.'); return }
    const validItems = items.filter(it => it.description.trim())
    if (validItems.length === 0) { setError('Add at least one line item.'); return }
    setSaving(true); setSaveAction(action); setError('')
    try {
      const { data: inv } = await apiClient.post(`/companies/${companyId}/ar/invoices`, {
        customerId,
        date,
        dueDate,
        memo,
        internalNotes,
        poNumber,
        items: validItems.map(it => ({
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          amount: Number(it.quantity) * Number(it.unitPrice),
          taxRate: Number(it.taxRate),
        })),
      })
      if (action === 'send' && inv?.id) {
        await apiClient.post(`/companies/${companyId}/ar/invoices/${inv.id}/send`)
      }
      recordTemplateUsage(template.id)
      router.push('/sales/billing/invoices')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  if (cidLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={24} className="animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ─── Sticky Top Bar ─── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/sales/billing/invoices')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700 font-medium transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Invoices
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-gray-400 tracking-wider">INVOICE #NEW</span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full border border-gray-200">Draft</span>
          </div>
        </div>

        {/* Template selector bar */}
        <div className="border-t border-gray-100 bg-gray-50/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3 overflow-x-auto">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Template:</span>
            {/* Quick template switcher */}
            <div className="flex items-center gap-2 flex-1 overflow-x-auto py-0.5">
              {allTemplates.slice(0, 6).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                    template.id === t.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
                  }`}>
                  <span>{t.icon}</span> {t.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowGallery(true)}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold whitespace-nowrap transition-colors">
              Browse All <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4">

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={15} /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X size={13} /></button>
          </motion.div>
        )}

        {/* Document Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* ── Row 1: Bill To + Invoice Details ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-gray-100">
            {/* Bill To */}
            <div className="p-6 lg:border-r border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bill To</h3>
              {selectedCustomer ? (
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-base">{selectedCustomer.name}</p>
                      {(customerEmail || selectedCustomer.email) && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={11} className="text-gray-300" />
                          {customerEmail || selectedCustomer.email}
                        </p>
                      )}
                      {customerPhone && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone size={11} className="text-gray-300" />
                          {customerPhone}
                        </p>
                      )}
                      {(billAddress.line1 || billAddress.city) && (
                        <div className="mt-1.5 p-2 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-0.5">
                          {billAddress.line1 && <p>{billAddress.line1}</p>}
                          {billAddress.city && <p>{[billAddress.city, billAddress.state, billAddress.zip].filter(Boolean).join(', ')}</p>}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Balance: {fmt(selectedCustomer.balance)}</p>
                    </div>
                    <button
                      onClick={() => { setCustomerId(''); setCustomerSearch('') }}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded">
                      <X size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => { setShowCustomerDD(true); setTimeout(() => customerSearchRef.current?.focus(), 50) }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    Change customer
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      ref={customerSearchRef}
                      value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDD(true) }}
                      onFocus={() => setShowCustomerDD(true)}
                      placeholder="Search by name, email, phone…"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-dashed border-gray-200 hover:border-emerald-300 focus:border-emerald-400 rounded-xl focus:outline-none transition-colors bg-gray-50/50"/>
                  </div>
                  <AnimatePresence>
                    {showCustomerDD && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {!customerSearch && (
                          <p className="px-3 pt-2.5 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent</p>
                        )}
                        <div className="max-h-52 overflow-y-auto">
                          {filteredCustomers.length === 0 ? (
                            <p className="px-3 py-4 text-xs text-gray-400 text-center">No customers found</p>
                          ) : filteredCustomers.map(c => (
                            <button key={c.contactId}
                              onClick={() => { setCustomerId(c.contactId); setCustomerSearch(''); setShowCustomerDD(false) }}
                              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 text-left transition-colors">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                                {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium text-emerald-600 tabular-nums">{fmt(c.balance)}</p>
                                {customerId === c.contactId && <Check size={12} className="text-emerald-500 ml-auto" />}
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 p-2">
                          <button onClick={() => { setShowCustomerDD(false) }}
                            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <Plus size={13} /> New Customer
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Ship To */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ship To</h3>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${shipSameAsBill ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 hover:border-emerald-400'}`}
                    onClick={() => setShipSameAsBill(p => !p)}>
                    {shipSameAsBill && <Check size={9} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-xs text-gray-500">Same as billing</span>
                </label>
              </div>
              {shipSameAsBill ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                  <MapPin size={16} className="mx-auto mb-1.5 text-gray-300" />
                  <p className="text-xs text-gray-400">Using billing address</p>
                  {(billAddress.line1 || billAddress.city) && (
                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                      {billAddress.line1 && <p>{billAddress.line1}</p>}
                      {billAddress.city && <p>{[billAddress.city, billAddress.state, billAddress.zip].filter(Boolean).join(', ')}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input type="text" value={shipAddress.line1}
                    onChange={e => setShipAddress(p => ({ ...p, line1: e.target.value }))}
                    placeholder="Street address"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={shipAddress.city}
                      onChange={e => setShipAddress(p => ({ ...p, city: e.target.value }))}
                      placeholder="City"
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                    <input type="text" value={shipAddress.state}
                      onChange={e => setShipAddress(p => ({ ...p, state: e.target.value }))}
                      placeholder="State"
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                    <input type="text" value={shipAddress.zip}
                      onChange={e => setShipAddress(p => ({ ...p, zip: e.target.value }))}
                      placeholder="ZIP"
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Row 1b: Invoice Details ── */}
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Payment Terms</label>
                <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white">
                  {['Due on Receipt', 'Net 7', 'Net 15', 'Net 30', 'Net 60', 'Net 90'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">PO / Reference #</label>
                <input type="text" value={poNumber} onChange={e => setPoNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
            </div>
          </div>

          {/* ── Row 2: Line Items ── */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Line Items</h3>
              <button onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                <Plus size={13} /> Add Row
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 w-8 border-r border-gray-200">#</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200">Description</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-20">Qty</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-32">Rate</th>
                    {template.defaults.taxTreatment !== 'none' && (
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-20">Tax %</th>
                    )}
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-32">Amount</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const lineTotal = it.quantity * it.unitPrice
                    return (
                      <tr key={it.id} className="group border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-2 text-gray-400 text-xs border-r border-gray-100 text-center">{i + 1}</td>
                        <td className="px-4 py-2 border-r border-gray-100 relative">
                          <input
                            value={it.description}
                            onChange={e => { updateItem(it.id, 'description', e.target.value); setActiveCatalogRow(it.id) }}
                            onFocus={() => setActiveCatalogRow(it.id)}
                            onBlur={() => setTimeout(() => setActiveCatalogRow(null), 150)}
                            placeholder="Type or select a product / service…"
                            className="w-full text-sm text-slate-800 bg-transparent border-0 outline-none focus:ring-0 placeholder:text-gray-300" />
                          {activeCatalogRow === it.id && catalogItems.length > 0 && (() => {
                            const q = it.description.toLowerCase()
                            const matches = catalogItems.filter(c =>
                              !q || c.name.toLowerCase().includes(q) || (c.sku ?? '').toLowerCase().includes(q)
                            ).slice(0, 8)
                            if (matches.length === 0) return null
                            return (
                              <div className="absolute left-0 top-full mt-1 z-40 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                                {matches.map(cat => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onMouseDown={() => pickCatalogItem(it.id, cat)}
                                    className="flex items-center justify-between w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 transition-colors border-b border-slate-50 last:border-0"
                                  >
                                    <div>
                                      <span className="font-medium text-slate-800">{cat.name}</span>
                                      {cat.sku && <span className="ml-1.5 text-xs text-slate-400 font-mono">{cat.sku}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                                        cat.type === 'SERVICE' ? 'bg-purple-50 text-purple-600' :
                                        cat.type === 'INVENTORY' ? 'bg-emerald-50 text-emerald-600' :
                                        'bg-blue-50 text-blue-600'
                                      }`}>{cat.type === 'SERVICE' ? 'Service' : cat.type === 'INVENTORY' ? 'Inventory' : 'Product'}</span>
                                      {cat.salesPrice != null && (
                                        <span className="text-xs text-slate-500 tabular-nums">{fmt(cat.salesPrice)}</span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )
                          })()}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-100">
                          <input
                            type="number" min="0.01" step="0.01"
                            value={it.quantity}
                            onChange={e => updateItem(it.id, 'quantity', e.target.value)}
                            className="w-full text-sm text-right text-slate-800 bg-transparent border-0 outline-none focus:ring-0 tabular-nums" />
                        </td>
                        <td className="px-4 py-2 border-r border-gray-100">
                          <input
                            type="number" min="0" step="0.01"
                            value={it.unitPrice}
                            onChange={e => updateItem(it.id, 'unitPrice', e.target.value)}
                            className="w-full text-sm text-right text-slate-800 bg-transparent border-0 outline-none focus:ring-0 tabular-nums" />
                        </td>
                        {template.defaults.taxTreatment !== 'none' && (
                          <td className="px-4 py-2 border-r border-gray-100">
                            <input
                              type="number" min="0" max="100" step="0.5"
                              value={it.taxRate}
                              onChange={e => updateItem(it.id, 'taxRate', e.target.value)}
                              className="w-full text-sm text-right text-slate-800 bg-transparent border-0 outline-none focus:ring-0 tabular-nums" />
                          </td>
                        )}
                        <td className="px-4 py-2 border-r border-gray-100 text-right">
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">{fmt(lineTotal)}</span>
                        </td>
                        <td className="px-2 py-2">
                          {items.length > 1 && (
                            <button onClick={() => removeItem(it.id)}
                              className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-slate-800">{fmt(subtotal)}</span>
                </div>
                {/* Discount Row */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 flex-shrink-0">Discount</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <select value={discountType} onChange={e => setDiscountType(e.target.value as any)}
                      className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 focus:outline-none text-gray-600">
                      <option value="pct">%</option>
                      <option value="flat">{currency}</option>
                    </select>
                    <input
                      type="number" min="0" step="0.01"
                      value={discountValue}
                      onChange={e => setDiscountValue(Number(e.target.value))}
                      className="w-20 text-right text-sm tabular-nums border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400/30" />
                    <span className="text-sm text-red-500 font-medium tabular-nums min-w-[5rem] text-right">
                      -{fmt(discountAmt)}
                    </span>
                  </div>
                </div>
                {template.defaults.taxTreatment !== 'none' && (
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Tax ({template.defaults.defaultTaxRate}%{template.defaults.taxTreatment === 'inclusive' ? ' incl.' : ''})</span>
                    <span className="tabular-nums">{fmt(taxTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-base font-bold text-gray-900 pt-2 border-t-2 border-gray-200">
                  <span>Total Due</span>
                  <span className="tabular-nums text-emerald-700">{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 3: Options ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Message + Notes */}
            <div className="p-6 lg:border-r border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Message to Customer</label>
                  <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3}
                    placeholder="Thank you for your business!"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Internal Notes <span className="normal-case">(not sent to customer)</span></label>
                  <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={2}
                    placeholder="Private notes…"
                    className="w-full px-3 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none text-gray-600" />
                </div>
              </div>
            </div>

            {/* Right: Attachments (Settings moved to ⚙️ gear in footer) */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attachments</h3>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors border border-dashed border-gray-200 hover:border-emerald-300 px-3 py-2 rounded-xl w-full justify-center">
                <Paperclip size={13} /> Add Attachment
              </button>
              <p className="text-xs text-gray-400 text-center">
                Invoice settings (recurring, fees, etc.) are in the{' '}
                <button onClick={() => setShowSettingsMenu(true)}
                  className="text-emerald-600 hover:underline font-medium inline-flex items-center gap-0.5">
                  <Settings size={11} /> gear menu
                </button>{' '}in the footer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky Footer Bar ─── */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgb(0,0,0/0.06)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => router.push('/sales/billing/invoices')}
            className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {/* Save Draft split-button */}
            <div className="relative flex">
              <button onClick={() => handleSave('draft')} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 border border-emerald-200 border-r-0 text-emerald-700 rounded-l-xl text-sm font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50">
                {saving && saveAction === 'draft' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Draft
              </button>
              <button onClick={() => setShowSaveDraftMenu(p => !p)}
                className="px-2 py-2 border border-emerald-200 text-emerald-700 rounded-r-xl hover:bg-emerald-50 transition-colors">
                <ChevronDown size={12} />
              </button>
              <AnimatePresence>
                {showSaveDraftMenu && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-52 z-50">
                    <button onClick={() => { handleSave('draft'); setShowSaveDraftMenu(false) }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Save &amp; Continue Editing</button>
                    <button onClick={() => { handleSave('draft'); setShowSaveDraftMenu(false) }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Save &amp; Close</button>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => setShowSaveDraftMenu(false)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Save as Template</button>
                    <button onClick={() => setShowSaveDraftMenu(false)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Save &amp; Create Similar</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Send Invoice split-button */}
            <div className="relative flex">
              <button onClick={() => handleSave('send')} disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-l-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm border-r border-emerald-500">
                {saving && saveAction === 'send' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send Invoice
              </button>
              <button onClick={() => setShowSendMenu(p => !p)}
                className="px-2 py-2 bg-emerald-700 text-white rounded-r-xl hover:bg-emerald-800 transition-colors shadow-sm">
                <ChevronDown size={12} />
              </button>
              <AnimatePresence>
                {showSendMenu && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-56 z-50">
                    <button onClick={() => { handleSave('send'); setShowSendMenu(false) }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Send Now (email immediately)</button>
                    <button onClick={() => { setScheduleSend(true); setShowSettingsMenu(true); setShowSendMenu(false) }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Schedule Send</button>
                    <button onClick={() => { handleSave('send'); setShowSendMenu(false) }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Send with Payment Link</button>
                    <button onClick={() => setShowSendMenu(false)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Preview Before Sending</button>
                    <button onClick={() => { handleSave('send'); setShowSendMenu(false) }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Send with Reminder</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* ⚙️ Settings gear */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(p => !p)}
                title="Invoice Settings"
                className={`p-2 rounded-xl border transition-colors ${
                  Object.values({ makeRecurring, scheduleSend, applyLateFee, enablePartialPayments, requirePO, enableDeposit }).some(Boolean)
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}>
                <Settings size={16} />
              </button>
              <AnimatePresence>
                {showSettingsMenu && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl py-3 w-72 z-50">
                    <div className="px-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                      <Settings size={13} className="text-emerald-600" />
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice Settings</p>
                    </div>
                    <div className="px-4 pt-3 space-y-3">
                      {([
                        { state: makeRecurring, set: setMakeRecurring, label: 'Save as recurring template', sub: 'Auto-generate this invoice on a schedule' },
                        { state: scheduleSend, set: setScheduleSend, label: 'Schedule send for later', sub: 'Pick a specific date and time to send' },
                        { state: applyLateFee, set: setApplyLateFee, label: 'Apply late fee after due date', sub: 'Automatically charge overdue interest' },
                        { state: enablePartialPayments, set: setEnablePartialPayments, label: 'Enable partial payments', sub: 'Allow customer to pay in installments' },
                        { state: requirePO, set: setRequirePO, label: 'Require PO number', sub: 'Customer must provide PO before payment' },
                        { state: enableDeposit, set: setEnableDeposit, label: 'Enable deposit required', sub: 'Collect a deposit before beginning work' },
                      ] as const).map(({ state, set, label, sub }) => (
                        <button key={label} onClick={() => (set as (fn: (p: boolean) => boolean) => void)(p => !p)}
                          className="w-full flex items-start gap-3 text-left group">
                          <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            state ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 group-hover:border-emerald-400'
                          }`}>
                            {state && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{label}</p>
                            <p className="text-xs text-gray-400">{sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="px-4 pt-3 border-t border-gray-100 mt-3">
                      <button onClick={() => setShowSettingsMenu(false)}
                        className="w-full py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                        Done
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Template Gallery */}
      <AnimatePresence>
        {showGallery && (
          <TemplateGallery modal
            onClose={() => setShowGallery(false)}
            onSelect={t => { setTemplate(t); setShowGallery(false) }}
          />
        )}
      </AnimatePresence>

      {/* Dismiss overlays */}
      {showCustomerDD && (
        <div className="fixed inset-0 z-20" onClick={() => setShowCustomerDD(false)} />
      )}
      {showMoreMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
      )}
      {showSaveDraftMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSaveDraftMenu(false)} />
      )}
      {showSendMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSendMenu(false)} />
      )}
      {showSettingsMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSettingsMenu(false)} />
      )}
    </div>
  )
}
