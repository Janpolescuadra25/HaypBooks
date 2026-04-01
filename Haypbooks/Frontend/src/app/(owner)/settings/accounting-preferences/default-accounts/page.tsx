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
    { id: 'r1', name: 'Acme Corp', category: 'Direct', value: 'Active Item', description: 'Primary', status: 'Approved' },
    { id: 'r2', name: 'Default', category: 'Revenue', value: 'Standard', description: 'Metro Manila', status: 'High' },
    { id: 'r3', name: 'Monthly', category: 'Operating', value: 'Active Item', description: 'Monthly', status: 'Pending' },
    { id: 'r4', name: 'Q1 2026', category: 'Revenue', value: 'Metro Manila', description: 'General', status: 'Completed' },
    { id: 'r5', name: 'Q1 2026', category: 'Variable', value: 'BPI Account', description: 'Sample Entry', status: 'Closed' },
    { id: 'r6', name: 'Standard', category: 'Annual', value: 'Metro Manila', description: 'BPI Account', status: 'In Stock' },
    { id: 'r7', name: 'Standard', category: 'Operating', value: 'Monthly', description: 'Default', status: 'Medium' },
    { id: 'r8', name: 'Monthly', category: 'Revenue', value: 'Primary', description: 'Primary', status: 'Low' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Default Accounts"
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
