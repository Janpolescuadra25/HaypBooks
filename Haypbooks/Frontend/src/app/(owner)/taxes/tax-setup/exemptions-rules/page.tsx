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
    { id: 'r1', name: 'Main', assignee: 'Primary', dueDate: '2026-01-20', priority: 'Active', status: 'Pending' },
    { id: 'r2', name: 'Metro Manila', assignee: 'BPI Account', dueDate: '2026-02-25', priority: 'Draft', status: 'Closed' },
    { id: 'r3', name: 'Primary', assignee: 'Default', dueDate: '2026-03-13', priority: 'Approved', status: 'In Stock' },
    { id: 'r4', name: 'Active Item', assignee: 'Main', dueDate: '2026-01-08', priority: 'Pending', status: 'Closed' },
    { id: 'r5', name: 'Acme Corp', assignee: 'Metro Manila', dueDate: '2026-03-17', priority: 'Closed', status: 'Open' },
    { id: 'r6', name: 'Primary', assignee: 'BPI Account', dueDate: '2026-01-11', priority: 'Completed', status: 'Processing' },
    { id: 'r7', name: 'Main', assignee: 'Active Item', dueDate: '2026-03-01', priority: 'Processing', status: 'Completed' },
    { id: 'r8', name: 'Active Item', assignee: 'BPI Account', dueDate: '2026-03-16', priority: 'Open', status: 'Closed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Exemptions Rules"
      section="Tax"
      icon={<FileText size={20}/>}
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
