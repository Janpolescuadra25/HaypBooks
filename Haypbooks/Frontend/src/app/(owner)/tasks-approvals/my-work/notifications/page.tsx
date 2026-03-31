'use client'

import { useState } from 'react'
import { CheckSquare, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Metro Manila', category: 'Premium', value: 'Monthly', description: 'Active Item', status: 'High' },
    { id: 'r2', name: 'Sample Entry', category: 'Operating', value: 'Active Item', description: 'Default', status: 'Processing' },
    { id: 'r3', name: 'Active Item', category: 'Fixed', value: 'BPI Account', description: 'Q1 2026', status: 'High' },
    { id: 'r4', name: 'Acme Corp', category: 'Fixed', value: 'Monthly', description: 'Monthly', status: 'Processing' },
    { id: 'r5', name: 'Main', category: 'Standard', value: 'Acme Corp', description: 'Default', status: 'Connected' },
    { id: 'r6', name: 'General', category: 'Monthly', value: 'Monthly', description: 'BPI Account', status: 'Draft' },
    { id: 'r7', name: 'Metro Manila', category: 'Basic', value: 'BPI Account', description: 'Metro Manila', status: 'Enabled' },
    { id: 'r8', name: 'Standard', category: 'Premium', value: 'Active Item', description: 'Active Item', status: 'Draft' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Notifications"
      section="Tasks & Approvals"
      icon={<CheckSquare size={20}/>}
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