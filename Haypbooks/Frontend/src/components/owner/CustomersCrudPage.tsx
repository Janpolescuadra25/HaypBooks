'use client'

import React, { useCallback } from 'react'
import { Building2, Eye, Pencil, Trash2, Download, RefreshCw, Plus, Clock } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import CrudModal from '@/components/owner/CrudModal'
import CustomerAuditLog from '@/components/owner/CustomerAuditLog'
import { useCrud } from '@/hooks/useCrud'
import { statusColors } from '@/components/owner/statusColors'
import { badgeColors } from '@/lib/badge-colors'
import type { CrudField } from '@/components/owner/CrudModal'

// ─── Field Definitions ────────────────────────────────────────────────────────

const customerFields: CrudField[] = [
  { key: 'displayName', label: 'Customer Name', type: 'text', required: true, colSpan: 2 },
  { key: 'email', label: 'Email', type: 'email', colSpan: 1 },
  { key: 'phone', label: 'Phone', type: 'tel', colSpan: 1 },
  { key: 'companyName', label: 'Company', type: 'text', colSpan: 1 },
  { key: 'taxId', label: 'Tax ID / TIN', type: 'text', colSpan: 1 },
  { key: 'billingAddress', label: 'Billing Address', type: 'textarea', colSpan: 2 },
  { key: 'shippingAddress', label: 'Shipping Address', type: 'textarea', colSpan: 2 },
  { key: 'paymentTerms', label: 'Payment Terms', type: 'select', colSpan: 1, options: [
    { label: 'Net 15', value: 'NET_15' },
    { label: 'Net 30', value: 'NET_30' },
    { label: 'Net 45', value: 'NET_45' },
    { label: 'Net 60', value: 'NET_60' },
    { label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
    { label: 'Prepaid', value: 'PREPAID' },
  ], defaultValue: 'NET_30' },
  { key: 'creditLimit', label: 'Credit Limit', type: 'currency', colSpan: 1, description: 'Leave 0 for no limit' },
  { key: 'notes', label: 'Internal Notes', type: 'textarea', colSpan: 2 },
]

// ─── Column Definitions for Table ─────────────────────────────────────────────

const columns = [
  {
    key: 'displayName',
    label: 'Customer Name',
    type: 'text' as const,
    sortable: true,
    render: (value: string, row: any) => {
      const initials = (value || '?')
        .split(' ')
        .map((n: string) => n[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?'
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 truncate text-sm">{value || 'Unnamed'}</div>
            {row.companyName && (
              <div className="text-[11px] text-slate-400 truncate">{row.companyName}</div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text' as const,
    render: (value: string) =>
      value
        ? <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 hover:underline text-sm" onClick={(e) => e.stopPropagation()}>{value}</a>
        : <span className="text-slate-300 text-sm">—</span>,
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'text' as const,
    render: (value: string) =>
      value
        ? <a href={`tel:${value}`} className="text-slate-600 hover:text-slate-900 text-sm" onClick={(e) => e.stopPropagation()}>{value}</a>
        : <span className="text-slate-300 text-sm">—</span>,
  },
  { key: 'totalSales', label: 'Total Sales', type: 'currency' as const, sortable: true },
  { key: 'openBalance', label: 'Open Balance', type: 'currency' as const, sortable: true },
  { key: 'paymentTerms', label: 'Terms', type: 'badge' as const, badgeColors },
  { key: 'status', label: 'Status', type: 'status' as const, statusColors },
]

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(50)
  const [search, setSearch] = React.useState('')

  // Audit log state
  const [auditCustomerId, setAuditCustomerId] = React.useState<string | null>(null)
  const [auditCustomerName, setAuditCustomerName] = React.useState<string | undefined>(undefined)
  const [auditOpen, setAuditOpen] = React.useState(false)

  // Search input ref for keyboard shortcut
  const searchRef = React.useRef<HTMLInputElement | null>(null)

  const endpoint = React.useCallback(
    (companyId: string) =>
      `/companies/${companyId}/contacts/customers?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    [page, limit, search],
  )

  const crud = useCrud({
    endpoint,
    fields: customerFields,
    entityName: 'Customer',
    searchableFields: ['displayName', 'email', 'phone', 'companyName'],
    transform: useCallback((data: any) => {
      const items = Array.isArray(data) ? data : data?.items || data?.records || data?.data || []
      return items.map((c: any) => ({
        ...c,
        id: c.id || c.contactId,
        displayName: c.displayName || c.contact?.displayName || c.name || c.customerName || '',
        email: c.email || c.contact?.contactEmails?.[0]?.email || c.contact?.email || '',
        phone: c.phone || c.contact?.contactPhones?.[0]?.phone || c.contact?.phone || '',
        totalSales: c.totalSales || c.salesTotal || 0,
        openBalance: c.openBalance || c.balance || 0,
        paymentTerms: c.paymentTerms || c.terms || 'NET_30',
        status: c.status || (c.isActive !== false ? 'Active' : 'Inactive'),
      }))
    }, []),
  })

  // Keyboard shortcuts: Ctrl/Cmd+N → new customer, Ctrl/Cmd+K → focus search, Escape → close audit
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key === 'n' && !crud.modalOpen && !auditOpen) {
        e.preventDefault()
        crud.openCreate()
      }
      if (meta && e.key === 'k') {
        e.preventDefault()
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')
        input?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [crud.modalOpen, auditOpen, crud.openCreate])

  const openAuditLog = useCallback((row: any) => {
    setAuditCustomerId(row.id)
    setAuditCustomerName(row.displayName)
    setAuditOpen(true)
  }, [])

  // ── Bulk action handlers ─────────────────────────────────────────────────────

  const handleBulkExport = useCallback((ids: string[]) => {
    const selected = crud.data.filter((c: any) => ids.includes(c.id))
    const headers = ['Customer Name', 'Email', 'Phone', 'Company', 'Payment Terms', 'Status', 'Total Sales', 'Open Balance']
    const rows = selected.map((c: any) => [
      c.displayName || '',
      c.email || '',
      c.phone || '',
      c.companyName || '',
      c.paymentTerms || '',
      c.status || '',
      c.totalSales || 0,
      c.openBalance || 0,
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [crud.data])

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    if (!window.confirm(`Delete ${ids.length} customer${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return
    for (const id of ids) {
      await crud.deleteRecord(id)
    }
    crud.refetch()
  }, [crud.deleteRecord, crud.refetch])

  return (
    <>
      <OwnerPageTemplate
        title="Customers"
        section="Sales & Revenue"
        icon={<Building2 size={20} />}
        columns={columns}
        data={crud.filteredData}
        loading={crud.loading}
        searchable
        searchableFields={['displayName','email','phone','companyName']}
        searchablePlaceholder="Search customers by name, email, or phone..."
        summaryCards={[
          { label: 'Total Customers', value: crud.data.length, icon: <Building2 size={16} />, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Active', value: crud.data.filter((c: any) => c.status === 'Active').length, icon: <RefreshCw size={16} />, bg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: 'Total Revenue', value: `PHP ${crud.data.reduce((sum: number, c: any) => sum + (c.totalSales || 0), 0).toLocaleString()}`, icon: <Download size={16} />, bg: 'bg-amber-100', iconColor: 'text-amber-600' },
          { label: 'Open Balance', value: `PHP ${crud.data.reduce((sum: number, c: any) => sum + (c.openBalance || 0), 0).toLocaleString()}`, icon: <Building2 size={16} />, bg: 'bg-purple-100', iconColor: 'text-purple-600' },
        ]}
        bulkActions={[
          { label: 'Export Selected', icon: <Download size={13} />, onClick: handleBulkExport },
          { label: 'Delete Selected', icon: <Trash2 size={13} />, onClick: handleBulkDelete, variant: 'danger' },
        ]}
        filters={[
          { key: 'status', label: 'Status', type: 'select' as const, options: [
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]},
          { key: 'paymentTerms', label: 'Payment Terms', type: 'select' as const, options: [
            { label: 'Net 15', value: 'NET_15' },
            { label: 'Net 30', value: 'NET_30' },
            { label: 'Net 45', value: 'NET_45' },
            { label: 'Net 60', value: 'NET_60' },
          ]},
          { key: 'date_from', label: 'Date Range', type: 'date-range' as const },
        ]}
        showCreate
        createLabel="New Customer"
        onCreate={crud.openCreate}
        showExport
        onRefresh={crud.refetch}
        onSearch={setSearch}
        onRowClick={(row) => crud.openView(row)}
        rowInlineActions={(row) => [
          {
            icon: <Eye size={14} />,
            title: 'View customer (V)',
            onClick: () => crud.openView(row),
            colorClass: 'text-slate-400 hover:text-blue-600 hover:bg-blue-50',
          },
          {
            icon: <Pencil size={14} />,
            title: 'Edit customer (E)',
            onClick: () => crud.openEdit(row),
            colorClass: 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50',
          },
          {
            icon: <Clock size={14} />,
            title: 'View audit history',
            onClick: () => openAuditLog(row),
            colorClass: 'text-slate-400 hover:text-purple-600 hover:bg-purple-50',
          },
          {
            icon: <Trash2 size={14} />,
            title: 'Delete customer',
            onClick: () => crud.openDelete(row),
            colorClass: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50',
          },
        ]}
        rowMenuItems={(row) => [
          crud.viewAction(row),
          crud.editAction(row),
          crud.deleteAction(row),
        ]}
        emptyTitle="No customers yet"
        emptyDescription="Add your first customer to start tracking sales and invoices."
        emptyAction={{ label: 'Add Customer', onClick: crud.openCreate }}
        footer={
          <div className="px-4 py-2 text-xs text-slate-500">
            Page {crud.pagination?.page ?? 1} of {crud.pagination?.totalPages ?? 1} • Total {crud.pagination?.total ?? crud.data.length}
          </div>
        }
      />

      {/* ── CRUD Modal ── */}
      <CrudModal
        open={crud.modalOpen}
        onClose={crud.closeModal}
        mode={crud.modalMode}
        title={crud.modalTitle}
        fields={customerFields}
        initialData={crud.editingRow || undefined}
        onSubmit={crud.submitForm}
        onDelete={crud.deleteRecord}
        loading={crud.saving}
      />

      {/* ── Audit Log Drawer ── */}
      <CustomerAuditLog
        customerId={auditCustomerId}
        customerName={auditCustomerName}
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
      />
    </>
  )
}
