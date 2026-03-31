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
    { id: 'r1', name: 'Main', assignee: 'Primary', dueDate: '2026-02-26', priority: 'Low', status: 'In Stock' },
    { id: 'r2', name: 'Sample Entry', assignee: 'Default', dueDate: '2026-03-22', priority: 'Approved', status: 'In Stock' },
    { id: 'r3', name: 'Main', assignee: 'Monthly', dueDate: '2026-02-10', priority: 'Processing', status: 'Current' },
    { id: 'r4', name: 'Standard', assignee: 'Main', dueDate: '2026-03-01', priority: 'Completed', status: 'Draft' },
    { id: 'r5', name: 'Sample Entry', assignee: 'Acme Corp', dueDate: '2026-01-22', priority: 'Paid', status: 'Low' },
    { id: 'r6', name: 'Q1 2026', assignee: 'BPI Account', dueDate: '2026-01-21', priority: 'Closed', status: 'Active' },
    { id: 'r7', name: 'Monthly', assignee: 'Monthly', dueDate: '2026-01-28', priority: 'Approved', status: 'Open' },
    { id: 'r8', name: 'Standard', assignee: 'Metro Manila', dueDate: '2026-02-09', priority: 'Enabled', status: 'Pending' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Compliance Alerts"
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