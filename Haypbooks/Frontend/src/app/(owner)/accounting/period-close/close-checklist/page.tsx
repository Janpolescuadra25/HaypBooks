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
    { id: 'r1', name: 'Main', assignee: 'General', dueDate: '2026-02-23', priority: 'Open', status: 'Paid' },
    { id: 'r2', name: 'Default', assignee: 'Standard', dueDate: '2026-03-24', priority: 'High', status: 'Filed' },
    { id: 'r3', name: 'Q1 2026', assignee: 'Monthly', dueDate: '2026-01-13', priority: 'Approved', status: 'Medium' },
    { id: 'r4', name: 'Default', assignee: 'Acme Corp', dueDate: '2026-02-27', priority: 'High', status: 'Connected' },
    { id: 'r5', name: 'Sample Entry', assignee: 'Monthly', dueDate: '2026-03-06', priority: 'Closed', status: 'Closed' },
    { id: 'r6', name: 'Metro Manila', assignee: 'Active Item', dueDate: '2026-02-27', priority: 'Connected', status: 'Current' },
    { id: 'r7', name: 'General', assignee: 'Main', dueDate: '2026-03-20', priority: 'Draft', status: 'Medium' },
    { id: 'r8', name: 'Metro Manila', assignee: 'Acme Corp', dueDate: '2026-01-09', priority: 'Completed', status: 'Enabled' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Close Checklist"
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