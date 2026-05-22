'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Download, Clock, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { salesService, type ArCustomer, type CustomerStatus, type CustomerGroup, type PaymentTerm } from '@/services/sales.service'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useToast } from '@/components/ToastProvider'
import { StatusBadge } from '@/components/shared/StatusBadgeSet'
import { HaypDataTable } from '@/components/shared/HaypDataTable'
import type { HaypActionItem, HaypColumn, HaypFilterOption } from '@/components/shared/HaypDataTable.types'
import HaypSelect from '@/components/shared/HaypSelect'
import ModalForm from '@/components/shared/ModalForm'
import { ModalPortal } from '@/components/shared/ModalPortal'
import CustomerFormModal from '@/components/sales/CustomerFormModal'

export default function CustomersPage() {
  const router = useRouter()
  const { companyId, loading: cidLoading, error: cidError } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const toast = useToast()

  const [customers, setCustomers] = useState<ArCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'ALL'>('ACTIVE')
  const [groupFilter, setGroupFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ArCustomer | null>(null)
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([])
  const [groups, setGroups] = useState<CustomerGroup[]>([])
  const [batchLoading, setBatchLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ArCustomer | null>(null)
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false)
  const [batchDeleteIds, setBatchDeleteIds] = useState<string[]>([])

  const fetchCustomers = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const response = await salesService.listArCustomers(companyId, {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        groupId: groupFilter || undefined,
      })
      const result = response.data as any
      const list: ArCustomer[] = Array.isArray(result) ? result : result.data ?? []
      setCustomers(list)
      setError('')
    } catch (cause: any) {
      setError(cause?.response?.data?.message ?? 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [companyId, groupFilter, statusFilter])

  const fetchPaymentTerms = useCallback(async () => {
    if (!companyId) return
    try {
      const response = await salesService.listArPaymentTerms(companyId)
      setPaymentTerms(Array.isArray(response.data) ? response.data : [])
    } catch {
      // not critical
    }
  }, [companyId])

  const fetchGroups = useCallback(async () => {
    if (!companyId) return
    try {
      const response = await salesService.listArCustomerGroups(companyId)
      setGroups(Array.isArray(response.data) ? response.data : [])
    } catch {
      // not critical
    }
  }, [companyId])

  useEffect(() => {
    fetchCustomers()
    fetchPaymentTerms()
    fetchGroups()
  }, [fetchCustomers, fetchPaymentTerms, fetchGroups])

  const handleDelete = useCallback((customer: ArCustomer) => {
    setDeleteTarget(customer)
    setShowDeleteModal(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!companyId || !deleteTarget) return
    setBatchLoading(true)
    try {
      await salesService.deleteArCustomer(companyId, deleteTarget.id)
      toast.success('Customer deleted')
      setShowDeleteModal(false)
      setDeleteTarget(null)
      fetchCustomers()
    } catch (cause: any) {
      toast.error(cause?.response?.data?.message ?? 'Failed to delete customer')
    } finally {
      setBatchLoading(false)
    }
  }, [companyId, deleteTarget, fetchCustomers, toast])

  const handleBatchDelete = useCallback(async () => {
    if (!companyId || batchDeleteIds.length === 0) return
    setBatchLoading(true)
    try {
      await salesService.batchDeleteArCustomers(companyId, batchDeleteIds)
      toast.success(`${batchDeleteIds.length} customer(s) deleted`)
      setShowBatchDeleteModal(false)
      setBatchDeleteIds([])
      fetchCustomers()
    } catch (cause: any) {
      toast.error(cause?.response?.data?.message ?? 'Batch delete failed')
    } finally {
      setBatchLoading(false)
    }
  }, [batchDeleteIds, companyId, fetchCustomers, toast])

  const handleBatchStatus = useCallback(async (selectedIds: string[], status: CustomerStatus) => {
    if (!companyId || selectedIds.length === 0) return
    setBatchLoading(true)
    try {
      await salesService.updateArCustomersStatus(companyId, selectedIds, status)
      toast.success(`${selectedIds.length} customer(s) marked ${status === 'ACTIVE' ? 'active' : 'inactive'}`)
      fetchCustomers()
    } catch (cause: any) {
      toast.error(cause?.response?.data?.message ?? 'Failed to update status')
    } finally {
      setBatchLoading(false)
    }
  }, [companyId, fetchCustomers, toast])

  const handleExport = useCallback(async () => {
    if (!companyId) return
    try {
      const response = await salesService.exportArCustomers(companyId, {
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        groupId: groupFilter || undefined,
      })
      const result = response.data as any
      const csv = typeof result === 'string' ? result : result.csv ?? ''
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
  }, [companyId, groupFilter, search, statusFilter, toast])

  const statusFilters: HaypFilterOption[] = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ]

  const customerColumns = useMemo<HaypColumn<ArCustomer>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        size: 220,
        render: (value: any, row: ArCustomer) => (
          <button
            type="button"
            onClick={() => router.push(`/sales/customers/${row.id}`)}
            className="text-left text-emerald-600 hover:text-emerald-800 hover:underline"
          >
            {value || '—'}
          </button>
        ),
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        size: 200,
      },
      {
        id: 'phone',
        accessorKey: 'phone',
        header: 'Phone',
        size: 140,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        size: 96,
        render: (_value: any, row: ArCustomer) => (
          <StatusBadge status={String(row.status ?? '')} domain="customer" />
        ),
      },
      {
        id: 'groupName',
        accessorKey: 'groupName',
        header: 'Group',
        size: 140,
      },
      {
        id: 'paymentTermName',
        accessorKey: 'paymentTermName',
        header: 'Terms',
        size: 120,
      },
      {
        id: 'openBalance',
        accessorKey: 'openBalance',
        header: 'Balance',
        size: 120,
        align: 'right',
        render: (value: any) => (
          <span className="font-semibold text-slate-800">
            {value != null ? new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(value)) : '—'}
          </span>
        ),
      },
      {
        id: 'creditLimit',
        accessorKey: 'creditLimit',
        header: 'Credit Limit',
        size: 120,
        align: 'right',
        render: (value: any) => (
          <span className="font-semibold text-slate-800">
            {value != null ? new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(value)) : '—'}
          </span>
        ),
      },
    ],
    [currency, router],
  )

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={fetchCustomers}
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
      <HaypSelect
        value={groupFilter}
        onChange={setGroupFilter}
        options={[
          { value: '', label: 'All groups' },
          ...groups.map((group) => ({ value: group.id, label: group.name })),
        ]}
        className="min-w-[180px]"
      />
      <button
        type="button"
        onClick={() => { setEditing(null); setShowForm(true) }}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
      >
        Add Customer
      </button>
    </div>
  )

  const rowActions = useMemo(
    () => [
      {
        label: 'Edit',
        icon: <Edit2 size={14} />,
        onClick: (_rowId: string, row: ArCustomer) => {
          setEditing(row)
          setShowForm(true)
        },
      },
      {
        label: 'Delete',
        icon: <Trash2 size={14} />,
        danger: true,
        onClick: (_rowId: string, row: ArCustomer) => handleDelete(row),
      },
    ],
    [handleDelete],
  )

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
      <HaypDataTable
        tableId="sales-customers"
        title="Customers"
        description={`${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
        data={customers}
        columns={customerColumns}
        getRowId={(row) => row.id}
        searchPlaceholder="Search customers…"
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        filters={statusFilters}
        activeFilter={statusFilter}
        onFilterChange={(value) => setStatusFilter(value as CustomerStatus | 'ALL')}
        filterLabel="Status"
        headerActions={headerActions}
        loading={loading}
        actions={rowActions}
        bulkActions={[
          {
            label: 'Mark Active',
            onClick: (selectedIds) => handleBatchStatus(selectedIds, 'ACTIVE'),
            disabled: batchLoading,
          },
          {
            label: 'Mark Inactive',
            onClick: (selectedIds) => handleBatchStatus(selectedIds, 'INACTIVE'),
            disabled: batchLoading,
          },
          {
            label: 'Delete Selected',
            variant: 'danger',
            onClick: (selectedIds) => {
              setBatchDeleteIds(selectedIds)
              setShowBatchDeleteModal(true)
            },
            disabled: batchLoading,
          },
        ]}
        onRefresh={fetchCustomers}
        onExport={handleExport}
        onActivityLog={() => router.push('/sales/customers/activity')}
        emptyTitle="No customers yet"
        emptySubtitle="Add your first customer to get started managing client relationships."
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto text-slate-500 hover:text-slate-700">Dismiss</button>
        </div>
      )}

      {showForm && companyId && (
        <CustomerFormModal
          companyId={companyId}
          customer={editing}
          paymentTerms={paymentTerms}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchCustomers() }}
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
            onClose={() => {
              setShowBatchDeleteModal(false)
              setBatchDeleteIds([])
            }}
            onSubmit={handleBatchDelete}
            submitLabel="Delete"
            isSubmitting={batchLoading}
            cancelLabel="Cancel"
          >
            <p className="text-slate-700">
              Are you sure you want to delete <strong>{batchDeleteIds.length}</strong> selected customer{batchDeleteIds.length !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
          </ModalForm>
        </ModalPortal>
      )}
    </div>
  )
}
