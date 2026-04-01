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
    { id: 'r1', name: 'Monthly', assignee: 'Q1 2026', dueDate: '2026-03-19', priority: 'Current', status: 'Enabled' },
    { id: 'r2', name: 'BPI Account', assignee: 'Primary', dueDate: '2026-03-18', priority: 'Filed', status: 'Filed' },
    { id: 'r3', name: 'Q1 2026', assignee: 'Acme Corp', dueDate: '2026-03-12', priority: 'High', status: 'Enabled' },
    { id: 'r4', name: 'Active Item', assignee: 'Standard', dueDate: '2026-02-23', priority: 'Closed', status: 'Current' },
    { id: 'r5', name: 'Metro Manila', assignee: 'Sample Entry', dueDate: '2026-01-01', priority: 'Pending', status: 'Active' },
    { id: 'r6', name: 'Sample Entry', assignee: 'Acme Corp', dueDate: '2026-02-22', priority: 'Current', status: 'Pending' },
    { id: 'r7', name: 'Monthly', assignee: 'Primary', dueDate: '2026-02-24', priority: 'High', status: 'High' },
    { id: 'r8', name: 'Standard', assignee: 'Main', dueDate: '2026-01-14', priority: 'Active', status: 'Closed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Revaluation Schedule"
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
