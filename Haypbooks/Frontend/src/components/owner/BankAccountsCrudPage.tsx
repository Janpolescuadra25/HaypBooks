// ─── Auto-generated CRUD page: BankAccounts ─────────────────────────────────
'use client'

import React from 'react'
import { Landmark, Eye, Pencil, Trash2, Download, RefreshCw } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import CrudModal from '@/components/owner/CrudModal'
import { useCrud } from '@/hooks/useCrud'
import { statusColors, badgeColors } from '@/components/owner/statusColors'
import type { CrudField } from '@/components/owner/CrudModal'

const fields: CrudField[] = [
  { key: 'name', label: 'Account Name', type: 'text', required: true, colSpan: 2 },
  { key: 'bankName', label: 'Bank Name', type: 'text' },
  { key: 'accountNumber', label: 'Account Number', type: 'text' },
  { key: 'accountType', label: 'Account Type', type: 'select', options: [{ label: 'Checking', value: 'Checking' }, { label: 'Savings', value: 'Savings' }, { label: 'Credit Card', value: 'CreditCard' }, { label: 'Cash', value: 'Cash' }] },
  { key: 'currency', label: 'Currency', type: 'select', options: [{ label: 'PHP', value: 'PHP' }, { label: 'USD', value: 'USD' }, { label: 'EUR', value: 'EUR' }], defaultValue: 'PHP' },
  { key: 'description', label: 'Description', type: 'textarea', colSpan: 2 }
]

const columns = [
  { key: 'displayName', label: 'Account Name', type: 'text' as const, sortable: true },
  { key: 'bankName', label: 'Bank', type: 'text' as const },
  { key: 'accountNumber', label: 'Account #', type: 'text' as const },
  { key: 'type', label: 'Type', type: 'badge' as const, badgeColors },
  { key: 'balance', label: 'Balance', type: 'currency' as const, sortable: true },
  { key: 'currency', label: 'Currency', type: 'text' as const },
  { key: 'status', label: 'Status', type: 'status' as const, statusColors }
]

export default function BankAccountsPage() {
  const crud = useCrud({
    endpoint: (companyId) => `/companies/${companyId}/banking/accounts`,
    fields,
    entityName: 'Bank Account',
    searchableFields: ['name', 'bankName', 'accountNumber', 'accountType'],
    transform: (data: any) => {
      const items = Array.isArray(data) ? data : data?.items || data?.records || data?.data || []
      return items.map((a: any) => ({...a, displayName: a.name || a.accountName || '', status: a.status || 'Active', type: a.accountType || 'Checking'}))
    },
  })

  function exportSelected() {
    const selected = crud.data.filter((r: any) => r._selected)
    const rows = selected.length ? selected : crud.data
    const headers = ['Account Name', 'Bank', 'Account #', 'Type', 'Balance', 'Currency', 'Status']
    const csvRows = rows.map((r: any) => [
      r.displayName, r.bankName, r.accountNumber, r.type,
      r.balance ?? '', r.currency ?? '', r.status
    ])
    const csv = [headers, ...csvRows].map(row => row.map(String).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'bank-accounts.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <OwnerPageTemplate
        title="Bank Account"
        section="Banking & Cash"
        icon={<Landmark size={20} />}
        columns={columns}
        data={crud.filteredData}
        loading={crud.loading}
        searchable
        searchableFields={[]}
        searchablePlaceholder="Search bank accounts..."
        showCreate
        createLabel="New Bank Account"
        onCreate={crud.openCreate}
        showExport
        onRefresh={crud.refetch}
        onRowClick={(row) => crud.openView(row)}
        rowMenuItems={(row) => [crud.viewAction(row), crud.editAction(row), crud.deleteAction(row)]}
        emptyTitle="No bank accounts yet"
        emptyDescription="Add your first bank account to get started."
        emptyAction={{ label: `Add Bank Account`, onClick: crud.openCreate }}
        bulkActions={[
          { label: 'Export Selected', icon: <Download size={13} />, onClick: exportSelected },
          { label: 'Delete Selected', icon: <Trash2 size={13} />, onClick: crud.bulkDelete ?? (() => {}), variant: 'danger' },
        ]}
        filters={[
          { key: 'status', label: 'Status', type: 'select' as const, options: [
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]},
          { key: 'date_from', label: 'Date Range', type: 'date-range' as const },
        ]}
        summaryCards={[
          { label: 'Total Records', value: crud.data.length, icon: <Landmark size={16} />, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
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
