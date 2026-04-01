// ─── Auto-generated CRUD page: Deposits ─────────────────────────────────
'use client'

import React from 'react'
import { ArrowDownCircle, Eye, Pencil, Trash2, Download, RefreshCw } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import CrudModal from '@/components/owner/CrudModal'
import { useCrud } from '@/hooks/useCrud'
import { statusColors, badgeColors } from '@/components/owner/statusColors'
import type { CrudField } from '@/components/owner/CrudModal'

const fields: CrudField[] = [
  { key: 'depositDate', label: 'Deposit Date', type: 'date', required: true },
  { key: 'reference', label: 'Reference #', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'currency', required: true },
  { key: 'accountName', label: 'Bank Account', type: 'text' },
  { key: 'paymentMethod', label: 'Payment Method', type: 'select', options: [{ label: 'Cash', value: 'Cash' }, { label: 'Check', value: 'Check' }, { label: 'Transfer', value: 'Transfer' }, { label: 'Credit Card', value: 'CreditCard' }] },
  { key: 'memo', label: 'Memo', type: 'textarea', colSpan: 2 }
]

const columns = [
  { key: 'depositDate', label: 'Date', type: 'date' as const, sortable: true },
  { key: 'reference', label: 'Reference', type: 'text' as const },
  { key: 'account', label: 'Account', type: 'text' as const },
  { key: 'amount', label: 'Amount', type: 'currency' as const, sortable: true },
  { key: 'paymentMethod', label: 'Method', type: 'badge' as const, badgeColors },
  { key: 'status', label: 'Status', type: 'status' as const, statusColors }
]

export default function DepositsPage() {
  const crud = useCrud({
    endpoint: (companyId) => `/companies/{companyId}/banking/deposits`,
    fields,
    entityName: 'Deposit',
    searchableFields: ['reference', 'accountName', 'paymentMethod'],
    transform: (data: any) => {
      const items = Array.isArray(data) ? data : data?.items || data?.records || data?.data || []
      return items.map(d => ({...d, status: d.status || "Recorded", account: d.accountName || d.bankAccountId || ""}))
    },
  })

  return (
    <>
      <OwnerPageTemplate
        title="Deposit"
        section="Banking & Cash"
        icon={<ArrowDownCircle size={20} />}
        columns={columns}
        data={crud.filteredData}
        loading={crud.loading}
        searchable
        searchableFields={[]}
        searchablePlaceholder="Search deposits..."
        showCreate
        createLabel="New Deposit"
        onCreate={crud.openCreate}
        showExport
        onRefresh={crud.refetch}
        onRowClick={(row) => crud.openView(row)}
        rowMenuItems={(row) => [crud.viewAction(row), crud.editAction(row), crud.deleteAction(row)]}
        emptyTitle="No deposits yet"
        emptyDescription="Add your first deposit to get started."
        emptyAction={{ label: `Add Deposit`, onClick: crud.openCreate }}
        bulkActions={[
          { label: 'Export Selected', icon: <Download size={13} />, onClick: () => {} },
          { label: 'Delete Selected', icon: <Trash2 size={13} />, onClick: () => {}, variant: 'danger' },
        ]}
        filters={[
          { key: 'status', label: 'Status', type: 'select' as const, options: [
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]},
          { key: 'date_from', label: 'Date Range', type: 'date-range' as const },
        ]}
        summaryCards={[
          { label: 'Total Records', value: crud.data.length, icon: <ArrowDownCircle size={16} />, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Active', value: crud.data.filter((r: any) => r.status === 'Active').length, icon: <RefreshCw size={16} />, bg: 'bg-blue-100', iconColor: 'text-blue-600' },
        ]}
      />
      <CrudModal
        open={crud.modalOpen}
        onClose={crud.closeModal}
        mode={crud.modalMode}
        title={crud.modalTitle}
        fields={fields}
        initialData={crud.editingRow || undefined}
        onSubmit={crud.submitForm}
        onDelete={crud.deleteRecord}
        loading={crud.saving}
      />
    </>
  )
}
