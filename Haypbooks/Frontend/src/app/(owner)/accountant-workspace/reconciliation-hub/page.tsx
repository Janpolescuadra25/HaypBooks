'use client'

import { useState } from 'react'
import { UserCheck, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import { statusColors } from '@/components/owner/statusColors'

const columns = [
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
    { key: 'account', label: 'Account', type: 'text' },
    { key: 'status', label: 'Status', type: 'status', statusColors }
]

const mockData = [
    { id: 'r1', date: '2026-01-20', description: 'Standard', amount: 48400, account: 'Metro Manila', status: 'Connected' },
    { id: 'r2', date: '2026-01-26', description: 'Metro Manila', amount: 26900, account: 'Q1 2026', status: 'High' },
    { id: 'r3', date: '2026-02-02', description: 'Metro Manila', amount: 17900, account: 'BPI Account', status: 'Closed' },
    { id: 'r4', date: '2026-01-05', description: 'Sample Entry', amount: 6600, account: 'Acme Corp', status: 'Active' },
    { id: 'r5', date: '2026-03-19', description: 'Main', amount: 28300, account: 'Standard', status: 'Approved' },
    { id: 'r6', date: '2026-03-07', description: 'Metro Manila', amount: 31300, account: 'Sample Entry', status: 'Current' },
    { id: 'r7', date: '2026-03-12', description: 'General', amount: 43800, account: 'Default', status: 'Pending' },
    { id: 'r8', date: '2026-03-17', description: 'Acme Corp', amount: 19900, account: 'Standard', status: 'Draft' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Reconciliation Hub"
      section="Accountant Workspace"
      icon={<UserCheck size={20}/>}
      columns={columns}
      data={data}
      searchable
      searchableFields={['name', 'description']}
      summaryCards={[
        { label: 'Total Records', value: 8, icon: <List size={16}/>, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        { label: 'Active', value: 6, icon: <CheckCircle size={16}/>, bg: 'bg-blue-100', iconColor: 'text-blue-600' },
        { label: 'Total Value', value: 'PHP 528,500', icon: <DollarSign size={16}/>, bg: 'bg-amber-100', iconColor: 'text-amber-600' },
        { label: 'This Month', value: 3, icon: <Calendar size={16}/>, bg: 'bg-purple-100', iconColor: 'text-purple-600' },
      ]}
      bulkActions={[
        { label: 'Export Selected', icon: <Download size={13}/>, onClick: (ids) => {} },
        { label: 'Delete Selected', icon: <Trash2 size={13}/>, onClick: (ids) => {}, variant: 'danger' },
      ]}
      filters={[
        { key: 'date_from', label: 'Date Range', type: 'date-range' },
      ]}
      showCreate
      createLabel="Create New"
      onCreate={() => {}}
      showExport
      onRefresh={() => {}}
      rowMenuItems={(row) => [
        { label: 'View', icon: <Eye size={14}/>, onClick: () => {} },
        { label: 'Edit', icon: <Edit2 size={14}/>, onClick: () => {} },
        { label: 'Delete', icon: <Trash2 size={14}/>, onClick: () => {}, variant: 'danger' },
      ]}
    />
  )
}