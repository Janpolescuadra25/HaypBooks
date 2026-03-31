'use client'

import { useState } from 'react'
import { Building, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'General', assignee: 'Metro Manila', dueDate: '2026-03-21', priority: 'Open', status: 'Processing' },
    { id: 'r2', name: 'BPI Account', assignee: 'Q1 2026', dueDate: '2026-03-07', priority: 'Draft', status: 'High' },
    { id: 'r3', name: 'Monthly', assignee: 'Primary', dueDate: '2026-01-28', priority: 'Closed', status: 'Approved' },
    { id: 'r4', name: 'Acme Corp', assignee: 'General', dueDate: '2026-03-10', priority: 'In Stock', status: 'Pending' },
    { id: 'r5', name: 'Standard', assignee: 'Monthly', dueDate: '2026-01-14', priority: 'In Stock', status: 'Medium' },
    { id: 'r6', name: 'Default', assignee: 'BPI Account', dueDate: '2026-01-10', priority: 'Active', status: 'Approved' },
    { id: 'r7', name: 'Sample Entry', assignee: 'Metro Manila', dueDate: '2026-02-14', priority: 'High', status: 'Pending' },
    { id: 'r8', name: 'General', assignee: 'Standard', dueDate: '2026-02-04', priority: 'In Stock', status: 'High' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Tax Compliance Calendar"
      section="Philippine Tax"
      icon={<Building size={20}/>}
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