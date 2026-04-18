'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Clock, Download, Plus, RefreshCw, X, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency } from '@/lib/format'
import { useFixedWidthResizableColumns } from '@/hooks/useFixedWidthTableResize'

type SortKey = 'caseNumber' | 'subject' | 'status' | 'priority' | 'assignedTo' | 'promisedAmount' | 'createdAt'
type SortDirection = 'asc' | 'desc'

function compareCases(a: CaseRow, b: CaseRow, key: SortKey, dir: SortDirection): number {
  if (key === 'promisedAmount') {
    const av = a.promisedAmount ?? -Infinity; const bv = b.promisedAmount ?? -Infinity
    return dir === 'asc' ? av - bv : bv - av
  }
  if (key === 'createdAt') {
    const av = new Date(a.createdAt).getTime() || 0; const bv = new Date(b.createdAt).getTime() || 0
    return dir === 'asc' ? av - bv : bv - av
  }
  const as = String((a as any)[key] ?? '').toLowerCase(); const bs = String((b as any)[key] ?? '').toLowerCase()
  return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
}

type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH'

interface CaseRow {
  id: string
  caseNumber: string
  customerId: string | null
  invoiceId: string | null
  subject: string
  status: CaseStatus
  priority: CasePriority
  assignedTo: string | null
  promisedAmount: number | null
  promisedDate: string | null
  notes: string | null
  createdAt: string
}

interface ActivityLog {
  id: string
  action: string
  recordId: string
  createdAt: string
  changes?: Record<string, any> | null
  user?: { id?: string; name?: string | null; email?: string | null } | null
}

interface ColDef {
  key: string; label: string; visible: boolean; width: number; align?: 'left' | 'right'
}

const DEFAULT_COLS: ColDef[] = [
  { key: 'caseNumber', label: 'Case #', visible: true, width: 110, align: 'left' },
  { key: 'subject', label: 'Subject', visible: true, width: 200, align: 'left' },
  { key: 'customerId', label: 'Customer ID', visible: true, width: 140, align: 'left' },
  { key: 'status', label: 'Status', visible: true, width: 110, align: 'left' },
  { key: 'priority', label: 'Priority', visible: true, width: 90, align: 'left' },
  { key: 'assignedTo', label: 'Assigned To', visible: true, width: 130, align: 'left' },
  { key: 'promisedAmount', label: 'Promise Amt', visible: true, width: 120, align: 'right' },
  { key: 'promisedDate', label: 'Promise Date', visible: false, width: 110, align: 'left' },
  { key: 'createdAt', label: 'Opened', visible: true, width: 110, align: 'left' },
]

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem('collections-cols-v1')
    if (s) {
      const saved = JSON.parse(s) as ColDef[]
      return DEFAULT_COLS.map(d => {
        const sc = saved.find(c => c.key === d.key)
        return sc ? { ...d, visible: sc.visible, width: sc.width } : d
      })
    }
  } catch { /* ignore */ }
  return DEFAULT_COLS
}

function normalizeCase(r: any): CaseRow {
  return {
    id: r.id,
    caseNumber: r.caseNumber ?? `COL-${r.id?.slice(0, 8)}`,
    customerId: r.customerId ?? null,
    invoiceId: r.invoiceId ?? null,
    subject: r.subject ?? '',
    status: (r.status ?? 'OPEN') as CaseStatus,
    priority: (r.priority ?? 'MEDIUM') as CasePriority,
    assignedTo: r.assignedTo ?? null,
    promisedAmount: r.promisedAmount ? Number(r.promisedAmount) : null,
    promisedDate: r.promisedDate ?? null,
    notes: r.notes ?? null,
    createdAt: r.createdAt ?? '',
  }
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed'
}

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  IN_PROGRESS: 'text-amber-700 bg-amber-50 border-amber-200',
  RESOLVED: 'text-sky-700 bg-sky-50 border-sky-200',
  CLOSED: 'text-slate-500 bg-slate-50 border-slate-200',
}

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'text-slate-500 bg-slate-100',
  MEDIUM: 'text-amber-700 bg-amber-100',
  HIGH: 'text-rose-700 bg-rose-100',
}

export default function CollectionsCenterPage() {
  const { companyId } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [items, setItems] = useState<CaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<CaseStatus | 'ALL'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | ''>('')
  const [toast, setToast] = useState('')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Detail drawer
  const [drawerCase, setDrawerCase] = useState<CaseRow | null>(null)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  // Create/Edit modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCase, setEditingCase] = useState<CaseRow | null>(null)
  const [form, setForm] = useState({
    subject: '', customerId: '', invoiceId: '', priority: 'MEDIUM' as CasePriority,
    assignedTo: '', notes: '', promisedAmount: '', promisedDate: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Column defs
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const [showColMenu, setShowColMenu] = useState(false)
  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const saveCols = (next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('collections-cols-v1', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const { containerRef, startResize: onResizeStart, isOverflowing: collectionsCenterIsOverflowing } = useFixedWidthResizableColumns({
    columns: cols,
    columnsRef: colsRef,
    saveColumns: saveCols,
    fixedWidth: 160,
  })

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const loadActivity = useCallback(async () => {
    if (!companyId) return
    setActivityLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/integrations/audit-logs`, {
        params: { tableName: 'CollectionsCase', limit: 8 },
      })
      setActivity(Array.isArray(data) ? data : data?.data ?? data?.items ?? [])
    } catch {
      setActivity([])
    } finally {
      setActivityLoading(false)
    }
  }, [companyId])

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true); setError('')
    try {
      const params: Record<string, string> = {}
      if (statusTab !== 'ALL') params.status = statusTab
      if (priorityFilter) params.priority = priorityFilter
      const { data } = await apiClient.get(`/companies/${companyId}/ar/collections`, { params })
      const raw: any[] = Array.isArray(data) ? data : data?.items || []
      setItems(raw.map(normalizeCase))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load collections')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusTab, priorityFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { loadActivity() }, [loadActivity])

  // ─── KPI summary ─────────────────────────────────────────────────────────

  const summary = useMemo(() => {
    const openCases = items.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS').length
    const totalOutstanding = items.filter(r => r.promisedAmount).reduce((s, r) => s + (r.promisedAmount ?? 0), 0)
    const highPriority = items.filter(r => r.priority === 'HIGH').length
    const avgAgeDays = items.length > 0
      ? Math.round(items.reduce((s, r) => {
          const created = r.createdAt ? new Date(r.createdAt).getTime() : Date.now()
          return s + (Date.now() - created) / (1000 * 60 * 60 * 24)
        }, 0) / items.length)
      : 0
    return { openCases, totalOutstanding, highPriority, avgAgeDays }
  }, [items])

  // ─── Selection ────────────────────────────────────────────────────────────

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(r => r.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  // ─── Batch ops ────────────────────────────────────────────────────────────

  async function handleBatchDelete() {
    if (!companyId || selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} case(s)?`)) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/collections/batch/delete`, { ids: Array.from(selectedIds) })
      setSelectedIds(new Set())
      fetchData()
      loadActivity()
      showToast(`Deleted ${selectedIds.size} case(s)`)
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Batch delete failed')
    } finally {
      setBatchLoading(false)
    }
  }

  async function handleBatchStatus(status: CaseStatus) {
    if (!companyId || selectedIds.size === 0) return
    setBatchLoading(true)
    try {
      await apiClient.patch(`/companies/${companyId}/ar/collections/batch/status`, { ids: Array.from(selectedIds), status })
      setSelectedIds(new Set())
      fetchData()
      loadActivity()
      showToast(`Updated ${selectedIds.size} case(s) to ${STATUS_LABELS[status]}`)
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Batch update failed')
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
      if (statusTab !== 'ALL') params.status = statusTab
      if (priorityFilter) params.priority = priorityFilter
      const { data } = await apiClient.get(`/companies/${companyId}/ar/collections/export`, { params })
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'collections-export.csv'; a.click()
      URL.revokeObjectURL(url)
      showToast('Export downloaded')
    } catch {
      showToast('Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  // ─── Delete single ────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!companyId) return
    if (!window.confirm('Delete this collection case?')) return
    setActioningId(id)
    try {
      await apiClient.delete(`/companies/${companyId}/ar/collections/${id}`)
      setDrawerCase(null)
      fetchData()
      loadActivity()
      showToast('Case deleted')
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Delete failed')
    } finally {
      setActioningId(null)
    }
  }

  // ─── Create / Edit modal ─────────────────────────────────────────────────

  function openCreate() {
    setEditingCase(null)
    setForm({ subject: '', customerId: '', invoiceId: '', priority: 'MEDIUM', assignedTo: '', notes: '', promisedAmount: '', promisedDate: '' })
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(row: CaseRow) {
    setEditingCase(row)
    setForm({
      subject: row.subject,
      customerId: row.customerId ?? '',
      invoiceId: row.invoiceId ?? '',
      priority: row.priority,
      assignedTo: row.assignedTo ?? '',
      notes: row.notes ?? '',
      promisedAmount: row.promisedAmount ? String(row.promisedAmount) : '',
      promisedDate: row.promisedDate ?? '',
    })
    setSaveError('')
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    if (!form.subject.trim()) { setSaveError('Subject is required'); return }
    setSaving(true); setSaveError('')
    try {
      const payload = {
        subject: form.subject.trim(),
        customerId: form.customerId || undefined,
        invoiceId: form.invoiceId || undefined,
        priority: form.priority,
        assignedTo: form.assignedTo || undefined,
        notes: form.notes || undefined,
        promisedAmount: form.promisedAmount ? parseFloat(form.promisedAmount) : undefined,
        promisedDate: form.promisedDate || undefined,
      }
      if (editingCase) {
        await apiClient.put(`/companies/${companyId}/ar/collections/${editingCase.id}`, payload)
        showToast('Case updated')
      } else {
        await apiClient.post(`/companies/${companyId}/ar/collections`, payload)
        showToast('Case created')
      }
      setModalOpen(false)
      fetchData()
      loadActivity()
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Failed to save case')
    } finally {
      setSaving(false)
    }
  }

  // ─── Search filter ────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let rows = items
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.caseNumber?.toLowerCase().includes(q) ||
        r.subject?.toLowerCase().includes(q) ||
        (r.customerId ?? '').toLowerCase().includes(q) ||
        (r.assignedTo ?? '').toLowerCase().includes(q)
      )
    }
    return rows
  }, [items, search])

  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir(key === 'createdAt' ? 'desc' : 'asc') }
  }
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compareCases(a, b, sortKey, sortDir)),
    [filtered, sortKey, sortDir] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const visibleCols = cols.filter(c => c.visible)

  const describeActivity = (entry: ActivityLog) => {
    const subject = entry.changes?.subject ?? entry.changes?.caseNumber ?? entry.recordId
    switch (entry.action) {
      case 'CREATE': return `Created ${subject}`
      case 'UPDATE': return entry.changes?.status ? `Updated ${subject} to ${STATUS_LABELS[entry.changes.status] ?? entry.changes.status}` : `Updated ${subject}`
      case 'DELETE': return `Deleted ${subject}`
      default: return `${entry.action} ${subject}`
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Collections Center</h1>
            <p className="text-sm text-slate-500 mt-1">Manage collection cases and payment promises</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} disabled={exportLoading} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40">
              <Download size={15} /> {exportLoading ? 'Exporting…' : 'Export'}
            </button>
            <button onClick={fetchData} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg" title="Refresh">
              <RefreshCw size={16} />
            </button>
            {/* Column visibility */}
            <div className="relative">
              <button onClick={() => setShowColMenu(v => !v)} className="px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Columns</button>
              {showColMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-40 py-2">
                  {cols.map(c => (
                    <label key={c.key} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={c.visible} onChange={() => saveCols(cols.map(col => col.key === c.key ? { ...col, visible: !col.visible } : col))} className="accent-emerald-600" />
                      {c.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">
              <Plus size={16} /> New Case
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {!loading && !error && (
          <div className="px-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Open Cases', value: String(summary.openCases) },
              { label: 'Total Promise Amt', value: formatCurrency(summary.totalOutstanding, currency) },
              { label: 'High Priority', value: String(summary.highPriority) },
              { label: 'Avg Age (Days)', value: String(summary.avgAgeDays) },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">{kpi.label}</p>
                <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Status tabs + filters */}
        <div className="px-6 pb-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setStatusTab(s); setSelectedIds(new Set()) }}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${statusTab === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'}`}
              >
                {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as CasePriority | '')}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <input
            placeholder="Search by case #, subject, customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
          />
        </div>
      </div>

      {/* Batch bar */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-700 text-white px-6 py-2.5 flex items-center gap-3 text-sm font-medium">
          <span>{selectedIds.size} selected</span>
          <button onClick={handleBatchDelete} disabled={batchLoading} className="px-3 py-1 bg-rose-500 hover:bg-rose-600 rounded text-white text-xs font-semibold disabled:opacity-50">Delete</button>
          {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map(s => (
            <button key={s} onClick={() => handleBatchStatus(s)} disabled={batchLoading} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold disabled:opacity-50">
              → {STATUS_LABELS[s]}
            </button>
          ))}
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto p-1 hover:bg-white/20 rounded"><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="px-6 py-5 flex-1">
        <div ref={containerRef} className={`bg-white rounded-xl border border-slate-200 ${collectionsCenterIsOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}`}>
          <table className="w-full text-sm" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="px-3 py-3 w-10 border-r border-slate-200">
                  <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleAll} className="accent-emerald-600" />
                </th>
                {visibleCols.map((col, ci) => (
                  <th
                    key={col.key}
                    style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                    className={`px-4 py-3 font-semibold text-xs uppercase tracking-wide relative select-none border-r border-slate-200 overflow-hidden ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    title={col.label}
                  >
                    <button
                      onClick={() => toggleSort(col.key as SortKey)}
                      className="flex items-center gap-1 w-full min-w-0 overflow-hidden pr-2"
                      style={{ justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start' }}
                    >
                      <span className="truncate">{col.label}</span>
                      <ArrowUpDown size={11} className={`shrink-0 ${sortKey === col.key ? 'text-emerald-600' : 'text-slate-300'}`} />
                    </button>
                    {ci < visibleCols.length - 1 && (
                      <span onMouseDown={e => onResizeStart(e, col.key)} className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-emerald-400/30" />
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-slate-400">
                  <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />Loading…
                </td></tr>
              ) : error ? (
                <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center">
                  <p className="text-rose-500 font-medium">{error}</p>
                  <button onClick={fetchData} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={visibleCols.length + 2} className="px-4 py-10 text-center text-slate-500">No collection cases found.</td></tr>
              ) : (
                sorted.map(row => (
                  <tr key={row.id} className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${selectedIds.has(row.id) ? 'bg-emerald-50' : ''}`}>
                    <td className="px-3 py-3 border-r border-slate-100">
                      <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleOne(row.id)} className="accent-emerald-600" />
                    </td>
                    {visibleCols.map(col => (
                      <td key={col.key} className={`px-4 py-3 truncate cursor-pointer border-r border-slate-100 ${col.align === 'right' ? 'text-right tabular-nums' : ''}`} onClick={() => setDrawerCase(row)}>
                        {col.key === 'caseNumber' && <span className="font-mono text-xs text-slate-700">{row.caseNumber}</span>}
                        {col.key === 'subject' && <span className="font-medium text-slate-900 truncate max-w-[180px] inline-block" title={row.subject}>{row.subject}</span>}
                        {col.key === 'customerId' && <span className="text-slate-600 font-mono text-xs">{row.customerId ? row.customerId.slice(0, 12) + '…' : '—'}</span>}
                        {col.key === 'status' && (
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${STATUS_COLOR[row.status]}`}>
                            {STATUS_LABELS[row.status]}
                          </span>
                        )}
                        {col.key === 'priority' && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLOR[row.priority]}`}>
                            {row.priority.charAt(0) + row.priority.slice(1).toLowerCase()}
                          </span>
                        )}
                        {col.key === 'assignedTo' && <span className="text-slate-600">{row.assignedTo ?? '—'}</span>}
                        {col.key === 'promisedAmount' && (
                          <span className="font-semibold text-slate-800">
                            {row.promisedAmount != null ? formatCurrency(row.promisedAmount, currency) : '—'}
                          </span>
                        )}
                        {col.key === 'promisedDate' && <span className="text-slate-600">{fmtDate(row.promisedDate)}</span>}
                        {col.key === 'createdAt' && <span className="text-slate-600">{fmtDate(row.createdAt)}</span>}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(row)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline">Edit</button>
                        <span className="text-slate-300">·</span>
                        <button onClick={() => handleDelete(row.id)} disabled={actioningId === row.id} className="text-xs font-semibold text-rose-500 hover:underline disabled:opacity-40">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && (
          <p className="mt-3 text-sm text-slate-500">{filtered.length} case(s) shown · {items.length} total</p>
        )}

        <section className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Clock size={14} className="text-emerald-600" />Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest collection-case changes across this workspace</p>
            </div>
          </div>
          {activityLoading ? (
            <div className="px-4 py-8 text-sm text-slate-500">Loading activity…</div>
          ) : activity.length === 0 ? (
            <div className="px-4 py-8 text-sm text-slate-500">No collection activity recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activity.map((entry) => (
                <div key={entry.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{describeActivity(entry)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{entry.user?.name ?? entry.user?.email ?? 'System'}</p>
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Detail Drawer */}
      {drawerCase && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawerCase(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{drawerCase.caseNumber}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{drawerCase.subject}</p>
              </div>
              <button onClick={() => setDrawerCase(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${STATUS_COLOR[drawerCase.status]}`}>{STATUS_LABELS[drawerCase.status]}</span>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Priority</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLOR[drawerCase.priority]}`}>{drawerCase.priority}</span>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Assigned To</p>
                  <p className="font-semibold text-slate-800">{drawerCase.assignedTo ?? '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Opened</p>
                  <p className="font-semibold text-slate-800">{fmtDate(drawerCase.createdAt)}</p>
                </div>
                {drawerCase.promisedAmount != null && (
                  <>
                    <div>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Promise Amount</p>
                      <p className="font-bold text-lg text-slate-900">{formatCurrency(drawerCase.promisedAmount, currency)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Promise Date</p>
                      <p className="font-semibold text-slate-800">{fmtDate(drawerCase.promisedDate)}</p>
                    </div>
                  </>
                )}
                {drawerCase.customerId && (
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Customer ID</p>
                    <p className="font-mono text-xs text-slate-700">{drawerCase.customerId}</p>
                  </div>
                )}
                {drawerCase.invoiceId && (
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Invoice ID</p>
                    <p className="font-mono text-xs text-slate-700">{drawerCase.invoiceId}</p>
                  </div>
                )}
              </div>
              {drawerCase.notes && (
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{drawerCase.notes}</p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex gap-2">
              <button onClick={() => { openEdit(drawerCase); setDrawerCase(null) }} className="flex-1 px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Edit Case</button>
              <button onClick={() => handleDelete(drawerCase.id)} disabled={actioningId === drawerCase.id} className="px-4 py-2 text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-lg disabled:opacity-50">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingCase ? 'Edit Case' : 'New Collection Case'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                <input
                  required
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Describe this case…"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as CasePriority }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
                  <input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Collector name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer ID</label>
                  <input value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Invoice ID</label>
                  <input value={form.invoiceId} onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono" placeholder="Optional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Promise Amount</label>
                  <input type="number" min="0" step="0.01" value={form.promisedAmount} onChange={e => setForm(f => ({ ...f, promisedAmount: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Promise Date</label>
                  <input type="date" value={form.promisedDate} onChange={e => setForm(f => ({ ...f, promisedDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none" placeholder="Collection notes…" />
              </div>
              {saveError && <p className="text-sm text-rose-500">{saveError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60">
                  {saving ? 'Saving…' : editingCase ? 'Update Case' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


