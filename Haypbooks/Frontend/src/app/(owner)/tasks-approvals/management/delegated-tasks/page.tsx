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
    { id: 'r1', name: 'Default', assignee: 'Acme Corp', dueDate: '2026-01-08', priority: 'In Stock', status: 'Active' },
    { id: 'r2', name: 'Sample Entry', assignee: 'Active Item', dueDate: '2026-03-18', priority: 'Medium', status: 'Pending' },
    { id: 'r3', name: 'BPI Account', assignee: 'Sample Entry', dueDate: '2026-03-04', priority: 'High', status: 'Processing' },
    { id: 'r4', name: 'Sample Entry', assignee: 'Q1 2026', dueDate: '2026-03-23', priority: 'Filed', status: 'Closed' },
    { id: 'r5', name: 'General', assignee: 'Active Item', dueDate: '2026-02-16', priority: 'High', status: 'Filed' },
    { id: 'r6', name: 'BPI Account', assignee: 'Active Item', dueDate: '2026-03-23', priority: 'Completed', status: 'Paid' },
    { id: 'r7', name: 'Primary', assignee: 'Main', dueDate: '2026-03-07', priority: 'Open', status: 'In Stock' },
    { id: 'r8', name: 'Active Item', assignee: 'Metro Manila', dueDate: '2026-02-03', priority: 'Paid', status: 'Closed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Delegated Tasks"
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
