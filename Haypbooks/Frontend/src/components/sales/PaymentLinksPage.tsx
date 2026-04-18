'use client'

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'
import { ArrowUpDown, Clock } from 'lucide-react'

type PaymentLinkRow = {
  id: string
  linkId: string
  description: string
  amount: number
  currency?: string
  createdDate: string
  expiryDate: string
  views: number
  url: string
  status: 'Active' | 'Paid' | 'Expired'
}

type NewPaymentLinkForm = {
  description: string
  amount: string
  invoiceId: string
  expiryDate: string
}

type ActivityLog = {
  id: string
  action: string
  recordId: string
  createdAt: string
  changes?: Record<string, any> | null
  user?: { id?: string; name?: string | null; email?: string | null } | null
}

type PaymentLinkSortKey = 'linkId' | 'description' | 'amount' | 'createdDate' | 'expiryDate' | 'views' | 'status'
type SortDirection = 'asc' | 'desc'

function compareLinks(a: PaymentLinkRow, b: PaymentLinkRow, key: PaymentLinkSortKey, dir: SortDirection): number {
  if (key === 'amount' || key === 'views') {
    const av = Number(a[key] ?? 0); const bv = Number(b[key] ?? 0)
    return dir === 'asc' ? av - bv : bv - av
  }
  if (key === 'createdDate' || key === 'expiryDate') {
    const av = new Date(a[key] ?? '').getTime() || 0; const bv = new Date(b[key] ?? '').getTime() || 0
    return dir === 'asc' ? av - bv : bv - av
  }
  const as = String(a[key] ?? '').toLowerCase(); const bs = String(b[key] ?? '').toLowerCase()
  return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
}

interface PlinkColDef { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right' }
const DEFAULT_PLINK_COLS: PlinkColDef[] = [
  { key: 'linkId', label: 'Link ID', visible: true, width: 110, align: 'left' },
  { key: 'description', label: 'Description', visible: true, width: 180, align: 'left' },
  { key: 'amount', label: 'Amount', visible: true, width: 110, align: 'right' },
  { key: 'createdDate', label: 'Created Date', visible: true, width: 120, align: 'left' },
  { key: 'expiryDate', label: 'Expiry Date', visible: true, width: 110, align: 'left' },
  { key: 'views', label: 'Views', visible: true, width: 80, align: 'right' },
  { key: 'status', label: 'Status', visible: true, width: 100, align: 'left' },
]
function loadPlinkCols(): PlinkColDef[] {
  try {
    const s = localStorage.getItem('payment-links-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as PlinkColDef[]
      return DEFAULT_PLINK_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_PLINK_COLS
}

export default function PaymentLinksPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<PaymentLinkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/payment-links`)
      setItems(Array.isArray(data) ? data : data?.items || data?.records || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load payment links')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])

  const loadActivity = useCallback(async () => {
    if (!companyId) return
    setActivityLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/integrations/audit-logs`, {
        params: { tableName: 'PaymentLink', limit: 8 },
      })
      setActivity(Array.isArray(data) ? data : data?.data ?? data?.items ?? [])
    } catch {
      setActivity([])
    } finally {
      setActivityLoading(false)
    }
  }, [companyId])

  useEffect(() => { loadActivity() }, [loadActivity])
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const [sortKey, setSortKey] = useState<PaymentLinkSortKey>('createdDate')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const toggleSort = (key: PaymentLinkSortKey) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir(key === 'createdDate' ? 'desc' : 'asc') }
  }
  const [form, setForm] = useState<NewPaymentLinkForm>({
    description: '',
    amount: '',
    invoiceId: '',
    expiryDate: '',
  })

  const createLink = useCallback(async () => {
    if (!companyId) return
    const amount = Number(form.amount)
    if (!form.invoiceId && (!Number.isFinite(amount) || amount <= 0)) {
      setError('Enter an amount greater than 0, or provide an invoice ID')
      return
    }

    setSaving(true)
    setError('')
    try {
      await apiClient.post(`/companies/${companyId}/payment-links`, {
        description: form.description || undefined,
        amount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
        invoiceId: form.invoiceId || undefined,
        expiryDate: form.expiryDate || undefined,
      })
      setShowCreate(false)
      setForm({ description: '', amount: '', invoiceId: '', expiryDate: '' })
      await fetchData()
      await loadActivity()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create payment link')
    } finally {
      setSaving(false)
    }
  }, [companyId, form, fetchData])

  const copyLink = useCallback(async (relativeUrl: string) => {
    const absolute = `${window.location.origin}${relativeUrl}`
    await navigator.clipboard.writeText(absolute)
  }, [])

  // Data fetched from API (see fetchData above)

  const filtered = useMemo(() => {
    if (!search) return items
    const lower = search.toLowerCase()
    return items.filter((row) =>
      (row.linkId ?? '').toLowerCase().includes(lower) ||
      (row.description ?? '').toLowerCase().includes(lower) ||
      (row.amount ?? '').toString().toLowerCase().includes(lower) ||
      (row.createdDate ?? '').toLowerCase().includes(lower) ||
      (row.expiryDate ?? '').toLowerCase().includes(lower) ||
      (row.status ?? '').toLowerCase().includes(lower)
    )
  }, [search, items])

  const sortedLinks = useMemo(
    () => [...filtered].sort((a, b) => compareLinks(a, b, sortKey, sortDir)),
    [filtered, sortKey, sortDir]
  )
  const [plinkCols, setPlinkCols] = useState<PlinkColDef[]>(() => loadPlinkCols())
  const plinkColsRef = useRef(plinkCols)
  useEffect(() => { plinkColsRef.current = plinkCols }, [plinkCols])
  const savePlinkCols = (next: PlinkColDef[]) => { setPlinkCols(next); try { localStorage.setItem('payment-links-cols-v1', JSON.stringify(next)) } catch { /* ignore */ } }
  const { containerRef, startResize: startPlinkResize, isOverflowing: paymentLinksIsOverflowing } = useFixedWidthResizableColumns({
    columns: plinkCols,
    columnsRef: plinkColsRef,
    saveColumns: savePlinkCols,
    fixedWidth: 80,
  })

  const describeActivity = (entry: ActivityLog) => {
    const linkId = entry.changes?.linkId ?? entry.recordId
    switch (entry.action) {
      case 'CREATE': return `Created payment link ${linkId}`
      case 'UPDATE': return `Updated payment link ${linkId}`
      case 'DELETE': return `Deleted payment link ${linkId}`
      default: return `${entry.action} payment link ${linkId}`
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payment Links</h1>
            <p className="text-sm text-slate-500 mt-1">Create shareable payment links for customers</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Create Link
            </button>
            <button onClick={() => setHelpOpen((cur) => !cur)} type="button" aria-label="Open documentation for Payment Links" className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold">?</button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3">
          <input
            title="Search payment links"
            placeholder="Search by link, description, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-xs text-slate-500 sm:col-span-2">Search by link ID, customer note, amount, or status.</div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div ref={containerRef} className={`bg-white rounded-xl border border-slate-200 ${paymentLinksIsOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}`}>
          <table className="w-full text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              {plinkCols.map(c => <col key={c.key} style={{ width: c.width }} />)}
              <col style={{ width: 80 }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                {plinkCols.map(c => (
                  <th key={c.key} className="relative px-4 py-3 border-r border-slate-200 select-none overflow-hidden" style={{ width: c.width, minWidth: c.width, maxWidth: c.width, textAlign: c.align === 'right' ? 'right' : 'left' }} title={c.label}>
                    <button onClick={() => toggleSort(c.key as PaymentLinkSortKey)} className="flex items-center gap-1 w-full min-w-0 overflow-hidden pr-2" style={{ justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start' }}>
                      <span className="truncate">{c.label}</span><ArrowUpDown size={11} className={`shrink-0 ${sortKey === c.key ? 'text-emerald-600' : 'text-slate-300'}`} />
                    </button>
                    <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startPlinkResize(e, c.key)} />
                  </th>
                ))}
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center">
                    <p className="text-rose-500 font-medium">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">No payment links found.</td>
                </tr>
              ) : (
                sortedLinks.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 truncate border-r border-slate-100" title={row.linkId ?? ''}>{row.linkId}</td>
                    <td className="px-4 py-3 text-slate-600 truncate border-r border-slate-100" title={row.description ?? ''}>{row.description}</td>
                    <td className="px-4 py-3 text-slate-600 truncate border-r border-slate-100">{formatCurrency(row.amount, row.currency ?? currency)}</td>
                    <td className="px-4 py-3 text-slate-600 truncate border-r border-slate-100">{row.createdDate}</td>
                    <td className="px-4 py-3 text-slate-600 truncate border-r border-slate-100">{row.expiryDate}</td>
                    <td className="px-4 py-3 text-slate-600 truncate border-r border-slate-100">{row.views}</td>
                    <td className={`px-4 py-3 text-sm font-semibold border-r border-slate-100 ${
                      row.status === 'Active' ? 'text-emerald-700' :
                      row.status === 'Paid' ? 'text-sky-700' :
                      'text-rose-700'
                    }`}>{row.status}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyLink(row.url)}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-300 rounded-md hover:bg-emerald-50"
                      >
                        Copy Link
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <section className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Clock size={14} className="text-emerald-600" />Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest payment-link creation events</p>
            </div>
          </div>
          {activityLoading ? (
            <div className="px-4 py-8 text-sm text-slate-500">Loading activity…</div>
          ) : activity.length === 0 ? (
            <div className="px-4 py-8 text-sm text-slate-500">No payment link activity recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activity.map((entry) => (
                <div key={entry.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{describeActivity(entry)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {entry.changes?.description || 'No description'}
                      {entry.changes?.amount != null ? ` · ${formatCurrency(Number(entry.changes.amount), currency)}` : ''}
                      {' · '}
                      {entry.user?.name ?? entry.user?.email ?? 'System'}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Create Payment Link</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-slate-700">Close</button>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4">
              <label className="text-sm text-slate-700">
                Description
                <input
                  value={form.description}
                  onChange={(e) => setForm((cur) => ({ ...cur, description: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Invoice payment, deposit request, or service fee"
                />
              </label>
              <label className="text-sm text-slate-700">
                Amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((cur) => ({ ...cur, amount: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="0.00"
                />
              </label>
              <label className="text-sm text-slate-700">
                Invoice ID (optional)
                <input
                  value={form.invoiceId}
                  onChange={(e) => setForm((cur) => ({ ...cur, invoiceId: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Link this payment to an existing invoice"
                />
              </label>
              <label className="text-sm text-slate-700">
                Expiry Date (optional)
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((cur) => ({ ...cur, expiryDate: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </label>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700">Cancel</button>
              <button
                onClick={createLink}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Creating…' : 'Create Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Payment Links Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Create shareable payment links to collect payments quickly from customers.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Issue links for invoices, deposits, or standalone charges.</li>
                <li>Track link views and status updates (paid/expired).</li>
                <li>Manage expiration and revoke links to control access.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
