'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Loader2, Building, Clock, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useFixedWidthResizableMap } from '@/hooks/useFixedWidthTableResize'
import ColumnResizer from '@/components/ColumnResizer'
import DataPage from '@/components/shared/DataPage'
import { useToast } from '@/components/ui/Toast'

interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  taxId?: string
  balance?: number
  status?: string
}

type SortKey = 'name' | 'email' | 'phone' | 'status' | 'balance'
type SortDir = 'asc' | 'desc' | null
const VENDOR_TABLE_ORDER: SortKey[] = ['name', 'email', 'phone', 'status', 'balance']
const DEFAULT_COLUMN_WIDTHS: Record<SortKey, number> = {
  name: 240,
  email: 240,
  phone: 160,
  status: 120,
  balance: 140,
}
const VENDOR_COLUMNS_STORAGE_KEY = 'vendors-page-column-widths-v1'

function loadVendorWidthMap(): Record<string, number> {
  try {
    const saved = localStorage.getItem(VENDOR_COLUMNS_STORAGE_KEY)
    if (!saved) return DEFAULT_COLUMN_WIDTHS
    const parsed = JSON.parse(saved) as Record<string, number>
    return {
      ...DEFAULT_COLUMN_WIDTHS,
      ...Object.fromEntries(Object.entries(parsed).filter(([key]) => VENDOR_TABLE_ORDER.includes(key as SortKey))),
    }
  } catch {
    return DEFAULT_COLUMN_WIDTHS
  }
}

function normalizeStatus(value?: string) {
  const status = value?.trim().toLowerCase() ?? 'active'
  if (status === 'inactive') return 'Inactive'
  if (status === 'on hold' || status === 'onhold') return 'On Hold'
  return 'Active'
}

function compareVendors(a: Vendor, b: Vendor, key: SortKey, dir: SortDir): number {
  const left = a[key] ?? ''
  const right = b[key] ?? ''
  if (key === 'balance') {
    const na = Number(left)
    const nb = Number(right)
    return dir === 'asc' ? na - nb : nb - na
  }
  const al = String(left).toLowerCase()
  const bl = String(right).toLowerCase()
  return dir === 'asc' ? al.localeCompare(bl) : bl.localeCompare(al)
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
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [widths, setWidths] = useState<Record<string, number>>(() => loadVendorWidthMap())
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const widthsRef = useRef(widths)

  useEffect(() => { widthsRef.current = widths }, [widths])

  const saveWidths = useCallback((next: Record<string, number>) => {
    setWidths(next)
    try { localStorage.setItem(VENDOR_COLUMNS_STORAGE_KEY, JSON.stringify(next)) } catch { }
  }, [])

  const { containerRef } = useFixedWidthResizableMap({
    widths,
    widthsRef,
    order: VENDOR_TABLE_ORDER,
    saveWidths,
    fixedWidth: 108,
    minWidth: 100,
    fallbackMinWidth: 100,
  })

  const fetchVendors = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/vendors`)
      setVendors(Array.isArray(data) ? data : data.vendors ?? [])
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchVendors() }, [fetchVendors])

  const filtered = useMemo(() => {
    if (!search) return vendors
    const q = search.toLowerCase()
    return vendors.filter((vendor) =>
      vendor.name.toLowerCase().includes(q) || (vendor.email ?? '').toLowerCase().includes(q) || (vendor.phone ?? '').toLowerCase().includes(q),
    )
  }, [vendors, search])

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered
    return [...filtered].sort((a, b) => compareVendors(a, b, sortKey, sortDir))
  }, [filtered, sortKey, sortDir])

  useEffect(() => {
    if (currentPage > Math.max(1, Math.ceil(sorted.length / pageSize))) {
      setCurrentPage(Math.max(1, Math.ceil(sorted.length / pageSize)))
    }
  }, [currentPage, pageSize, sorted.length])

  const pagedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, currentPage, pageSize])

  const totalPayables = useMemo(() => vendors.reduce((sum, vendor) => sum + (vendor.balance ?? 0), 0), [vendors])
  const activeCount = useMemo(() => vendors.filter((vendor) => normalizeStatus(vendor.status) === 'Active').length, [vendors])

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
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
    try {
      await apiClient.delete(`/companies/${companyId}/vendors/${id}`)
      fetchVendors()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to delete vendor')
    }
  }

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const columns = useMemo(() => {
    const makeHeader = (label: string, key: SortKey, width: number) => (
      <div className="relative flex items-center gap-2">
        <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-2 text-left font-medium text-slate-800 hover:text-slate-900">
          {label}
          {sortKey === key ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
        </button>
        <ColumnResizer colKey={key} width={width} onChange={(_, next) => setWidths((prev) => ({ ...prev, [key]: next }))} min={80} />
      </div>
    )

    return [
      {
        accessorKey: 'name',
        header: makeHeader('Name', 'name', widths.name),
        meta: { align: 'left', style: { width: widths.name, minWidth: widths.name, maxWidth: widths.name } },
      },
      {
        accessorKey: 'email',
        header: makeHeader('Email', 'email', widths.email),
        meta: { align: 'left', hideBelow: 'md', style: { width: widths.email, minWidth: widths.email, maxWidth: widths.email } },
      },
      {
        accessorKey: 'phone',
        header: makeHeader('Phone', 'phone', widths.phone),
        meta: { align: 'left', hideBelow: 'lg', style: { width: widths.phone, minWidth: widths.phone, maxWidth: widths.phone } },
      },
      {
        accessorKey: 'status',
        header: makeHeader('Status', 'status', widths.status),
        meta: { align: 'left', style: { width: widths.status, minWidth: widths.status, maxWidth: widths.status } },
        cell: ({ getValue }) => {
          const label = normalizeStatus(String(getValue() ?? ''))
          const classes = label === 'Inactive'
            ? 'bg-slate-100 text-slate-700 border-slate-200'
            : label === 'On Hold'
              ? 'bg-amber-50 text-amber-700 border-amber-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${classes}`}>{label}</span>
        },
      },
      {
        accessorKey: 'balance',
        header: makeHeader('Balance', 'balance', widths.balance),
        meta: { align: 'right', style: { width: widths.balance, minWidth: widths.balance, maxWidth: widths.balance } },
        cell: ({ getValue }) => <span className="font-semibold text-emerald-800 tabular-nums">{fmt(Number(getValue() ?? 0))}</span>,
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        meta: { align: 'right', style: { width: 120, minWidth: 120, maxWidth: 120 } },
        cell: ({ row }) => {
          const vendor = row.original as Vendor
          return (
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => { setEditing(vendor); setShowForm(true) }} className="p-1 rounded hover:bg-emerald-100 text-emerald-600" data-no-row-toggle><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(vendor.id)} className="p-1 rounded hover:bg-red-100 text-red-400" data-no-row-toggle><Trash2 size={14} /></button>
            </div>
          )
        },
      },
    ]
  }, [fmt, sortKey, sortDir, widths])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total vendors</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{vendors.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active vendors</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-900">{activeCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total payables</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{fmt(totalPayables)}</p>
        </div>
      </div>

      <DataPage
        title="Vendors"
        subtitle={`${sorted.length} visible vendors`}
        primaryActionLabel="Add Vendor"
        onPrimaryAction={() => { setEditing(null); setShowForm(true) }}
        secondaryActions={
          <button onClick={handleDeleteSelected} disabled={selectedIds.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
            Delete Selected ({selectedIds.length})
          </button>
        }
        filters={(
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              placeholder="Search vendors…"
              className="w-full pl-9 pr-3 py-2 border border-emerald-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        )}
        columns={columns}
        data={pagedVendors}
        isLoading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={sorted.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(row) => row.id}
        bulkActions={[{ label: 'Delete Selected', icon: <Trash2 size={14} />, onClick: handleDeleteSelected, variant: 'destructive' }]}
        emptyTitle="No vendors found"
        emptyDescription="Try a different search or add your first vendor."
        emptyPrimaryAction="Add Vendor"
        onEmptyPrimaryAction={() => { setEditing(null); setShowForm(true) }}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <VendorFormModal
            companyId={companyId!}
            vendor={editing}
            onClose={() => { setShowForm(false); setEditing(null) }}
            onSaved={() => { setShowForm(false); setEditing(null); fetchVendors() }}
          />
        )}
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
