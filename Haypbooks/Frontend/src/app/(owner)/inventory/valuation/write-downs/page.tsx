'use client'

import { useState } from 'react'
import { Package, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', date: '2026-02-15', description: 'Monthly', amount: 2100, account: 'Active Item', status: 'Draft' },
    { id: 'r2', date: '2026-01-18', description: 'Monthly', amount: 7600, account: 'Metro Manila', status: 'Closed' },
    { id: 'r3', date: '2026-02-18', description: 'Primary', amount: 45200, account: 'Active Item', status: 'Medium' },
    { id: 'r4', date: '2026-03-16', description: 'Acme Corp', amount: 33100, account: 'Monthly', status: 'Filed' },
    { id: 'r5', date: '2026-01-02', description: 'Primary', amount: 2100, account: 'Acme Corp', status: 'Open' },
    { id: 'r6', date: '2026-03-11', description: 'Default', amount: 10300, account: 'Q1 2026', status: 'Low' },
    { id: 'r7', date: '2026-02-01', description: 'Metro Manila', amount: 24500, account: 'Default', status: 'Draft' },
    { id: 'r8', date: '2026-02-11', description: 'Primary', amount: 1400, account: 'Acme Corp', status: 'Medium' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Write Downs"
      section="Inventory"
      icon={<Package size={20}/>}
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