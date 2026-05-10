'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useToast } from '@/components/ToastProvider'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
import ActivityLog from '@/components/ui/ActivityLog'
import { useActivityLog } from '@/hooks/useActivityLog'
import HaypSelect from '@/components/shared/HaypSelect'

export type VendorFormHandle = {
  save: () => Promise<void>
}

interface VendorFormProps {
  mode: 'new' | 'edit'
  vendorId?: string
  onSaved?: () => void
}

const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt']
const VENDOR_TYPES = ['Company', 'Individual']
const CURRENCIES = ['USD', 'EUR', 'PHP', 'GBP', 'AUD']

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9()+\-\s]*$/

const VendorForm = forwardRef<VendorFormHandle, VendorFormProps>(function VendorForm({ mode, vendorId, onSaved }, ref) {
  const { companyId } = useCompanyId()
  const { currency: companyCurrency } = useCompanyCurrency()
  const toast = useToast()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [status, setStatus] = useState('ACTIVE')
  const [companyName, setCompanyName] = useState('')
  const [vendorType, setVendorType] = useState('Company')
  const [taxId, setTaxId] = useState('')
  const [website, setWebsite] = useState('')
  const [currency, setCurrency] = useState(companyCurrency || 'USD')

  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [mobile, setMobile] = useState('')
  const [fax, setFax] = useState('')

  const [billingAddress, setBillingAddress] = useState({ line1: '', city: '', state: '', zip: '', country: '' })
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [creditLimit, setCreditLimit] = useState(0)
  const [openingBalance, setOpeningBalance] = useState(0)
  const [defaultExpenseAccount, setDefaultExpenseAccount] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [taxRate, setTaxRate] = useState(0)

  const [internalNotes, setInternalNotes] = useState('')
  const [publicNotes, setPublicNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')
  const { activities, loading: activityLoading, refetch: refreshActivity } = useActivityLog({
    companyId: activeTab === 'activity' ? companyId : null,
    initialFilters: { tableName: 'Vendor', recordId: vendorId },
  })

  useEffect(() => {
    if (mode !== 'edit' || !vendorId || !companyId) return
    expensesService.getVendor(companyId, vendorId)
      .then((response) => {
        const data = response.data ?? response
        setCompanyName(data.name ?? data.displayName ?? '')
        setStatus(data.status ?? 'ACTIVE')
        setVendorType(data.type ?? 'Company')
        setTaxId(data.taxId ?? '')
        setWebsite(data.website ?? '')
        setCurrency(data.currency ?? companyCurrency ?? 'USD')
        setContactName(data.contactName ?? '')
        setEmail(data.email ?? '')
        setPhone(data.phone ?? '')
        setMobile(data.mobile ?? '')
        setFax(data.fax ?? '')
        setBillingAddress({
          line1: data.billingAddress?.line1 ?? '',
          city: data.billingAddress?.city ?? '',
          state: data.billingAddress?.state ?? '',
          zip: data.billingAddress?.zip ?? '',
          country: data.billingAddress?.country ?? '',
        })
        setPaymentTerms(data.paymentTerms ?? 'Net 30')
        setCreditLimit(Number(data.creditLimit ?? 0))
        setOpeningBalance(Number(data.openingBalance ?? 0))
        setDefaultExpenseAccount(data.defaultExpenseAccount ?? '')
        setBankName(data.bankName ?? '')
        setBankAccountNumber(data.bankAccountNumber ?? '')
        setRoutingNumber(data.routingNumber ?? '')
        setTaxRate(Number(data.taxRate ?? 0))
        setInternalNotes(data.internalNotes ?? '')
        setPublicNotes(data.publicNotes ?? '')
      })
      .catch(() => toast.error('Failed to load vendor'))
  }, [mode, vendorId, companyId, companyCurrency, toast])

  const validate = useCallback(() => {
    if (!companyName.trim()) { setError('Company name is required'); return false }
    if (email && !emailPattern.test(email)) { setError('A valid email address is required'); return false }
    if (phone && !phonePattern.test(phone)) { setError('Phone number may only include digits, spaces, dashes, parentheses, and plus sign'); return false }
    if (mobile && !phonePattern.test(mobile)) { setError('Mobile number may only include digits, spaces, dashes, parentheses, and plus sign'); return false }
    setError('')
    return true
  }, [companyName, email, phone, mobile])

  const payload = useMemo(() => ({
    name: companyName,
    displayName: companyName,
    status,
    type: vendorType,
    taxId,
    website,
    currency,
    contactName,
    email,
    phone,
    mobile,
    fax,
    billingAddress,
    paymentTerms,
    creditLimit,
    openingBalance,
    defaultExpenseAccount,
    bankName,
    bankAccountNumber,
    routingNumber,
    taxRate,
    internalNotes,
    publicNotes,
  }), [companyName, status, vendorType, taxId, website, currency, contactName, email, phone, mobile, fax, billingAddress, paymentTerms, creditLimit, openingBalance, defaultExpenseAccount, bankName, bankAccountNumber, routingNumber, taxRate, internalNotes, publicNotes])

  const handleSave = useCallback(async () => {
    if (!companyId) return
    if (!validate()) return

    setSubmitting(true)
    try {
      if (mode === 'new') {
        await expensesService.createVendor(companyId, payload)
        toast.success('Vendor created')
        if (onSaved) onSaved()
        return
      }

      if (vendorId) {
        await expensesService.updateVendor(companyId, vendorId, payload)
        toast.success('Vendor updated')
        if (onSaved) onSaved()
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to save vendor')
      toast.error('Unable to save vendor')
    } finally {
      setSubmitting(false)
    }
  }, [companyId, mode, vendorId, payload, toast, validate, onSaved])

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
        {mode !== 'new' && (
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
          </div>
        )}
      </div>

      {activeTab === 'details' && (
        <div className="space-y-4 text-slate-900 pb-8">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <section>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
            <div className="w-1 h-6 bg-emerald-500 rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Company Information</h2>
          </div>
          <div className="px-4 pb-4 sm:px-5 lg:px-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="vendorCompanyName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name *</label>
                <input
                  id="vendorCompanyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  placeholder="Vendor name"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="vendorType" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor Type</label>
                  <HaypSelect
                    id="vendorType"
                    value={vendorType}
                    onChange={setVendorType}
                    options={VENDOR_TYPES.map((t) => ({ value: t, label: t }))}
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vendorTaxId" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tax ID / EIN</label>
                  <input
                    id="vendorTaxId"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    placeholder="Tax ID"
                  />
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <label htmlFor="vendorCurrency" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currency</label>
                <HaypSelect
                  id="vendorCurrency"
                  value={currency}
                  onChange={setCurrency}
                  options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
            <div className="w-1 h-6 bg-emerald-500 rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Contact Information</h2>
          </div>
          <div className="px-4 pb-4 sm:px-5 lg:px-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="vendorContactName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Contact</label>
                <input
                  id="vendorContactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  placeholder="Contact name"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="vendorPhone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                  <input
                    id="vendorPhone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    placeholder="(123) 456-7890"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vendorEmail" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                  <input
                    id="vendorEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="vendorWebsite" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website</label>
                  <input
                    id="vendorWebsite"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    placeholder="https://"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vendorMobile" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile</label>
                  <input
                    id="vendorMobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
            <div className="w-1 h-6 bg-emerald-500 rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Address</h2>
          </div>
          <div className="px-4 pb-4 sm:px-5 lg:px-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="vendorAddressLine1" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
                <input
                  id="vendorAddressLine1"
                  value={billingAddress.line1}
                  onChange={(e) => setBillingAddress((prev) => ({ ...prev, line1: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  placeholder="Street address"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="vendorAddressCity" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
                  <input
                    id="vendorAddressCity"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    placeholder="City"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="vendorAddressState" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</label>
                  <input
                    id="vendorAddressState"
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, state: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="vendorAddressZip" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">ZIP Code</label>
                  <input
                    id="vendorAddressZip"
                    value={billingAddress.zip}
                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, zip: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    placeholder="ZIP"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="vendorAddressCountry" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Country</label>
                  <input
                    id="vendorAddressCountry"
                    value={billingAddress.country}
                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, country: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
            <div className="w-1 h-6 bg-emerald-500 rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Financial Details</h2>
          </div>
          <div className="px-4 pb-4 sm:px-5 lg:px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="vendorPaymentTerms" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Terms</label>
                <HaypSelect
                  id="vendorPaymentTerms"
                  value={paymentTerms}
                  onChange={setPaymentTerms}
                  options={PAYMENT_TERMS.map((t) => ({ value: t, label: t }))}
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="vendorCreditLimit" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credit Limit</label>
                <input
                  id="vendorCreditLimit"
                  type="number"
                  min={0}
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-4 space-y-1.5 max-w-sm">
              <label htmlFor="vendorOpeningBalance" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opening Balance</label>
              <input
                id="vendorOpeningBalance"
                type="number"
                min={0}
                value={openingBalance}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 sm:px-5 lg:px-6">
            <div className="w-1 h-6 bg-slate-300 rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Notes</h2>
          </div>
          <div className="px-4 pb-4 sm:px-5 lg:px-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="vendorInternalNotes" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal Notes (Private)</label>
                <textarea
                  id="vendorInternalNotes"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  placeholder="Notes for internal users"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="vendorPublicNotes" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Public Notes (Visible to Vendor)</label>
                <textarea
                  id="vendorPublicNotes"
                  value={publicNotes}
                  onChange={(e) => setPublicNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                  placeholder="Notes visible to vendor"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )}

      {activeTab === 'activity' && (
        <div className="max-w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <ActivityLog
            activities={activities}
            loading={activityLoading}
            onRefresh={refreshActivity}
          />
        </div>
      )}
    </div>
  )
})

export default VendorForm
