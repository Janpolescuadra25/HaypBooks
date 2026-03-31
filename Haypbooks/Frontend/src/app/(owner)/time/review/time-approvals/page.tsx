'use client'

import { useState } from 'react'
import { Clock, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'General', assignee: 'Active Item', dueDate: '2026-03-09', priority: 'Active', status: 'Open' },
    { id: 'r2', name: 'Acme Corp', assignee: 'Default', dueDate: '2026-02-09', priority: 'Open', status: 'Filed' },
    { id: 'r3', name: 'General', assignee: 'General', dueDate: '2026-02-23', priority: 'Approved', status: 'High' },
    { id: 'r4', name: 'Standard', assignee: 'Main', dueDate: '2026-01-25', priority: 'Draft', status: 'Pending' },
    { id: 'r5', name: 'Acme Corp', assignee: 'Acme Corp', dueDate: '2026-02-23', priority: 'Paid', status: 'Completed' },
    { id: 'r6', name: 'Sample Entry', assignee: 'Monthly', dueDate: '2026-02-05', priority: 'Low', status: 'High' },
    { id: 'r7', name: 'Monthly', assignee: 'Main', dueDate: '2026-01-18', priority: 'Approved', status: 'Enabled' },
    { id: 'r8', name: 'Monthly', assignee: 'Main', dueDate: '2026-01-25', priority: 'Paid', status: 'Enabled' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Time Approvals"
      section="Time Tracking"
      icon={<Clock size={20}/>}
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