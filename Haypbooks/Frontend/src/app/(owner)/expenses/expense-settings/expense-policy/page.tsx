'use client'

import { useState } from 'react'
import { Receipt, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import { statusColors, badgeColors } from '@/components/owner/statusColors'

const columns = [
    { key: 'name', label: 'Setting', type: 'text', sortable: true },
    { key: 'category', label: 'Category', type: 'badge', badgeColors },
    { key: 'value', label: 'Value', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'status', label: 'Status', type: 'status', statusColors }
]

const mockData = [
    { id: 'r1', name: 'Standard', category: 'Basic', value: 'Main', description: 'General', status: 'Draft' },
    { id: 'r2', name: 'Acme Corp', category: 'Direct', value: 'Monthly', description: 'Main', status: 'Connected' },
    { id: 'r3', name: 'General', category: 'Premium', value: 'General', description: 'Active Item', status: 'Paid' },
    { id: 'r4', name: 'Metro Manila', category: 'Operating', value: 'Primary', description: 'Metro Manila', status: 'Completed' },
    { id: 'r5', name: 'Primary', category: 'Fixed', value: 'Standard', description: 'Primary', status: 'Pending' },
    { id: 'r6', name: 'Primary', category: 'Premium', value: 'Main', description: 'Acme Corp', status: 'Connected' },
    { id: 'r7', name: 'General', category: 'Fixed', value: 'Acme Corp', description: 'Default', status: 'Processing' },
    { id: 'r8', name: 'Default', category: 'Fixed', value: 'General', description: 'Acme Corp', status: 'Pending' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Expense Policy"
      section="Expenses"
      icon={<Receipt size={20}/>}
      columns={columns}
      data={data}
      searchable
      searchableFields={[]}
      summaryCards={[
        { label: 'Total Records', value: 8, icon: <List size={16}/>, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        { label: 'Active', value: 6, icon: <CheckCircle size={16}/>, bg: 'bg-blue-100', iconColor: 'text-blue-600' },
        { label: 'This Month', value: 3, icon: <Calendar size={16}/>, bg: 'bg-amber-100', iconColor: 'text-amber-600' },
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
