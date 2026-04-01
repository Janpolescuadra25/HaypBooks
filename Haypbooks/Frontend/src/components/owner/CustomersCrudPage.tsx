'use client'

import React from 'react'
import { Building2, Eye, Pencil, Trash2, Download, RefreshCw, Plus } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import CrudModal from '@/components/owner/CrudModal'
import { useCrud } from '@/hooks/useCrud'
import { statusColors } from '@/components/owner/statusColors'
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
  { key: 'displayName', label: 'Customer Name', type: 'text' as const, sortable: true },
  { key: 'email', label: 'Email', type: 'text' as const },
  { key: 'phone', label: 'Phone', type: 'text' as const },
  { key: 'totalSales', label: 'Total Sales', type: 'currency' as const, sortable: true },
  { key: 'openBalance', label: 'Open Balance', type: 'currency' as const, sortable: true },
  { key: 'paymentTerms', label: 'Terms', type: 'badge' as const, badgeColors },
  { key: 'status', label: 'Status', type: 'status' as const, statusColors },
]

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CustomersPage() {
  const crud = useCrud({
    endpoint: (companyId) => `/companies/${companyId}/customers`,
    fields: customerFields,
    entityName: 'Customer',
    searchableFields: ['displayName', 'email', 'phone', 'companyName'],
    transform: (data: any) => {
      const items = Array.isArray(data) ? data : data?.items || data?.records || data?.data || []
      return items.map((c: any) => ({
        ...c,
        displayName: c.displayName || c.name || c.customerName || '',
        totalSales: c.totalSales || c.salesTotal || 0,
        openBalance: c.openBalance || c.balance || 0,
        paymentTerms: c.paymentTerms || c.terms || 'NET_30',
        status: c.status || (c.isActive !== false ? 'Active' : 'Inactive'),
      }))
    },
  })

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
        searchableFields={[]}
        searchablePlaceholder="Search customers by name, email, or phone..."
        summaryCards={[
          { label: 'Total Customers', value: crud.data.length, icon: <Building2 size={16} />, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Active', value: crud.data.filter((c: any) => c.status === 'Active').length, icon: <RefreshCw size={16} />, bg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: 'Total Revenue', value: `PHP ${crud.data.reduce((sum: number, c: any) => sum + (c.totalSales || 0), 0).toLocaleString()}`, icon: <Download size={16} />, bg: 'bg-amber-100', iconColor: 'text-amber-600' },
          { label: 'Open Balance', value: `PHP ${crud.data.reduce((sum: number, c: any) => sum + (c.openBalance || 0), 0).toLocaleString()}`, icon: <Building2 size={16} />, bg: 'bg-purple-100', iconColor: 'text-purple-600' },
        ]}
        bulkActions={[
          { label: 'Export Selected', icon: <Download size={13} />, onClick: () => {} },
          { label: 'Delete Selected', icon: <Trash2 size={13} />, onClick: () => {}, variant: 'danger' },
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
        onRowClick={(row) => crud.openView(row)}
        rowMenuItems={(row) => [
          crud.viewAction(row),
          crud.editAction(row),
          crud.deleteAction(row),
        ]}
        emptyTitle="No customers yet"
        emptyDescription="Add your first customer to start tracking sales and invoices."
        emptyAction={{ label: 'Add Customer', onClick: crud.openCreate }}
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
    </>
  )
}
