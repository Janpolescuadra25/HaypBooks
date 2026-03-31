// ─── Auto-generated CRUD page: Checks ─────────────────────────────────
'use client'

import React from 'react'
import { FileText, Eye, Pencil, Trash2, Download, RefreshCw } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import CrudModal from '@/components/owner/CrudModal'
import { useCrud } from '@/hooks/useCrud'
import { statusColors, badgeColors } from '@/components/owner/statusColors'
import type { CrudField } from '@/components/owner/CrudModal'

const fields: CrudField[] = [
  { key: 'checkDate', label: 'Check Date', type: 'date', required: true },
  { key: 'checkNumber', label: 'Check #', type: 'text', required: true },
  { key: 'payee', label: 'Payee', type: 'text', required: true, colSpan: 2 },
  { key: 'amount', label: 'Amount', type: 'currency', required: true },
  { key: 'accountName', label: 'Bank Account', type: 'text' },
  { key: 'memo', label: 'Memo', type: 'textarea', colSpan: 2 }
]

const columns = [
  { key: 'checkNumber', label: 'Check #', type: 'text' as const, sortable: true },
  { key: 'payee', label: 'Payee', type: 'text' as const },
  { key: 'amount', label: 'Amount', type: 'currency' as const, sortable: true },
  { key: 'checkDate', label: 'Date', type: 'date' as const, sortable: true },
  { key: 'account', label: 'Account', type: 'text' as const },
  { key: 'status', label: 'Status', type: 'status' as const, statusColors }
]

export default function ChecksPage() {
  const crud = useCrud({
    endpoint: (companyId) => `/companies/{companyId}/banking/checks`,
    fields,
    entityName: 'Check',
    searchableFields: ['checkNumber', 'payee', 'accountName'],
    transform: (data: any) => {
      const items = Array.isArray(data) ? data : data?.items || data?.records || data?.data || []
      return items.map(c => ({...c, status: c.status || "Printed", account: c.accountName || ""}))
    },
  })

  return (
    <>
      <OwnerPageTemplate
        title="Check"
        section="Banking & Cash"
        icon={<FileText size={20} />}
        columns={columns}
        data={crud.filteredData}
        loading={crud.loading}
        searchable
        searchableFields={'checkNumber', 'payee', 'accountName'}
        searchablePlaceholder="Search checks..."
        showCreate
        createLabel="New Check"
        onCreate={crud.openCreate}
        showExport
        onRefresh={crud.refetch}
        onRowClick={(row) => crud.openView(row)}
        rowMenuItems={(row) => [crud.viewAction(row), crud.editAction(row), crud.deleteAction(row)]}
        emptyTitle="No checks yet"
        emptyDescription="Add your first check to get started."
        emptyAction={{ label: `Add Check`, onClick: crud.openCreate }}
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
          { label: 'Total Records', value: crud.data.length, icon: <FileText size={16} />, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
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
