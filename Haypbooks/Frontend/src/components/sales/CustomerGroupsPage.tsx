'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit2, Trash2, RefreshCw, Download, Users, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'

const PAGE_SIZE = 25
const LS_WIDTHS = 'sales-customer-groups-col-widths'

type CustomerGroup = {
  id: string
  name: string
  description: string
  customerCount: number
}

type ActivityLog = {
  id: string
  action: string
  recordId: string
  createdAt: string
  changes?: Record<string, any> | null
  user?: { id?: string; name?: string | null; email?: string | null } | null
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

function GroupFormModal({
  mode,
  initial,
  onClose,
  onSaved,
  companyId,
}: {
  mode: 'create' | 'edit'
  initial?: CustomerGroup
  onClose: () => void
  onSaved: () => void
  companyId: string
}) {
  const toast = useToast()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Group name is required'); return }
    setSaving(true)
    try {
      if (mode === 'create') {
        await apiClient.post(`/companies/${companyId}/ar/customer-groups`, { name: name.trim(), description: description.trim() })
        toast.success('Group created')
      } else {
        await apiClient.put(`/companies/${companyId}/ar/customer-groups/${initial!.id}`, { name: name.trim(), description: description.trim() })
        toast.success('Group updated')
      }
      onSaved()
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save group')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{mode === 'create' ? 'New Customer Group' : 'Edit Group'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Group Name <span className="text-red-500">*</span></label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Wholesale"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">
              {saving ? 'Saving…' : mode === 'create' ? 'Create Group' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerGroupsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const router = useRouter()
  const toast = useToast()

  const [groups, setGroups] = useState<CustomerGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; group: CustomerGroup } | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [batchDeleting, setBatchDeleting] = useState(false)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  // Resizable columns
  const defaultWidths = { name: 220, description: 320, count: 120, actions: 100 }
  const [colWidths, setColWidths] = useState<typeof defaultWidths>(() => {
    if (typeof window === 'undefined') return defaultWidths
    try { return { ...defaultWidths, ...JSON.parse(localStorage.getItem(LS_WIDTHS) ?? '{}') } } catch { return defaultWidths }
  })
  const colWidthsRef = useRef(colWidths)
  useEffect(() => { colWidthsRef.current = colWidths }, [colWidths])
  const saveColWidths = useCallback((next: typeof defaultWidths) => {
    setColWidths(next)
    localStorage.setItem(LS_WIDTHS, JSON.stringify(next))
  }, [])
  const { containerRef, startResize, isOverflowing: customerGroupsIsOverflowing } = useFixedWidthResizableMap({
    widths: colWidths,
    widthsRef: colWidthsRef,
    order: ['name', 'description', 'count', 'actions'],
    saveWidths: saveColWidths,
    fixedWidth: 40,
    minWidth: { name: 80, description: 80, count: 80, actions: 100 },
  })

  const fetchGroups = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customer-groups`)
      setGroups(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const loadActivity = useCallback(async () => {
    if (!companyId) return
    setActivityLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/integrations/audit-logs`, {
        params: { tableName: 'CustomerGroup', limit: 8 },
      })
      setActivity(Array.isArray(data) ? data : data?.data ?? data?.items ?? [])
    } catch {
      setActivity([])
    } finally {
      setActivityLoading(false)
    }
  }, [companyId])

  useEffect(() => { loadActivity() }, [loadActivity])

  const filtered = useMemo(() => {
    if (!search.trim()) return groups
    const q = search.toLowerCase()
    return groups.filter(g => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
  }, [groups, search])

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const allSelected = paginated.length > 0 && paginated.every(g => selectedIds.has(g.id))
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(prev => { const next = new Set(prev); paginated.forEach(g => next.delete(g.id)); return next })
    } else {
      setSelectedIds(prev => { const next = new Set(prev); paginated.forEach(g => next.add(g.id)); return next })
    }
  }
  const toggleOne = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const handleDelete = async (group: CustomerGroup) => {
    if (!confirm(`Delete group "${group.name}"? This will unassign all its customers.`)) return
    try {
      await apiClient.delete(`/companies/${companyId}/ar/customer-groups/${group.id}`)
      toast.success('Group deleted')
      fetchGroups()
      loadActivity()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete group')
    }
  }

  const handleBatchDelete = async () => {
    const ids = [...selectedIds]
    if (!ids.length) return
    if (!confirm(`Delete ${ids.length} group(s)? This will unassign all their customers.`)) return
    setBatchDeleting(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/customer-groups/batch/delete`, { ids })
      toast.success(`${ids.length} group(s) deleted`)
      setSelectedIds(new Set())
      fetchGroups()
      loadActivity()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Batch delete failed')
    } finally {
      setBatchDeleting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customer-groups/export`)
      const blob = new Blob([data.csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = data.filename; a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const ResizeHandle = ({ col }: { col: keyof typeof defaultWidths }) => (
    <span
      className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none hover:bg-blue-400 opacity-0 group-hover:opacity-100"
      onMouseDown={e => startResize(e, col)}
    />
  )

  const describeActivity = (entry: ActivityLog) => {
    const name = entry.changes?.name ?? entry.recordId
    switch (entry.action) {
      case 'CREATE': return `Created group ${name}`
      case 'UPDATE': return `Updated group ${name}`
      case 'DELETE': return `Deleted group ${name}`
      default: return `${entry.action} group ${name}`
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={22} className="text-emerald-600" />
              Customer Groups
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Organize customers into segments for reporting and pricing</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Download size={14} />
              {exporting ? 'Exporting…' : 'Export'}
            </button>
            <button
              onClick={() => fetchGroups()}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setModal({ mode: 'create' })}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              <Plus size={14} />
              New Group
            </button>
            <button
              onClick={() => setHelpOpen(o => !o)}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-bold"
              title="Help"
            >?</button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 pb-3 flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search groups…"
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-gray-400">{filtered.length} group{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Batch bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-[105px] z-20 bg-emerald-600 text-white px-6 py-2 flex items-center gap-3 text-sm shadow-md">
          <span className="font-semibold">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <button
            onClick={handleBatchDelete}
            disabled={batchDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 font-medium"
          >
            <Trash2 size={13} />
            {batchDeleting ? 'Deleting…' : 'Delete Selected'}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1.5 rounded-lg hover:bg-white/20"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div ref={containerRef} className={`${customerGroupsIsOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'}`}>
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-10 px-3 py-3">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-blue-600" />
                  </th>
                  <th className="relative group text-left px-4 py-3 text-gray-600 font-semibold overflow-hidden" style={{ width: colWidths.name, minWidth: colWidths.name, maxWidth: colWidths.name }} title="Name">
                    <span className="block truncate pr-3">Name</span><ResizeHandle col="name" />
                  </th>
                  <th className="relative group text-left px-4 py-3 text-gray-600 font-semibold overflow-hidden" style={{ width: colWidths.description, minWidth: colWidths.description, maxWidth: colWidths.description }} title="Description">
                    <span className="block truncate pr-3">Description</span><ResizeHandle col="description" />
                  </th>
                  <th className="relative group text-right px-4 py-3 text-gray-600 font-semibold overflow-hidden" style={{ width: colWidths.count, minWidth: colWidths.count, maxWidth: colWidths.count }} title="Customers">
                    <span className="block truncate pr-3">Customers</span><ResizeHandle col="count" />
                  </th>
                  <th className="text-right px-4 py-3 text-gray-600 font-semibold" style={{ width: colWidths.actions }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                      Loading groups…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center">
                      <p className="text-red-500 font-medium mb-2">{error}</p>
                      <button onClick={fetchGroups} className="text-sm text-emerald-600 hover:underline">Try again</button>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      {search ? 'No groups match your search.' : 'No customer groups yet. Create your first group.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map(group => (
                    <tr
                      key={group.id}
                      className={`border-t border-gray-100 hover:bg-blue-50/30 transition-colors ${selectedIds.has(group.id) ? 'bg-blue-50/20' : ''}`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input type="checkbox" checked={selectedIds.has(group.id)} onChange={() => toggleOne(group.id)} className="accent-blue-600" />
                      </td>
                      <td className="px-4 py-3 font-medium truncate" style={{ width: colWidths.name, maxWidth: colWidths.name }}>
                        <button
                          onClick={() => router.push(`/sales/customers/groups/${group.id}`)}
                          className="text-emerald-600 hover:text-emerald-800 hover:underline text-left w-full truncate"
                        >
                          {group.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500 truncate" style={{ width: colWidths.description, maxWidth: colWidths.description }}>
                        {group.description || <span className="italic text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 font-medium" style={{ width: colWidths.count }}>
                        {group.customerCount}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ width: colWidths.actions }}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setModal({ mode: 'edit', group })}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(group)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between text-sm text-gray-600">
              <span>Showing {page * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE + PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2">Page {page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <section className="mt-5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Clock size={14} className="text-emerald-600" />Recent Activity</h2>
            <p className="text-xs text-gray-500 mt-0.5">Latest customer-group create, update, and delete events</p>
          </div>
          {activityLoading ? (
            <div className="px-4 py-8 text-sm text-gray-500">Loading activity…</div>
          ) : activity.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-500">No customer group activity recorded yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activity.map((entry) => (
                <div key={entry.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{describeActivity(entry)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{entry.user?.name ?? entry.user?.email ?? 'System'}</p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Form Modal */}
      {modal && (
        <GroupFormModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.group : undefined}
          companyId={companyId!}
          onClose={() => setModal(null)}
          onSaved={() => { fetchGroups(); loadActivity() }}
        />
      )}

      {/* Help */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-y-auto max-h-[85vh]">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-semibold">Customer Groups Help</h2>
              <button onClick={() => setHelpOpen(false)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-4 text-sm text-gray-700 space-y-3">
              <p>Customer Groups let you segment your customers for reporting, pricing rules, and targeted workflows.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create named groups (e.g. Wholesale, VIP, Retail).</li>
                <li>Assign customers to groups individually or in bulk from the Customers page.</li>
                <li>Click a group name to view and manage its members.</li>
                <li>Use groups as filters in the Customers list and reports.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
