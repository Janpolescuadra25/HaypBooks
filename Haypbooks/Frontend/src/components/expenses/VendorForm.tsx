'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useToast } from '@/components/ToastProvider'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'

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
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to save vendor')
      toast.error('Unable to save vendor')
    } finally {
      setSubmitting(false)
    }
  }, [companyId, mode, vendorId, payload, toast, validate, onSaved])

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

  return (
    <div className="space-y-6 text-slate-900">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="pb-4 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Company Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Vendor name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vendor Type</label>
            <select
              value={vendorType}
              onChange={(e) => setVendorType(e.target.value)}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {VENDOR_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID / EIN</label>
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Tax ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="https://"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="pb-4 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Contact Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Primary Contact</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="(123) 456-7890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="(123) 456-7890"
            />
          </div>
        </div>
      </section>

      <section className="pb-4 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
            <input
              value={billingAddress.line1}
              onChange={(e) => setBillingAddress((prev) => ({ ...prev, line1: e.target.value }))}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input
                value={billingAddress.city}
                onChange={(e) => setBillingAddress((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <input
                value={billingAddress.state}
                onChange={(e) => setBillingAddress((prev) => ({ ...prev, state: e.target.value }))}
                className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="State"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
              <input
                value={billingAddress.zip}
                onChange={(e) => setBillingAddress((prev) => ({ ...prev, zip: e.target.value }))}
                className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="ZIP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <input
                value={billingAddress.country}
                onChange={(e) => setBillingAddress((prev) => ({ ...prev, country: e.target.value }))}
                className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Country"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-4 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Financial Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {PAYMENT_TERMS.map((term) => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Credit Limit</label>
            <input
              type="number"
              min={0}
              value={creditLimit}
              onChange={(e) => setCreditLimit(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="0.00"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Opening Balance</label>
            <input
              type="number"
              min={0}
              value={openingBalance}
              onChange={(e) => setOpeningBalance(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Notes</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Notes for internal users"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Public Notes</label>
            <textarea
              value={publicNotes}
              onChange={(e) => setPublicNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-none px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Notes visible to vendor"
            />
          </div>
        </div>
      </section>
    </div>
  )
})

export default VendorForm
