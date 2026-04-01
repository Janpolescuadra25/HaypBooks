'use client'

import { useState } from 'react'
import { Zap, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import { statusColors } from '@/components/owner/statusColors'

const columns = [
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
    { key: 'account', label: 'Account', type: 'text' },
    { key: 'status', label: 'Status', type: 'status', statusColors }
]

const mockData = [
    { id: 'r1', date: '2026-03-16', description: 'Metro Manila', amount: 44100, account: 'Primary', status: 'Medium' },
    { id: 'r2', date: '2026-01-21', description: 'Q1 2026', amount: 24700, account: 'Acme Corp', status: 'Paid' },
    { id: 'r3', date: '2026-03-10', description: 'Acme Corp', amount: 7200, account: 'Default', status: 'Open' },
    { id: 'r4', date: '2026-02-16', description: 'Default', amount: 500, account: 'Main', status: 'Draft' },
    { id: 'r5', date: '2026-01-26', description: 'Primary', amount: 21600, account: 'Metro Manila', status: 'Low' },
    { id: 'r6', date: '2026-03-14', description: 'Q1 2026', amount: 15700, account: 'BPI Account', status: 'Enabled' },
    { id: 'r7', date: '2026-03-25', description: 'Sample Entry', amount: 2800, account: 'Monthly', status: 'Active' },
    { id: 'r8', date: '2026-03-22', description: 'Active Item', amount: 3900, account: 'Acme Corp', status: 'Open' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Document Recognition"
      section="Automation"
      icon={<Zap size={20}/>}
      columns={columns}
      data={data}
      searchable
      searchableFields={[]}
      summaryCards={[
        { label: 'Total Records', value: 8, icon: <List size={16}/>, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        { label: 'Active', value: 6, icon: <CheckCircle size={16}/>, bg: 'bg-blue-100', iconColor: 'text-blue-600' },
        { label: 'Total Value', value: 'PHP 528,500', icon: <DollarSign size={16}/>, bg: 'bg-amber-100', iconColor: 'text-amber-600' },
        { label: 'This Month', value: 3, icon: <Calendar size={16}/>, bg: 'bg-purple-100', iconColor: 'text-purple-600' },
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
