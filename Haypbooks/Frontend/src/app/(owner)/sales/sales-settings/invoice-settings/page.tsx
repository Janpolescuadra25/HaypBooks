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
    { id: 'r1', name: 'BPI Account', category: 'Premium', value: 'Metro Manila', description: 'Q1 2026', status: 'In Stock' },
    { id: 'r2', name: 'Main', category: 'Monthly', value: 'Sample Entry', description: 'Q1 2026', status: 'Draft' },
    { id: 'r3', name: 'Monthly', category: 'Annual', value: 'Q1 2026', description: 'Active Item', status: 'Processing' },
    { id: 'r4', name: 'Sample Entry', category: 'Standard', value: 'Default', description: 'Standard', status: 'Draft' },
    { id: 'r5', name: 'Q1 2026', category: 'Basic', value: 'Active Item', description: 'Main', status: 'Paid' },
    { id: 'r6', name: 'Default', category: 'Fixed', value: 'General', description: 'Metro Manila', status: 'Processing' },
    { id: 'r7', name: 'General', category: 'Direct', value: 'Monthly', description: 'Monthly', status: 'Current' },
    { id: 'r8', name: 'Main', category: 'Fixed', value: 'Q1 2026', description: 'Sample Entry', status: 'Filed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Invoice Settings"
      section="Sales & Revenue"
      icon={<TrendingUp size={20}/>}
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