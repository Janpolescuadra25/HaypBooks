'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Edit2, User, Mail, Phone, MapPin, AlertCircle,
  Loader2, FileText, CreditCard, DollarSign, TrendingUp, X,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'

interface RecentInvoice {
  id: string
  invoiceNumber: string
  date: string | null
  total: number
  balance: number
  status: string
}

interface RecentPayment {
  id: string
  referenceNumber: string | null
  paymentDate: string | null
  amount: number
}

interface CustomerDetail {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  status: 'ACTIVE' | 'INACTIVE'
  groupId?: string | null
  groupName?: string | null
  paymentTermId?: string | null
  paymentTermName?: string | null
  creditLimit?: number | null
  openBalance: number
  totalRevenue: number
  invoiceCount: number
  openInvoiceCount: number
  recentInvoices: RecentInvoice[]
  recentPayments: RecentPayment[]
}

interface PaymentTerm {
  id: string
  name: string
  dueDays: number
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  PARTIAL: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  OVERDUE: 'bg-red-100 text-red-700',
  VOIDED: 'bg-gray-100 text-gray-500',
}

function fmt(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CustomerDetailPage({ customerId }: { customerId: string }) {
  const router = useRouter()
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([])

  const fmtCurrency = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchCustomer = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers/${customerId}`)
      setCustomer(data)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load customer')
    } finally {
      setLoading(false)
    }
  }, [companyId, customerId])

  const fetchPaymentTerms = useCallback(async () => {
    if (!companyId) return
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/payment-terms`)
      setPaymentTerms(Array.isArray(data) ? data : [])
    } catch { /* not critical */ }
  }, [companyId])

  useEffect(() => {
    fetchCustomer()
    fetchPaymentTerms()
  }, [fetchCustomer, fetchPaymentTerms])

  if (cidLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading customer…</span>
      </div>
    )
  }

  if (cidError || error) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{cidError || error}</p>
          </div>
        </div>
        <button onClick={() => router.back()} className="mt-4 flex items-center gap-1 text-sm text-emerald-600 hover:underline">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    )
  }

  if (!customer) return null

  const addressLine = [customer.address, customer.city, customer.state, customer.zip, customer.country]
    .filter(Boolean).join(', ')

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/sales/customers')}
            className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">{customer.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                customer.status === 'INACTIVE' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {customer.status === 'INACTIVE' ? 'Inactive' : 'Active'}
              </span>
              {customer.groupName && (
                <span className="text-xs text-emerald-600/60">{customer.groupName}</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
          <Edit2 size={14} /> Edit
        </button>
      </div>

      {/* Financial summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg"><DollarSign size={15} className="text-emerald-600" /></div>
            <span className="text-xs text-emerald-600/70">Open Balance</span>
          </div>
          <p className="text-xl font-bold text-emerald-900 tabular-nums">{fmtCurrency(customer.openBalance)}</p>
          {customer.openInvoiceCount > 0 && (
            <p className="text-xs text-emerald-500 mt-0.5">{customer.openInvoiceCount} open invoice{customer.openInvoiceCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-50 rounded-lg"><TrendingUp size={15} className="text-blue-600" /></div>
            <span className="text-xs text-emerald-600/70">Total Revenue</span>
          </div>
          <p className="text-xl font-bold text-emerald-900 tabular-nums">{fmtCurrency(customer.totalRevenue)}</p>
          <p className="text-xs text-emerald-500 mt-0.5">{customer.invoiceCount} invoice{customer.invoiceCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-50 rounded-lg"><CreditCard size={15} className="text-amber-600" /></div>
            <span className="text-xs text-emerald-600/70">Credit Limit</span>
          </div>
          <p className="text-xl font-bold text-emerald-900 tabular-nums">
            {customer.creditLimit != null ? fmtCurrency(customer.creditLimit) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-50 rounded-lg"><FileText size={15} className="text-purple-600" /></div>
            <span className="text-xs text-emerald-600/70">Payment Terms</span>
          </div>
          <p className="text-lg font-bold text-emerald-900">{customer.paymentTermName ?? '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contact info */}
        <div className="bg-white rounded-xl border border-emerald-100 p-5">
          <h2 className="text-sm font-semibold text-emerald-800 mb-4 flex items-center gap-2">
            <User size={15} /> Contact Information
          </h2>
          <div className="space-y-3 text-sm">
            {customer.email && (
              <div className="flex items-center gap-3 text-emerald-700">
                <Mail size={14} className="text-emerald-400 shrink-0" />
                <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3 text-emerald-700">
                <Phone size={14} className="text-emerald-400 shrink-0" />
                <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
              </div>
            )}
            {addressLine && (
              <div className="flex items-start gap-3 text-emerald-700">
                <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{addressLine}</span>
              </div>
            )}
            {!customer.email && !customer.phone && !addressLine && (
              <p className="text-emerald-400 text-xs">No contact information</p>
            )}
          </div>
        </div>

        {/* Recent invoices */}
        <div className="bg-white rounded-xl border border-emerald-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
              <FileText size={15} /> Recent Invoices
            </h2>
            <button
              onClick={() => router.push(`/sales/invoices?customerId=${customer.id}`)}
              className="text-xs text-emerald-600 hover:underline">
              View all →
            </button>
          </div>
          {customer.recentInvoices.length === 0 ? (
            <p className="text-xs text-emerald-400">No invoices yet</p>
          ) : (
            <div className="space-y-2">
              {customer.recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between text-sm">
                  <div>
                    <button
                      onClick={() => router.push(`/sales/invoices/${inv.id}`)}
                      className="font-medium text-emerald-800 hover:underline text-sm">
                      {inv.invoiceNumber}
                    </button>
                    <span className="text-emerald-400 text-xs ml-2">{fmt(inv.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                      STATUS_COLORS[inv.status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-600'
                    }`}>{inv.status}</span>
                    <span className="tabular-nums font-semibold text-emerald-800 text-xs">{fmtCurrency(inv.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent payments */}
      {customer.recentPayments.length > 0 && (
        <div className="bg-white rounded-xl border border-emerald-100 p-5">
          <h2 className="text-sm font-semibold text-emerald-800 mb-4 flex items-center gap-2">
            <CreditCard size={15} /> Recent Payments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-50">
                  <th className="text-left py-2 pr-4 text-xs text-emerald-600/60 font-medium">Reference</th>
                  <th className="text-left py-2 pr-4 text-xs text-emerald-600/60 font-medium">Date</th>
                  <th className="text-right py-2 text-xs text-emerald-600/60 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {customer.recentPayments.map(p => (
                  <tr key={p.id} className="border-t border-emerald-50">
                    <td className="py-2 pr-4 text-emerald-700">{p.referenceNumber ?? '—'}</td>
                    <td className="py-2 pr-4 text-emerald-600/70 text-xs">{fmt(p.paymentDate)}</td>
                    <td className="py-2 text-right tabular-nums font-semibold text-emerald-800">{fmtCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && customer && (
        <CustomerEditModal
          companyId={companyId!}
          customer={customer}
          paymentTerms={paymentTerms}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchCustomer() }}
        />
      )}
    </div>
  )
}

function CustomerEditModal({ companyId, customer, paymentTerms, onClose, onSaved }: {
  companyId: string
  customer: CustomerDetail
  paymentTerms: PaymentTerm[]
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const [form, setForm] = useState({
    name: customer.name ?? '',
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    address: customer.address ?? '',
    city: customer.city ?? '',
    state: customer.state ?? '',
    zip: customer.zip ?? '',
    country: customer.country ?? 'US',
    paymentTermId: customer.paymentTermId ?? '',
    creditLimit: customer.creditLimit != null ? String(customer.creditLimit) : '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError('')
    try {
      await apiClient.put(`/companies/${companyId}/ar/customers/${customer.id}`, {
        displayName: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        zip: form.zip.trim() || undefined,
        country: form.country.trim() || undefined,
        paymentTermId: form.paymentTermId || undefined,
        creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined,
      })
      toast.success('Customer updated')
      onSaved()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save customer')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-emerald-900">Edit Customer</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Street Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">State</label>
              <input value={form.state} onChange={e => set('state', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">ZIP</label>
              <input value={form.zip} onChange={e => set('zip', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Payment Terms</label>
              <select value={form.paymentTermId} onChange={e => set('paymentTermId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white">
                <option value="">— None —</option>
                {paymentTerms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Credit Limit</label>
              <input type="number" min="0" step="0.01" value={form.creditLimit} onChange={e => set('creditLimit', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-semibold">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
