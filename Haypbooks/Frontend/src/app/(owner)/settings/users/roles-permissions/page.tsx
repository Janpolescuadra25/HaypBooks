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
    { id: 'r1', name: 'Primary', category: 'Revenue', value: 'Standard', description: 'Primary', status: 'In Stock' },
    { id: 'r2', name: 'General', category: 'Operating', value: 'Acme Corp', description: 'Sample Entry', status: 'Open' },
    { id: 'r3', name: 'Acme Corp', category: 'Premium', value: 'Sample Entry', description: 'General', status: 'Low' },
    { id: 'r4', name: 'Main', category: 'Premium', value: 'BPI Account', description: 'Metro Manila', status: 'Approved' },
    { id: 'r5', name: 'Standard', category: 'Direct', value: 'Metro Manila', description: 'Monthly', status: 'Medium' },
    { id: 'r6', name: 'Active Item', category: 'Premium', value: 'Q1 2026', description: 'BPI Account', status: 'Connected' },
    { id: 'r7', name: 'Default', category: 'Fixed', value: 'Q1 2026', description: 'Sample Entry', status: 'Draft' },
    { id: 'r8', name: 'Monthly', category: 'Basic', value: 'Primary', description: 'Active Item', status: 'In Stock' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Roles Permissions"
      section="Settings"
      icon={<Settings size={20}/>}
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