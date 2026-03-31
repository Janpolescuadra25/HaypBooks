'use client'

import { useState } from 'react'
import { FolderKanban, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Active Item', assignee: 'Sample Entry', dueDate: '2026-02-11', priority: 'Approved', status: 'Current' },
    { id: 'r2', name: 'BPI Account', assignee: 'Monthly', dueDate: '2026-02-01', priority: 'Paid', status: 'Paid' },
    { id: 'r3', name: 'Acme Corp', assignee: 'Metro Manila', dueDate: '2026-03-20', priority: 'Active', status: 'Enabled' },
    { id: 'r4', name: 'Metro Manila', assignee: 'Acme Corp', dueDate: '2026-01-14', priority: 'Paid', status: 'Approved' },
    { id: 'r5', name: 'Metro Manila', assignee: 'Primary', dueDate: '2026-01-23', priority: 'Open', status: 'Enabled' },
    { id: 'r6', name: 'Primary', assignee: 'Default', dueDate: '2026-02-09', priority: 'Closed', status: 'Enabled' },
    { id: 'r7', name: 'Primary', assignee: 'Q1 2026', dueDate: '2026-01-22', priority: 'Enabled', status: 'Enabled' },
    { id: 'r8', name: 'Standard', assignee: 'BPI Account', dueDate: '2026-02-23', priority: 'Completed', status: 'Pending' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Task Board"
      section="Projects"
      icon={<FolderKanban size={20}/>}
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