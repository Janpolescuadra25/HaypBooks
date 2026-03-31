'use client'

import { useState } from 'react'
import { Calculator, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', date: '2026-02-22', description: 'Metro Manila', amount: 29200, account: 'Metro Manila', status: 'In Stock' },
    { id: 'r2', date: '2026-01-14', description: 'Sample Entry', amount: 48400, account: 'Metro Manila', status: 'Active' },
    { id: 'r3', date: '2026-03-06', description: 'Default', amount: 35800, account: 'BPI Account', status: 'Filed' },
    { id: 'r4', date: '2026-01-05', description: 'Metro Manila', amount: 36800, account: 'Q1 2026', status: 'High' },
    { id: 'r5', date: '2026-03-17', description: 'Monthly', amount: 38700, account: 'Acme Corp', status: 'Draft' },
    { id: 'r6', date: '2026-02-11', description: 'Active Item', amount: 20200, account: 'Default', status: 'Low' },
    { id: 'r7', date: '2026-02-16', description: 'BPI Account', amount: 23900, account: 'Active Item', status: 'Enabled' },
    { id: 'r8', date: '2026-03-04', description: 'Monthly', amount: 34800, account: 'Sample Entry', status: 'Paid' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="New Asset"
      section="Accounting"
      icon={<Calculator size={20}/>}
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