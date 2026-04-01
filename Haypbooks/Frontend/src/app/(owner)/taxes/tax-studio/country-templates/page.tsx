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
    { id: 'r1', name: 'Main', category: 'Variable', value: 'BPI Account', description: 'Active Item', status: 'Active' },
    { id: 'r2', name: 'Acme Corp', category: 'Direct', value: 'BPI Account', description: 'Primary', status: 'High' },
    { id: 'r3', name: 'Q1 2026', category: 'Direct', value: 'Primary', description: 'Default', status: 'Paid' },
    { id: 'r4', name: 'Monthly', category: 'Monthly', value: 'Primary', description: 'Active Item', status: 'Enabled' },
    { id: 'r5', name: 'Sample Entry', category: 'Direct', value: 'Acme Corp', description: 'BPI Account', status: 'Pending' },
    { id: 'r6', name: 'Metro Manila', category: 'Variable', value: 'Primary', description: 'BPI Account', status: 'Open' },
    { id: 'r7', name: 'Primary', category: 'Monthly', value: 'Acme Corp', description: 'Q1 2026', status: 'Completed' },
    { id: 'r8', name: 'Standard', category: 'Standard', value: 'Active Item', description: 'Main', status: 'Active' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Country Templates"
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
