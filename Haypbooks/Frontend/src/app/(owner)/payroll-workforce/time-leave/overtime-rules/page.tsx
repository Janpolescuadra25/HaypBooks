'use client'

import { useState } from 'react'
import { Users, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Q1 2026', assignee: 'Q1 2026', dueDate: '2026-01-20', priority: 'Low', status: 'Filed' },
    { id: 'r2', name: 'BPI Account', assignee: 'Main', dueDate: '2026-01-26', priority: 'Current', status: 'Open' },
    { id: 'r3', name: 'Acme Corp', assignee: 'Metro Manila', dueDate: '2026-01-18', priority: 'Connected', status: 'Closed' },
    { id: 'r4', name: 'Default', assignee: 'Active Item', dueDate: '2026-02-23', priority: 'Current', status: 'Current' },
    { id: 'r5', name: 'General', assignee: 'Metro Manila', dueDate: '2026-03-11', priority: 'Current', status: 'Active' },
    { id: 'r6', name: 'Monthly', assignee: 'General', dueDate: '2026-01-05', priority: 'In Stock', status: 'Draft' },
    { id: 'r7', name: 'Acme Corp', assignee: 'Metro Manila', dueDate: '2026-02-22', priority: 'Enabled', status: 'Active' },
    { id: 'r8', name: 'Sample Entry', assignee: 'Metro Manila', dueDate: '2026-03-21', priority: 'In Stock', status: 'Completed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Overtime Rules"
      section="Payroll & Workforce"
      icon={<Users size={20}/>}
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
