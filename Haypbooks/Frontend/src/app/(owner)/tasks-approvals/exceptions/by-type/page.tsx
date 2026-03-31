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
    { id: 'r1', name: 'Sample Entry', assignee: 'Main', dueDate: '2026-03-02', priority: 'High', status: 'Medium' },
    { id: 'r2', name: 'BPI Account', assignee: 'Metro Manila', dueDate: '2026-01-03', priority: 'Medium', status: 'Approved' },
    { id: 'r3', name: 'Sample Entry', assignee: 'BPI Account', dueDate: '2026-01-21', priority: 'Processing', status: 'Closed' },
    { id: 'r4', name: 'Primary', assignee: 'Standard', dueDate: '2026-03-04', priority: 'Medium', status: 'Active' },
    { id: 'r5', name: 'Monthly', assignee: 'Sample Entry', dueDate: '2026-02-08', priority: 'Enabled', status: 'Approved' },
    { id: 'r6', name: 'Main', assignee: 'Main', dueDate: '2026-03-13', priority: 'Medium', status: 'Completed' },
    { id: 'r7', name: 'Metro Manila', assignee: 'Standard', dueDate: '2026-02-21', priority: 'Current', status: 'Filed' },
    { id: 'r8', name: 'Acme Corp', assignee: 'Monthly', dueDate: '2026-02-25', priority: 'Current', status: 'Active' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="By Type"
      section="Tasks & Approvals"
      icon={<CheckSquare size={20}/>}
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