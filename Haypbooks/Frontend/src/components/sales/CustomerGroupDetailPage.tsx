'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Edit2, Trash2, Plus, Search, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'

const PAGE_SIZE = 25

type Group = {
  id: string
  name: string
  description: string
  customerCount: number
}

type Member = {
  id: string
  name: string
  email: string
  paymentTermName: string
}

type AvailableCustomer = {
  id: string
  name: string
  email?: string
  groupId?: string | null
}

// ─── Edit Group Modal ──────────────────────────────────────────────────────────

function EditGroupModal({
  group,
  companyId,
  onClose,
  onSaved,
}: {
  group: Group
  companyId: string
  onClose: () => void
  onSaved: (updated: Partial<Group>) => void
}) {
  const toast = useToast()
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description)
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Group name is required'); return }
    setSaving(true)
    try {
      await apiClient.put(`/companies/${companyId}/ar/customer-groups/${group.id}`, {
        name: name.trim(),
        description: description.trim(),
      })
      toast.success('Group updated')
      onSaved({ name: name.trim(), description: description.trim() })
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update group')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Edit Group</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Group Name <span className="text-red-500">*</span></label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Add Members Modal ─────────────────────────────────────────────────────────

function AddMembersModal({
  groupId,
  companyId,
  existingIds,
  onClose,
  onAdded,
}: {
  groupId: string
  companyId: string
  existingIds: Set<string>
  onClose: () => void
  onAdded: () => void
}) {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState<AvailableCustomer[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)

  const fetchCustomers = useCallback(async (q: string) => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers`, {
        params: { search: q || undefined, limit: 50, offset: 0 },
      })
      const list: AvailableCustomer[] = (Array.isArray(data) ? data : data.data ?? []).filter(
        (c: any) => !existingIds.has(c.id) && c.groupId == null
      )
      setCustomers(list)
    } catch {
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [companyId, existingIds])

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(search), 300)
    return () => clearTimeout(t)
  }, [search, fetchCustomers])

  const toggleOne = (id: string) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const handleAdd = async () => {
    if (!selected.size) return
    setAdding(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/customer-groups/${groupId}/members`, {
        customerIds: [...selected],
      })
      toast.success(`${selected.size} customer(s) added`)
      onAdded()
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add members')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Add Customers to Group</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
        </div>
        <div className="p-4 flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customers not yet in a group…"
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Only customers without an existing group are shown.</p>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-gray-100">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : customers.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No available customers found.</p>
          ) : (
            customers.map(c => (
              <label key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggleOne(c.id)}
                  className="accent-blue-600"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                  {c.email && <p className="text-xs text-gray-400 truncate">{c.email}</p>}
                </div>
              </label>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <span className="text-sm text-gray-500">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button
              onClick={handleAdd}
              disabled={!selected.size || adding}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
            >
              {adding ? 'Adding…' : `Add ${selected.size || ''} Customer${selected.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CustomerGroupDetailPage({ groupId }: { groupId: string }) {
  const { companyId, loading: companyLoading } = useCompanyId()
  const router = useRouter()
  const toast = useToast()

  const [group, setGroup] = useState<Group | null>(null)
  const [groupLoading, setGroupLoading] = useState(true)
  const [groupError, setGroupError] = useState('')

  const [members, setMembers] = useState<Member[]>([])
  const [membersTotal, setMembersTotal] = useState(0)
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError, setMembersError] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [memberPage, setMemberPage] = useState(0)

  const [editOpen, setEditOpen] = useState(false)
  const [addMembersOpen, setAddMembersOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const fetchGroup = useCallback(async () => {
    if (!companyId) return
    setGroupLoading(true)
    setGroupError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customer-groups/${groupId}`)
      setGroup(data)
    } catch (err: any) {
      setGroupError(err?.response?.data?.message ?? 'Failed to load group')
    } finally {
      setGroupLoading(false)
    }
  }, [companyId, groupId])

  const fetchMembers = useCallback(async (pg = 0, search = '') => {
    if (!companyId) return
    setMembersLoading(true)
    setMembersError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customer-groups/${groupId}/members`, {
        params: { search: search || undefined, limit: PAGE_SIZE, offset: pg * PAGE_SIZE },
      })
      setMembers(Array.isArray(data) ? data : data.data ?? [])
      setMembersTotal(typeof data.total === 'number' ? data.total : (data.data ?? data).length)
    } catch (err: any) {
      setMembersError(err?.response?.data?.message ?? 'Failed to load members')
    } finally {
      setMembersLoading(false)
    }
  }, [companyId, groupId])

  useEffect(() => {
    fetchGroup()
    fetchMembers(0, '')
  }, [fetchGroup, fetchMembers])

  useEffect(() => {
    const t = setTimeout(() => { setMemberPage(0); fetchMembers(0, memberSearch) }, 350)
    return () => clearTimeout(t)
  }, [memberSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(membersTotal / PAGE_SIZE))

  const existingMemberIds = useMemo(() => new Set(members.map(m => m.id)), [members])

  const allSelected = members.length > 0 && members.every(m => selectedIds.has(m.id))
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(prev => { const next = new Set(prev); members.forEach(m => next.delete(m.id)); return next })
    } else {
      setSelectedIds(prev => { const next = new Set(prev); members.forEach(m => next.add(m.id)); return next })
    }
  }
  const toggleOne = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const handleRemoveMember = async (memberId: string) => {
    setRemovingIds(prev => new Set(prev).add(memberId))
    try {
      await apiClient.delete(`/companies/${companyId}/ar/customer-groups/${groupId}/members`, {
        data: { customerIds: [memberId] },
      })
      toast.success('Customer removed from group')
      fetchGroup()
      fetchMembers(memberPage, memberSearch)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to remove member')
    } finally {
      setRemovingIds(prev => { const next = new Set(prev); next.delete(memberId); return next })
    }
  }

  const handleBatchRemove = async () => {
    const ids = [...selectedIds]
    if (!ids.length) return
    if (!confirm(`Remove ${ids.length} customer(s) from this group?`)) return
    try {
      await apiClient.delete(`/companies/${companyId}/ar/customer-groups/${groupId}/members`, {
        data: { customerIds: ids },
      })
      toast.success(`${ids.length} customer(s) removed`)
      setSelectedIds(new Set())
      fetchGroup()
      fetchMembers(memberPage, memberSearch)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Batch remove failed')
    }
  }

  const handleDeleteGroup = async () => {
    if (!group) return
    if (!confirm(`Delete group "${group.name}"? All customers will be unassigned.`)) return
    try {
      await apiClient.delete(`/companies/${companyId}/ar/customer-groups/${groupId}`)
      toast.success('Group deleted')
      router.push('/sales/customers/groups')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete group')
    }
  }

  if (companyLoading || groupLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (groupError || !group) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-red-500 font-medium">{groupError || 'Group not found'}</p>
        <button onClick={() => router.push('/sales/customers/groups')} className="mt-3 text-sm text-emerald-600 hover:underline">
          Back to Groups
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.push('/sales/customers/groups')}
              className="mt-1 p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              title="Back to Groups"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users size={20} className="text-emerald-600" />
                {group.name}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {group.description || <span className="italic">No description</span>}
                &nbsp;·&nbsp;
                <span className="font-medium text-gray-700">{group.customerCount} customer{group.customerCount !== 1 ? 's' : ''}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Edit2 size={13} />
              Edit
            </button>
            <button
              onClick={handleDeleteGroup}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 rounded-lg text-red-600 hover:bg-red-50"
            >
              <Trash2 size={13} />
              Delete Group
            </button>
            <button
              onClick={() => setAddMembersOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              <Plus size={14} />
              Add Customers
            </button>
          </div>
        </div>

        {/* Members search */}
        <div className="px-6 pb-3 flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              placeholder="Search members…"
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={() => { fetchGroup(); fetchMembers(memberPage, memberSearch) }}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw size={13} />
          </button>
          <span className="text-xs text-gray-400">{membersTotal} member{membersTotal !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Batch bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-[105px] z-20 bg-emerald-600 text-white px-6 py-2 flex items-center gap-3 text-sm shadow-md">
          <span className="font-semibold">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <button
            onClick={handleBatchRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 font-medium"
          >
            <Trash2 size={13} />
            Remove from Group
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="p-1.5 rounded-lg hover:bg-white/20">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Members Table */}
      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-10 px-3 py-3">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-blue-600" />
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Customer</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Payment Terms</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {membersLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                      Loading members…
                    </td>
                  </tr>
                ) : membersError ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center">
                      <p className="text-red-500 font-medium">{membersError}</p>
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      {memberSearch ? 'No members match your search.' : 'No customers in this group yet. Use "Add Customers" to add members.'}
                    </td>
                  </tr>
                ) : (
                  members.map(member => (
                    <tr
                      key={member.id}
                      className={`border-t border-gray-100 hover:bg-blue-50/30 transition-colors ${selectedIds.has(member.id) ? 'bg-blue-50/20' : ''}`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input type="checkbox" checked={selectedIds.has(member.id)} onChange={() => toggleOne(member.id)} className="accent-blue-600" />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <button
                          onClick={() => router.push(`/sales/customers/${member.id}`)}
                          className="text-emerald-600 hover:text-emerald-800 hover:underline text-left"
                        >
                          {member.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{member.email || <span className="italic text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-gray-500">{member.paymentTermName || <span className="italic text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removingIds.has(member.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-40"
                          title="Remove from group"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {membersTotal > PAGE_SIZE && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between text-sm text-gray-600">
              <span>Showing {memberPage * PAGE_SIZE + 1}–{Math.min(memberPage * PAGE_SIZE + PAGE_SIZE, membersTotal)} of {membersTotal}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { const p = Math.max(0, memberPage - 1); setMemberPage(p); fetchMembers(p, memberSearch) }}
                  disabled={memberPage === 0}
                  className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2">Page {memberPage + 1} / {totalPages}</span>
                <button
                  onClick={() => { const p = Math.min(totalPages - 1, memberPage + 1); setMemberPage(p); fetchMembers(p, memberSearch) }}
                  disabled={memberPage >= totalPages - 1}
                  className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <EditGroupModal
          group={group}
          companyId={companyId!}
          onClose={() => setEditOpen(false)}
          onSaved={updates => setGroup(prev => prev ? { ...prev, ...updates } : prev)}
        />
      )}

      {/* Add Members Modal */}
      {addMembersOpen && (
        <AddMembersModal
          groupId={groupId}
          companyId={companyId!}
          existingIds={existingMemberIds}
          onClose={() => setAddMembersOpen(false)}
          onAdded={() => { fetchGroup(); fetchMembers(memberPage, memberSearch) }}
        />
      )}
    </div>
  )
}
