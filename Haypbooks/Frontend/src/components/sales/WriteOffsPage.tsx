'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Plus, Search, Trash2, X, AlertCircle, Loader2, RefreshCw,
  Download, Eye, CheckCircle, RotateCcw, FileX,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

interface WriteOff {
  id: string
  writeOffNumber: string
  customer: string
  invoiceNumber: string
  amount: string
  reason: string
  date: string
  approvedBy: string
  status: string
  journalEntryId?: string | null
  journalEntryNumber?: string | null
  invoiceId?: string | null
}

interface ColDef { key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right' }

const DEFAULT_COLS: ColDef[] = [
  { key: 'writeOffNumber', label: 'Write-Off #', visible: true, width: 130, align: 'left' },
  { key: 'customer', label: 'Customer', visible: true, width: 180, align: 'left' },
  { key: 'invoiceNumber', label: 'Invoice #', visible: true, width: 120, align: 'left' },
  { key: 'amount', label: 'Amount', visible: true, width: 110, align: 'right' },
  { key: 'reason', label: 'Reason', visible: true, width: 200, align: 'left' },
  { key: 'date', label: 'Date', visible: true, width: 110, align: 'left' },
  { key: 'approvedBy', label: 'Approved By', visible: false, width: 140, align: 'left' },
  { key: 'status', label: 'Status', visible: true, width: 110, align: 'left' },
]

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem('write-offs-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as ColDef[]
      return DEFAULT_COLS.map(d => { const sc = saved.find(c => c.key === d.key); return sc ? { ...d, visible: sc.visible, width: sc.width } : d })
    }
  } catch { /* ignore */ }
  return DEFAULT_COLS
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REVERSED: 'bg-amber-50 text-amber-700 border-amber-200',
}

interface WriteOffFormData {
  invoiceId: string
  amount: string
  reason: string
  writeOffDate: string
}

export default function WriteOffsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const toast = useToast()

  const [items, setItems] = useState<WriteOff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const [showColMenu, setShowColMenu] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<WriteOff | null>(null)
  const [detailItem, setDetailItem] = useState<WriteOff | null>(null)
  const [formData, setFormData] = useState<WriteOffFormData>({ invoiceId: '', amount: '', reason: '', writeOffDate: new Date().toISOString().split('T')[0] })
  const [formSaving, setFormSaving] = useState(false)

  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const saveCols = (next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('write-offs-cols-v1', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const fetchItems = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/write-offs`)
      const list: WriteOff[] = Array.isArray(data) ? data : data?.items || data?.records || []
      setItems(list)
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load write-offs')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const filtered = items.filter(row => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      row.writeOffNumber?.toLowerCase().includes(q) ||
      row.customer?.toLowerCase().includes(q) ||
      row.invoiceNumber?.toLowerCase().includes(q) ||
      row.reason?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || row.status === statusFilter
    return matchSearch && matchStatus
  })

  const paginated = filtered.slice(page * pageSize, page * pageSize + pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  const allSelected = paginated.length > 0 && paginated.every(r => selectedIds.has(r.id))
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(paginated.map(r => r.id)))
  }
  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedIds(next)
  }

  const resizeRef = useRef<{ key: string; startX: number; startW: number } | null>(null)
  const startResize = (e: React.MouseEvent, key: string, w: number) => {
    e.preventDefault()
    resizeRef.current = { key, startX: e.clientX, startW: w }
    const onMove = (mv: MouseEvent) => {
      if (!resizeRef.current) return
      const newW = Math.max(60, resizeRef.current.startW + mv.clientX - resizeRef.current.startX)
      saveCols(colsRef.current.map(c => c.key === resizeRef.current!.key ? { ...c, width: newW } : c))
    }
    const onUp = () => { resizeRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleApprove = async (id: string) => {
    if (!companyId) return
    try {
      await apiClient.post(`/companies/${companyId}/ar/write-offs/${id}/approve`)
      toast.success('Write-off approved — GL entry posted')
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Approval failed')
    }
  }

  const handleReverse = async (id: string) => {
    if (!companyId || !window.confirm('Reverse this write-off? This will create a reversing GL entry.')) return
    try {
      await apiClient.post(`/companies/${companyId}/ar/write-offs/${id}/reverse`)
      toast.success('Write-off reversed')
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Reversal failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!companyId || !window.confirm('Delete this write-off?')) return
    try {
      await apiClient.delete(`/companies/${companyId}/ar/write-offs/${id}`)
      toast.success('Write-off deleted')
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Delete failed')
    }
  }

  const handleBatchDelete = async () => {
    if (!companyId || !selectedIds.size || !window.confirm(`Delete ${selectedIds.size} write-off(s)?`)) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/write-offs/batch/delete`, { ids: [...selectedIds] })
      toast.success(`${selectedIds.size} write-off(s) deleted`)
      setSelectedIds(new Set())
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Batch delete failed')
    } finally { setBatchLoading(false) }
  }

  const handleExport = () => {
    const headers = ['Write-Off #', 'Customer', 'Invoice #', 'Amount', 'Reason', 'Date', 'Status']
    const rows = filtered.map(r => [r.writeOffNumber, r.customer, r.invoiceNumber, r.amount, r.reason, r.date, r.status])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'write-offs.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const openCreate = () => {
    setEditing(null)
    setFormData({ invoiceId: '', amount: '', reason: '', writeOffDate: new Date().toISOString().split('T')[0] })
    setShowForm(true)
  }

  const openEdit = (row: WriteOff) => {
    setEditing(row)
    setFormData({ invoiceId: row.invoiceId ?? '', amount: row.amount, reason: row.reason, writeOffDate: row.date })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!companyId || !formData.amount || !formData.reason) { toast.error('Amount and reason are required'); return }
    setFormSaving(true)
    try {
      if (editing) {
        await apiClient.put(`/companies/${companyId}/ar/write-offs/${editing.id}`, formData)
        toast.success('Write-off updated')
      } else {
        await apiClient.post(`/companies/${companyId}/ar/write-offs`, formData)
        toast.success('Write-off created')
      }
      setShowForm(false)
      fetchItems()
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Save failed')
    } finally { setFormSaving(false) }
  }

  const visibleCols = cols.filter(c => c.visible)

  if (cidLoading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading…</span></div>
  if (cidError) return <div className="p-6 text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Write-Offs</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} write-off{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchItems} title="Refresh" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors"><RefreshCw size={15} /></button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Download size={15} /> Export</button>
          <div className="relative">
            <button onClick={() => setShowColMenu(v => !v)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"><Eye size={15} /> Columns</button>
            {showColMenu && (
              <><div className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-emerald-100 rounded-xl shadow-lg p-2 min-w-[160px]">
                  {cols.filter(c => c.key !== 'writeOffNumber').map(c => (
                    <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-emerald-50 cursor-pointer">
                      <input type="checkbox" checked={c.visible} onChange={() => saveCols(cols.map(d => d.key === c.key ? { ...d, visible: !d.visible } : d))} className="accent-emerald-600" />{c.label}
                    </label>
                  ))}
                </div></>
            )}
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"><Plus size={16} /> New Write-Off</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search write-offs…" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-700">
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="APPROVED">Approved</option>
          <option value="REVERSED">Reversed</option>
        </select>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-gray-500">Rows:</span>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}
            className="px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none">
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Batch bar */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-600 text-white rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <button onClick={handleBatchDelete} disabled={batchLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/80 hover:bg-red-500 rounded-lg disabled:opacity-40 transition-colors font-semibold">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => { setError(''); fetchItems() }} className="ml-auto text-xs underline">Retry</button>
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: 700 }}>
          <colgroup>
            <col style={{ width: 44 }} />
            {visibleCols.map(c => <col key={c.key} style={{ width: c.width }} />)}
            <col style={{ width: 110 }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-blue-600" /></th>
              {visibleCols.map(c => (
                <th key={c.key} className="relative px-3 py-3 font-semibold text-gray-600 select-none" style={{ textAlign: c.align === 'right' ? 'right' : 'left' }}>
                  {c.label}
                  <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60" onMouseDown={e => startResize(e, c.key, c.width)} />
                </th>
              ))}
              <th className="px-3 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  <td className="px-3 py-3"><div className="h-4 w-4 bg-gray-100 rounded" /></td>
                  {visibleCols.map(c => <td key={c.key} className="px-3 py-3"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>)}
                  <td className="px-3 py-3"><div className="h-4 w-16 bg-gray-100 rounded ml-auto" /></td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 2} className="px-4 py-16 text-center text-gray-300">
                  <FileX size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-gray-400">No write-offs found</p>
                  <p className="text-xs mt-1 text-gray-300">{search || statusFilter ? 'Try adjusting your filters' : 'Create a write-off to get started'}</p>
                </td>
              </tr>
            ) : (
              paginated.map(row => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetailItem(row)}>
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} className="accent-blue-600" /></td>
                  {visibleCols.map(c => (
                    <td key={c.key} className="px-3 py-3 truncate" style={{ textAlign: c.align === 'right' ? 'right' : 'left' }}>
                      {c.key === 'status' ? (
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[row.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>{row.status}</span>
                      ) : (row as any)[c.key]}
                    </td>
                  ))}
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {row.status === 'DRAFT' && (
                        <>
                          <button onClick={() => openEdit(row)} title="Edit" className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"><Eye size={14} /></button>
                          <button onClick={() => handleApprove(row.id)} title="Approve" className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"><CheckCircle size={14} /></button>
                          <button onClick={() => handleDelete(row.id)} title="Delete" className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"><Trash2 size={14} /></button>
                        </>
                      )}
                      {row.status === 'APPROVED' && (
                        <button onClick={() => handleReverse(row.id)} title="Reverse" className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors"><RotateCcw size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filtered.length} total, page {page + 1} of {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">← Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">Next →</button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Write-Off' : 'New Write-Off'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID (optional)</label>
                <input type="text" value={formData.invoiceId} onChange={e => setFormData(f => ({ ...f, invoiceId: e.target.value }))}
                  placeholder="Invoice ID to write off"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea value={formData.reason} onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))} rows={2}
                  placeholder="Reason for write-off…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Write-Off Date</label>
                <input type="date" value={formData.writeOffDate} onChange={e => setFormData(f => ({ ...f, writeOffDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={formSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors">
                {formSaving ? <Loader2 size={15} className="animate-spin" /> : null}
                {editing ? 'Save Changes' : 'Create Write-Off'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30" onClick={() => setDetailItem(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">{detailItem.writeOffNumber}</h2>
              <button onClick={() => setDetailItem(null)} className="p-1.5 rounded hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Customer', detailItem.customer],
                  ['Invoice #', detailItem.invoiceNumber || '—'],
                  ['Amount', detailItem.amount],
                  ['Date', detailItem.date],
                  ['Status', detailItem.status],
                  ['Approved By', detailItem.approvedBy || '—'],
                  ['GL Entry', detailItem.journalEntryNumber || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
                  </div>
                ))}
              </div>
              {detailItem.reason && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Reason</p>
                  <p className="text-sm text-gray-700">{detailItem.reason}</p>
                </div>
              )}
              <div className="flex flex-col gap-2 pt-2">
                {detailItem.status === 'DRAFT' && (
                  <button onClick={() => { handleApprove(detailItem.id); setDetailItem(null) }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                    <CheckCircle size={16} /> Approve &amp; Post to GL
                  </button>
                )}
                {detailItem.status === 'APPROVED' && (
                  <button onClick={() => { handleReverse(detailItem.id); setDetailItem(null) }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors">
                    <RotateCcw size={16} /> Reverse Write-Off
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
