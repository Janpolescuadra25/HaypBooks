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
    { id: 'r1', name: 'Default', assignee: 'Standard', dueDate: '2026-01-25', priority: 'Current', status: 'Medium' },
    { id: 'r2', name: 'Sample Entry', assignee: 'Active Item', dueDate: '2026-02-14', priority: 'Pending', status: 'Paid' },
    { id: 'r3', name: 'General', assignee: 'Q1 2026', dueDate: '2026-01-04', priority: 'Medium', status: 'Open' },
    { id: 'r4', name: 'Q1 2026', assignee: 'Standard', dueDate: '2026-03-01', priority: 'Enabled', status: 'Draft' },
    { id: 'r5', name: 'BPI Account', assignee: 'General', dueDate: '2026-02-13', priority: 'Open', status: 'Low' },
    { id: 'r6', name: 'General', assignee: 'Monthly', dueDate: '2026-02-09', priority: 'Draft', status: 'Enabled' },
    { id: 'r7', name: 'Default', assignee: 'Default', dueDate: '2026-01-02', priority: 'Connected', status: 'Active' },
    { id: 'r8', name: 'General', assignee: 'Main', dueDate: '2026-03-03', priority: 'Completed', status: 'Open' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Approval Chains"
      section="Automation"
      icon={<Zap size={20}/>}
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