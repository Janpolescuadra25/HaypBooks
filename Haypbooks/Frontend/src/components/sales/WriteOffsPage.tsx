'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, X, AlertCircle, Loader2, RefreshCw, Eye, CheckCircle, RotateCcw, Clock } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypColumn, HaypFilterOption } from '@/components/shared/HaypDataTable.types'

interface WriteOff {
  id: string
  writeOffNumber: string
  customer: string
  invoiceNumber: string
  amount: number | string
  reason: string
  date: string
  approvedBy?: string | null
  status: string
  journalEntryId?: string | null
  journalEntryNumber?: string | null
  invoiceId?: string | null
  [key: string]: any
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REVERSED: 'bg-amber-50 text-amber-700 border-amber-200',
}

const statusFilters: HaypFilterOption[] = [
  { value: '', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REVERSED', label: 'Reversed' },
]

const defaultFormData = {
  invoiceId: '',
  amount: '',
  reason: '',
  writeOffDate: new Date().toISOString().split('T')[0],
}

export default function WriteOffsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [items, setItems] = useState<WriteOff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<WriteOff | null>(null)
  const [formData, setFormData] = useState({ ...defaultFormData })
  const [formSaving, setFormSaving] = useState(false)
  const [detailItem, setDetailItem] = useState<WriteOff | null>(null)
  const [detailTab, setDetailTab] = useState<'details' | 'activity'>('details')
  const [activity, setActivity] = useState<any[]>([])
  const [activityLoading, setActivityLoading] = useState(false)

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await salesService.listArWriteOffs(companyId)
      const data = response.data
      setItems(Array.isArray(data) ? data : data?.items ?? data?.records ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load write-offs')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSave = useCallback(async () => {
    if (!companyId) return
    if (!formData.amount || !formData.reason) {
      toast.error('Amount and reason are required')
      return
    }
    setFormSaving(true)
    try {
      if (editing) {
        await salesService.updateArWriteOff(companyId, editing.id, formData)
        toast.success('Write-off updated')
      } else {
        await salesService.createArWriteOff(companyId, formData)
        toast.success('Write-off created')
      }
      setShowForm(false)
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Save failed')
    } finally {
      setFormSaving(false)
    }
  }, [companyId, editing, formData, fetchItems, toast])

  const handleApprove = useCallback(async (id: string) => {
    if (!companyId) return
    if (!window.confirm('Approve this write-off?')) return
    try {
      await salesService.approveArWriteOff(companyId, id)
      toast.success('Write-off approved')
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Approval failed')
    }
  }, [companyId, fetchItems, toast])

  const handleReverse = useCallback(async (id: string) => {
    if (!companyId) return
    if (!window.confirm('Reverse this write-off?')) return
    try {
      await salesService.reverseArWriteOff(companyId, id)
      toast.success('Write-off reversed')
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Reversal failed')
    }
  }, [companyId, fetchItems, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!companyId) return
    if (!window.confirm('Delete this write-off?')) return
    try {
      await salesService.deleteArWriteOff(companyId, id)
      toast.success('Write-off deleted')
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Delete failed')
    }
  }, [companyId, fetchItems, toast])

  const handleBatchDelete = useCallback(async (selectedIds: string[]) => {
    if (!companyId || selectedIds.length === 0) return
    if (!window.confirm(`Delete ${selectedIds.length} write-off(s)?`)) return
    try {
      await salesService.batchDeleteArWriteOffs(companyId, selectedIds)
      toast.success(`${selectedIds.length} write-off(s) deleted`)
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Batch delete failed')
    }
  }, [companyId, fetchItems, toast])

  const handleExport = useCallback(() => {
    const headers = ['Write-Off #', 'Customer', 'Invoice #', 'Amount', 'Reason', 'Date', 'Status']
    const rows = items.map((row) => [
      row.writeOffNumber,
      row.customer,
      row.invoiceNumber,
      formatCurrency(Number(row.amount), currency),
      row.reason,
      row.date,
      row.status,
    ])
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'write-offs.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }, [items, currency])

  const openCreate = useCallback(() => {
    setEditing(null)
    setFormData({ ...defaultFormData })
    setShowForm(true)
  }, [])

  const openEdit = useCallback((row: WriteOff) => {
    setEditing(row)
    setFormData({
      invoiceId: row.invoiceId ?? '',
      amount: String(row.amount ?? ''),
      reason: row.reason ?? '',
      writeOffDate: row.date,
    })
    setShowForm(true)
  }, [])

  const openDetail = useCallback((row: WriteOff) => {
    setDetailItem(row)
    setDetailTab('details')
    setActivity([])
  }, [])

  const loadActivity = useCallback(async (writeOffId: string) => {
    if (!companyId) return
    setActivityLoading(true)
    try {
      const response = await salesService.getArWriteOffActivity(companyId, writeOffId)
      const data = response.data
      setActivity(Array.isArray(data) ? data : data?.data ?? data?.items ?? [])
    } catch {
      setActivity([])
    } finally {
      setActivityLoading(false)
    }
  }, [companyId])

  const columns = useMemo<HaypColumn<WriteOff>[]>(() => [
    { id: 'writeOffNumber', header: 'Write-Off #', accessorKey: 'writeOffNumber', size: 180 },
    { id: 'customer', header: 'Customer', accessorKey: 'customer', size: 180 },
    { id: 'invoiceNumber', header: 'Invoice #', accessorKey: 'invoiceNumber', size: 140 },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      size: 120,
      align: 'right',
      render: (_value, row) => formatCurrency(Number(row.amount), currency),
    },
    { id: 'reason', header: 'Reason', accessorKey: 'reason', size: 220 },
    { id: 'date', header: 'Date', accessorKey: 'date', size: 140 },
    { id: 'approvedBy', header: 'Approved By', accessorKey: 'approvedBy', size: 160, enableHiding: true },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      size: 120,
      render: (_value, row) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${STATUS_STYLES[row.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {row.status}
        </span>
      ),
    },
  ], [currency])

  const actions = useMemo<HaypActionItem[]>(() => [
    {
      label: 'Edit',
      icon: <Eye size={14} />,
      show: (row) => row.status === 'DRAFT',
      onClick: (_rowId, row) => openEdit(row),
    },
    {
      label: 'Approve',
      icon: <CheckCircle size={14} />,
      show: (row) => row.status === 'DRAFT',
      onClick: async (_rowId, row) => { await handleApprove(row.id) },
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      show: (row) => row.status === 'DRAFT',
      onClick: async (_rowId, row) => { await handleDelete(row.id) },
    },
    {
      label: 'Reverse',
      icon: <RotateCcw size={14} />,
      show: (row) => row.status === 'APPROVED',
      onClick: async (_rowId, row) => { await handleReverse(row.id) },
    },
  ], [handleApprove, handleDelete, openEdit, handleReverse])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={fetchItems} className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
        <RefreshCw size={14} /> Refresh
      </button>
      <button type="button" onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
        <Plus size={14} /> New Write-Off
      </button>
    </div>
  )

  if (cidLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading…</span>
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
        tableId="write-offs"
        title="Write-Offs"
        description="Manage write-off requests and approvals."
        loading={loading}
        searchPlaceholder="Search write-offs..."
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        headerActions={headerActions}
        actions={actions}
        bulkActions={[{
          label: 'Batch Delete',
          icon: <Trash2 size={14} />,
          onClick: handleBatchDelete,
        }]}
        onRowClick={(row) => openDetail(row)}
        onRefresh={fetchItems}
        onExport={handleExport}
        emptyTitle="No write-offs found"
        emptySubtitle="Create a write-off to get started"
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Edit Write-Off' : 'New Write-Off'}</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close form" className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="invoiceId" className="block text-sm font-medium text-slate-700 mb-1">Invoice ID</label>
                <input id="invoiceId" type="text" value={formData.invoiceId} onChange={(e) => setFormData((prev) => ({ ...prev, invoiceId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                <input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                <textarea id="reason" value={formData.reason} onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))} rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
              </div>
              <div>
                <label htmlFor="writeOffDate" className="block text-sm font-medium text-slate-700 mb-1">Write-Off Date</label>
                <input id="writeOffDate" type="date" value={formData.writeOffDate} onChange={(e) => setFormData((prev) => ({ ...prev, writeOffDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-slate-50">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
              <button onClick={handleSave} disabled={formSaving}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {formSaving ? 'Saving…' : editing ? 'Save Write-Off' : 'Create Write-Off'}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 z-[100] bg-black/80" onClick={() => setDetailItem(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-slate-900">{detailItem.writeOffNumber}</h2>
              <button onClick={() => setDetailItem(null)} aria-label="Close details" className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="flex border-b border-slate-200 bg-slate-50 px-6">
              {(['details', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setDetailTab(tab)
                    if (tab === 'activity' && activity.length === 0) {
                      loadActivity(detailItem.id)
                    }
                  }}
                  className={`px-4 py-2.5 text-sm font-semibold transition-colors ${detailTab === tab ? 'border-b-2 border-emerald-500 text-emerald-700' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'}`}>
                  {tab === 'activity' ? <span className="flex items-center gap-1"><Clock size={13} />Activity</span> : 'Details'}
                </button>
              ))}
            </div>
            {detailTab === 'activity' ? (
              <div className="p-6 space-y-3">
                {activityLoading ? (
                  <div className="flex justify-center py-10"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
                ) : activity.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-10">No activity available.</p>
                ) : activity.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <Clock size={14} className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{entry.user?.name ?? entry.user?.email ?? 'System'} · {new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Customer', detailItem.customer],
                    ['Invoice #', detailItem.invoiceNumber || '—'],
                    ['Amount', formatCurrency(Number(detailItem.amount), currency)],
                    ['Date', detailItem.date],
                    ['Status', detailItem.status],
                    ['Approved By', detailItem.approvedBy || '—'],
                    ['GL Entry', detailItem.journalEntryNumber || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">{label}</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Reason</p>
                  <p className="text-sm text-slate-700">{detailItem.reason}</p>
                </div>
                <div className="space-y-2">
                  {detailItem.status === 'DRAFT' && (
                    <button onClick={() => { handleApprove(detailItem.id); setDetailItem(null) }} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                      <CheckCircle size={15} /> Approve &amp; Post to GL
                    </button>
                  )}
                  {detailItem.status === 'APPROVED' && (
                    <button onClick={() => { handleReverse(detailItem.id); setDetailItem(null) }} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors">
                      <RotateCcw size={15} /> Reverse Write-Off
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
