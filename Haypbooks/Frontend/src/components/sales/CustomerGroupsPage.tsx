'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, RefreshCw, Download, Users, X, Clock } from 'lucide-react'
import { salesService } from '@/services/sales.service'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import HaypModal from '@/components/shared/HaypModal'


type CustomerGroupRow = {
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
  initial?: CustomerGroupRow
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
        await salesService.createArCustomerGroup(companyId, { name: name.trim(), description: description.trim() })
        toast.success('Group created')
      } else {
        await salesService.updateArCustomerGroup(companyId, initial!.id, { name: name.trim(), description: description.trim() })
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
    <HaypModal
      open={true}
      onClose={onClose}
      title={mode === 'create' ? 'New Customer Group' : 'Edit Group'}
      subtitle={mode === 'create' ? 'Create a group to organize customers into segments.' : undefined}
      size="sm"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Group Name <span className="text-red-500">*</span></label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Wholesale"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional description"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">
            {saving ? 'Saving…' : mode === 'create' ? 'Create Group' : 'Save Changes'}
          </button>
        </div>
      </form>
    </HaypModal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerGroupsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const router = useRouter()
  const toast = useToast()

  const [groups, setGroups] = useState<CustomerGroupRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; group: CustomerGroupRow } | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [batchDeleting, setBatchDeleting] = useState(false)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  const fetchGroups = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const response = await salesService.listArCustomerGroups(companyId)
      const result = response.data as any
      setGroups(Array.isArray(result) ? result : [])
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
      const response = await salesService.getArCustomerGroupActivity(companyId, { tableName: 'CustomerGroup', limit: 8 })
      const result = response.data
      setActivity(Array.isArray(result) ? result : result?.data ?? result?.items ?? [])
    } catch {
      setActivity([])
    } finally {
      setActivityLoading(false)
    }
  }, [companyId])

  useEffect(() => { loadActivity() }, [loadActivity])

  const handleDelete = async (group: CustomerGroupRow) => {
    if (!confirm(`Delete group "${group.name}"? ${group.customerCount} customer(s) will be unassigned.`)) return
    try {
      await salesService.deleteArCustomerGroup(companyId!, group.id)
      toast.success('Group deleted')
      fetchGroups()
      loadActivity()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete group')
    }
  }

  const handleBatchDelete = async (ids: string[]) => {
    if (!ids.length) return
    const affectedCustomers = groups.filter(g => ids.includes(g.id)).reduce((sum, g) => sum + (g.customerCount ?? 0), 0)
    if (!confirm(`Delete ${ids.length} group(s)? A total of ${affectedCustomers} customer(s) will be unassigned.`)) return
    setBatchDeleting(true)
    try {
      await salesService.batchDeleteArCustomerGroups(companyId!, ids)
      toast.success(`${ids.length} group(s) deleted`)
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
      const response = await salesService.exportArCustomerGroups(companyId!)
      const result = response.data
      const csv = typeof result === 'string' ? result : result.csv ?? ''
      const filename = typeof result === 'string' ? 'customer-groups.csv' : result.filename ?? 'customer-groups.csv'
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const columns = useMemo(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Group Name',
      render: (value: any, row: CustomerGroupRow) => (
        <button
          type="button"
          onClick={() => router.push(`/sales/customers/groups/${row.id}`)}
          className="text-left text-emerald-600 hover:text-emerald-800 hover:underline font-medium"
        >
          {value}
        </button>
      ),
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      render: (value: any) => (
        <span className="text-gray-500">{value || <span className="italic text-gray-300">—</span>}</span>
      ),
    },
    {
      id: 'customerCount',
      accessorKey: 'customerCount',
      header: 'Customers',
      align: 'right' as const,
      render: (value: any) => (
        <span className="text-gray-700 font-medium">{value ?? 0}</span>
      ),
    },
  ], [router])

  const rowActions = useMemo(
    () => [
      {
        label: 'Edit',
        icon: <Edit2 size={14} />,
        onClick: (_rowId: string, row: CustomerGroupRow) => setModal({ mode: 'edit', group: row }),
      },
      {
        label: 'Delete',
        icon: <Trash2 size={14} />,
        danger: true,
        onClick: (_rowId: string, row: CustomerGroupRow) => handleDelete(row),
      },
    ],
    [handleDelete],
  )

  const bulkActions = useMemo(
    () => [
      {
        label: 'Delete Selected',
        icon: <Trash2 size={14} />,
        variant: 'danger' as const,
        onClick: (selectedIds: string[]) => handleBatchDelete(selectedIds),
      },
    ],
    [handleBatchDelete],
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
      <div className="bg-white border-b border-gray-200 shadow-sm">
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

      </div>

      <div className="px-6 py-5">
        <HaypDataTable
          tableId="customer-groups"
          title="Customer Groups"
          description="Organize customers into segments for reporting and pricing"
          data={groups}
          columns={columns}
          actions={rowActions}
          bulkActions={bulkActions}
          loading={loading || companyLoading}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          searchPlaceholder="Search groups…"
          emptyTitle="No customer groups yet"
          emptySubtitle="Create your first group to organize customers"
          onRefresh={fetchGroups}
          onExport={handleExport}
          exportLabel={exporting ? 'Exporting…' : 'Export'}
          onRowClick={(row) => router.push(`/sales/customers/groups/${row.id}`)}
          className="bg-white rounded-xl border border-gray-200"
        />

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-y-auto max-h-[85vh]">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-semibold">Customer Groups Help</h2>
              <button onClick={() => setHelpOpen(false)} className="p-1 rounded hover:bg-gray-100" aria-label="Close help" title="Close help"><X size={16} /></button>
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
