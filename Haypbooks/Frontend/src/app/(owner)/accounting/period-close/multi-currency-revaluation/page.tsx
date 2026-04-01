'use client'

import { useState } from 'react'
import { Calculator, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Main', category: 'Basic', value: 'Standard', description: 'Main', status: 'Open' },
    { id: 'r2', name: 'Main', category: 'Basic', value: 'Standard', description: 'Active Item', status: 'High' },
    { id: 'r3', name: 'Default', category: 'Quarterly', value: 'Q1 2026', description: 'Monthly', status: 'Closed' },
    { id: 'r4', name: 'Monthly', category: 'Quarterly', value: 'Default', description: 'Default', status: 'Completed' },
    { id: 'r5', name: 'Q1 2026', category: 'Basic', value: 'Default', description: 'Standard', status: 'Pending' },
    { id: 'r6', name: 'Monthly', category: 'Standard', value: 'Metro Manila', description: 'Metro Manila', status: 'Closed' },
    { id: 'r7', name: 'Metro Manila', category: 'Variable', value: 'Primary', description: 'General', status: 'Connected' },
    { id: 'r8', name: 'Active Item', category: 'Basic', value: 'Main', description: 'Default', status: 'Current' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Multi Currency Revaluation"
      section="Accounting"
      icon={<Calculator size={20}/>}
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
