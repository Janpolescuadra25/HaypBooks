'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Loader2, X } from 'lucide-react'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { expensesService } from '@/services/expenses.service'

interface VendorFormProps {
  mode: 'new' | 'edit'
  vendorId?: string
}

const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt']
const VENDOR_TYPES = ['Company', 'Individual']
const CURRENCIES = ['USD', 'EUR', 'PHP', 'GBP', 'AUD']
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE']

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9()+\-\s]*$/

export default function VendorForm({ mode, vendorId }: VendorFormProps) {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency: companyCurrency } = useCompanyCurrency()
  const toast = useToast()

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [status, setStatus] = useState('ACTIVE')
  const [companyName, setCompanyName] = useState('')
  const [vendorType, setVendorType] = useState('Company')
  const [vendorCode, setVendorCode] = useState('')
  const [taxId, setTaxId] = useState('')
  const [website, setWebsite] = useState('')
  const [currency, setCurrency] = useState(companyCurrency || 'USD')

  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [mobile, setMobile] = useState('')
  const [fax, setFax] = useState('')

  const [billingAddress, setBillingAddress] = useState({ line1: '', city: '', state: '', zip: '', country: '' })
  const [shippingAddress, setShippingAddress] = useState({ line1: '', city: '', state: '', zip: '', country: '' })
  const [sameAsBilling, setSameAsBilling] = useState(true)

  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [creditLimit, setCreditLimit] = useState(0)
  const [defaultExpenseAccount, setDefaultExpenseAccount] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [taxRate, setTaxRate] = useState(0)

  const [internalNotes, setInternalNotes] = useState('')
  const [publicNotes, setPublicNotes] = useState('')

  useEffect(() => {
    if (sameAsBilling) {
      setShippingAddress({ ...billingAddress })
    }
  }, [sameAsBilling, billingAddress])

  useEffect(() => {
    if (mode !== 'edit' || !vendorId || !companyId) return
    setLoading(true)
    const id = vendorId
    expensesService.getVendor(companyId, id)
      .then(response => {
        const data = response.data ?? response
        setCompanyName(data.name ?? data.displayName ?? '')
        setVendorCode(data.contactId ?? data.id ?? '')
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
        setShippingAddress({
          line1: data.shippingAddress?.line1 ?? '',
          city: data.shippingAddress?.city ?? '',
          state: data.shippingAddress?.state ?? '',
          zip: data.shippingAddress?.zip ?? '',
          country: data.shippingAddress?.country ?? '',
        })
        setSameAsBilling(data.sameAsBilling ?? true)
        setPaymentTerms(data.paymentTerms ?? 'Net 30')
        setCreditLimit(Number(data.creditLimit ?? 0))
        setDefaultExpenseAccount(data.defaultExpenseAccount ?? '')
        setBankName(data.bankName ?? '')
        setBankAccountNumber(data.bankAccountNumber ?? '')
        setRoutingNumber(data.routingNumber ?? '')
        setTaxRate(Number(data.taxRate ?? 0))
        setInternalNotes(data.internalNotes ?? '')
        setPublicNotes(data.publicNotes ?? '')
      })
      .catch(() => toast.error('Failed to load vendor'))
      .finally(() => setLoading(false))
  }, [mode, vendorId, companyId, companyCurrency, toast])

  const validate = () => {
    if (!companyName.trim()) { setError('Company name is required'); return false }
    if (!contactName.trim()) { setError('Primary contact name is required'); return false }
    if (!email.trim() || !emailPattern.test(email)) { setError('A valid email address is required'); return false }
    if (phone && !phonePattern.test(phone)) { setError('Phone number may only include digits, spaces, dashes, parentheses, and plus sign'); return false }
    if (mobile && !phonePattern.test(mobile)) { setError('Mobile number may only include digits, spaces, dashes, parentheses, and plus sign'); return false }
    setError('')
    return true
  }

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
    shippingAddress: sameAsBilling ? billingAddress : shippingAddress,
    sameAsBilling,
    paymentTerms,
    creditLimit,
    defaultExpenseAccount,
    bankName,
    bankAccountNumber,
    routingNumber,
    taxRate,
    internalNotes,
    publicNotes,
  }), [companyName, status, vendorType, taxId, website, currency, contactName, email, phone, mobile, fax, billingAddress, shippingAddress, sameAsBilling, paymentTerms, creditLimit, defaultExpenseAccount, bankName, bankAccountNumber, routingNumber, taxRate, internalNotes, publicNotes])

  const clearForm = useCallback(() => {
    setStatus('ACTIVE')
    setCompanyName('')
    setVendorCode('')
    setVendorType('Company')
    setTaxId('')
    setWebsite('')
    setCurrency(companyCurrency || 'USD')
    setContactName('')
    setEmail('')
    setPhone('')
    setMobile('')
    setFax('')
    setBillingAddress({ line1: '', city: '', state: '', zip: '', country: '' })
    setShippingAddress({ line1: '', city: '', state: '', zip: '', country: '' })
    setSameAsBilling(true)
    setPaymentTerms('Net 30')
    setCreditLimit(0)
    setDefaultExpenseAccount('')
    setBankName('')
    setBankAccountNumber('')
    setRoutingNumber('')
    setTaxRate(0)
    setInternalNotes('')
    setPublicNotes('')
    setError('')
  }, [companyCurrency])

  const handleSave = async (nextRoute: 'list' | 'new') => {
    if (!companyId) return
    if (!validate()) return
    setSubmitting(true)
    try {
      if (mode === 'new') {
        await expensesService.createVendor(companyId, payload)
        toast.success('Vendor created')
        if (nextRoute === 'new') {
          clearForm()
          router.push('/expenses/vendors/new')
          return
        }
      } else if (vendorId) {
        await expensesService.updateVendor(companyId, vendorId, payload)
        toast.success('Vendor updated')
      }
      router.push('/expenses/procurement/vendors')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Unable to save vendor')
      toast.error('Unable to save vendor')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => router.push('/expenses/procurement/vendors')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700">
                <ArrowLeft size={16} /> Back to vendors
              </button>
              <div className="mt-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{mode === 'new' ? 'New Vendor' : 'Edit Vendor'}</h1>
                <p className="mt-1 text-sm text-slate-500">Manage vendor details and payment information.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="font-semibold">Status</div>
              <div>{status === 'ACTIVE' ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-40">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Company Name</label>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Vendor name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Vendor ID</label>
                  <input value={vendorCode || 'Auto-generated'} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Vendor Type</label>
                  <select value={vendorType} onChange={e => setVendorType(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {VENDOR_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Tax ID / EIN</label>
                  <input value={taxId} onChange={e => setTaxId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Tax ID" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Website</label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="https://" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {CURRENCIES.map(cur => <option key={cur} value={cur}>{cur}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Primary Contact Name</label>
                  <input value={contactName} onChange={e => setContactName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="name@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="(123) 456-7890" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Mobile</label>
                  <input value={mobile} onChange={e => setMobile(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="(123) 456-7890" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900">Fax</label>
                  <input value={fax} onChange={e => setFax(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Fax number" />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Billing Address</h2>
                  <p className="mt-1 text-sm text-slate-500">Primary address for vendor invoices.</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={sameAsBilling} onChange={e => setSameAsBilling(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  Same as billing
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Street</label>
                  <input value={billingAddress.line1} onChange={e => setBillingAddress(p => ({ ...p, line1: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Street address" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">City</label>
                  <input value={billingAddress.city} onChange={e => setBillingAddress(p => ({ ...p, city: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="City" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">State</label>
                  <input value={billingAddress.state} onChange={e => setBillingAddress(p => ({ ...p, state: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="State" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Zip</label>
                  <input value={billingAddress.zip} onChange={e => setBillingAddress(p => ({ ...p, zip: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Postal code" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900">Country</label>
                  <input value={billingAddress.country} onChange={e => setBillingAddress(p => ({ ...p, country: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" placeholder="Country" />
                </div>
              </div>
              {!sameAsBilling && (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Shipping Address</h3>
                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">Street</label>
                      <input value={shippingAddress.line1} onChange={e => setShippingAddress(p => ({ ...p, line1: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">City</label>
                      <input value={shippingAddress.city} onChange={e => setShippingAddress(p => ({ ...p, city: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">State</label>
                      <input value={shippingAddress.state} onChange={e => setShippingAddress(p => ({ ...p, state: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">Zip</label>
                      <input value={shippingAddress.zip} onChange={e => setShippingAddress(p => ({ ...p, zip: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-900">Country</label>
                      <input value={shippingAddress.country} onChange={e => setShippingAddress(p => ({ ...p, country: e.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Financial Information</h2>
              <div className="grid gap-4 mt-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Payment Terms</label>
                  <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none">
                    {PAYMENT_TERMS.map(term => <option key={term} value={term}>{term}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Credit Limit</label>
                  <input type="number" min="0" value={creditLimit} onChange={e => setCreditLimit(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Default Expense Account</label>
                  <input value={defaultExpenseAccount} onChange={e => setDefaultExpenseAccount(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Bank Name</label>
                  <input value={bankName} onChange={e => setBankName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Bank Account Number</label>
                  <input type="password" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Routing Number</label>
                  <input type="password" value={routingNumber} onChange={e => setRoutingNumber(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Tax Rate %</label>
                  <input type="number" min="0" max="100" step="0.1" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
              <div className="grid gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Internal Notes</label>
                  <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900">Notes (visible to vendor)</label>
                  <textarea value={publicNotes} onChange={e => setPublicNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgb(15,23,42/0.08)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-end">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600"><span>Currency</span><span>{currency}</span></div>
                <div className="flex items-center justify-between text-sm text-slate-600 mt-2"><span>Payment Terms</span><span>{paymentTerms}</span></div>
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-base font-semibold text-slate-900"><span>Status</span><span>{status === 'ACTIVE' ? 'Active' : 'Inactive'}</span></div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900">Notes</label>
                <textarea value={publicNotes} onChange={e => setPublicNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button type="button" onClick={() => router.push('/expenses/procurement/vendors')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <X size={16} /> Cancel
              </button>
              <button type="button" onClick={() => handleSave('list')} disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
              </button>
              {mode === 'new' && (
                <button type="button" onClick={() => handleSave('new')} disabled={submitting} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus size={16} /> Save & New
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}
