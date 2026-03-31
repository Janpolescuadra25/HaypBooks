'use client'

import { useState } from 'react'
import { FileText, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', date: '2026-02-02', description: 'Main', amount: 45000, account: 'Main', status: 'Open' },
    { id: 'r2', date: '2026-03-24', description: 'Standard', amount: 19800, account: 'Q1 2026', status: 'Low' },
    { id: 'r3', date: '2026-03-19', description: 'BPI Account', amount: 41400, account: 'Primary', status: 'Medium' },
    { id: 'r4', date: '2026-01-16', description: 'Sample Entry', amount: 47400, account: 'Primary', status: 'Connected' },
    { id: 'r5', date: '2026-02-24', description: 'Primary', amount: 44700, account: 'Q1 2026', status: 'Closed' },
    { id: 'r6', date: '2026-01-08', description: 'Metro Manila', amount: 38000, account: 'Q1 2026', status: 'Open' },
    { id: 'r7', date: '2026-01-26', description: 'Q1 2026', amount: 26700, account: 'Sample Entry', status: 'Draft' },
    { id: 'r8', date: '2026-01-01', description: 'Standard', amount: 38800, account: 'BPI Account', status: 'Connected' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Tax Closing Entries"
      section="Tax"
      icon={<FileText size={20}/>}
      columns={columns}
      data={data}
      searchable
      searchableFields={['name', 'description']}
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