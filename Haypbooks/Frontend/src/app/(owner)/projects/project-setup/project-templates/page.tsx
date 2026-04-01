'use client'

import { useState } from 'react'
import { FolderKanban, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Active Item', category: 'Revenue', value: 'Q1 2026', description: 'Q1 2026', status: 'Approved' },
    { id: 'r2', name: 'Active Item', category: 'Monthly', value: 'Monthly', description: 'Standard', status: 'Active' },
    { id: 'r3', name: 'Main', category: 'Standard', value: 'Acme Corp', description: 'Metro Manila', status: 'Current' },
    { id: 'r4', name: 'Active Item', category: 'Revenue', value: 'Active Item', description: 'Metro Manila', status: 'Completed' },
    { id: 'r5', name: 'Acme Corp', category: 'Annual', value: 'Main', description: 'Q1 2026', status: 'Open' },
    { id: 'r6', name: 'Primary', category: 'Operating', value: 'Main', description: 'Metro Manila', status: 'Enabled' },
    { id: 'r7', name: 'Primary', category: 'Premium', value: 'Standard', description: 'BPI Account', status: 'Closed' },
    { id: 'r8', name: 'Active Item', category: 'Variable', value: 'Q1 2026', description: 'Sample Entry', status: 'Enabled' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Project Templates"
      section="Projects"
      icon={<FolderKanban size={20}/>}
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
