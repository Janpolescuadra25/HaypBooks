'use client'


import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Edit2, User, Mail, Phone, MapPin, AlertCircle,
  Loader2, FileText, CreditCard, DollarSign, TrendingUp, Clock, Send,
} from 'lucide-react'
import CustomerFormModal from '@/components/sales/CustomerFormModal'
import { salesService } from '@/services/sales.service'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { formatActivityValue } from '@/components/ui/ActivityLog'

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

interface ActivityEntry {
  id: string
  action: string
  changes: Record<string, any> | null
  createdAt: string
  user: { id: string; name: string | null; email: string } | null
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
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

  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'activity'>('overview')
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [activityTotal, setActivityTotal] = useState(0)
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState('')
  const [schedule, setSchedule] = useState<any>(null)
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [sendNowLoading, setSendNowLoading] = useState(false)
  const toast = useToast()

  const fmtCurrency = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const fetchCustomer = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await salesService.getArCustomer(companyId, customerId)
      setCustomer(response.data as CustomerDetail)
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
      const response = await salesService.listArPaymentTerms(companyId)
      const data = response.data
      setPaymentTerms(Array.isArray(data) ? data : [])
    } catch { /* not critical */ }
  }, [companyId])

  const loadSchedule = useCallback(async () => {
    if (!companyId || !customerId) return
    try {
      setScheduleLoading(true)
      const res = await salesService.getStatementSchedule(companyId, customerId)
      setSchedule(res.data || null)
    } catch {
      setSchedule(null)
    } finally {
      setScheduleLoading(false)
    }
  }, [companyId, customerId])

  const handleToggleSchedule = async (enabled: boolean) => {
    if (!companyId || !customerId) return
    setScheduleSaving(true)
    try {
      if (enabled) {
        const res = await salesService.upsertStatementSchedule(companyId, customerId, {
          frequency: schedule?.frequency || 'MONTHLY',
          dayOfMonth: schedule?.dayOfMonth || 1,
        })
        setSchedule(res.data)
        toast.push({ type: 'success', message: 'Statement schedule enabled' })
      } else {
        await salesService.deactivateStatementSchedule(companyId, customerId)
        setSchedule(prev => prev ? { ...prev, isActive: false } : null)
        toast.push({ type: 'success', message: 'Statement schedule disabled' })
      }
    } catch {
      toast.push({ type: 'error', message: 'Failed to update schedule' })
    } finally {
      setScheduleSaving(false)
    }
  }

  const handleUpdateSchedule = async (frequency: string, dayOfMonth: number) => {
    if (!companyId || !customerId) return
    setScheduleSaving(true)
    try {
      const res = await salesService.upsertStatementSchedule(companyId, customerId, { frequency, dayOfMonth })
      setSchedule(res.data)
      toast.push({ type: 'success', message: 'Schedule updated' })
    } catch {
      toast.push({ type: 'error', message: 'Failed to update schedule' })
    } finally {
      setScheduleSaving(false)
    }
  }

  const handleSendNow = async () => {
    if (!companyId || !customerId) return
    setSendNowLoading(true)
    try {
      await salesService.sendStatementNow(companyId, customerId)
      toast.push({ type: 'success', message: 'Statement sent successfully' })
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send statement'
      toast.push({ type: 'error', message: msg })
    } finally {
      setSendNowLoading(false)
    }
  }

  const fetchActivity = useCallback(async () => {
    if (!companyId) return
    setActivityLoading(true)
    setActivityError('')
    try {
      const response = await salesService.getArCustomerActivity(companyId, customerId)
      const data = response.data
      setActivity(Array.isArray(data.data) ? data.data : [])
      setActivityTotal(data.total ?? 0)
    } catch (e: any) {
      setActivityError(e?.response?.data?.message ?? 'Failed to load activity')
    } finally {
      setActivityLoading(false)
    }
  }, [companyId, customerId])

  useEffect(() => {
    fetchCustomer()
    fetchPaymentTerms()
    loadSchedule()
  }, [fetchCustomer, fetchPaymentTerms, loadSchedule])

  useEffect(() => {
    if (activeTab === 'activity') fetchActivity()
  }, [activeTab, fetchActivity])

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
            className="p-2 rounded-lg hover:bg-slate-50 text-emerald-600 border border-slate-200 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                customer.status === 'INACTIVE' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {customer.status === 'INACTIVE' ? 'Inactive' : 'Active'}
              </span>
              {customer.groupName && (
                <span className="text-xs text-slate-400">{customer.groupName}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/sales/billing/invoices/new')}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <FileText size={14} />
            Create Invoice
          </button>

          <button
            onClick={() => router.push('/sales/collections/payments')}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <CreditCard size={14} />
            Record Payment
          </button>

          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Edit2 size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['overview', 'contacts', 'activity'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'activity' ? (
              <span className="flex items-center gap-1.5"><Clock size={13} /> Activity</span>
            ) : tab === 'contacts' ? 'Contacts' : 'Overview'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (<>
      {/* Financial summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-slate-50 rounded-lg"><DollarSign size={15} className="text-emerald-600" /></div>
            <span className="text-xs text-slate-500">Open Balance</span>
          </div>
          <p className="text-xl font-bold text-slate-900 tabular-nums">{fmtCurrency(customer.openBalance)}</p>
          {customer.openInvoiceCount > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">{customer.openInvoiceCount} open invoice{customer.openInvoiceCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-50 rounded-lg"><TrendingUp size={15} className="text-blue-600" /></div>
            <span className="text-xs text-slate-500">Total Revenue</span>
          </div>
          <p className="text-xl font-bold text-slate-900 tabular-nums">{fmtCurrency(customer.totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{customer.invoiceCount} invoice{customer.invoiceCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-50 rounded-lg"><CreditCard size={15} className="text-amber-600" /></div>
            <span className="text-xs text-slate-500">Credit Limit</span>
          </div>
          <p className="text-xl font-bold text-slate-900 tabular-nums">
            {customer.creditLimit != null ? fmtCurrency(customer.creditLimit) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-50 rounded-lg"><FileText size={15} className="text-purple-600" /></div>
            <span className="text-xs text-slate-500">Payment Terms</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{customer.paymentTermName ?? '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contact info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <User size={15} /> Contact Information
          </h2>
          <div className="space-y-3 text-sm">
            {customer.email && (
              <div className="flex items-center gap-3 text-slate-700">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3 text-slate-700">
                <Phone size={14} className="text-gray-400 shrink-0" />
                <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
              </div>
            )}
            {addressLine && (
              <div className="flex items-start gap-3 text-slate-700">
                <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{addressLine}</span>
              </div>
            )}
            {!customer.email && !customer.phone && !addressLine && (
              <p className="text-gray-400 text-xs">No contact information</p>
            )}
          </div>
        </div>

        {/* Recent invoices */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={15} /> Recent Invoices
            </h2>
            <button
              onClick={() => router.push('/sales/billing/invoices')}
              className="text-xs text-emerald-600 hover:underline">
              View all →
            </button>
          </div>
          {customer.recentInvoices.length === 0 ? (
            <p className="text-xs text-gray-400">No invoices yet</p>
          ) : (
            <div className="space-y-2">
              {customer.recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between text-sm">
                  <div>
                    <button
                      onClick={() => router.push(`/sales/billing/invoices/${inv.id}`)}
                      className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline text-sm">
                      {inv.invoiceNumber}
                    </button>
                    <span className="text-gray-400 text-xs ml-2">{fmt(inv.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                      STATUS_COLORS[inv.status as keyof typeof STATUS_COLORS] ?? 'bg-gray-100 text-gray-600'
                    }`}>{inv.status}</span>
                    <span className="tabular-nums font-semibold text-slate-800 text-xs">{fmtCurrency(inv.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent payments */}
      {customer.recentPayments.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <CreditCard size={15} /> Recent Payments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">Reference</th>
                  <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">Date</th>
                  <th className="text-right py-2 text-xs text-gray-500 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {customer.recentPayments.map(p => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4 text-slate-700">{p.referenceNumber ?? '—'}</td>
                    <td className="py-2 pr-4 text-slate-500 text-xs">{fmt(p.paymentDate)}</td>
                    <td className="py-2 text-right tabular-nums font-semibold text-slate-800">{fmtCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400">No payments yet</p>
      )}

      {/* Statement Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
            <Mail size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Statement Schedule</h3>
            <p className="text-xs text-slate-500 mt-0.5">Automatically email account statements to this customer</p>
          </div>
        </div>

        {scheduleLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            Loading schedule...
          </div>
        ) : (
          <>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${schedule?.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${schedule?.isActive ? 'left-5' : 'left-0.5'}`} />
              </div>
              <input type="checkbox" checked={!!schedule?.isActive} onChange={e => handleToggleSchedule(e.target.checked)} disabled={scheduleSaving} className="sr-only" />
              <span className="text-sm font-medium text-gray-700">Enable scheduled statements</span>
            </label>

            {schedule?.isActive && (
              <div className="pl-4 border-l-2 border-emerald-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Frequency</label>
                    <select
                      value={schedule.frequency}
                      onChange={e => handleUpdateSchedule(e.target.value, schedule.dayOfMonth)}
                      disabled={scheduleSaving}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                    </select>
                  </div>
                  {(schedule.frequency === 'MONTHLY' || schedule.frequency === 'QUARTERLY') && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Day of Month</label>
                      <select
                        value={schedule.dayOfMonth}
                        onChange={e => handleUpdateSchedule(schedule.frequency, parseInt(e.target.value))}
                        disabled={scheduleSaving}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {schedule.lastSentAt && (
                  <p className="text-xs text-slate-400">
                    Last sent: {new Date(schedule.lastSentAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {schedule?.isActive && (
              <button
                onClick={handleSendNow}
                disabled={sendNowLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                {sendNowLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Send Statement Now
              </button>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && customer && (
        <CustomerFormModal
          companyId={companyId!}
          customer={customer}
          paymentTerms={paymentTerms}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchCustomer() }}
        />
      )}
    </>)}

      {/* Activity Tab */}
      {activeTab === 'contacts' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Contacts</h2>
          <p className="text-sm text-gray-400">Contact management will be added here.</p>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
            <Clock size={15} /> Activity Log
            {activityTotal > 0 && <span className="ml-auto text-xs text-gray-400">{activityTotal} event{activityTotal !== 1 ? 's' : ''}</span>}
          </h2>

          {activityLoading && (
            <div className="flex items-center gap-2 py-8 justify-center text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading activity…</span>
            </div>
          )}

          {!activityLoading && activityError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={14} /> {activityError}
            </div>
          )}

          {!activityLoading && !activityError && activity.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Clock size={28} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No activity recorded yet</p>
              <p className="text-xs mt-1 text-gray-300">Actions like creating, editing, or deleting this customer will appear here</p>
            </div>
          )}

          {!activityLoading && activity.length > 0 && (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-100" />
              <div className="space-y-4">
                {activity.map((entry, i) => {
                  const isCreate = entry.action === 'CREATE'
                  const isDelete = entry.action === 'DELETE'
                  const dotColor = isCreate
                    ? 'bg-emerald-500 ring-emerald-100'
                    : isDelete
                      ? 'bg-red-400 ring-red-100'
                      : 'bg-blue-400 ring-blue-100'
                  const label = isCreate ? 'Created' : isDelete ? 'Deleted' : 'Updated'
                  const labelColor = isCreate
                    ? 'text-emerald-700 bg-emerald-50'
                    : isDelete
                      ? 'text-red-600 bg-red-50'
                      : 'text-blue-700 bg-blue-50'
                  const userName = entry.user?.name || entry.user?.email || 'Unknown user'
                  const changes = entry.changes && typeof entry.changes === 'object' ? entry.changes as Record<string, any> : null
                  const changeKeys = changes ? Object.keys(changes) : []

                  return (
                    <div key={entry.id} className="relative flex gap-4 pl-1">
                      {/* Dot */}
                      <div className={`relative z-10 mt-1 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ring-4 ${dotColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      {/* Content */}
                      <div className="flex-1 pb-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${labelColor}`}>{label}</span>
                            <span className="text-sm text-gray-700">by <span className="font-medium">{userName}</span></span>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{fmt(entry.createdAt)}</span>
                        </div>
                        {changeKeys.length > 0 && (
                          <div className="mt-2 rounded-lg border border-gray-100 overflow-hidden text-xs">
                            <table className="w-full">
                              <tbody>
                                {changeKeys.map(k => (
                                  <tr key={k} className="border-t border-gray-100 first:border-0">
                                    <td className="px-3 py-1.5 text-gray-400 font-medium w-32 bg-gray-50">{k}</td>
                                    <td className="px-3 py-1.5 text-gray-700">
                                      {formatActivityValue(changes![k])}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

