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
    { id: 'r1', name: 'Q1 2026', assignee: 'Q1 2026', dueDate: '2026-01-27', priority: 'Completed', status: 'Enabled' },
    { id: 'r2', name: 'Acme Corp', assignee: 'Monthly', dueDate: '2026-02-04', priority: 'Active', status: 'Closed' },
    { id: 'r3', name: 'Acme Corp', assignee: 'Default', dueDate: '2026-02-20', priority: 'Draft', status: 'High' },
    { id: 'r4', name: 'Main', assignee: 'General', dueDate: '2026-03-16', priority: 'Pending', status: 'Paid' },
    { id: 'r5', name: 'Primary', assignee: 'Q1 2026', dueDate: '2026-02-26', priority: 'Paid', status: 'High' },
    { id: 'r6', name: 'Active Item', assignee: 'Primary', dueDate: '2026-01-26', priority: 'Current', status: 'Active' },
    { id: 'r7', name: 'Q1 2026', assignee: 'Monthly', dueDate: '2026-01-19', priority: 'Filed', status: 'Closed' },
    { id: 'r8', name: 'Monthly', assignee: 'Standard', dueDate: '2026-01-20', priority: 'Enabled', status: 'High' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Schedule"
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
