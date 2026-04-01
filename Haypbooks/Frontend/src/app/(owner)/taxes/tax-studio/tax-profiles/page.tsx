'use client'

import { useState } from 'react'
import { FileText, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Primary', category: 'Revenue', value: 'Main', description: 'Default', status: 'Paid' },
    { id: 'r2', name: 'Metro Manila', category: 'Basic', value: 'Default', description: 'Standard', status: 'Approved' },
    { id: 'r3', name: 'Q1 2026', category: 'Basic', value: 'General', description: 'Primary', status: 'Closed' },
    { id: 'r4', name: 'Main', category: 'Variable', value: 'Default', description: 'Acme Corp', status: 'Processing' },
    { id: 'r5', name: 'Sample Entry', category: 'Basic', value: 'Primary', description: 'Standard', status: 'Processing' },
    { id: 'r6', name: 'Default', category: 'Fixed', value: 'Default', description: 'Q1 2026', status: 'Closed' },
    { id: 'r7', name: 'Acme Corp', category: 'Direct', value: 'Metro Manila', description: 'Main', status: 'Approved' },
    { id: 'r8', name: 'Metro Manila', category: 'Direct', value: 'General', description: 'Q1 2026', status: 'Processing' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Tax Profiles"
      section="Tax"
      icon={<FileText size={20}/>}
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
