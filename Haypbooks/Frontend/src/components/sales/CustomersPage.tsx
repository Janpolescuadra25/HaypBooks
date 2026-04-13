'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Edit2, Trash2, X, AlertCircle, Loader2, Users, RefreshCw,
  ChevronLeft, ChevronRight, Download, Eye, UserCheck, UserX, Clock, ArrowUpDown,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'

const PAGE_SIZE = 25

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  paymentTermId?: string | null
  paymentTermName?: string | null
  creditLimit?: number | null
  openBalance?: number
  totalRevenue?: number
  invoiceCount?: number
  status?: 'ACTIVE' | 'INACTIVE'
  groupId?: string | null
  groupName?: string | null
}

interface PaymentTerm { id: string; name: string; dueDays: number }
interface Group { id: string; name: string }

interface ColDef {
  key: string
  label: string
  visible: boolean
  width: number
  align?: 'left' | 'right'
}

type SortKey = 'name' | 'email' | 'phone' | 'status' | 'groupName' | 'paymentTermName' | 'openBalance' | 'creditLimit'
type SortDirection = 'asc' | 'desc'

function compareCustomers(a: Customer, b: Customer, key: SortKey, dir: SortDirection): number {
  let av: any = a[key as keyof Customer] ?? ''
  let bv: any = b[key as keyof Customer] ?? ''
  if (key === 'openBalance' || key === 'creditLimit') {
    av = Number(av); bv = Number(bv)
    return dir === 'asc' ? av - bv : bv - av
  }
  const as = String(av).toLowerCase(); const bs = String(bv).toLowerCase()
  return dir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
}

const DEFAULT_COLS: ColDef[] = [
  { key: 'name', label: 'Name', visible: true, width: 220, align: 'left' },
  { key: 'email', label: 'Email', visible: true, width: 200, align: 'left' },
  { key: 'phone', label: 'Phone', visible: true, width: 140, align: 'left' },
  { key: 'status', label: 'Status', visible: true, width: 96, align: 'left' },
  { key: 'groupName', label: 'Group', visible: false, width: 140, align: 'left' },
  { key: 'paymentTermName', label: 'Terms', visible: true, width: 120, align: 'left' },
  { key: 'openBalance', label: 'Balance', visible: true, width: 120, align: 'right' },
  { key: 'creditLimit', label: 'Credit Limit', visible: false, width: 120, align: 'right' },
]

function loadCols(): ColDef[] {
  try {
    const s = localStorage.getItem('customers-cols-v2')
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

export default function CustomersPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ACTIVE')
  const [groupFilter, setGroupFilter] = useState('')
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [cols, setCols] = useState<ColDef[]>(() => loadCols())
  const [showColMenu, setShowColMenu] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => compareCustomers(a, b, sortKey, sortDir)),
    [customers, sortKey, sortDir]
  )

  const searchRef = useRef(search)
  searchRef.current = search
  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const fmt = useCallback((n: number) => formatCurrency(n, currency), [currency])

  const saveCols = (next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('customers-cols-v2', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const fetchCustomers = useCallback(async (pg = 0) => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers`, {
        params: {
          search: searchRef.current || undefined,
          status: statusFilter || undefined,
          groupId: groupFilter || undefined,
          limit: PAGE_SIZE,
          offset: pg * PAGE_SIZE,
        },
      })
      const list: Customer[] = Array.isArray(data) ? data : data.data ?? []
      const t = typeof data.total === 'number' ? data.total : list.length
      setCustomers(list)
      setTotal(t)
      setSelectedIds(new Set())
      setError('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [companyId, statusFilter, groupFilter])

  const fetchPaymentTerms = useCallback(async () => {
    if (!companyId) return
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/payment-terms`)
      setPaymentTerms(Array.isArray(data) ? data : [])
    } catch { /* not critical */ }
  }, [companyId])

  const fetchGroups = useCallback(async () => {
    if (!companyId) return
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customer-groups`)
      setGroups(Array.isArray(data) ? data : [])
    } catch { /* not critical */ }
  }, [companyId])

  useEffect(() => {
    fetchCustomers(0)
    fetchPaymentTerms()
    fetchGroups()
  }, [fetchCustomers, fetchPaymentTerms, fetchGroups])

  useEffect(() => {
    const t = setTimeout(() => { setPage(0); fetchCustomers(0) }, 350)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const goToPage = (pg: number) => { setPage(pg); fetchCustomers(pg) }

  // Column resize via mouse drag
  const resizeRef = useRef<{ key: string; startX: number; startW: number } | null>(null)
  const startResize = (e: React.MouseEvent, key: string, currentWidth: number) => {
    e.preventDefault()
    resizeRef.current = { key, startX: e.clientX, startW: currentWidth }
    const onMove = (mv: MouseEvent) => {
      if (!resizeRef.current) return
      const delta = mv.clientX - resizeRef.current.startX
      const newW = Math.max(60, resizeRef.current.startW + delta)
      saveCols(colsRef.current.map(c => c.key === resizeRef.current!.key ? { ...c, width: newW } : c))
    }
    const onUp = () => {
      resizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const allSelected = customers.length > 0 && customers.every(c => selectedIds.has(c.id))
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(customers.map(c => c.id)))
  }
  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedIds(next)
  }

  const handleDelete = async (id: string) => {
    if (!companyId || !window.confirm('Delete this customer?')) return
    try {
      await apiClient.delete(`/companies/${companyId}/ar/customers/${id}`)
      toast.success('Customer deleted')
      fetchCustomers(page)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to delete customer')
    }
  }

  const handleBatchDelete = async () => {
    if (!companyId || !selectedIds.size || !window.confirm(`Delete ${selectedIds.size} customer(s)?`)) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/customers/batch/delete`, { ids: [...selectedIds] })
      toast.success(`${selectedIds.size} customer(s) deleted`)
      fetchCustomers(page)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Batch delete failed')
    } finally { setBatchLoading(false) }
  }

  const handleBatchStatus = async (status: 'ACTIVE' | 'INACTIVE') => {
    if (!companyId || !selectedIds.size) return
    setBatchLoading(true)
    try {
      await apiClient.patch(`/companies/${companyId}/ar/customers/batch/status`, { ids: [...selectedIds], status })
      toast.success(`${selectedIds.size} customer(s) marked ${status === 'ACTIVE' ? 'active' : 'inactive'}`)
      fetchCustomers(page)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to update status')
    } finally { setBatchLoading(false) }
  }

  const handleExport = async () => {
    if (!companyId) return
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers/export`, {
        params: { search: search || undefined, status: statusFilter || undefined, groupId: groupFilter || undefined },
      })
      const csv = typeof data === 'string' ? data : data.csv ?? ''
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  const visibleCols = cols.filter(c => c.visible)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (cidLoading || (loading && customers.length === 0 && !error)) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading customers…</span>
      </div>
    )
  }
  if (cidError) return <div className="p-6 text-center text-red-600">{cidError}</div>

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">Customers</h1>
          <p className="text-sm text-emerald-600/70 mt-0.5">{total} customer{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => fetchCustomers(page)} title="Refresh"
            className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 border border-emerald-100 transition-colors">
            <RefreshCw size={15} />
          </button>
          <button onClick={handleExport} title="Export CSV"
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors">
            <Download size={15} /> Export
          </button>
          <button onClick={() => router.push('/sales/customers/activity')} title="Activity Log"
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors">
            <Clock size={15} /> History
          </button>
          <div className="relative">
            <button onClick={() => setShowColMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors">
              <Eye size={15} /> Columns
            </button>
            {showColMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-emerald-100 rounded-xl shadow-lg p-2 min-w-[160px]">
                  {cols.filter(c => c.key !== 'name').map(c => (
                    <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-emerald-50 cursor-pointer">
                      <input type="checkbox" checked={c.visible} onChange={() => saveCols(cols.map(d => d.key === c.key ? { ...d, visible: !d.visible } : d))} className="accent-emerald-600" />
                      {c.label}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-700">
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ALL">All Status</option>
        </select>
        {groups.length > 0 && (
          <select value={groupFilter} onChange={e => { setGroupFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-700">
            <option value="">All Groups</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
      </div>

      {/* Batch actions */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-600 text-white rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <button onClick={() => handleBatchStatus('ACTIVE')} disabled={batchLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-40 transition-colors font-semibold">
            <UserCheck size={13} /> Mark Active
          </button>
          <button onClick={() => handleBatchStatus('INACTIVE')} disabled={batchLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-40 transition-colors font-semibold">
            <UserX size={13} /> Mark Inactive
          </button>
          <button onClick={handleBatchDelete} disabled={batchLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/80 hover:bg-red-500 text-white rounded-lg disabled:opacity-40 transition-colors font-semibold">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: 600 }}>
          <colgroup>
            <col style={{ width: 44 }} />
            {visibleCols.map(c => <col key={c.key} style={{ width: c.width }} />)}
            <col style={{ width: 80 }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-3 border-r border-gray-200">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-blue-600" />
              </th>
              {visibleCols.map(c => (
                <th key={c.key} className="relative px-3 py-3 font-semibold text-gray-600 select-none border-r border-gray-200"
                  style={{ textAlign: c.align === 'right' ? 'right' : 'left' }}>
                  <button
                    onClick={() => toggleSort(c.key as SortKey)}
                    className="flex items-center gap-1 w-full"
                    style={{ justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start' }}
                  >
                    <span>{c.label}</span>
                    <ArrowUpDown size={12} className={sortKey === c.key ? 'text-emerald-600' : 'text-gray-300'} />
                  </button>
                  <div
                    className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-gray-300/60"
                    onMouseDown={e => startResize(e, c.key, c.width)}
                  />
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
                  {visibleCols.map(c => (
                    <td key={c.key} className="px-3 py-3">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                    </td>
                  ))}
                  <td className="px-3 py-3"><div className="h-4 w-8 bg-gray-100 rounded ml-auto" /></td>
                </tr>
              ))
            ) : sortedCustomers.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 2} className="px-4 py-16 text-center text-gray-300">
                  <Users size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-gray-400">No customers found</p>
                  <p className="text-xs mt-1 text-gray-300">Try adjusting your filters or add a new customer</p>
                </td>
              </tr>
            ) : (
              sortedCustomers.map(c => (
                <tr key={c.id}
                  className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${selectedIds.has(c.id) ? 'bg-blue-50/20' : ''}`}>
                  <td className="px-3 py-2.5 border-r border-gray-100">
                    <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleOne(c.id)} className="accent-blue-600" />
                  </td>
                  {visibleCols.map(col => {
                    if (col.key === 'name') return (
                      <td key={col.key} className="px-3 py-2.5 truncate border-r border-gray-100">
                        <button onClick={() => router.push(`/sales/customers/${c.id}`)}
                          className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline text-left truncate w-full block">
                          {c.name}
                        </button>
                      </td>
                    )
                    if (col.key === 'status') return (
                      <td key={col.key} className="px-3 py-2.5 border-r border-gray-100">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'INACTIVE' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {c.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                    )
                    if (col.key === 'openBalance' || col.key === 'creditLimit') return (
                      <td key={col.key} className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-800 truncate border-r border-gray-100">
                        {fmt(Number(c[col.key as keyof Customer] ?? 0))}
                      </td>
                    )
                    return (
                      <td key={col.key} className={`px-3 py-2.5 text-slate-500 truncate border-r border-gray-100 ${col.align === 'right' ? 'text-right' : ''}` }>
                        {String(c[col.key as keyof Customer] ?? '') || '—'}
                      </td>
                    )
                  })}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(c); setShowForm(true) }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(c.id)}
                        className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => goToPage(page - 1)} disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600">
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="text-xs text-gray-400">Page {page + 1} / {totalPages}</span>
              <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <CustomerFormModal
          companyId={companyId!}
          customer={editing}
          paymentTerms={paymentTerms}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchCustomers(page) }}
        />
      )}
    </div>
  )
}

function CustomerFormModal({ companyId, customer, paymentTerms, onClose, onSaved }: {
  companyId: string
  customer: Customer | null
  paymentTerms: PaymentTerm[]
  onClose: () => void
  onSaved: () => void
}) {
  const toast = useToast()
  const isEdit = !!customer
  const [modalTab, setModalTab] = useState<'form' | 'activity'>('form')
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    address: customer?.address ?? '',
    city: customer?.city ?? '',
    state: customer?.state ?? '',
    zip: customer?.zip ?? '',
    country: customer?.country ?? 'US',
    paymentTermId: customer?.paymentTermId ?? '',
    creditLimit: customer?.creditLimit != null ? String(customer.creditLimit) : '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  interface ActivityEntry { id: string; action: string; recordId: string; changes: any; createdAt: string; user: { id: string; name: string; email: string } }
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([])
  const [activityLoading, setActivityLoading] = useState(false)

  useEffect(() => {
    if (modalTab !== 'activity' || !customer?.id) return
    setActivityLoading(true)
    apiClient.get(`/companies/${companyId}/ar/customers/${customer.id}/activity`)
      .then(({ data }) => setActivityLog(data.data ?? []))
      .catch(() => setActivityLog([]))
      .finally(() => setActivityLoading(false))
  }, [modalTab, customer?.id, companyId])

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        displayName: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        zip: form.zip.trim() || undefined,
        country: form.country.trim() || undefined,
        paymentTermId: form.paymentTermId || undefined,
        creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined,
      }
      if (isEdit) {
        await apiClient.put(`/companies/${companyId}/ar/customers/${customer!.id}`, payload)
      } else {
        await apiClient.post(`/companies/${companyId}/ar/customers`, payload)
      }
      toast.success(isEdit ? 'Customer updated' : 'Customer created')
      onSaved()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save customer')
    } finally { setSaving(false) }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Customer' : 'New Customer'} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-emerald-900">{isEdit ? 'Edit Customer' : 'New Customer'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
        </div>
        {isEdit && (
          <div className="flex border-b border-gray-200 bg-white px-4">
            {(['form', 'activity'] as const).map(tab => (
              <button key={tab} onClick={() => setModalTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${modalTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                {tab === 'form' ? <Edit2 size={11} /> : <Clock size={11} />}
                {tab === 'form' ? 'Details' : 'Activity'}
              </button>
            ))}
          </div>
        )}
        {modalTab === 'form' && (<>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-emerald-700 mb-1">Street Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">State</label>
              <input value={form.state} onChange={e => set('state', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">ZIP</label>
              <input value={form.zip} onChange={e => set('zip', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Payment Terms</label>
              <select value={form.paymentTermId} onChange={e => set('paymentTermId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white">
                <option value="">— None —</option>
                {paymentTerms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-700 mb-1">Credit Limit</label>
              <input type="number" min="0" step="0.01" value={form.creditLimit} onChange={e => set('creditLimit', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-emerald-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-semibold">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
        </>)}
        {modalTab === 'activity' && (
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Clock size={14} className="text-emerald-600" /> Audit Log
            </h3>
            {activityLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-400">
                <Loader2 size={18} className="animate-spin mr-2" /> Loading activity…
              </div>
            ) : activityLog.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No activity recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {activityLog.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-xs">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={11} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-gray-800">{entry.user?.name ?? entry.user?.email ?? 'System'}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono uppercase text-[10px]">{entry.action}</span>
                      </div>
                      <p className="text-gray-500">{new Date(entry.createdAt).toLocaleString()}</p>
                      {entry.changes && Object.keys(entry.changes).length > 0 && (
                        <pre className="mt-1 text-[10px] text-gray-400 bg-white rounded p-1.5 border border-gray-100 overflow-x-auto">{JSON.stringify(entry.changes, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

