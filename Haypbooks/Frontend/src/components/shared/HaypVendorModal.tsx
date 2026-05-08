'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  ShieldCheck, 
  Info,
  CreditCard,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
  DollarSign,
  Calendar,
  Shield,
  FileText
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { format } from 'date-fns'
import { useToast } from '@/components/ToastProvider'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import { cn } from '@/lib/utils'
import { ModalPortal } from '@/components/shared/ModalPortal'

interface HaypVendorModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'new' | 'edit'
  vendorId?: string
  onSaved?: () => void
}

const PAYMENT_TERMS = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 60', 'Net 90']
const VENDOR_TYPES = ['Company', 'Individual']
const CURRENCIES = ['USD', 'EUR', 'PHP', 'GBP', 'AUD']

type TabType = 'General' | 'Address' | 'Payments' | 'Taxes' | 'Notes'

export default function HaypVendorModal({ 
  isOpen, 
  onClose, 
  mode, 
  vendorId, 
  onSaved 
}: HaypVendorModalProps) {
  const { companyId } = useCompanyId()
  const { currency: companyCurrency } = useCompanyCurrency()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState<TabType>('General')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    company: '',
    displayName: '',
    email: '',
    phone: '',
    mobile: '',
    fax: '',
    website: '',
    billingAddress: {
      line1: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    shippingAddress: {
      line1: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    billingSameAsShipping: true,
    notes: '',
    publicNotes: '',
    accountNumber: '',
    terms: 'Net 30',
    openingBalance: '0.00',
    asOfDate: format(new Date(), 'yyyy-MM-dd'),
    taxId: '',
    track1099: false,
    currency: '',
    vendorType: 'Company',
    creditLimit: '0.00',
    bankName: '',
    bankAccountNumber: '',
    routingNumber: '',
    taxRate: '0.00',
    status: 'ACTIVE'
  })

  // Set default currency when component mounts or companyCurrency changes
  useEffect(() => {
    if (companyCurrency && !formData.currency) {
      setFormData(prev => ({ ...prev, currency: companyCurrency }))
    }
  }, [companyCurrency])

  // Fetch vendor data if in edit mode
  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !vendorId || !companyId) return

    const fetchVendor = async () => {
      setLoading(true)
      try {
        const response = await expensesService.getVendor(companyId, vendorId)
        const data = response.data ?? response
        
        setFormData({
          title: data.title ?? '',
          firstName: data.firstName ?? '',
          middleName: data.middleName ?? '',
          lastName: data.lastName ?? '',
          suffix: data.suffix ?? '',
          company: data.name ?? data.company ?? '',
          displayName: data.displayName ?? data.name ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          mobile: data.mobile ?? '',
          fax: data.fax ?? '',
          website: data.website ?? '',
          billingAddress: {
            line1: data.billingAddress?.line1 ?? '',
            city: data.billingAddress?.city ?? '',
            state: data.billingAddress?.state ?? '',
            zip: data.billingAddress?.zip ?? '',
            country: data.billingAddress?.country ?? '',
          },
          shippingAddress: {
            line1: data.shippingAddress?.line1 ?? '',
            city: data.shippingAddress?.city ?? '',
            state: data.shippingAddress?.state ?? '',
            zip: data.shippingAddress?.zip ?? '',
            country: data.shippingAddress?.country ?? '',
          },
          billingSameAsShipping: data.billingSameAsShipping ?? true,
          notes: data.internalNotes ?? data.notes ?? '',
          publicNotes: data.publicNotes ?? '',
          accountNumber: data.accountNumber ?? '',
          terms: data.paymentTerms ?? data.terms ?? 'Net 30',
          openingBalance: String(data.openingBalance ?? '0.00'),
          asOfDate: data.asOfDate ? format(new Date(data.asOfDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          taxId: data.taxId ?? '',
          track1099: data.track1099 ?? false,
          currency: data.currency ?? companyCurrency ?? 'USD',
          vendorType: data.type ?? 'Company',
          creditLimit: String(data.creditLimit ?? '0.00'),
          bankName: data.bankName ?? '',
          bankAccountNumber: data.bankAccountNumber ?? '',
          routingNumber: data.routingNumber ?? '',
          taxRate: String(data.taxRate ?? '0.00'),
          status: data.status ?? 'ACTIVE'
        })
      } catch (err) {
        console.error('Failed to fetch vendor:', err)
        toast.error('Failed to load vendor data')
      } finally {
        setLoading(false)
      }
    }

    fetchVendor()
  }, [isOpen, mode, vendorId, companyId, companyCurrency, toast])

  const handleClose = () => {
    if (submitting) return
    setActiveTab('General')
    setError('')
    onClose()
  }

  // Sync display name if not manually edited
  const updateDisplayName = (first: string, last: string, company: string) => {
    if (company) setFormData(prev => ({ ...prev, displayName: company }))
    else if (first || last) setFormData(prev => ({ ...prev, displayName: `${first} ${last}`.trim() }))
  }

  const validate = () => {
    if (!formData.displayName.trim() && !formData.company.trim() && !formData.firstName.trim()) {
      setError('Display name or Company name is required')
      setActiveTab('General')
      return false
    }
    setError('')
    return true
  }

  const handleSave = async () => {
    if (!companyId || submitting) return
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = {
        name: formData.company || formData.displayName,
        displayName: formData.displayName,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        title: formData.title,
        suffix: formData.suffix,
        type: formData.vendorType,
        taxId: formData.taxId,
        website: formData.website,
        currency: formData.currency,
        email: formData.email,
        phone: formData.phone,
        mobile: formData.mobile,
        fax: formData.fax,
        billingAddress: formData.billingAddress,
        shippingAddress: formData.billingSameAsShipping ? formData.billingAddress : formData.shippingAddress,
        billingSameAsShipping: formData.billingSameAsShipping,
        paymentTerms: formData.terms,
        creditLimit: Number(formData.creditLimit),
        openingBalance: Number(formData.openingBalance),
        asOfDate: formData.asOfDate,
        internalNotes: formData.notes,
        publicNotes: formData.publicNotes,
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        routingNumber: formData.routingNumber,
        taxRate: Number(formData.taxRate),
        track1099: formData.track1099,
        status: formData.status
      }

      if (mode === 'new') {
        await expensesService.createVendor(companyId, payload)
        toast.success('Vendor created successfully')
      } else if (vendorId) {
        await expensesService.updateVendor(companyId, vendorId, payload)
        toast.success('Vendor updated successfully')
      }

      if (onSaved) onSaved()
      handleClose()
    } catch (err: any) {
      console.error('Save error:', err)
      const msg = err?.response?.data?.message ?? 'Unable to save vendor'
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <ModalPortal>
      <AnimatePresence>
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="relative w-full max-w-5xl bg-white rounded-[24px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {mode === 'new' ? 'New Vendor' : 'Edit Vendor'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor Information</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Help</button>
                <button 
                  onClick={handleClose}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-slate-100/50 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mx-8 mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 items-center">
                    <AlertCircle className="text-rose-500 shrink-0" size={18} />
                    <p className="text-sm font-bold text-rose-700">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading vendor data...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-6 gap-3">
                        <div className="col-span-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Title</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">First Name</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                            value={formData.firstName}
                            onChange={(e) => {
                              setFormData({...formData, firstName: e.target.value});
                              updateDisplayName(e.target.value, formData.lastName, formData.company);
                            }}
                          />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Middle</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                            value={formData.middleName}
                            onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Last Name</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                            value={formData.lastName}
                            onChange={(e) => {
                              setFormData({...formData, lastName: e.target.value});
                              updateDisplayName(formData.firstName, e.target.value, formData.company);
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Company / Business Name</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                            value={formData.company}
                            onChange={(e) => {
                              setFormData({...formData, company: e.target.value});
                              updateDisplayName(formData.firstName, formData.lastName, e.target.value);
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Vendor Type</label>
                          <select 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all"
                            value={formData.vendorType}
                            onChange={(e) => setFormData({...formData, vendorType: e.target.value})}
                          >
                            {VENDOR_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Display name as *</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                          value={formData.displayName}
                          onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        />
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Required: Identification name in reports</p>
                      </div>
                    </div>

                    {/* Right Column: Contact Detail */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
                          <div className="relative group">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <input 
                              type="email" 
                              placeholder="example@acme.com"
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                          <div className="relative group">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <input 
                              type="text" 
                              placeholder="(000) 000-0000"
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Mobile</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                            value={formData.mobile}
                            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Website</label>
                          <div className="relative group">
                            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                            <input 
                              type="text" 
                              placeholder="https://..."
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                              value={formData.website}
                              onChange={(e) => setFormData({...formData, website: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Fax</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                            value={formData.fax}
                            onChange={(e) => setFormData({...formData, fax: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Currency</label>
                          <select 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all font-bold"
                            value={formData.currency}
                            onChange={(e) => setFormData({...formData, currency: e.target.value})}
                          >
                            {CURRENCIES.map(cur => <option key={cur} value={cur}>{cur}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs Interface */}
                  <div className="mt-12 border border-slate-100 rounded-3xl overflow-hidden shadow-sm bg-slate-50/30">
                    <div className="flex border-b border-slate-100 bg-white px-2">
                      {(['General', 'Address', 'Payments', 'Taxes', 'Notes'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {tab}
                          {activeTab === tab && (
                            <motion.div 
                              layoutId="activeTabVendor"
                              className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" 
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="p-6 min-h-[260px]">
                      <AnimatePresence mode="wait">
                        {activeTab === 'General' && (
                          <motion.div 
                            key="general-tab"
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                          >
                            <div className="space-y-6">
                              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <ShieldCheck className="text-emerald-500" size={18} />
                                  <h4 className="text-sm font-bold text-slate-800">Status & Classification</h4>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vendor Status</label>
                                  <select 
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                  >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex gap-4">
                              <Info className="text-emerald-500 shrink-0" size={20} />
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-emerald-900">Pro Tip</p>
                                <p className="text-xs text-emerald-700/70 font-medium leading-relaxed">
                                  Use categories to group vendors. This helps in generating detailed expense reports and managing supplier relationships efficiently.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'Address' && (
                          <motion.div 
                            key="address-tab"
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-12"
                          >
                            <div className="space-y-4">
                              <label className="text-xs font-bold text-slate-900 block flex items-center gap-2">
                                <MapPin size={14} className="text-slate-400" />
                                Billing Address
                              </label>
                              <div className="space-y-2">
                                <input 
                                  type="text"
                                  placeholder="Street Address"
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none shadow-inner"
                                  value={formData.billingAddress.line1}
                                  onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, line1: e.target.value}})}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input 
                                    type="text"
                                    placeholder="City"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none shadow-inner"
                                    value={formData.billingAddress.city}
                                    onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, city: e.target.value}})}
                                  />
                                  <input 
                                    type="text"
                                    placeholder="State"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none shadow-inner"
                                    value={formData.billingAddress.state}
                                    onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, state: e.target.value}})}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <input 
                                    type="text"
                                    placeholder="ZIP"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none shadow-inner"
                                    value={formData.billingAddress.zip}
                                    onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, zip: e.target.value}})}
                                  />
                                  <input 
                                    type="text"
                                    placeholder="Country"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none shadow-inner"
                                    value={formData.billingAddress.country}
                                    onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, country: e.target.value}})}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                  <Globe size={14} className="text-slate-400" />
                                  Shipping Address
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                   <div className={cn(
                                     "w-4 h-4 rounded border transition-all flex items-center justify-center",
                                     formData.billingSameAsShipping ? "bg-emerald-500 border-emerald-500 shadow-sm" : "border-slate-300 group-hover:border-slate-400"
                                   )}>
                                     <input 
                                       type="checkbox" 
                                       className="sr-only" 
                                       checked={formData.billingSameAsShipping}
                                       onChange={(e) => setFormData({...formData, billingSameAsShipping: e.target.checked})}
                                     />
                                     {formData.billingSameAsShipping && <CheckCircle2 size={10} className="text-white" />}
                                   </div>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Same as billing</span>
                                </label>
                              </div>
                              <div className={cn("space-y-2 transition-all", formData.billingSameAsShipping && "opacity-40 pointer-events-none")}>
                                <input 
                                  type="text"
                                  placeholder="Street Address"
                                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none shadow-inner"
                                  value={formData.shippingAddress.line1}
                                  onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, line1: e.target.value}})}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input 
                                    type="text"
                                    placeholder="City"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none shadow-inner"
                                    value={formData.shippingAddress.city}
                                    onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, city: e.target.value}})}
                                  />
                                  <input 
                                    type="text"
                                    placeholder="State"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none shadow-inner"
                                    value={formData.shippingAddress.state}
                                    onChange={(e) => setFormData({...formData, shippingAddress: {...formData.shippingAddress, state: e.target.value}})}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'Payments' && (
                          <motion.div 
                            key="payments-tab"
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                            className="space-y-8"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Account Number</label>
                                  <input 
                                    type="text" 
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none shadow-sm"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Terms</label>
                                  <div className="relative">
                                    <select 
                                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold appearance-none outline-none focus:border-emerald-500 shadow-sm"
                                      value={formData.terms}
                                      onChange={(e) => setFormData({...formData, terms: e.target.value})}
                                    >
                                      {PAYMENT_TERMS.map(term => <option key={term} value={term}>{term}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Credit Limit</label>
                                  <div className="relative group">
                                    <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                      type="number" 
                                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none shadow-sm"
                                      value={formData.creditLimit}
                                      onChange={(e) => setFormData({...formData, creditLimit: e.target.value})}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Opening Balance</label>
                                  <div className="relative group">
                                    <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                      type="number" 
                                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none shadow-sm"
                                      value={formData.openingBalance}
                                      onChange={(e) => setFormData({...formData, openingBalance: e.target.value})}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">As of Date</label>
                                  <div className="relative group">
                                    <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                      type="date" 
                                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none shadow-sm"
                                      value={formData.asOfDate}
                                      onChange={(e) => setFormData({...formData, asOfDate: e.target.value})}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Bank Details Section */}
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="text-slate-400" size={18} />
                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[10px]">Bank Information</h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Bank Name</label>
                                  <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Account Number</label>
                                  <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                                    value={formData.bankAccountNumber}
                                    onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase">Routing Number</label>
                                  <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                                    value={formData.routingNumber}
                                    onChange={(e) => setFormData({...formData, routingNumber: e.target.value})}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'Taxes' && (
                          <motion.div 
                             key="taxes-tab"
                             initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                             className="space-y-8"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tax ID / SSN / EIN</label>
                                  <div className="relative group">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={14} />
                                    <input 
                                      type="text" 
                                      placeholder="XX-XXXXXXX"
                                      className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none shadow-sm"
                                      value={formData.taxId}
                                      onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Default Tax Rate (%)</label>
                                  <input 
                                    type="number" 
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none shadow-sm"
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData({...formData, taxRate: e.target.value})}
                                  />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer group p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all">
                                   <div className={cn(
                                     "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                                     formData.track1099 ? "bg-emerald-500 border-emerald-500 shadow-sm" : "border-slate-300"
                                   )}>
                                     <input 
                                       type="checkbox" 
                                       className="sr-only" 
                                       checked={formData.track1099}
                                       onChange={(e) => setFormData({...formData, track1099: e.target.checked})}
                                     />
                                     {formData.track1099 && <CheckCircle2 size={12} className="text-white" />}
                                   </div>
                                   <span className="text-sm font-bold text-slate-700">Track payments for 1099</span>
                                </label>
                              </div>

                              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100/50 flex gap-4">
                                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-amber-900">Accountancy Compliance</p>
                                  <p className="text-xs text-amber-600/80 font-medium leading-relaxed">Tax identification is required for year-end reporting. Businesses that pay an independent contractor $600 or more during a tax year are generally required to report such payments to the IRS.</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'Notes' && (
                          <motion.div 
                             key="notes-tab"
                             initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                             className="grid grid-cols-1 md:grid-cols-2 gap-8"
                          >
                            <div className="space-y-4">
                              <label className="text-xs font-bold text-slate-900 block flex items-center gap-2">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                Internal Notes (Private)
                              </label>
                              <textarea 
                                rows={6} 
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:border-emerald-500 outline-none transition-all resize-none shadow-inner"
                                placeholder="Add private information about this vendor..."
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                              />
                            </div>
                            <div className="space-y-4">
                              <label className="text-xs font-bold text-slate-900 block flex items-center gap-2">
                                <FileText size={14} className="text-blue-500" />
                                Public Notes (Visible to Vendor)
                              </label>
                              <textarea 
                                rows={6} 
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:border-emerald-500 outline-none transition-all resize-none shadow-inner"
                                placeholder="These notes may appear on purchase orders or payments..."
                                value={formData.publicNotes}
                                onChange={(e) => setFormData({...formData, publicNotes: e.target.value})}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <button 
                onClick={handleClose}
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                 <button 
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 border border-slate-200 rounded-xl hover:bg-white transition-all shadow-sm disabled:opacity-50"
                 >
                  Save and new
                 </button>
                 <button 
                  onClick={handleSave}
                  disabled={submitting}
                  className="px-10 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Vendor'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </ModalPortal>
  )
}
