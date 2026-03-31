'use client'

import { useState } from 'react'
import { Network, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Primary', assignee: 'Standard', dueDate: '2026-02-02', priority: 'Enabled', status: 'Draft' },
    { id: 'r2', name: 'BPI Account', assignee: 'Primary', dueDate: '2026-02-05', priority: 'Closed', status: 'Closed' },
    { id: 'r3', name: 'Standard', assignee: 'Primary', dueDate: '2026-02-26', priority: 'Current', status: 'Medium' },
    { id: 'r4', name: 'Main', assignee: 'Standard', dueDate: '2026-01-19', priority: 'Filed', status: 'Filed' },
    { id: 'r5', name: 'BPI Account', assignee: 'Sample Entry', dueDate: '2026-02-02', priority: 'Completed', status: 'Open' },
    { id: 'r6', name: 'Active Item', assignee: 'Q1 2026', dueDate: '2026-03-06', priority: 'Approved', status: 'Low' },
    { id: 'r7', name: 'Monthly', assignee: 'Sample Entry', dueDate: '2026-01-14', priority: 'Medium', status: 'Draft' },
    { id: 'r8', name: 'Monthly', assignee: 'Q1 2026', dueDate: '2026-02-01', priority: 'Pending', status: 'Medium' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Filing Calendar"
      section="Organization"
      icon={<Network size={20}/>}
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