'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useToast } from '@/components/ToastProvider'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { expensesService } from '@/services/expenses.service'
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
    <div className="space-y-6 text-slate-900">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Company Information</h2>
            <p className="text-sm text-slate-500">Vendor core details and default currency settings.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="vendorCompanyName" className="block text-sm font-semibold text-slate-900">Company Name *</label>
            <input
              id="vendorCompanyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="Vendor name"
            />
          </div>

          <div>
            <label htmlFor="vendorType" className="block text-sm font-semibold text-slate-900">Vendor Type</label>
            <HaypSelect
              id="vendorType"
              value={vendorType}
              onChange={setVendorType}
              options={VENDOR_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <div>
            <label htmlFor="vendorTaxId" className="block text-sm font-semibold text-slate-900">Tax ID / EIN</label>
            <input
              id="vendorTaxId"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="Tax ID"
            />
          </div>

          <div>
            <label htmlFor="vendorWebsite" className="block text-sm font-semibold text-slate-900">Website</label>
            <input
              id="vendorWebsite"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="https://"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="vendorCurrency" className="block text-sm font-semibold text-slate-900">Currency</label>
            <HaypSelect
              id="vendorCurrency"
              value={currency}
              onChange={setCurrency}
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
            <p className="text-sm text-slate-500">Primary vendor contact details used for communication.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="vendorContactName" className="block text-sm font-semibold text-slate-900">Primary Contact</label>
            <input
              id="vendorContactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="Contact name"
            />
          </div>

          <div>
            <label htmlFor="vendorPhone" className="block text-sm font-semibold text-slate-900">Phone</label>
            <input
              id="vendorPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="(123) 456-7890"
            />
          </div>

          <div>
            <label htmlFor="vendorEmail" className="block text-sm font-semibold text-slate-900">Email</label>
            <input
              id="vendorEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="email@example.com"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="vendorMobile" className="block text-sm font-semibold text-slate-900">Mobile</label>
            <input
              id="vendorMobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="(123) 456-7890"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Address</h2>
            <p className="text-sm text-slate-500">Billing address for vendor invoices and payments.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="vendorAddressLine1" className="block text-sm font-semibold text-slate-900">Street Address</label>
            <input
              id="vendorAddressLine1"
              value={billingAddress.line1}
              onChange={(e) => setBillingAddress((prev) => ({ ...prev, line1: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="Street address"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="vendorAddressCity" className="block text-sm font-semibold text-slate-900">City</label>
              <input
                id="vendorAddressCity"
                value={billingAddress.city}
                onChange={(e) => setBillingAddress((prev) => ({ ...prev, city: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                placeholder="City"
              />
            </div>
            <div>
              <label htmlFor="vendorAddressState" className="block text-sm font-semibold text-slate-900">State</label>
              <input
                id="vendorAddressState"
                value={billingAddress.state}
                onChange={(e) => setBillingAddress((prev) => ({ ...prev, state: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                placeholder="State"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="vendorAddressZip" className="block text-sm font-semibold text-slate-900">ZIP Code</label>
              <input
                id="vendorAddressZip"
                value={billingAddress.zip}
                onChange={(e) => setBillingAddress((prev) => ({ ...prev, zip: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                placeholder="ZIP"
              />
            </div>
            <div>
              <label htmlFor="vendorAddressCountry" className="block text-sm font-semibold text-slate-900">Country</label>
              <input
                id="vendorAddressCountry"
                value={billingAddress.country}
                onChange={(e) => setBillingAddress((prev) => ({ ...prev, country: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                placeholder="Country"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Financial Details</h2>
            <p className="text-sm text-slate-500">Default payment terms and vendor credit settings.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="vendorPaymentTerms" className="block text-sm font-semibold text-slate-900">Payment Terms</label>
            <HaypSelect
              id="vendorPaymentTerms"
              value={paymentTerms}
              onChange={setPaymentTerms}
              options={PAYMENT_TERMS.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <div>
            <label htmlFor="vendorCreditLimit" className="block text-sm font-semibold text-slate-900">Credit Limit</label>
            <input
              id="vendorCreditLimit"
              type="number"
              min={0}
              value={creditLimit}
              onChange={(e) => setCreditLimit(Number(e.target.value))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="vendorOpeningBalance" className="block text-sm font-semibold text-slate-900">Opening Balance</label>
            <input
              id="vendorOpeningBalance"
              type="number"
              min={0}
              value={openingBalance}
              onChange={(e) => setOpeningBalance(Number(e.target.value))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
            <p className="text-sm text-slate-500">Use internal or public notes to share vendor context.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="vendorInternalNotes" className="block text-sm font-semibold text-slate-900">Internal Notes</label>
            <textarea
              id="vendorInternalNotes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="Notes for internal users"
            />
          </div>

          <div>
            <label htmlFor="vendorPublicNotes" className="block text-sm font-semibold text-slate-900">Public Notes</label>
            <textarea
              id="vendorPublicNotes"
              value={publicNotes}
              onChange={(e) => setPublicNotes(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              placeholder="Notes visible to vendor"
            />
          </div>
        </div>
      </section>
    </div>
  )
})

export default VendorForm

