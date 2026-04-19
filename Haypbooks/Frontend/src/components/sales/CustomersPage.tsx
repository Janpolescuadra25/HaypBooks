'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, RefreshCw, Download, Clock, Eye, Edit2, Trash2, X, AlertCircle, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import ActivityLog, { type ActivityLogItem } from '@/components/ui/ActivityLog'
import DataPage from '@/components/shared/DataPage'
import type { BulkAction } from '@/components/shared/BulkActionBar'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import ModalForm from '@/components/shared/ModalForm'
import { ModalPortal } from '@/components/shared/ModalPortal'

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
    av = Number(av)
    bv = Number(bv)
    return dir === 'asc' ? av - bv : bv - av
  }
  const as = String(av).toLowerCase()
  const bs = String(bv).toLowerCase()
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
      return DEFAULT_COLS.map((col) => {
        const savedCol = saved.find((entry) => entry.key === col.key)
        return savedCol ? { ...col, visible: savedCol.visible, width: savedCol.width } : col
      })
    }
  } catch {
    // ignore local storage issues
  }
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)

  const visibleCols = useMemo(() => cols.filter((col) => col.visible), [cols])

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir('asc')
      }
    },
    [sortKey],
  )

  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => compareCustomers(a, b, sortKey, sortDir)),
    [customers, sortKey, sortDir],
  )

  const searchRef = useRef(search)
  searchRef.current = search
  const colsRef = useRef(cols)
  useEffect(() => { colsRef.current = cols }, [cols])

  const fmt = useCallback((value: number) => formatCurrency(value, currency), [currency])

  const saveCols = useCallback((next: ColDef[]) => {
    setCols(next)
    try { localStorage.setItem('customers-cols-v2', JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  const fetchCustomers = useCallback(
    async (pg = 0) => {
      if (!companyId) return
      setLoading(true)
      try {
        const { data } = await apiClient.get(`/companies/${companyId}/ar/customers`, {
          params: {
            search: search || undefined,
            status: statusFilter || undefined,
            groupId: groupFilter || undefined,
            limit: PAGE_SIZE,
            offset: pg * PAGE_SIZE,
          },
        })
        const list: Customer[] = Array.isArray(data) ? data : data.data ?? []
        const count = typeof data.total === 'number' ? data.total : list.length
        setCustomers(list)
        setTotal(count)
        setSelectedIds(new Set())
        setError('')
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'Failed to load customers')
      } finally {
        setLoading(false)
      }
    },
    [companyId, groupFilter, statusFilter],
  )

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
    const timer = window.setTimeout(() => {
      setPage(0)
      fetchCustomers(0)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search, fetchCustomers])

  const goToPage = (pg: number) => {
    setPage(pg)
    fetchCustomers(pg)
  }

  const selectedIdArray = useMemo(() => Array.from(selectedIds), [selectedIds])
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const handleDelete = (customer: Customer) => {
    setDeleteTarget(customer)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!companyId || !deleteTarget) return
    setBatchLoading(true)
    try {
      await apiClient.delete(`/companies/${companyId}/ar/customers/${deleteTarget.id}`)
      toast.success('Customer deleted')
      setShowDeleteModal(false)
      setDeleteTarget(null)
      fetchCustomers(page)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to delete customer')
    } finally {
      setBatchLoading(false)
    }
  }

  const handleOpenBatchDelete = () => {
    if (!selectedIds.size) return
    setShowBatchDeleteModal(true)
  }

  const handleConfirmBatchDelete = async () => {
    if (!companyId || !selectedIds.size) return
    setBatchLoading(true)
    try {
      await apiClient.post(`/companies/${companyId}/ar/customers/batch/delete`, { ids: [...selectedIds] })
      toast.success(`${selectedIds.size} customer(s) deleted`)
      setShowBatchDeleteModal(false)
      setSelectedIds(new Set())
      fetchCustomers(page)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Batch delete failed')
    } finally {
      setBatchLoading(false)
    }
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
    } finally {
      setBatchLoading(false)
    }
  }

  const handleExport = async () => {
    if (!companyId) return
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/ar/customers/export`, {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          groupId: groupFilter || undefined,
        },
      })
      const csv = typeof data === 'string' ? data : data.csv ?? ''
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'customers.csv'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  const refreshCustomers = () => fetchCustomers(page)

  const bulkActions: BulkAction[] = useMemo(() => [
    { label: 'Mark Active', onClick: () => handleBatchStatus('ACTIVE'), variant: 'default', disabled: batchLoading },
    { label: 'Mark Inactive', onClick: () => handleBatchStatus('INACTIVE'), variant: 'default', disabled: batchLoading },
    { label: 'Delete Selected', onClick: handleOpenBatchDelete, variant: 'destructive', disabled: batchLoading },
  ], [batchLoading, handleBatchStatus])

  const columns = useMemo(() => visibleCols.map((col) => {
    const sortIndicator = sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''
    if (col.key === 'name') {
      return {
        accessorKey: 'name',
        id: 'name',
        header: (
          <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 font-semibold text-slate-600">
            {col.label}{sortIndicator}
          </button>
        ),
        cell: ({ row }: any) => (
          <button
            type="button"
            onClick={() => router.push(`/sales/customers/${row.original.id}`)}
            className="text-left text-emerald-600 hover:text-emerald-800 hover:underline"
          >
            {row.original.name || '—'}
          </button>
        ),
        meta: { align: col.align },
      }
    }
    if (col.key === 'status') {
      return {
        accessorKey: 'status',
        id: 'status',
        header: (
          <button type="button" onClick={() => toggleSort('status')} className="inline-flex items-center gap-1 font-semibold text-slate-600">
            {col.label}{sortIndicator}
          </button>
        ),
        cell: ({ row }: any) => (
          <StatusBadge status={String(row.original.status ?? '')} domain="customer" />
        ),
        meta: { align: col.align, statusDomain: 'customer' },
      }
    }
    if (col.key === 'openBalance' || col.key === 'creditLimit') {
      return {
        accessorKey: col.key,
        id: col.key,
        header: (
          <button type="button" onClick={() => toggleSort(col.key as SortKey)} className="inline-flex items-center gap-1 font-semibold text-slate-600">
            {col.label}{sortIndicator}
          </button>
        ),
        cell: ({ getValue }: any) => (
          <span className="font-semibold text-slate-800">{fmt(Number(getValue() ?? 0))}</span>
        ),
        meta: { align: col.align },
      }
    }
    return {
      accessorKey: col.key,
      id: col.key,
      header: (
        <button type="button" onClick={() => toggleSort(col.key as SortKey)} className="inline-flex items-center gap-1 font-semibold text-slate-600">
          {col.label}{sortIndicator}
        </button>
      ),
      cell: ({ getValue }: any) => <span>{String(getValue() ?? '') || '—'}</span>,
      meta: { align: col.align },
    }
  }), [fmt, router, sortDir, sortKey, toggleSort, visibleCols])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={refreshCustomers}
        title="Refresh"
        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <RefreshCw size={16} />
      </button>
      <button
        type="button"
        onClick={handleExport}
        title="Export CSV"
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Download size={15} /> Export
      </button>
      <button
        type="button"
        onClick={() => router.push('/sales/customers/activity')}
        title="Activity Log"
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Clock size={15} /> Activity Log
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowColMenu((open) => !open)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Eye size={15} /> Columns
        </button>
        {showColMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {cols.filter((col) => col.key !== 'name').map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => saveCols(cols.map((entry) => (entry.key === col.key ? { ...entry, visible: !entry.visible } : entry)))}
                    className="accent-emerald-600"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )

  const filterControls = (
    <div className="flex flex-wrap items-center gap-2 w-full">
      <div className="relative flex-1 min-w-[180px] max-w-xl">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
      <select
        aria-label="Customer status filter"
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="ALL">All Status</option>
      </select>
      {groups.length > 0 && (
        <select
          aria-label="Customer group filter"
          value={groupFilter}
          onChange={(e) => { setGroupFilter(e.target.value); setPage(0) }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">All Groups</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      )}
    </div>
  )

  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (cidLoading || (loading && customers.length === 0 && !error)) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-emerald-700">Loading customers…</span>
      </div>
    )
  }

  if (cidError) {
    return <div className="p-6 text-center text-red-600">{cidError}</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <DataPage
        title="Customers"
        subtitle={`${total} customer${total !== 1 ? 's' : ''}`}
        primaryActionLabel="Add Customer"
        onPrimaryAction={() => { setEditing(null); setShowForm(true) }}
        secondaryActions={headerActions}
        filters={filterControls}
        columns={[...columns, {
          id: 'actions',
          header: 'Actions',
          cell: ({ row }: any) => (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setEditing(row.original); setShowForm(true) }}
                title="Edit"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <Edit2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(row.original)}
                title="Delete"
                className="p-2 rounded-lg text-red-500 hover:bg-red-100 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ),
          meta: { align: 'right' },
        }]}
        data={sortedCustomers}
        isLoading={loading}
        currentPage={page + 1}
        totalPages={Math.max(1, totalPages)}
        totalCount={total}
        onPageChange={(nextPage) => goToPage(Math.max(0, nextPage - 1))}
        pageSize={PAGE_SIZE}
        selectedIds={selectedIdArray}
        onSelectionChange={handleSelectionChange}
        getRowId={(row) => row.id}
        bulkActions={bulkActions}
        emptyTitle="No customers yet"
        emptyDescription="Add your first customer to get started managing client relationships."
        emptyIllustration="users"
        emptyPrimaryAction="Add Customer"
        onEmptyPrimaryAction={() => { setEditing(null); setShowForm(true) }}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto text-slate-500 hover:text-slate-700">Dismiss</button>
        </div>
      )}

      {showForm && (
        <CustomerFormModal
          companyId={companyId!}
          customer={editing}
          paymentTerms={paymentTerms}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchCustomers(page) }}
        />
      )}

      {showDeleteModal && (
        <ModalPortal>
          <ModalForm
            isOpen={showDeleteModal}
            title="Delete customer"
            onClose={() => setShowDeleteModal(false)}
            onSubmit={handleConfirmDelete}
            submitLabel="Delete"
            isSubmitting={batchLoading}
            cancelLabel="Cancel"
          >
            <p className="text-slate-700">
              Are you sure you want to delete <strong>{deleteTarget?.name ?? 'this customer'}</strong>? This action cannot be undone.
            </p>
          </ModalForm>
        </ModalPortal>
      )}

      {showBatchDeleteModal && (
        <ModalPortal>
          <ModalForm
            isOpen={showBatchDeleteModal}
            title="Delete selected customers"
            onClose={() => setShowBatchDeleteModal(false)}
            onSubmit={handleConfirmBatchDelete}
            submitLabel="Delete"
            isSubmitting={batchLoading}
            cancelLabel="Cancel"
          >
            <p className="text-slate-700">
              Are you sure you want to delete <strong>{selectedIds.size}</strong> selected customer{selectedIds.size !== 1 ? 's' : ''}? This cannot be undone.
            </p>
          </ModalForm>
        </ModalPortal>
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
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([])
  const [activityLoading, setActivityLoading] = useState(false)

  useEffect(() => {
    if (modalTab !== 'activity' || !customer?.id) return
    setActivityLoading(true)
    apiClient.get(`/companies/${companyId}/ar/customers/${customer.id}/activity`)
      .then(({ data }) => setActivityLog(data.data ?? []))
      .catch(() => setActivityLog([]))
      .finally(() => setActivityLoading(false))
  }, [modalTab, customer?.id, companyId])

  const setField = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError('')
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
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalPortal>
      <div role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Customer' : 'New Customer'} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} className="relative z-[10000] bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-lg font-bold text-emerald-900">{isEdit ? 'Edit Customer' : 'New Customer'}</h2>
            <button onClick={onClose} aria-label="Close customer form" className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-500"><X size={18} /></button>
          </div>
          {isEdit && (
            <div className="flex border-b border-gray-200 bg-white px-4">
              {(['form', 'activity'] as const).map((tab) => (
                <button key={tab} onClick={() => setModalTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${modalTab === tab ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                  {tab === 'form' ? <Edit2 size={11} /> : <Clock size={11} />}
                  {tab === 'form' ? 'Details' : 'Activity'}
                </button>
              ))}
            </div>
          )}
          {modalTab === 'form' && (
            <>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-emerald-700 mb-1">Name *</label>
                  <input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Full name or business name"
                    className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="customer@email.com"
                      className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="(555) 000-0000"
                      className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-700 mb-1">Street Address</label>
                  <input value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="Street address"
                    className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">City</label>
                    <input value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="City"
                      className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">State</label>
                    <input value={form.state} onChange={(e) => setField('state', e.target.value)} placeholder="State"
                      className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">ZIP</label>
                    <input value={form.zip} onChange={(e) => setField('zip', e.target.value)} placeholder="ZIP"
                      className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Payment Terms</label>
                    <select aria-label="Payment Terms" value={form.paymentTermId} onChange={(e) => setField('paymentTermId', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white">
                      <option value="">— None —</option>
                      {paymentTerms.map((term) => (
                        <option key={term.id} value={term.id}>{term.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Credit Limit</label>
                    <input type="number" min="0" step="0.01" value={form.creditLimit} onChange={(e) => setField('creditLimit', e.target.value)}
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
            </>
          )}
          {modalTab === 'activity' && (
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Clock size={14} className="text-emerald-600" /> Audit Log
              </h3>
              <ActivityLog entries={activityLog} loading={activityLoading} emptyMessage="No activity recorded yet." />
              <div className="mt-4 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  )
}
