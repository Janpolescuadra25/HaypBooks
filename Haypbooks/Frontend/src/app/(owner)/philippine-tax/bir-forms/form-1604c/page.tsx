'use client'

import { useState } from 'react'
import { Building, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', date: '2026-02-14', description: 'Active Item', amount: 15300, account: 'General', status: 'Processing' },
    { id: 'r2', date: '2026-01-09', description: 'Default', amount: 17300, account: 'Standard', status: 'Approved' },
    { id: 'r3', date: '2026-02-10', description: 'Default', amount: 48800, account: 'Standard', status: 'Filed' },
    { id: 'r4', date: '2026-03-22', description: 'Primary', amount: 20200, account: 'Default', status: 'Connected' },
    { id: 'r5', date: '2026-03-05', description: 'Q1 2026', amount: 28900, account: 'Metro Manila', status: 'Active' },
    { id: 'r6', date: '2026-03-03', description: 'Active Item', amount: 46900, account: 'Monthly', status: 'Current' },
    { id: 'r7', date: '2026-03-09', description: 'Default', amount: 19000, account: 'Standard', status: 'In Stock' },
    { id: 'r8', date: '2026-03-20', description: 'Sample Entry', amount: 900, account: 'Metro Manila', status: 'In Stock' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Form 1604c"
      section="Philippine Tax"
      icon={<Building size={20}/>}
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
