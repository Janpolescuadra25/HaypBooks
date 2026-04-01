'use client'

import { useState } from 'react'
import { CheckSquare, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Metro Manila', assignee: 'Default', dueDate: '2026-02-19', priority: 'High', status: 'Active' },
    { id: 'r2', name: 'Metro Manila', assignee: 'Active Item', dueDate: '2026-03-15', priority: 'Enabled', status: 'Processing' },
    { id: 'r3', name: 'BPI Account', assignee: 'Q1 2026', dueDate: '2026-03-04', priority: 'In Stock', status: 'Filed' },
    { id: 'r4', name: 'Monthly', assignee: 'Standard', dueDate: '2026-03-21', priority: 'Completed', status: 'High' },
    { id: 'r5', name: 'Monthly', assignee: 'General', dueDate: '2026-01-14', priority: 'Closed', status: 'Draft' },
    { id: 'r6', name: 'Metro Manila', assignee: 'General', dueDate: '2026-01-06', priority: 'Enabled', status: 'Connected' },
    { id: 'r7', name: 'Default', assignee: 'Active Item', dueDate: '2026-03-10', priority: 'Connected', status: 'Pending' },
    { id: 'r8', name: 'Main', assignee: 'General', dueDate: '2026-03-05', priority: 'Open', status: 'Processing' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Calendar"
      section="Tasks & Approvals"
      icon={<CheckSquare size={20}/>}
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
