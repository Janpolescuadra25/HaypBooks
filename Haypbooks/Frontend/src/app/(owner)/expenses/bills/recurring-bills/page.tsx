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
    { id: 'r1', name: 'Standard', assignee: 'General', dueDate: '2026-03-28', priority: 'Draft', status: 'Completed' },
    { id: 'r2', name: 'Metro Manila', assignee: 'Monthly', dueDate: '2026-03-14', priority: 'Low', status: 'Medium' },
    { id: 'r3', name: 'General', assignee: 'Active Item', dueDate: '2026-03-06', priority: 'Open', status: 'In Stock' },
    { id: 'r4', name: 'Metro Manila', assignee: 'Acme Corp', dueDate: '2026-02-17', priority: 'Processing', status: 'In Stock' },
    { id: 'r5', name: 'Acme Corp', assignee: 'Primary', dueDate: '2026-03-23', priority: 'Completed', status: 'Connected' },
    { id: 'r6', name: 'General', assignee: 'Primary', dueDate: '2026-01-24', priority: 'Processing', status: 'High' },
    { id: 'r7', name: 'Primary', assignee: 'General', dueDate: '2026-01-04', priority: 'Enabled', status: 'Open' },
    { id: 'r8', name: 'Primary', assignee: 'Active Item', dueDate: '2026-01-07', priority: 'Pending', status: 'Filed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Recurring Bills"
      section="Expenses"
      icon={<Receipt size={20}/>}
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