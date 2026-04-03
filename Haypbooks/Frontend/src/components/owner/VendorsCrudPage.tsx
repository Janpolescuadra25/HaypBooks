'use client'

import React from 'react'
import { Store, Eye, Pencil, Trash2, Download, RefreshCw, Plus } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import CrudModal from '@/components/owner/CrudModal'
import { useCrud } from '@/hooks/useCrud'
import { statusColors } from '@/components/owner/statusColors'
import { badgeColors } from '@/lib/badge-colors'
import type { CrudField } from '@/components/owner/CrudModal'

const vendorFields: CrudField[] = [
  { key: 'displayName', label: 'Vendor Name', type: 'text', required: true, colSpan: 2 },
  { key: 'email', label: 'Email', type: 'email', colSpan: 1 },
  { key: 'phone', label: 'Phone', type: 'tel', colSpan: 1 },
  { key: 'companyName', label: 'Company', type: 'text', colSpan: 1 },
  { key: 'taxId', label: 'Tax ID / TIN', type: 'text', colSpan: 1 },
  { key: 'address', label: 'Address', type: 'textarea', colSpan: 2 },
  { key: 'paymentTerms', label: 'Payment Terms', type: 'select', colSpan: 1, options: [
    { label: 'Net 15', value: 'NET_15' },
    { label: 'Net 30', value: 'NET_30' },
    { label: 'Net 45', value: 'NET_45' },
    { label: 'Net 60', value: 'NET_60' },
    { label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
  ], defaultValue: 'NET_30' },
  { key: 'bankAccount', label: 'Bank Account #', type: 'text', colSpan: 1 },
  { key: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
]

const columns = [
  { key: 'displayName', label: 'Vendor Name', type: 'text' as const, sortable: true },
  { key: 'email', label: 'Email', type: 'text' as const },
  { key: 'phone', label: 'Phone', type: 'text' as const },
  { key: 'totalBills', label: 'Total Bills', type: 'currency' as const, sortable: true },
  { key: 'openBalance', label: 'Open Balance', type: 'currency' as const, sortable: true },
  { key: 'paymentTerms', label: 'Terms', type: 'badge' as const, badgeColors },
  { key: 'status', label: 'Status', type: 'status' as const, statusColors },
]

export default function VendorsCrudPage() {
  const crud = useCrud({
    endpoint: (companyId) => `/companies/${companyId}/contacts/vendors`,
    fields: vendorFields,
    entityName: 'Vendor',
    searchableFields: ['displayName', 'email', 'phone', 'companyName'],
    transform: (data: any) => {
      const items = Array.isArray(data) ? data : data?.items || data?.records || data?.data || []
      return items.map((v: any) => ({
        ...v,
        displayName: v.displayName || v.name || v.vendorName || '',
        totalBills: v.totalBills || v.billsTotal || 0,
        openBalance: v.openBalance || v.balance || 0,
        paymentTerms: v.paymentTerms || v.terms || 'NET_30',
        status: v.status || (v.isActive !== false ? 'Active' : 'Inactive'),
      }))
    },
  })

  return (
    <>
      <OwnerPageTemplate
        title="Vendors"
        section="Expenses"
        icon={<Store size={20} />}
        columns={columns}
        data={crud.filteredData}
        loading={crud.loading}
        searchable
        searchableFields={[]}
        searchablePlaceholder="Search vendors..."
        summaryCards={[
          { label: 'Total Vendors', value: crud.data.length, icon: <Store size={16} />, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Active', value: crud.data.filter((v: any) => v.status === 'Active').length, icon: <RefreshCw size={16} />, bg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: 'Total Payables', value: `PHP ${crud.data.reduce((s: number, v: any) => s + (v.openBalance || 0), 0).toLocaleString()}`, icon: <Download size={16} />, bg: 'bg-amber-100', iconColor: 'text-amber-600' },
        ]}
        showCreate createLabel="New Vendor" onCreate={crud.openCreate}
        showExport onRefresh={crud.refetch}
        onRowClick={(row) => crud.openView(row)}
        rowMenuItems={(row) => [crud.viewAction(row), crud.editAction(row), crud.deleteAction(row)]}
        emptyTitle="No vendors yet"
        emptyDescription="Add your first vendor to start tracking bills and payments."
        emptyAction={{ label: 'Add Vendor', onClick: crud.openCreate }}
        filters={[
          { key: 'status', label: 'Status', type: 'select' as const, options: [
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]},
        ]}
        bulkActions={[
          { label: 'Export Selected', icon: <Download size={13} />, onClick: () => {} },
          { label: 'Delete Selected', icon: <Trash2 size={13} />, onClick: () => {}, variant: 'danger' },
        ]}
      />
      <CrudModal
        open={crud.modalOpen} onClose={crud.closeModal} mode={crud.modalMode}
        title={crud.modalTitle} fields={vendorFields}
        initialData={crud.editingRow || undefined}
        onSubmit={crud.submitForm} onDelete={crud.deleteRecord} loading={crud.saving}
      />
    </>
  )
}
