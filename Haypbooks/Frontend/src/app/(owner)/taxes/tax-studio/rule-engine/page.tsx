'use client'

import { useState } from 'react'
import { FileText, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Primary', assignee: 'Sample Entry', dueDate: '2026-03-26', priority: 'Paid', status: 'Open' },
    { id: 'r2', name: 'General', assignee: 'Default', dueDate: '2026-02-12', priority: 'Approved', status: 'Low' },
    { id: 'r3', name: 'General', assignee: 'Primary', dueDate: '2026-01-24', priority: 'Current', status: 'Medium' },
    { id: 'r4', name: 'Acme Corp', assignee: 'Standard', dueDate: '2026-01-27', priority: 'In Stock', status: 'Connected' },
    { id: 'r5', name: 'Standard', assignee: 'Default', dueDate: '2026-02-26', priority: 'Approved', status: 'Closed' },
    { id: 'r6', name: 'Acme Corp', assignee: 'BPI Account', dueDate: '2026-01-22', priority: 'Approved', status: 'Open' },
    { id: 'r7', name: 'Metro Manila', assignee: 'General', dueDate: '2026-02-15', priority: 'Pending', status: 'Draft' },
    { id: 'r8', name: 'BPI Account', assignee: 'Sample Entry', dueDate: '2026-02-22', priority: 'Draft', status: 'Connected' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Rule Engine"
      section="Tax"
      icon={<FileText size={20}/>}
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