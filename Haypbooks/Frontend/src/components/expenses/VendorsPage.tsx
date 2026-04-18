'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Loader2, Building, Clock } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ui/Toast'

interface Vendor {
  id: string; name: string; email?: string; phone?: string; address?: string; city?: string; state?: string; country?: string; taxId?: string; balance?: number; status?: string
}

export default function VendorsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)

  const fetchVendors = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/vendors`)
      setVendors(Array.isArray(data) ? data : data.vendors ?? [])
      setError('')
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to load vendors') }
    finally { setLoading(false) }
  }, [companyId])

  useEffect(() => { fetchVendors() }, [fetchVendors])

  const filtered = useMemo(() => {
    if (!search) return vendors
    const q = search.toLowerCase()
    return vendors.filter(v => v.name.toLowerCase().includes(q) || (v.email ?? '').toLowerCase().includes(q))
  }, [vendors, search])

  const toggleSelectAll = () => {
    const allSelected = filtered.length > 0 && filtered.every((item) => selectedIds.includes(item.id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filtered.some((item) => item.id === id)))
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...filtered.map((item) => item.id)])])
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  const handleDeleteSelected = async () => {
    if (!companyId || selectedIds.length === 0) return
    setLoading(true)
    setError('')
    try {
      await Promise.all(selectedIds.map((id) => apiClient.delete(`/companies/${companyId}/vendors/${id}`)))
      setVendors((prev) => prev.filter((vendor) => !selectedIds.includes(vendor.id)))
      setSelectedIds([])
      toast.success(`${selectedIds.length} selected vendor${selectedIds.length === 1 ? '' : 's'} deleted`)
    } catch (e: any) {
      const message = e?.response?.data?.message ?? 'Failed to delete selected vendors'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!companyId) return
    try { await apiClient.delete(`/companies/${companyId}/vendors/${id}`); fetchVendors() }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to delete vendor') }
  }

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  if (cidLoading || (loading && vendors.length === 0)) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /><span className="ml-2 text-emerald-700">Loading vendors…</span></div>
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-emerald-900">Vendors</h1><p className="text-sm text-emerald-600/70 mt-0.5">{filtered.length} vendors</p></div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button onClick={handleDeleteSelected} className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors">
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <button onClick={() => { setEditing(null); setShowForm(true) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-emerald-100 p-3">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input type="text" placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle size={16} /> {error} <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button></div>}
      <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-emerald-50/50 border-b border-emerald-100">
            <th className="w-10 px-3 py-3 text-left text-emerald-700">
              <button onClick={toggleSelectAll} className="text-emerald-600 hover:text-emerald-900 transition-colors">
                {filtered.length > 0 && filtered.every((vendor) => selectedIds.includes(vendor.id)) ? '▣' : '▢'}
              </button>
            </th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700">Name</th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden md:table-cell">Email</th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden lg:table-cell">Phone</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700">Balance</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700 w-24">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-emerald-400"><Building size={24} className="mx-auto mb-2 opacity-50" />No vendors found.</td></tr>
            ) : (
              filtered.map(v => {
                const isSelected = selectedIds.includes(v.id)
                return (
                  <tr key={v.id} className={`border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors ${isSelected ? 'bg-emerald-50/60' : ''}`}>
                    <td className="px-3 py-2">
                      <button onClick={() => toggleSelect(v.id)} className="text-emerald-500 hover:text-emerald-900 transition-colors">
                        {isSelected ? '▣' : '▢'}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-emerald-900">{v.name}</td>
                    <td className="px-4 py-2.5 text-emerald-600/70 hidden md:table-cell">{v.email ?? '—'}</td>
                    <td className="px-4 py-2.5 text-emerald-600/70 hidden lg:table-cell">{v.phone ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-emerald-800">{fmt(v.balance ?? 0)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(v); setShowForm(true) }} className="p-1 rounded hover:bg-emerald-100 text-emerald-600"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(v.id)} className="p-1 rounded hover:bg-red-100 text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {showForm && <VendorFormModal companyId={companyId!} vendor={editing} onClose={() => { setShowForm(false); setEditing(null) }} onSaved={() => { setShowForm(false); setEditing(null); fetchVendors() }} />}
      </AnimatePresence>
    </div>
  )
}

interface ActivityEntry { id: string; action: string; createdAt: string; user?: { name?: string; email?: string } | null; changes?: Record<string, unknown> | null }

function VendorFormModal({ companyId, vendor, onClose, onSaved }: { companyId: string; vendor: Vendor | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!vendor
  const [form, setForm] = useState({ name: vendor?.name ?? '', email: vendor?.email ?? '', phone: vendor?.phone ?? '', address: vendor?.address ?? '', city: vendor?.city ?? '', state: vendor?.state ?? '', country: vendor?.country ?? '', taxId: vendor?.taxId ?? '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [modalTab, setModalTab] = useState<'form' | 'activity'>('form')
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  useEffect(() => {
    if (modalTab !== 'activity' || !isEdit || !vendor?.id) return
    setActivityLoading(true)
    apiClient.get(`/companies/${companyId}/ap/vendors/${vendor.id}/activity`)
      .then(({ data }) => setActivityLog(data.data ?? []))
      .catch(() => setActivityLog([]))
      .finally(() => setActivityLoading(false))
  }, [modalTab, isEdit, vendor?.id, companyId])

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError('')
    try {
      if (isEdit) await apiClient.put(`/companies/${companyId}/vendors/${vendor!.id}`, form)
      else await apiClient.post(`/companies/${companyId}/vendors`, form)
      onSaved()
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to save') }
    finally { setSaving(false) }
  }

  const fmtDate = (d: string) => { try { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) } catch { return d } }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-900">{isEdit ? 'Edit Vendor' : 'New Vendor'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
        </div>
        {isEdit && (
          <div className="flex border-b border-emerald-100 px-6 pt-3">
            {(['form', 'activity'] as const).map(tab => (
              <button key={tab} onClick={() => setModalTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${modalTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-emerald-400 hover:text-emerald-600'}`}>
                {tab === 'form' ? 'Details' : 'Activity'}
              </button>
            ))}
          </div>
        )}
        {modalTab === 'form' || !isEdit ? (
          <>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700"><AlertCircle size={14} className="inline mr-1" />{error}</div>}
              <div><label className="block text-xs font-medium text-emerald-700 mb-1">Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-emerald-700 mb-1">Email</label><input value={form.email} onChange={e => set('email', e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
                <div><label className="block text-xs font-medium text-emerald-700 mb-1">Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
              </div>
              <div><label className="block text-xs font-medium text-emerald-700 mb-1">Address</label><input value={form.address} onChange={e => set('address', e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium text-emerald-700 mb-1">City</label><input value={form.city} onChange={e => set('city', e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
                <div><label className="block text-xs font-medium text-emerald-700 mb-1">State</label><input value={form.state} onChange={e => set('state', e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
                <div><label className="block text-xs font-medium text-emerald-700 mb-1">Tax ID</label><input value={form.taxId} onChange={e => set('taxId', e.target.value)} className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5">
                {saving && <Loader2 size={14} className="animate-spin" />} {isEdit ? 'Update' : 'Create'}
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activityLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-emerald-500" /></div>
            ) : activityLog.length === 0 ? (
              <div className="text-center py-8 text-emerald-400"><Clock size={24} className="mx-auto mb-2 opacity-50" /><p className="text-sm">No activity recorded yet.</p></div>
            ) : (
              <div className="space-y-2">
                {activityLog.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock size={13} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-emerald-900">{entry.action}</p>
                      <p className="text-xs text-emerald-500 mt-0.5">{entry.user?.name ?? entry.user?.email ?? 'System'} · {fmtDate(entry.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
