'use client'

import { useState } from 'react'
import { LayoutDashboard, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'General', category: 'Operating', value: 'Acme Corp', description: 'Metro Manila', status: 'Draft' },
    { id: 'r2', name: 'Q1 2026', category: 'Basic', value: 'Standard', description: 'Monthly', status: 'Draft' },
    { id: 'r3', name: 'Primary', category: 'Monthly', value: 'Standard', description: 'General', status: 'Open' },
    { id: 'r4', name: 'General', category: 'Direct', value: 'Sample Entry', description: 'Default', status: 'Completed' },
    { id: 'r5', name: 'Default', category: 'Standard', value: 'Sample Entry', description: 'BPI Account', status: 'Completed' },
    { id: 'r6', name: 'Monthly', category: 'Operating', value: 'Metro Manila', description: 'BPI Account', status: 'Filed' },
    { id: 'r7', name: 'Default', category: 'Basic', value: 'Sample Entry', description: 'Q1 2026', status: 'Open' },
    { id: 'r8', name: 'Standard', category: 'Basic', value: 'Metro Manila', description: 'Main', status: 'Draft' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Notifications"
      section="Home"
      icon={<LayoutDashboard size={20}/>}
      columns={columns}
      data={data}
      searchable
      searchableFields={['name', 'description']}
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