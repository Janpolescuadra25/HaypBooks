'use client'

import { useState } from 'react'
import { Settings, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'BPI Account', category: 'Monthly', value: 'Q1 2026', description: 'Metro Manila', status: 'Approved' },
    { id: 'r2', name: 'General', category: 'Basic', value: 'Acme Corp', description: 'Sample Entry', status: 'Draft' },
    { id: 'r3', name: 'BPI Account', category: 'Quarterly', value: 'Sample Entry', description: 'Primary', status: 'Paid' },
    { id: 'r4', name: 'Main', category: 'Operating', value: 'Q1 2026', description: 'Main', status: 'Completed' },
    { id: 'r5', name: 'Monthly', category: 'Monthly', value: 'Monthly', description: 'Default', status: 'Draft' },
    { id: 'r6', name: 'Monthly', category: 'Operating', value: 'Monthly', description: 'Default', status: 'In Stock' },
    { id: 'r7', name: 'General', category: 'Monthly', value: 'General', description: 'Primary', status: 'Enabled' },
    { id: 'r8', name: 'Main', category: 'Variable', value: 'Active Item', description: 'General', status: 'Processing' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Custom Lists"
      section="Settings"
      icon={<Settings size={20}/>}
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
