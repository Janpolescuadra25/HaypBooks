'use client'

import { useState } from 'react'
import { Receipt, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Q1 2026', assignee: 'BPI Account', dueDate: '2026-01-06', priority: 'Pending', status: 'Closed' },
    { id: 'r2', name: 'General', assignee: 'Sample Entry', dueDate: '2026-02-01', priority: 'Active', status: 'In Stock' },
    { id: 'r3', name: 'Metro Manila', assignee: 'Standard', dueDate: '2026-01-16', priority: 'Connected', status: 'Medium' },
    { id: 'r4', name: 'Primary', assignee: 'General', dueDate: '2026-02-08', priority: 'Pending', status: 'High' },
    { id: 'r5', name: 'Standard', assignee: 'BPI Account', dueDate: '2026-03-03', priority: 'Draft', status: 'In Stock' },
    { id: 'r6', name: 'Standard', assignee: 'Standard', dueDate: '2026-01-07', priority: 'Paid', status: 'Connected' },
    { id: 'r7', name: 'Sample Entry', assignee: 'Metro Manila', dueDate: '2026-03-18', priority: 'Closed', status: 'Approved' },
    { id: 'r8', name: 'Metro Manila', assignee: 'Monthly', dueDate: '2026-03-13', priority: 'Open', status: 'Current' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Approval Workflows"
      section="Expenses"
      icon={<Receipt size={20}/>}
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
