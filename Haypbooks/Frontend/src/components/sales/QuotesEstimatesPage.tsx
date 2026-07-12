'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Download, Plus, RefreshCw, X, Edit2, Send, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useToast } from '@/components/ToastProvider'
import ActivityLog, { type ActivityLogItem } from '@/components/ui/ActivityLog'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypColumn, HaypActionItem, HaypBulkAction } from '@/components/shared/HaypDataTable.types'
import CustomerPickerField from './CustomerPickerField'
import QuickAddCustomerModal from './QuickAddCustomerModal'

const STATUS_FILTERS = ['All', 'DRAFT', 'SENT', 'ACCEPTED', 'EXPIRED', 'REJECTED', 'CONVERTED'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

interface QuoteRow {
  id: string
  quoteNumber: string
  customer: string
  customerId: string
  date: string | null
  expiryDate: string | null
  amount: number
  status: string
  lineCount: number
  convertedToInvoiceId: string | null
}

interface CustomerOption { id: string; name: string; email?: string }
interface LineItem { description: string; quantity: string; unitPrice: string }

function normalizeQuote(q: any): QuoteRow {
  return {
    id: q.id,
    quoteNumber: q.quoteNumber ?? `QT-${q.id?.slice(0, 8)}`,
    customer: q.customer ?? q.customerName ?? '—',
    customerId: q.customerId ?? '',
    date: q.date ?? q.issuedAt ?? null,
    expiryDate: q.expiryDate ?? null,
    amount: Number(q.amount ?? q.totalAmount ?? 0),
    status: q.status ?? 'DRAFT',
    lineCount: q.lineCount ?? 0,
    convertedToInvoiceId: q.convertedToInvoiceId ?? null,
  }
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

function statusColor(status: string) {
  switch (status) {
    case 'ACCEPTED': return 'text-emerald-700 bg-emerald-50'
    case 'SENT': return 'text-sky-700 bg-sky-50'
    case 'EXPIRED': return 'text-rose-700 bg-rose-50'
    case 'REJECTED': return 'text-red-700 bg-red-50'
    case 'CONVERTED': return 'text-violet-700 bg-violet-50'
    default: return 'text-amber-700 bg-amber-50'
  }
}

function statusLabel(s: string) {
  const m: Record<string, string> = {
    DRAFT: 'Draft', SENT: 'Sent', ACCEPTED: 'Accepted',
    EXPIRED: 'Expired', REJECTED: 'Rejected', CONVERTED: 'Converted',
  }
  return m[s] ?? s
}

function emptyLine(): LineItem { return { description: '', quantity: '1', unitPrice: '' } }

export default function QuotesEstimatesPage() {
  const router = useRouter()
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

  // Detail drawer
  const [drawerQuote, setDrawerQuote] = useState<QuoteRow | null>(null)
  const [drawerTab, setDrawerTab] = useState<'details' | 'activity'>('details')
  const [drawerActivity, setDrawerActivity] = useState<ActivityLogItem[]>([])
  const [drawerActivityLoading, setDrawerActivityLoading] = useState(false)

  useEffect(() => {
    setDrawerTab('details')
    setDrawerActivity([])
  }, [drawerQuote?.id])

  useEffect(() => {
    if (drawerTab !== 'activity' || !drawerQuote?.id || !companyId) return
    setDrawerActivityLoading(true)
    salesService.getQuoteActivity(companyId, drawerQuote.id)
      .then((response) => setDrawerActivity(response.data.data ?? []))
      .catch(() => setDrawerActivity([]))
      .finally(() => setDrawerActivityLoading(false))
  }, [drawerTab, drawerQuote?.id, companyId])

  // Create/Edit modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [custLoading, setCustLoading] = useState(false)
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false)
  const [form, setForm] = useState({ customerId: '', expiryDate: '' })
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fetchQuotes = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const response = await salesService.getQuotes(companyId, { limit: 500 })
      const data = response.data
      const raw: any[] = Array.isArray(data) ? data : data?.items || data?.records || []
      setItems(raw.map(normalizeQuote))
      setError('')
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to load quotes'
      toast.error(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  useEffect(() => { fetchQuotes() }, [fetchQuotes])

  // ─── Batch ops ────────────────────────────────────────────────────────────

  async function handleBatchDelete(ids: string[]) {
    if (!companyId || ids.length === 0) return
    if (!window.confirm(`Delete ${ids.length} quote(s)? This cannot be undone.`)) return
    setBatchLoading(true)
    try {
      await salesService.batchDeleteQuotes(companyId, ids)
      toast.success(`Deleted ${ids.length} quote(s)`)
      await fetchQuotes()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Batch delete failed')
    } finally {
      setBatchLoading(false)
    }
  }

  async function handleBatchStatus(ids: string[], status: string) {
    if (!companyId || ids.length === 0) return
    setBatchLoading(true)
    try {
      await salesService.batchUpdateQuoteStatus(companyId, ids, status)
      toast.success(`Updated ${ids.length} quote(s) to ${statusLabel(status)}`)
      await fetchQuotes()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Batch update failed')
    } finally {
      setBatchLoading(false)
    }
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  async function handleExport() {
    if (!companyId) return
    setExportLoading(true)
    try {
      const params: Record<string, string> = {}
      if (statusFilter !== 'All') params.status = statusFilter
      const response = await salesService.exportQuotes(companyId, params)
      const data = response.data
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'quotes-export.csv'; a.click()
      URL.revokeObjectURL(url)
      toast.success('Export downloaded')
    } catch {
      toast.error('Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  // ─── Single delete ────────────────────────────────────────────────────────

  async function handleDelete(quoteId: string) {
    if (!companyId) return
    if (!window.confirm('Delete this quote? This cannot be undone.')) return
    setActioningId(quoteId)
    try {
      await salesService.deleteQuote(companyId, quoteId)
      setDrawerQuote(null)
      await fetchQuotes()
      toast.success('Quote deleted')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Delete failed')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Status action ────────────────────────────────────────────────────────

  async function handleStatusChange(quoteId: string, status: string) {
    if (!companyId) return
    setActioningId(quoteId)
    try {
      await salesService.updateQuoteStatus(companyId, quoteId, status)
      await fetchQuotes()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update status')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Convert to invoice ───────────────────────────────────────────────────

  async function handleConvert(quoteId: string) {
    if (!companyId) return
    if (!window.confirm('Convert this quote to an invoice?')) return
    setActioningId(quoteId)
    try {
      const response = await salesService.convertQuote(companyId, quoteId)
      await fetchQuotes()
      toast.success('Quote converted to invoice')
      const data = response.data
      const invoiceId = data?.invoiceId ?? data?.id ?? data?.data?.id ?? null
      if (invoiceId) {
        router.push(`/sales/billing/invoices/${invoiceId}`)
      } else {
        router.push('/sales/billing/invoices')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to convert quote')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Load customers ───────────────────────────────────────────────────────

  const loadCustomers = useCallback(async () => {
    if (!companyId) return
    setCustLoading(true)
    try {
      const response = await salesService.listArCustomers(companyId)
      const data = response.data as any
      const raw: any[] = Array.isArray(data) ? data : data?.data ?? data?.items ?? []
      setCustomers(raw.map((c: any) => ({
        id: c.id || c.contactId,
        name: c.name || c.displayName || '—',
        email: c.email || c.contact?.email || '',
      })))
    } catch { /* non-blocking */ }
    finally { setCustLoading(false) }
  }, [companyId])

  // ─── Open create/edit modal ───────────────────────────────────────────────

  function openCreate() {
    setEditingId(null)
    setForm({ customerId: '', expiryDate: '' })
    setLines([emptyLine()])
    setSaveError('')
    setModalOpen(true)
    loadCustomers()
  }

  function openEdit(row: QuoteRow) {
    setEditingId(row.id)
    setForm({ customerId: row.customerId, expiryDate: row.expiryDate ?? '' })
    setLines([emptyLine()])
    setSaveError('')
    setModalOpen(true)
    loadCustomers()
  }

  // ─── Line helpers ─────────────────────────────────────────────────────────

  function setLine(idx: number, field: keyof LineItem, value: string) {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }
  function addLine() { setLines(prev => [...prev, emptyLine()]) }
  function removeLine(idx: number) { setLines(prev => prev.filter((_, i) => i !== idx)) }

  const lineTotal = lines.reduce((s, l) => {
    const qty = parseFloat(l.quantity) || 0
    const price = parseFloat(l.unitPrice) || 0
    return s + qty * price
  }, 0)

  // ─── Save ─────────────────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    if (!form.customerId) { setSaveError('Select a customer'); return }
    const validLines = lines.filter(l => l.description.trim())
    if (!validLines.length) { setSaveError('Add at least one line item'); return }
    setSaving(true); setSaveError('')
    try {
      const payload = {
        customerId: form.customerId,
        expiryDate: form.expiryDate || undefined,
        lines: validLines.map(l => {
          const qty = parseFloat(l.quantity) || 1
          const price = parseFloat(l.unitPrice) || 0
          return { description: l.description.trim(), quantity: qty, unitPrice: price, amount: qty * price }
        }),
      }
      if (editingId) {
        await salesService.updateQuote(companyId, editingId, payload)
        toast.success('Quote updated')
      } else {
        await salesService.createQuote(companyId, payload)
        toast.success('Quote created')
      }
      setModalOpen(false)
      await fetchQuotes()
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? 'Failed to save quote')
    } finally {
      setSaving(false)
    }
  }

  const statusFiltered = useMemo(
    () => (statusFilter === 'All' ? items : items.filter((q) => q.status === statusFilter)),
    [items, statusFilter],
  )

  const columns = useMemo<HaypColumn<QuoteRow>[]>(
    () => [
      {
        id: 'quoteNumber',
        header: 'Quote #',
        accessorKey: 'quoteNumber',
        size: 120,
        render: (value, row) => (
          <button
            type="button"
            onClick={() => router.push(`/sales/opportunities/quotes/${row.id}`)}
            className="text-left text-emerald-600 hover:text-emerald-800 hover:underline"
          >
            {value || '—'}
          </button>
        ),
      },
      { id: 'customer', header: 'Customer', accessorKey: 'customer', size: 200 },
      { id: 'date', header: 'Date', accessorKey: 'date', size: 110, render: (value) => fmtDate(value) },
      { id: 'expiryDate', header: 'Expiry', accessorKey: 'expiryDate', size: 110, render: (value) => fmtDate(value) },
      {
        id: 'amount',
        header: 'Amount',
        accessorKey: 'amount',
        size: 120,
        align: 'right',
        render: (value) => (
          <span className="font-semibold text-slate-800">{formatCurrency(value, currency)}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        size: 120,
        render: (value) => (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(value)}`}>
            {statusLabel(value)}
          </span>
        ),
      },
    ],
    [currency, router],
  )

  const actions = useMemo<HaypActionItem[]>(
    () => [
      {
        label: 'Edit',
        icon: <Edit2 size={14} />,
        onClick: (_rowId, row) => openEdit(row),
      },
      {
        label: 'Send',
        icon: <Send size={14} />,
        onClick: (rowId) => handleStatusChange(rowId, 'SENT'),
        show: (row) => row.status === 'DRAFT',
      },
      {
        label: 'Accept',
        icon: <CheckCircle size={14} />,
        onClick: (rowId) => handleStatusChange(rowId, 'ACCEPTED'),
        show: (row) => row.status === 'SENT',
      },
      {
        label: 'Reject',
        icon: <XCircle size={14} />,
        onClick: (rowId) => handleStatusChange(rowId, 'REJECTED'),
        show: (row) => row.status === 'SENT',
        danger: true,
      },
      {
        label: 'Convert',
        icon: <ArrowRight size={14} />,
        onClick: (rowId) => handleConvert(rowId),
        show: (row) => ['SENT', 'ACCEPTED'].includes(row.status),
      },
      {
        label: 'Delete',
        icon: <X size={14} />,
        onClick: (rowId) => handleDelete(rowId),
        danger: true,
      },
    ],
    [handleConvert, handleDelete, handleStatusChange, openEdit],
  )

  const bulkActions = useMemo<HaypBulkAction[]>(
    () => [
      {
        label: 'Mark as Sent',
        icon: <Send size={14} />,
        onClick: (selectedIds) => handleBatchStatus(selectedIds, 'SENT'),
      },
      {
        label: 'Mark as Accepted',
        icon: <CheckCircle size={14} />,
        onClick: (selectedIds) => handleBatchStatus(selectedIds, 'ACCEPTED'),
      },
      {
        label: 'Mark as Expired',
        icon: <Clock size={14} />,
        onClick: (selectedIds) => handleBatchStatus(selectedIds, 'EXPIRED'),
      },
      {
        label: 'Delete Selected',
        icon: <X size={14} />,
        variant: 'danger',
        onClick: (selectedIds) => handleBatchDelete(selectedIds),
      },
    ],
    [handleBatchDelete, handleBatchStatus],
  )

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={exportLoading}
        className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        title="Export CSV"
      >
        <Download size={15} /> {exportLoading ? 'Exporting…' : 'Export'}
      </button>
      <button
        type="button"
        onClick={fetchQuotes}
        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        title="Refresh"
      >
        <RefreshCw size={16} />
      </button>
      <button
        type="button"
        onClick={() => router.push('/sales/opportunities/quotes/activity')}
        className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
      >
        <Clock size={15} /> Activity Log
      </button>
      <button
        type="button"
        onClick={openCreate}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
      >
        <Plus size={16} /> New Quote
      </button>
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quotes & Estimates</h1>
            <p className="text-sm text-slate-500 mt-1">Create and manage customer quotes</p>
          </div>
        </div>

        {/* Status tabs */}
        <div className="px-6 pb-3 flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'}`}
            >
              {s === 'All' ? 'All' : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5 flex-1">
        <HaypDataTable
          data={statusFiltered}
          columns={columns}
          tableId="quotes-estimates"
          loading={loading}
          primaryAction={
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              <Plus size={16} /> New Quote
            </button>
          }
          actions={actions}
          bulkActions={bulkActions}
          onRowClick={(row) => setDrawerQuote(row)}
          onRefresh={fetchQuotes}
          emptyTitle="No quotes found"
          emptySubtitle="Create a quote to get started"
        />
      </div>

      {/* Detail Drawer */}
      {drawerQuote && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawerQuote(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{drawerQuote.quoteNumber}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{drawerQuote.customer}</p>
              </div>
              <button aria-label="Close details drawer" onClick={() => setDrawerQuote(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="relative z-10 flex border-b border-slate-200 bg-white px-4">
              {(['details', 'activity'] as const).map(tab => (
                <button key={tab} onClick={() => setDrawerTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${drawerTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  {tab === 'details' ? <Download size={11} /> : <Clock size={11} />}
                  {tab === 'details' ? 'Details' : 'Activity'}
                </button>
              ))}
            </div>
            {drawerTab === 'details' && (
            <div className="px-5 py-4 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Date</p>
                  <p className="font-semibold text-slate-800">{fmtDate(drawerQuote.date)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Expiry</p>
                  <p className="font-semibold text-slate-800">{fmtDate(drawerQuote.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Amount</p>
                  <p className="font-bold text-xl text-slate-900">{formatCurrency(drawerQuote.amount, currency)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(drawerQuote.status)}`}>
                    {statusLabel(drawerQuote.status)}
                  </span>
                </div>
              </div>
              {drawerQuote.convertedToInvoiceId && (
                <div className="text-sm bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 text-violet-700">
                  Converted to Invoice ID: <span className="font-mono">{drawerQuote.convertedToInvoiceId.slice(0, 12)}…</span>
                </div>
              )}
              <div className="text-sm text-slate-500">
                {drawerQuote.lineCount > 0 ? `${drawerQuote.lineCount} line item(s)` : 'No line item details available'}
              </div>
            </div>
            )}
            {drawerTab === 'activity' && (
              <div className="px-5 py-4 flex-1">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Clock size={14} className="text-emerald-600" /> Audit Log
                </h3>
                <ActivityLog
                  entries={drawerActivity}
                  loading={drawerActivityLoading}
                  emptyMessage="No activity recorded yet."
                />
              </div>
            )}
            <div className="px-5 py-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => { openEdit(drawerQuote); setDrawerQuote(null) }}
                className="flex-1 px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Edit Quote
              </button>
              <button
                onClick={() => handleDelete(drawerQuote.id)}
                disabled={actioningId === drawerQuote.id}
                className="px-4 py-2 text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-lg disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Quote' : 'New Quote'}</h2>
              <button aria-label="Close quote modal" onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <CustomerPickerField
                  label="Customer *"
                  value={form.customerId}
                  customers={customers}
                  loading={custLoading}
                  placeholder="Select customer..."
                  createLabel="Create New Customer"
                  onOpen={loadCustomers}
                  onChange={(id) => setForm((f) => ({ ...f, customerId: id }))}
                  onCreateNew={() => setShowQuickAddCustomer(true)}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    aria-label="Expiry date"
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Line Items *</label>
                  <button type="button" onClick={addLine} className="text-xs font-semibold text-emerald-700 hover:underline">+ Add line</button>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-slate-600">Description</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600 w-20">Qty</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600 w-28">Unit Price</th>
                        <th className="text-right px-3 py-2 font-medium text-slate-600 w-24">Amount</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l, i) => {
                        const qty = parseFloat(l.quantity) || 0
                        const price = parseFloat(l.unitPrice) || 0
                        return (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-2 py-1">
                              <input aria-label="Description" value={l.description} onChange={e => setLine(i, 'description', e.target.value)} placeholder="Description" className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm" />
                            </td>
                            <td className="px-2 py-1">
                              <input aria-label="Quantity" type="number" min="0" step="1" value={l.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} placeholder="0" className="w-full px-2 py-1.5 border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm" />
                            </td>
                            <td className="px-2 py-1">
                              <input type="number" min="0" step="0.01" value={l.unitPrice} onChange={e => setLine(i, 'unitPrice', e.target.value)} placeholder="0.00" className="w-full px-2 py-1.5 border border-slate-200 rounded text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm" />
                            </td>
                            <td className="px-3 py-1 text-right tabular-nums text-slate-700 text-sm">{formatCurrency(qty * price, currency)}</td>
                            <td className="px-1 py-1 text-center">
                              {lines.length > 1 && (
                                <button type="button" onClick={() => removeLine(i)} className="text-rose-400 hover:text-rose-600 text-lg leading-none">×</button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-2 pr-10 text-sm font-semibold text-slate-800">
                  Total: {formatCurrency(lineTotal, currency)}
                </div>
              </div>

              {saveError && <p className="text-sm text-rose-500">{saveError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60">
                  {saving ? 'Saving…' : editingId ? 'Update Quote' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuickAddCustomer && companyId && (
        <QuickAddCustomerModal
          companyId={companyId}
          onClose={() => setShowQuickAddCustomer(false)}
          onCreated={(customer) => {
            const next = { id: customer.contactId, name: customer.name, email: customer.email }
            setCustomers((prev) => [next, ...prev.filter((p) => p.id !== next.id)])
            setForm((prev) => ({ ...prev, customerId: next.id }))
            setShowQuickAddCustomer(false)
          }}
        />
      )}
    </div>
  )
}
