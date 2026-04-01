'use client'

import { useState } from 'react'
import { Landmark, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', date: '2026-02-13', description: 'Main', amount: 26500, account: 'Default', status: 'Pending' },
    { id: 'r2', date: '2026-03-25', description: 'Sample Entry', amount: 12900, account: 'Standard', status: 'Enabled' },
    { id: 'r3', date: '2026-02-27', description: 'Active Item', amount: 42700, account: 'Active Item', status: 'Processing' },
    { id: 'r4', date: '2026-02-22', description: 'BPI Account', amount: 7300, account: 'General', status: 'In Stock' },
    { id: 'r5', date: '2026-03-03', description: 'Primary', amount: 38100, account: 'Main', status: 'Paid' },
    { id: 'r6', date: '2026-03-01', description: 'Main', amount: 13500, account: 'Standard', status: 'Completed' },
    { id: 'r7', date: '2026-02-01', description: 'Q1 2026', amount: 17200, account: 'Q1 2026', status: 'Enabled' },
    { id: 'r8', date: '2026-02-17', description: 'Default', amount: 38300, account: 'Active Item', status: 'Filed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Batch Payments"
      section="Banking & Cash"
      icon={<Landmark size={20}/>}
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
