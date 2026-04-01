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
    { id: 'r1', name: 'Acme Corp', assignee: 'Active Item', dueDate: '2026-03-07', priority: 'Filed', status: 'Paid' },
    { id: 'r2', name: 'Sample Entry', assignee: 'Primary', dueDate: '2026-03-21', priority: 'In Stock', status: 'Medium' },
    { id: 'r3', name: 'Q1 2026', assignee: 'Main', dueDate: '2026-02-13', priority: 'Completed', status: 'High' },
    { id: 'r4', name: 'BPI Account', assignee: 'Q1 2026', dueDate: '2026-02-25', priority: 'Processing', status: 'Pending' },
    { id: 'r5', name: 'Primary', assignee: 'Main', dueDate: '2026-02-03', priority: 'Current', status: 'Completed' },
    { id: 'r6', name: 'Acme Corp', assignee: 'General', dueDate: '2026-01-11', priority: 'Pending', status: 'Approved' },
    { id: 'r7', name: 'Metro Manila', assignee: 'Active Item', dueDate: '2026-02-22', priority: 'In Stock', status: 'Approved' },
    { id: 'r8', name: 'Q1 2026', assignee: 'General', dueDate: '2026-02-11', priority: 'In Stock', status: 'Active' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Sign Offs"
      section="Accounting"
      icon={<Calculator size={20}/>}
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
