'use client'

import { useState } from 'react'
import { TrendingUp, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Default', category: 'Operating', value: 'Sample Entry', description: 'General', status: 'Approved' },
    { id: 'r2', name: 'Main', category: 'Operating', value: 'Sample Entry', description: 'Q1 2026', status: 'Filed' },
    { id: 'r3', name: 'Primary', category: 'Basic', value: 'Q1 2026', description: 'Q1 2026', status: 'Approved' },
    { id: 'r4', name: 'Sample Entry', category: 'Revenue', value: 'General', description: 'Acme Corp', status: 'Completed' },
    { id: 'r5', name: 'Metro Manila', category: 'Revenue', value: 'Sample Entry', description: 'Metro Manila', status: 'Closed' },
    { id: 'r6', name: 'Standard', category: 'Premium', value: 'Sample Entry', description: 'Main', status: 'Current' },
    { id: 'r7', name: 'Acme Corp', category: 'Revenue', value: 'General', description: 'Sample Entry', status: 'Pending' },
    { id: 'r8', name: 'Acme Corp', category: 'Monthly', value: 'Monthly', description: 'BPI Account', status: 'Approved' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Credit Terms"
      section="Sales & Revenue"
      icon={<TrendingUp size={20}/>}
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
