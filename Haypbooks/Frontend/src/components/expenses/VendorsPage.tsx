'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Loader2, Building } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'

interface Vendor {
  id: string; name: string; email?: string; phone?: string; address?: string; city?: string; state?: string; country?: string; taxId?: string; balance?: number; status?: string
}

export default function VendorsPage() {
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)

  const fetchVendors = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ap/vendors`)
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

  const handleDelete = async (id: string) => {
    if (!companyId) return
    try { await apiClient.delete(`/companies/${companyId}/ap/vendors/${id}`); fetchVendors() }
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
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
          <Plus size={16} /> Add Vendor
        </button>
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
            <th className="text-left px-4 py-3 font-medium text-emerald-700">Name</th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden md:table-cell">Email</th>
            <th className="text-left px-4 py-3 font-medium text-emerald-700 hidden lg:table-cell">Phone</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700">Balance</th>
            <th className="text-right px-4 py-3 font-medium text-emerald-700 w-24">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-emerald-400"><Building size={24} className="mx-auto mb-2 opacity-50" />No vendors found.</td></tr>
            ) : (
              filtered.map(v => (
                <tr key={v.id} className="border-t border-emerald-50 hover:bg-emerald-50/30 transition-colors">
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
              ))
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

function VendorFormModal({ companyId, vendor, onClose, onSaved }: { companyId: string; vendor: Vendor | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!vendor
  const [form, setForm] = useState({ name: vendor?.name ?? '', email: vendor?.email ?? '', phone: vendor?.phone ?? '', address: vendor?.address ?? '', city: vendor?.city ?? '', state: vendor?.state ?? '', country: vendor?.country ?? '', taxId: vendor?.taxId ?? '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError('')
    try {
      if (isEdit) await apiClient.put(`/companies/${companyId}/ap/vendors/${vendor!.id}`, form)
      else await apiClient.post(`/companies/${companyId}/ap/vendors`, form)
      onSaved()
    } catch (e: any) { setError(e?.response?.data?.message ?? 'Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between"><h2 className="text-lg font-bold text-emerald-900">{isEdit ? 'Edit Vendor' : 'New Vendor'}</h2><button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button></div>
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
      </motion.div>
    </motion.div>
  )
}
