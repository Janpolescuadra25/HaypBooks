// ─── Auto-generated CRUD page: CreditCards ─────────────────────────────────
'use client'

import React from 'react'
import { CreditCard, Eye, Pencil, Trash2, Download, RefreshCw } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import CrudModal from '@/components/owner/CrudModal'
import { useCrud } from '@/hooks/useCrud'
import { statusColors, badgeColors } from '@/components/owner/statusColors'
import type { CrudField } from '@/components/owner/CrudModal'

const fields: CrudField[] = [
  { key: 'name', label: 'Card Name', type: 'text', required: true, colSpan: 2 },
  { key: 'last4', label: 'Last 4 Digits', type: 'text' },
  { key: 'cardType', label: 'Card Type', type: 'select', options: [{ label: 'Visa', value: 'Visa' }, { label: 'Mastercard', value: 'Mastercard' }, { label: 'Amex', value: 'Amex' }, { label: 'JCB', value: 'JCB' }] },
  { key: 'creditLimit', label: 'Credit Limit', type: 'currency' },
  { key: 'statementDay', label: 'Statement Day', type: 'number' }
]

const columns = [
  { key: 'displayName', label: 'Card Name', type: 'text' as const, sortable: true },
  { key: 'last4', label: 'Last 4', type: 'text' as const },
  { key: 'type', label: 'Type', type: 'badge' as const, badgeColors },
  { key: 'balance', label: 'Balance', type: 'currency' as const, sortable: true },
  { key: 'creditLimit', label: 'Credit Limit', type: 'currency' as const },
  { key: 'status', label: 'Status', type: 'status' as const, statusColors }
]

export default function CreditCardsPage() {
  const crud = useCrud({
    endpoint: (companyId) => `/companies/{companyId}/banking/credit-cards`,
    fields,
    entityName: 'Credit Card',
    searchableFields: ['name', 'last4', 'cardType'],
    transform: (data: any) => {
      const items = Array.isArray(data) ? data : data?.items || data?.records || data?.data || []
      return items.map(c => ({...c, displayName: c.name || c.cardName || "", status: c.status || "Active", type: c.cardType || "Visa"}))
    },
  })

  return (
    <>
      <OwnerPageTemplate
        title="Credit Card"
        section="Banking & Cash"
        icon={<CreditCard size={20} />}
        columns={columns}
        data={crud.filteredData}
        loading={crud.loading}
        searchable
        searchableFields={'name', 'last4', 'cardType'}
        searchablePlaceholder="Search credit cards..."
        showCreate
        createLabel="New Credit Card"
        onCreate={crud.openCreate}
        showExport
        onRefresh={crud.refetch}
        onRowClick={(row) => crud.openView(row)}
        rowMenuItems={(row) => [crud.viewAction(row), crud.editAction(row), crud.deleteAction(row)]}
        emptyTitle="No credit cards yet"
        emptyDescription="Add your first credit card to get started."
        emptyAction={{ label: `Add Credit Card`, onClick: crud.openCreate }}
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
          { label: 'Total Records', value: crud.data.length, icon: <CreditCard size={16} />, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Active', value: crud.data.filter((r: any) => r.status === 'Active').length, icon: <RefreshCw size={16} />, bg: 'bg-blue-100', iconColor: 'text-blue-600' },
        }]
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
