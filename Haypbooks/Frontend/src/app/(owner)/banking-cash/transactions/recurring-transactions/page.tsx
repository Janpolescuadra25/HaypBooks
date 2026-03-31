'use client'

import { useState } from 'react'
import { Landmark, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'General', assignee: 'Acme Corp', dueDate: '2026-03-27', priority: 'Pending', status: 'Pending' },
    { id: 'r2', name: 'Acme Corp', assignee: 'Default', dueDate: '2026-03-05', priority: 'Approved', status: 'Open' },
    { id: 'r3', name: 'Primary', assignee: 'BPI Account', dueDate: '2026-03-24', priority: 'Filed', status: 'Filed' },
    { id: 'r4', name: 'General', assignee: 'General', dueDate: '2026-02-02', priority: 'In Stock', status: 'Open' },
    { id: 'r5', name: 'Monthly', assignee: 'Q1 2026', dueDate: '2026-02-19', priority: 'Completed', status: 'Current' },
    { id: 'r6', name: 'Primary', assignee: 'Metro Manila', dueDate: '2026-01-19', priority: 'Completed', status: 'High' },
    { id: 'r7', name: 'Active Item', assignee: 'General', dueDate: '2026-01-13', priority: 'In Stock', status: 'Completed' },
    { id: 'r8', name: 'Main', assignee: 'Q1 2026', dueDate: '2026-01-24', priority: 'Completed', status: 'Current' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Recurring Transactions"
      section="Banking & Cash"
      icon={<Landmark size={20}/>}
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