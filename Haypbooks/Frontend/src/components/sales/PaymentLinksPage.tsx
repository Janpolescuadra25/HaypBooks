'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import apiClient from '@/lib/api-client'
import { Plus, X, AlertCircle, Loader2, RefreshCw, Copy, Clock } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypColumn } from '@/components/shared/HaypDataTable.types'

interface PaymentLinkRow {
  id: string
  linkId: string
  description: string
  amount: number
  currency?: string
  createdDate: string
  expiryDate: string
  views: number
  url: string
  status: string
}

interface ActivityLog {
  id: string
  action: string
  recordId: string
  createdAt: string
  changes?: Record<string, any> | null
  user?: { name?: string | null; email?: string | null } | null
}

interface PaymentLinkForm {
  description: string
  amount: string
  invoiceId: string
  expiryDate: string
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'text-emerald-700',
  Paid: 'text-sky-700',
  Expired: 'text-rose-700',
}

const defaultFormData: PaymentLinkForm = {
  description: '',
  amount: '',
  invoiceId: '',
  expiryDate: '',
}

export default function PaymentLinksPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<PaymentLinkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<PaymentLinkForm>(defaultFormData)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const response = await salesService.listPaymentLinks(companyId)
      const data = response.data
      setItems(Array.isArray(data) ? data : data?.items ?? data?.records ?? [])
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load payment links')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  const loadActivity = useCallback(async () => {
    if (!companyId) return
    setActivityLoading(true)
    try {
      const response = await apiClient.get(`/companies/${companyId}/integrations/audit-logs`, {
        params: { tableName: 'PaymentLink', limit: 8 },
      })
      const data = response.data
      setActivity(Array.isArray(data) ? data : data?.data ?? data?.items ?? [])
    } catch {
      setActivity([])
    } finally {
      setActivityLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchItems() }, [fetchItems])
  useEffect(() => { loadActivity() }, [loadActivity])

  const describeActivity = useCallback((entry: ActivityLog) => {
    const linkId = entry.changes?.linkId ?? entry.recordId
    switch (entry.action) {
      case 'CREATE': return `Created payment link ${linkId}`
      case 'UPDATE': return `Updated payment link ${linkId}`
      case 'DELETE': return `Deleted payment link ${linkId}`
      default: return `${entry.action} payment link ${linkId}`
    }
  }, [])

  const createLink = useCallback(async () => {
    if (!companyId) return
    const amount = Number(form.amount)
    if (!form.invoiceId && (!Number.isFinite(amount) || amount <= 0)) {
      toast.error('Enter an amount greater than zero or reference an invoice')
      return
    }

    setSaving(true)
    try {
      await salesService.createPaymentLink(companyId, {
        description: form.description || undefined,
        amount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
        invoiceId: form.invoiceId || undefined,
        expiryDate: form.expiryDate || undefined,
      })
      toast.success('Payment link created')
      setShowCreate(false)
      setForm(defaultFormData)
      fetchItems()
      loadActivity()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to create payment link')
    } finally {
      setSaving(false)
    }
  }, [companyId, form, fetchItems, loadActivity, toast])

  const copyLink = useCallback(async (url: string) => {
    const absolute = url.startsWith('http') ? url : `${window.location.origin}${url}`
    await navigator.clipboard.writeText(absolute)
    toast.success('Link copied')
  }, [toast])

  const columns = useMemo<HaypColumn<PaymentLinkRow>[]>(() => [
    { id: 'linkId', header: 'Link ID', accessorKey: 'linkId', size: 140 },
    { id: 'description', header: 'Description', accessorKey: 'description', size: 200 },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      size: 110,
      align: 'right',
      render: (_value, row) => formatCurrency(Number(row.amount), currency),
    },
    { id: 'createdDate', header: 'Created Date', accessorKey: 'createdDate', size: 140 },
    { id: 'expiryDate', header: 'Expiry Date', accessorKey: 'expiryDate', size: 140 },
    { id: 'views', header: 'Views', accessorKey: 'views', size: 90, align: 'right' },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 110,
      render: (_value, row) => (
        <span className={`text-xs font-semibold ${STATUS_STYLES[row.status] ?? 'text-slate-700'}`}>
          {row.status}
        </span>
      ),
    },
  ], [currency])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Copy link',
      icon: <Copy size={14} />,
      onClick: (_rowId, row) => { void copyLink(row.url) },
    },
  ], [copyLink])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={fetchItems} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
        <RefreshCw size={14} /> Refresh
      </button>
      <button type="button" onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
        <Plus size={14} /> Create Link
      </button>
      <button type="button" onClick={() => setHelpOpen((cur) => !cur)} aria-label="Toggle payment links help" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">
        ?
      </button>
    </div>
  )

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading payment links…</span>
      </div>
    )
  }

  if (cidError) {
    return <div className="p-6 text-red-600">{cidError}</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <HaypDataTable
        data={items}
        columns={columns}
        tableId="payment-links"
        title="Payment Links"
        description="Create and share links for customer payments."
        loading={loading}
        searchPlaceholder="Search payment links..."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        headerActions={headerActions}
        actions={actions}
        onRefresh={fetchItems}
        emptyTitle="No payment links found"
        emptySubtitle="Create a payment link to begin collecting payments"
      />

      {helpOpen && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Payment Links Help</h2>
              <p className="text-sm text-slate-600 mt-2">Use payment links to collect customer payments by sharing a secure URL. Create a link for an invoice or a one-time payment amount.</p>
            </div>
            <button type="button" onClick={() => setHelpOpen(false)} aria-label="Close help" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-900">
            <Clock size={16} />
            <h2 className="text-sm font-semibold">Recent activity</h2>
          </div>
          <span className="text-xs text-slate-500">{activity.length} events</span>
        </div>
        {activityLoading ? (
          <div className="py-8 flex justify-center"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
        ) : activity.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">No payment link activity found.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {activity.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{describeActivity(entry)}</p>
                <p className="text-xs text-slate-500 mt-1">{entry.user?.name ?? entry.user?.email ?? 'System'} · {new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-slate-900">Create Payment Link</h2>
              <button onClick={() => setShowCreate(false)} aria-label="Close form" className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  id="description"
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label htmlFor="invoiceId" className="block text-sm font-medium text-slate-700 mb-1">Invoice ID</label>
                  <input
                    id="invoiceId"
                    type="text"
                    value={form.invoiceId}
                    onChange={(e) => setForm((prev) => ({ ...prev, invoiceId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                <input
                  id="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-slate-50">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
              <button type="button" onClick={createLink} disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : 'Create Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
