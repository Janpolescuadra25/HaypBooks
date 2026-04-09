'use client'
export const dynamic = 'force-dynamic'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft, Plus, Trash2, Loader2, AlertCircle, ChevronDown,
  Save, Send, LayoutTemplate, Search, Check, X, ChevronRight,
  FileText, Paperclip, Clock, RefreshCw, Printer, Download,
  MoreHorizontal, Info, MapPin, Copy, Ban, History,
  Mail, Phone, Settings, Eye,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { getAllTemplates, getDefaultTemplate, recordTemplateUsage } from '@/lib/invoice-templates/templateStorage'
import type { InvoiceTemplate } from '@/lib/invoice-templates/types'
import TemplateGallery from '@/components/sales/invoice-templates/TemplateGallery'
import QuickAddCustomerModal from '@/components/sales/QuickAddCustomerModal'
import InvoiceSettingsModal, { DEFAULT_INVOICE_SETTINGS, InvoiceSettings } from '@/components/sales/InvoiceSettingsModal'
import { useToast } from '@/components/ToastProvider'

// ─── Print/PDF template theme definitions ────────────────────────────────────
type PrintTheme = {
  bg: string
  fontClass: string
  titleClass: string
  titleBorderClass: string
  draftNumClass: string
  metaLabelClass: string
  addrTitleClass: string
  addrTextClass: string
  thRowBg: string
  thCellClass: string
  tbodyRowClass: string
  tdClass: string
  totalsDividerClass: string
  totalsDueClass: string
  totalsDueAmtClass: string
  memoClass: string
}

const PRINT_THEMES: Record<string, PrintTheme> = {
  'builtin-clean': {
    bg: 'bg-white',
    fontClass: 'font-sans',
    titleClass: 'text-4xl font-bold text-gray-900 tracking-tight',
    titleBorderClass: 'border-b border-gray-300 pb-6 mb-8',
    draftNumClass: 'text-gray-400 font-mono text-sm mt-1',
    metaLabelClass: 'font-semibold text-gray-700',
    addrTitleClass: 'text-xs font-bold uppercase tracking-widest text-gray-400 mb-2',
    addrTextClass: 'text-sm text-gray-700 space-y-0.5',
    thRowBg: '',
    thCellClass: 'font-semibold text-gray-500 text-xs uppercase tracking-wide py-3',
    tbodyRowClass: 'border-b border-gray-100',
    tdClass: 'py-3 text-gray-700',
    totalsDividerClass: 'border-t border-gray-300 pt-4',
    totalsDueClass: 'font-bold text-gray-900',
    totalsDueAmtClass: 'text-gray-900',
    memoClass: 'border-t border-gray-100 pt-6 mt-8 text-sm text-gray-500',
  },
  'builtin-colorful': {
    bg: 'bg-white',
    fontClass: 'font-sans',
    titleClass: 'text-4xl font-black text-emerald-700',
    titleBorderClass: 'border-b-2 border-emerald-300 pb-6 mb-8',
    draftNumClass: 'text-emerald-400 font-mono text-sm mt-1',
    metaLabelClass: 'font-semibold text-emerald-700',
    addrTitleClass: 'text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2',
    addrTextClass: 'text-sm text-gray-700 space-y-0.5',
    thRowBg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
    thCellClass: 'font-bold text-white text-xs uppercase tracking-wide py-3',
    tbodyRowClass: 'border-b border-emerald-100 even:bg-emerald-50/40',
    tdClass: 'py-3 text-gray-700',
    totalsDividerClass: 'border-t-2 border-emerald-300 pt-4',
    totalsDueClass: 'font-black text-emerald-700',
    totalsDueAmtClass: 'text-emerald-700',
    memoClass: 'border-t border-emerald-100 pt-6 mt-8 text-sm text-gray-500',
  },
  'builtin-modern': {
    bg: 'bg-gray-50',
    fontClass: 'font-sans',
    titleClass: 'text-3xl font-light text-gray-900 tracking-widest uppercase',
    titleBorderClass: 'border-b border-gray-200 pb-6 mb-8',
    draftNumClass: 'text-gray-400 font-light text-sm mt-1',
    metaLabelClass: 'font-medium text-gray-500',
    addrTitleClass: 'text-xs font-medium uppercase tracking-widest text-gray-400 mb-2',
    addrTextClass: 'text-sm text-gray-600 space-y-0.5',
    thRowBg: 'bg-gray-100',
    thCellClass: 'font-medium text-gray-500 text-xs uppercase tracking-widest py-3',
    tbodyRowClass: 'border-b border-gray-100',
    tdClass: 'py-3.5 text-gray-600 text-sm',
    totalsDividerClass: 'border-t border-gray-200 pt-4',
    totalsDueClass: 'font-semibold text-sky-700',
    totalsDueAmtClass: 'text-sky-700',
    memoClass: 'border-t border-gray-200 pt-6 mt-8 text-sm text-gray-500',
  },
  'builtin-corporate': {
    bg: 'bg-white',
    fontClass: 'font-serif',
    titleClass: 'text-4xl font-bold text-blue-950 tracking-tight uppercase',
    titleBorderClass: 'border-b-4 border-blue-950 pb-6 mb-8',
    draftNumClass: 'text-gray-500 font-mono text-sm mt-1',
    metaLabelClass: 'font-semibold text-blue-950',
    addrTitleClass: 'text-xs font-bold uppercase tracking-widest text-blue-900 mb-2',
    addrTextClass: 'text-sm text-gray-800 space-y-0.5 font-serif',
    thRowBg: 'bg-blue-950',
    thCellClass: 'font-bold text-white text-xs uppercase tracking-wide py-3',
    tbodyRowClass: 'border-b border-gray-300',
    tdClass: 'py-3 text-gray-800',
    totalsDividerClass: 'border-t-4 border-blue-950 pt-4',
    totalsDueClass: 'font-bold text-blue-950 uppercase text-sm tracking-wide',
    totalsDueAmtClass: 'text-blue-950',
    memoClass: 'border-t-2 border-blue-950 pt-6 mt-8 text-sm text-gray-500 font-serif',
  },
  'builtin-creative': {
    bg: 'bg-amber-50',
    fontClass: 'font-sans',
    titleClass: 'text-5xl font-black text-amber-500 tracking-tight',
    titleBorderClass: 'pb-6 mb-8',
    draftNumClass: 'text-gray-400 font-mono text-sm mt-1',
    metaLabelClass: 'font-black text-amber-600',
    addrTitleClass: 'text-xs font-black uppercase tracking-widest text-amber-400 mb-2',
    addrTextClass: 'text-sm text-gray-700 space-y-0.5',
    thRowBg: 'bg-amber-500',
    thCellClass: 'font-black text-white text-xs uppercase tracking-wide py-3',
    tbodyRowClass: 'border-b-2 border-amber-100',
    tdClass: 'py-3 text-gray-700',
    totalsDividerClass: 'border-t-4 border-amber-500 pt-4',
    totalsDueClass: 'font-black text-amber-600',
    totalsDueAmtClass: 'text-amber-600',
    memoClass: 'border-t-2 border-amber-200 pt-6 mt-8 text-sm text-gray-500',
  },
  'builtin-classic': {
    bg: 'bg-amber-50/40',
    fontClass: 'font-serif',
    titleClass: 'text-4xl font-bold text-gray-900',
    titleBorderClass: 'border-b-2 border-gray-900 pb-6 mb-8',
    draftNumClass: 'text-gray-500 font-serif text-sm mt-1',
    metaLabelClass: 'font-semibold text-gray-800',
    addrTitleClass: 'text-xs font-bold uppercase tracking-widest text-gray-500 mb-2',
    addrTextClass: 'text-sm text-gray-800 space-y-0.5 font-serif',
    thRowBg: '',
    thCellClass: 'font-bold text-gray-900 text-xs uppercase tracking-wide py-3 border-b-2 border-gray-900',
    tbodyRowClass: 'border-b border-gray-400',
    tdClass: 'py-3 text-gray-800 font-serif',
    totalsDividerClass: 'border-t-2 border-gray-900 pt-4',
    totalsDueClass: 'font-bold text-gray-900 uppercase font-serif',
    totalsDueAmtClass: 'text-gray-900',
    memoClass: 'border-t border-gray-400 pt-6 mt-8 text-sm text-gray-600 font-serif',
  },
}

const getPrintTheme = (templateId: string): PrintTheme =>
  PRINT_THEMES[templateId] ?? PRINT_THEMES['builtin-clean']

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
  taxRate?: number
}

const genId = () => Math.random().toString(36).slice(2, 9)

export default function InvoiceCreatePage() {
  const router = useRouter()
  const { companyId, loading: cidLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])
  const toast = useToast()

  // Template
  const [template, setTemplate] = useState<InvoiceTemplate>(getDefaultTemplate)
  const [showGallery, setShowGallery] = useState(false)
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [allTemplates, setAllTemplates] = useState<InvoiceTemplate[]>([])

  useEffect(() => { setAllTemplates(getAllTemplates()) }, [])

  // Load global accounting preferences and apply as defaults
  useEffect(() => {
    if (!companyId) return
    fetch(`/api/companies/${companyId}/settings`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        if (data.defaultPaymentTerms) {
          const termsMap: Record<string, string> = {
            'due-on-receipt': 'Due on Receipt',
            'net-15': 'Net 15',
            'net-30': 'Net 30',
            'net-45': 'Net 45',
            'net-60': 'Net 60',
            'end-of-month': 'End of Month',
          }
          setPaymentTerms(termsMap[data.defaultPaymentTerms] ?? data.defaultPaymentTerms)
        }
      })
      .catch(() => {}) // Non-critical — falls back to default 'Net 30'
  }, [companyId])

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

  // Options (invoice settings modal)
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(DEFAULT_INVOICE_SETTINGS)
  const [showInvoiceSettings, setShowInvoiceSettings] = useState(false)

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
  const [recentlyUsedItems, setRecentlyUsedItems] = useState<string[]>([])

  // Quick-add customer
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)

  // Bill To editable fields
  const [billContact, setBillContact] = useState('')
  const [billCompany, setBillCompany] = useState('')

  // Email composition (per-invoice, not stored in template)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [emailCc, setEmailCc] = useState('')
  const [emailBcc, setEmailBcc] = useState('')
  const [emailTone, setEmailTone] = useState<'professional' | 'friendly' | 'brief'>('professional')
  const [emailSendCopyToSelf, setEmailSendCopyToSelf] = useState(false)
  const [emailScheduleSend, setEmailScheduleSend] = useState(false)
  const [emailScheduleDate, setEmailScheduleDate] = useState('')
  const [emailScheduleTime, setEmailScheduleTime] = useState('09:00')

  // View tabs
  const [activeCreateTab, setActiveCreateTab] = useState<'edit' | 'email' | 'print'>('edit')

  // State
  const [saving, setSaving] = useState(false)
  const [saveAction, setSaveAction] = useState<'draft' | 'send'>('draft')
  const [error, setError] = useState('')
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showSaveDraftMenu, setShowSaveDraftMenu] = useState(false)
  const [showSendMenu, setShowSendMenu] = useState(false)

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
          taxRate: i.taxRate != null ? Number(i.taxRate) : undefined,
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
    // Pre-fill email message from template default (user can override per invoice)
    setEmailMessage(template.defaultMessage || 'Thank you for your business! Please find your invoice attached.')
  }, [template])

  // Auto-fill from selected customer
  useEffect(() => {
    if (!customerId) return
    const c = customers.find(x => x.contactId === customerId)
    if (!c) return
    setBillContact(c.name)
    setBillCompany('')
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
  const taxTotal = template.defaults.taxTreatment !== 'none'
    ? items.reduce((sum, it) => {
        const lineTotal = it.quantity * it.unitPrice
        return sum + (lineTotal * (it.taxRate || 0) / 100)
      }, 0)
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
      taxRate: cat.taxRate ?? it.taxRate,
    } : it))
    setRecentlyUsedItems(p => [cat.id, ...p.filter(id => id !== cat.id)].slice(0, 5))
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
        discountType,
        discountValue: Number(discountValue),
        billAddress: { contactName: billContact, company: billCompany, ...billAddress },
        shipAddress: shipSameAsBill ? undefined : shipAddress,
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

        {/* View Tabs */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center">
              {([
                { tab: 'edit' as const, label: 'Edit', icon: <FileText size={12} /> },
                { tab: 'email' as const, label: 'Email & Preview', icon: <Mail size={12} /> },
                { tab: 'print' as const, label: 'Print / PDF', icon: <Printer size={12} /> },
              ]).map(({ tab, label, icon }) => (
                <button key={tab} onClick={() => setActiveCreateTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    activeCreateTab === tab
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                  }`}>
                  {icon} {label}
                </button>
              ))}
            </div>
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

        {/* Document Card — Edit Tab */}
        {activeCreateTab === 'edit' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* ── Section 1: Customer Selector ── */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</h3>
              {selectedCustomer && (
                <button
                  onClick={() => { setCustomerId(''); setCustomerSearch(''); setBillContact(''); setBillCompany('') }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            {selectedCustomer ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-emerald-700">{selectedCustomer.name[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {(customerEmail || selectedCustomer.email) && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail size={10} className="text-gray-300" />
                          {customerEmail || selectedCustomer.email}
                        </p>
                      )}
                      {customerPhone && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone size={10} className="text-gray-300" />
                          {customerPhone}
                        </p>
                      )}
                      <span className="text-xs text-emerald-600 font-medium">Balance: {fmt(selectedCustomer.balance)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCustomerDD(true); setTimeout(() => customerSearchRef.current?.focus(), 50) }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-200 hover:border-emerald-400 px-3 py-1.5 rounded-lg transition-colors">
                  Change
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
                    placeholder="Search customers by name, email or phone…"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-dashed border-gray-200 hover:border-emerald-300 focus:border-emerald-400 rounded-xl focus:outline-none transition-colors bg-gray-50/50" />
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
                        <button onClick={() => { setShowCustomerDD(false); setShowQuickAddModal(true) }}
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

          {/* ── Section 2: Bill To + Ship To ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-gray-100">
            {/* Bill To — editable address */}
            <div className="p-6 lg:border-r border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bill To</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={billContact} onChange={e => setBillContact(e.target.value)}
                    placeholder="Contact name"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                  <input type="text" value={billCompany} onChange={e => setBillCompany(e.target.value)}
                    placeholder="Company (optional)"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                </div>
                <input type="text" value={billAddress.line1}
                  onChange={e => setBillAddress(p => ({ ...p, line1: e.target.value }))}
                  placeholder="Street address"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" value={billAddress.city}
                    onChange={e => setBillAddress(p => ({ ...p, city: e.target.value }))}
                    placeholder="City"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                  <input type="text" value={billAddress.state}
                    onChange={e => setBillAddress(p => ({ ...p, state: e.target.value }))}
                    placeholder="State"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                  <input type="text" value={billAddress.zip}
                    onChange={e => setBillAddress(p => ({ ...p, zip: e.target.value }))}
                    placeholder="ZIP"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                </div>
              </div>
              {/* Email override shortcut */}
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                <Mail size={12} className="text-gray-400 flex-shrink-0" />
                <button
                  type="button"
                  onClick={() => setActiveCreateTab('email')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium underline"
                >
                  Customize email recipient, CC, BCC &amp; message
                </button>
                {(emailCc || emailBcc || emailSubject || emailMessage) && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Customized</span>
                )}
              </div>
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
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200">Product / Service</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-20">Qty</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-32">Rate</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600 border-r border-gray-200 w-20">Tax %</th>
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
                          <div className="flex items-center gap-1">
                            <input
                              value={it.description}
                              onChange={e => { updateItem(it.id, 'description', e.target.value); setActiveCatalogRow(it.id) }}
                              onFocus={() => setActiveCatalogRow(it.id)}
                              onBlur={() => setTimeout(() => setActiveCatalogRow(null), 150)}
                              placeholder="Type or select a product / service…"
                              className="flex-1 min-w-0 text-sm text-slate-800 bg-transparent border-0 outline-none focus:ring-0 placeholder:text-gray-300" />
                            <button
                              type="button"
                              onMouseDown={e => { e.preventDefault(); setActiveCatalogRow(activeCatalogRow === it.id ? null : it.id) }}
                              className="shrink-0 p-0.5 rounded hover:bg-gray-100 text-gray-300 hover:text-emerald-500 transition-colors">
                              <ChevronDown size={12} />
                            </button>
                          </div>
                          {activeCatalogRow === it.id && (() => {
                            const q = it.description.toLowerCase()
                            const allMatches = catalogItems.filter(c =>
                              !q || c.name.toLowerCase().includes(q) || (c.sku ?? '').toLowerCase().includes(q)
                            )
                            const recentItems = !q
                              ? recentlyUsedItems.map(id => catalogItems.find(c => c.id === id)).filter(Boolean) as CatalogItem[]
                              : []
                            const products = allMatches.filter(c => c.type !== 'SERVICE').slice(0, 6)
                            const services = allMatches.filter(c => c.type === 'SERVICE').slice(0, 6)
                            const hasNoItems = catalogItems.length === 0
                            if (!hasNoItems && allMatches.length === 0 && recentItems.length === 0) return null

                            const CatalogRow = ({ cat, keyPfx }: { cat: CatalogItem; keyPfx?: string }) => (
                              <button
                                key={`${keyPfx ?? ''}${cat.id}`}
                                type="button"
                                onMouseDown={() => pickCatalogItem(it.id, cat)}
                                className="flex items-center justify-between w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 transition-colors border-b border-slate-50 last:border-0">
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
                            )

                            return (
                              <div className="absolute left-0 top-full mt-1 z-40 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                                {hasNoItems && (
                                  <div className="px-4 py-6 text-center">
                                    <p className="text-xs font-semibold text-gray-500 mb-1">No catalog items yet</p>
                                    <p className="text-xs text-gray-400">Add products &amp; services in Inventory, or type a custom description</p>
                                  </div>
                                )}
                                {!hasNoItems && allMatches.length === 0 && q && (
                                  <div className="px-4 py-4 text-center">
                                    <p className="text-xs text-gray-400">No matches — will save as custom description</p>
                                  </div>
                                )}
                                {recentItems.length > 0 && (
                                  <>
                                    <div className="px-3 pt-2.5 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                      <Clock size={10} /> Recently Used
                                    </div>
                                    {recentItems.map(cat => <CatalogRow key={`r-${cat.id}`} cat={cat} keyPfx="r-" />)}
                                    {(products.length > 0 || services.length > 0) && <div className="border-t border-gray-100" />}
                                  </>
                                )}
                                {products.length > 0 && (
                                  <>
                                    <div className="px-3 pt-2.5 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">📦 Products</div>
                                    {products.map(cat => <CatalogRow key={cat.id} cat={cat} />)}
                                    {services.length > 0 && <div className="border-t border-gray-100" />}
                                  </>
                                )}
                                {services.length > 0 && (
                                  <>
                                    <div className="px-3 pt-2.5 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">💼 Services</div>
                                    {services.map(cat => <CatalogRow key={cat.id} cat={cat} />)}
                                  </>
                                )}
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
                        <td className="px-4 py-2 border-r border-gray-100">
                          <input
                            type="number" min="0" max="100" step="0.5"
                            value={it.taxRate}
                            onChange={e => updateItem(it.id, 'taxRate', e.target.value)}
                            className="w-full text-sm text-right text-slate-800 bg-transparent border-0 outline-none focus:ring-0 tabular-nums" />
                        </td>
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
                <button onClick={() => setShowInvoiceSettings(true)}
                  className="text-emerald-600 hover:underline font-medium inline-flex items-center gap-0.5">
                  <Settings size={11} /> Invoice Settings
                </button>{' '}below.
              </p>
            </div>
          </div>
        </div>
        )} {/* end edit tab */}

        {/* ── Email & Preview Tab ── */}
        {activeCreateTab === 'email' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Mail size={15} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-700">Email &amp; Preview</h3>
              <span className="text-xs text-gray-400 ml-auto">Compose your email on the left — see what the customer sees online on the right</span>
            </div>
            <div className="grid grid-cols-[45%_55%] divide-x divide-gray-100 min-h-[700px]">

              {/* Left: Compose */}
              <div className="p-6 space-y-4 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compose Email</p>

                {/* To / Subject */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                    <input
                      value={customerEmail || selectedCustomer?.email || ''}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="customer@email.com"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">CC</label>
                    <input value={emailCc} onChange={e => setEmailCc(e.target.value)}
                      placeholder="cc@example.com (optional)"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">BCC</label>
                    <input value={emailBcc} onChange={e => setEmailBcc(e.target.value)}
                      placeholder="bcc@example.com (optional)"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      value={emailSubject || `Invoice from your company — Due ${dueDate}`}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder={`Invoice — Due ${dueDate}`}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                {/* Tone selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Message Tone</label>
                  <div className="flex gap-2">
                    {(['professional', 'friendly', 'brief'] as const).map(tone => (
                      <button key={tone} onClick={() => setEmailTone(tone)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border capitalize transition-colors ${emailTone === tone ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        {tone}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {emailTone === 'professional' && 'Formal, business-appropriate language.'}
                    {emailTone === 'friendly' && 'Warm and approachable tone.'}
                    {emailTone === 'brief' && 'Short and to-the-point.'}
                  </p>
                </div>

                {/* Message body */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Message Body</label>
                  <textarea
                    value={emailMessage}
                    onChange={e => setEmailMessage(e.target.value)}
                    rows={6}
                    placeholder="Write your message to the customer…"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-y"
                  />
                  <p className="text-xs text-gray-400 mt-1">Pre-filled from template default — edit freely for this invoice.</p>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={emailSendCopyToSelf} onChange={e => setEmailSendCopyToSelf(e.target.checked)} className="rounded text-emerald-600" />
                    <span className="text-sm text-gray-700">Send a copy to myself</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={emailScheduleSend} onChange={e => setEmailScheduleSend(e.target.checked)} className="rounded text-emerald-600" />
                    <span className="text-sm text-gray-700">Schedule send</span>
                  </label>
                  {emailScheduleSend && (
                    <div className="ml-5 flex gap-2">
                      <input type="date" value={emailScheduleDate} onChange={e => setEmailScheduleDate(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none" />
                      <input type="time" value={emailScheduleTime} onChange={e => setEmailScheduleTime(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Invoice Preview (what customer sees when they click "View Invoice & Pay Online") */}
              <div className="flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
                  <Eye size={13} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-xs font-semibold text-gray-600">Customer Invoice Preview</p>
                </div>
                {/* Scrollable invoice content */}
                <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
                  <div className="max-w-xl mx-auto">
                    {(() => {
                      const th = getPrintTheme(template.id)
                      return (
                        <div className={`rounded-2xl overflow-hidden border border-gray-200 shadow-sm ${th.bg} ${th.fontClass}`}>
                          <div className="p-6">
                            {/* Invoice header */}
                            <div className={`flex items-start justify-between ${th.titleBorderClass}`}>
                              <div>
                                <h1 className={th.titleClass}>INVOICE</h1>
                                <p className={th.draftNumClass}>#DRAFT</p>
                              </div>
                              <div className="text-right text-xs text-gray-600 space-y-1">
                                <p><span className={th.metaLabelClass}>Date:</span> {date}</p>
                                <p><span className={th.metaLabelClass}>Due:</span> {dueDate}</p>
                                {poNumber && <p><span className={th.metaLabelClass}>PO #:</span> {poNumber}</p>}
                              </div>
                            </div>
                            {/* Bill To */}
                            <div className="mb-5">
                              <h4 className={th.addrTitleClass}>Bill To</h4>
                              {(selectedCustomer || billContact) ? (
                                <div className={th.addrTextClass}>
                                  <p className="font-semibold">{billContact || selectedCustomer?.name}</p>
                                  {billCompany && <p>{billCompany}</p>}
                                  {billAddress.line1 && <p>{billAddress.line1}</p>}
                                  {billAddress.city && <p>{[billAddress.city, billAddress.state, billAddress.zip].filter(Boolean).join(', ')}</p>}
                                </div>
                              ) : <p className="text-sm text-gray-400 italic">No customer selected</p>}
                            </div>
                            {/* Line items */}
                            <table className="w-full mb-5 text-xs">
                              <thead>
                                <tr className={th.thRowBg}>
                                  <th className={`text-left ${th.thCellClass}`}>Description</th>
                                  <th className={`text-right ${th.thCellClass} w-10`}>Qty</th>
                                  <th className={`text-right ${th.thCellClass} w-20`}>Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.filter(it => it.description.trim()).length === 0 ? (
                                  <tr><td colSpan={3} className="py-4 text-center text-gray-400 italic">No line items added yet</td></tr>
                                ) : items.filter(it => it.description.trim()).map(it => (
                                  <tr key={it.id} className={th.tbodyRowClass}>
                                    <td className={th.tdClass}>{it.description}</td>
                                    <td className={`${th.tdClass} text-right tabular-nums`}>{it.quantity}</td>
                                    <td className={`${th.tdClass} text-right font-semibold tabular-nums`}>{fmt(it.quantity * it.unitPrice)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {/* Totals */}
                            <div className="flex justify-end mb-6">
                              <div className={`w-52 space-y-1.5 text-xs ${th.totalsDividerClass}`}>
                                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span></div>
                                {discountAmt > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span className="tabular-nums">-{fmt(discountAmt)}</span></div>}
                                {template.defaults.taxTreatment !== 'none' && <div className="flex justify-between text-gray-600"><span>Tax</span><span className="tabular-nums">{fmt(taxTotal)}</span></div>}
                                <div className="flex justify-between pt-2 mt-1 border-t border-current/20">
                                  <span className={`${th.totalsDueClass} text-xs`}>TOTAL DUE</span>
                                  <span className={`tabular-nums font-bold text-sm ${th.totalsDueAmtClass}`}>{fmt(total)}</span>
                                </div>
                              </div>
                            </div>
                            {/* Pay Now button */}
                            <div className="text-center py-2">
                              <div className="inline-flex flex-col items-center gap-1.5">
                                <div className="bg-emerald-600 text-white text-sm font-bold px-8 py-3 rounded-xl shadow-md cursor-default select-none">
                                  💳 Pay Now — {fmt(total)}
                                </div>
                                <p className="text-xs text-gray-400">Secure payment via credit card, ACH, or bank transfer</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                    {/* Info footer */}
                    <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                      This is what customers see when they click<br />
                      <span className="font-medium text-gray-500">"View Invoice &amp; Pay Online"</span> in your email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Print Tab ── */}
        {activeCreateTab === 'print' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer size={15} className="text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-700">Print Preview</h3>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                  <Printer size={12} /> Print
                </button>
              </div>
              {/* Template selector — only in Print/PDF tab */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 overflow-x-auto">
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Print Style:</span>
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
                  More <ChevronRight size={12} />
                </button>
              </div>
            </div>
            <div className="p-8 print:p-0">
              {/* Print/PDF info banner — hidden when printing */}
              <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 print:hidden">
                <p className="font-semibold mb-0.5">🖨️ Print / PDF Preview</p>
                <p>
                  This shows how your invoice looks when printed or saved as PDF.
                  For the online version customers see (with the Pay Now button), check the{' '}
                  <button onClick={() => setActiveCreateTab('email')} className="underline font-medium hover:text-blue-900">
                    Email &amp; Preview
                  </button>{' '}tab.
                </p>
              </div>
              {(() => {
                const th = getPrintTheme(template.id)
                return (
                  <div className={`max-w-3xl mx-auto print:shadow-none ${th.bg} ${th.fontClass}`}>
                    {/* Print header */}
                    <div className={`flex items-start justify-between ${th.titleBorderClass}`}>
                      <div>
                        <h1 className={th.titleClass}>INVOICE</h1>
                        <p className={th.draftNumClass}>#DRAFT</p>
                      </div>
                      <div className="text-right text-sm text-gray-600 space-y-1">
                        <p><span className={th.metaLabelClass}>Date:</span> {date}</p>
                        <p><span className={th.metaLabelClass}>Due:</span> {dueDate}</p>
                        {poNumber && <p><span className={th.metaLabelClass}>PO #:</span> {poNumber}</p>}
                      </div>
                    </div>
                    {/* Addresses */}
                    <div className="grid grid-cols-2 gap-8 mb-10">
                      <div>
                        <h4 className={th.addrTitleClass}>Bill To</h4>
                        {(selectedCustomer || billContact) ? (
                          <div className={th.addrTextClass}>
                            <p className="font-semibold">{billContact || selectedCustomer?.name}</p>
                            {billCompany && <p>{billCompany}</p>}
                            {billAddress.line1 && <p>{billAddress.line1}</p>}
                            {billAddress.city && <p>{[billAddress.city, billAddress.state, billAddress.zip].filter(Boolean).join(', ')}</p>}
                            {(customerEmail || selectedCustomer?.email) && <p className="text-gray-400">{customerEmail || selectedCustomer?.email}</p>}
                          </div>
                        ) : <p className="text-sm text-gray-400 italic">No customer selected</p>}
                      </div>
                    </div>
                    {/* Items table */}
                    <table className="w-full mb-8 text-sm">
                      <thead>
                        <tr className={th.thRowBg}>
                          <th className={`text-left ${th.thCellClass}`}>Description</th>
                          <th className={`text-right ${th.thCellClass} w-16`}>Qty</th>
                          <th className={`text-right ${th.thCellClass} w-28`}>Unit Price</th>
                          <th className={`text-right ${th.thCellClass} w-28`}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.filter(it => it.description.trim()).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-gray-400 italic">No line items</td>
                          </tr>
                        ) : items.filter(it => it.description.trim()).map(it => (
                          <tr key={it.id} className={th.tbodyRowClass}>
                            <td className={th.tdClass}>{it.description}</td>
                            <td className={`${th.tdClass} text-right tabular-nums`}>{it.quantity}</td>
                            <td className={`${th.tdClass} text-right tabular-nums`}>{fmt(it.unitPrice)}</td>
                            <td className={`${th.tdClass} text-right font-semibold tabular-nums`}>{fmt(it.quantity * it.unitPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className={`w-72 space-y-2 text-sm ${th.totalsDividerClass}`}>
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="tabular-nums">{fmt(subtotal)}</span></div>
                        {discountAmt > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span className="tabular-nums">-{fmt(discountAmt)}</span></div>}
                        {template.defaults.taxTreatment !== 'none' && (
                          <div className="flex justify-between text-gray-600"><span>Tax</span><span className="tabular-nums">{fmt(taxTotal)}</span></div>
                        )}
                        <div className="flex justify-between pt-3 mt-2 border-t border-current/20">
                          <span className={th.totalsDueClass}>TOTAL DUE</span>
                          <span className={`tabular-nums font-bold ${th.totalsDueAmtClass}`}>{fmt(total)}</span>
                        </div>
                      </div>
                    </div>
                    {memo && (
                      <div className={th.memoClass}>
                        <p>{memo}</p>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        )}

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
                    <button onClick={() => { setInvoiceSettings(p => ({ ...p, scheduleSend: true })); setShowInvoiceSettings(true); setShowSendMenu(false) }}
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
            {/* ⚙️ Invoice Settings button → opens large modal */}
            <button
              onClick={() => setShowInvoiceSettings(true)}
              title="Invoice Settings"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                [invoiceSettings.makeRecurring, invoiceSettings.scheduleSend, invoiceSettings.applyLateFee,
                 invoiceSettings.enablePartialPayments, invoiceSettings.requirePO, invoiceSettings.enableDeposit,
                 invoiceSettings.autoReminders].some(Boolean)
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
              <Settings size={15} />
              Invoice Settings
              {[invoiceSettings.makeRecurring, invoiceSettings.scheduleSend, invoiceSettings.applyLateFee,
                invoiceSettings.enablePartialPayments, invoiceSettings.requirePO, invoiceSettings.enableDeposit,
                invoiceSettings.autoReminders].some(Boolean) && (
                <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
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

      {/* Invoice Settings Modal */}
      <AnimatePresence>
        {showInvoiceSettings && (
          <InvoiceSettingsModal
            initial={invoiceSettings}
            onClose={() => setShowInvoiceSettings(false)}
            onApply={s => {
              setInvoiceSettings(s)
              setShowInvoiceSettings(false)
              toast.success('Invoice settings applied')
            }}
          />
        )}
      </AnimatePresence>

      {/* Quick Add Customer Modal */}
      {showQuickAddModal && (
        <QuickAddCustomerModal
          companyId={companyId!}
          onClose={() => setShowQuickAddModal(false)}
          onCreated={c => {
            setCustomers(p => [...p, c])
            setCustomerId(c.contactId)
            setBillContact(c.name)
            if (c.billingAddress) setBillAddress({
              line1: c.billingAddress.line1 ?? '',
              city: c.billingAddress.city ?? '',
              state: c.billingAddress.state ?? '',
              zip: c.billingAddress.zip ?? '',
            })
            setShowQuickAddModal(false)
          }}
        />
      )}

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
    </div>
  )
}
