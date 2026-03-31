'use client'

import { useState } from 'react'
import { Calculator, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Active Item', assignee: 'Monthly', dueDate: '2026-02-28', priority: 'Filed', status: 'Processing' },
    { id: 'r2', name: 'BPI Account', assignee: 'Standard', dueDate: '2026-01-25', priority: 'Low', status: 'Connected' },
    { id: 'r3', name: 'Active Item', assignee: 'Standard', dueDate: '2026-01-20', priority: 'Active', status: 'Approved' },
    { id: 'r4', name: 'Primary', assignee: 'Q1 2026', dueDate: '2026-01-19', priority: 'Pending', status: 'Filed' },
    { id: 'r5', name: 'Standard', assignee: 'Default', dueDate: '2026-01-20', priority: 'Processing', status: 'Open' },
    { id: 'r6', name: 'BPI Account', assignee: 'Primary', dueDate: '2026-01-23', priority: 'Filed', status: 'Current' },
    { id: 'r7', name: 'Default', assignee: 'Monthly', dueDate: '2026-01-16', priority: 'Low', status: 'Completed' },
    { id: 'r8', name: 'Default', assignee: 'General', dueDate: '2026-03-23', priority: 'Connected', status: 'Active' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Schedules"
      section="Accounting"
      icon={<Calculator size={20}/>}
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