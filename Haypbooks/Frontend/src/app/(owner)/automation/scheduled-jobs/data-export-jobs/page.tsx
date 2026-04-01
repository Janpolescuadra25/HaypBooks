'use client'

import { useState } from 'react'
import { Zap, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import { statusColors } from '@/components/owner/statusColors'

const columns = [
    { key: 'name', label: 'Task', type: 'text', sortable: true },
    { key: 'assignee', label: 'Assignee', type: 'text' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'priority', label: 'Priority', type: 'status', statusColors },
    { key: 'status', label: 'Status', type: 'status', statusColors }
]

const mockData = [
    { id: 'r1', name: 'Metro Manila', assignee: 'BPI Account', dueDate: '2026-02-09', priority: 'High', status: 'Medium' },
    { id: 'r2', name: 'Metro Manila', assignee: 'Main', dueDate: '2026-01-12', priority: 'Medium', status: 'Draft' },
    { id: 'r3', name: 'General', assignee: 'Active Item', dueDate: '2026-01-04', priority: 'In Stock', status: 'Pending' },
    { id: 'r4', name: 'Main', assignee: 'Main', dueDate: '2026-01-27', priority: 'Filed', status: 'Medium' },
    { id: 'r5', name: 'Default', assignee: 'Metro Manila', dueDate: '2026-02-10', priority: 'In Stock', status: 'High' },
    { id: 'r6', name: 'Default', assignee: 'Active Item', dueDate: '2026-03-21', priority: 'Medium', status: 'Filed' },
    { id: 'r7', name: 'Acme Corp', assignee: 'Main', dueDate: '2026-03-04', priority: 'Enabled', status: 'Connected' },
    { id: 'r8', name: 'Acme Corp', assignee: 'Standard', dueDate: '2026-01-05', priority: 'Processing', status: 'Connected' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Data Export Jobs"
      section="Automation"
      icon={<Zap size={20}/>}
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
