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
    { id: 'r1', name: 'Active Item', assignee: 'Sample Entry', dueDate: '2026-02-25', priority: 'Connected', status: 'Connected' },
    { id: 'r2', name: 'General', assignee: 'Active Item', dueDate: '2026-01-04', priority: 'Completed', status: 'Open' },
    { id: 'r3', name: 'Acme Corp', assignee: 'Standard', dueDate: '2026-03-18', priority: 'Active', status: 'Approved' },
    { id: 'r4', name: 'General', assignee: 'Q1 2026', dueDate: '2026-01-27', priority: 'Closed', status: 'Connected' },
    { id: 'r5', name: 'Main', assignee: 'Primary', dueDate: '2026-01-16', priority: 'High', status: 'Closed' },
    { id: 'r6', name: 'Active Item', assignee: 'Monthly', dueDate: '2026-02-11', priority: 'Filed', status: 'Medium' },
    { id: 'r7', name: 'Primary', assignee: 'Q1 2026', dueDate: '2026-01-18', priority: 'Open', status: 'Completed' },
    { id: 'r8', name: 'Active Item', assignee: 'Standard', dueDate: '2026-03-16', priority: 'Enabled', status: 'In Stock' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Payroll Calendar"
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
