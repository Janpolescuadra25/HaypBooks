'use client'

import { useState } from 'react'
import { FolderKanban, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', date: '2026-02-11', description: 'Metro Manila', amount: 47700, account: 'Metro Manila', status: 'Enabled' },
    { id: 'r2', date: '2026-01-13', description: 'Standard', amount: 5400, account: 'Sample Entry', status: 'Closed' },
    { id: 'r3', date: '2026-01-26', description: 'Monthly', amount: 34500, account: 'BPI Account', status: 'High' },
    { id: 'r4', date: '2026-03-27', description: 'General', amount: 27000, account: 'Sample Entry', status: 'Paid' },
    { id: 'r5', date: '2026-02-10', description: 'Q1 2026', amount: 45300, account: 'Main', status: 'High' },
    { id: 'r6', date: '2026-03-18', description: 'Acme Corp', amount: 44700, account: 'Active Item', status: 'Active' },
    { id: 'r7', date: '2026-02-13', description: 'BPI Account', amount: 33400, account: 'Monthly', status: 'Closed' },
    { id: 'r8', date: '2026-02-15', description: 'Metro Manila', amount: 35300, account: 'Active Item', status: 'High' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Capacity Planning"
      section="Projects"
      icon={<FolderKanban size={20}/>}
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
