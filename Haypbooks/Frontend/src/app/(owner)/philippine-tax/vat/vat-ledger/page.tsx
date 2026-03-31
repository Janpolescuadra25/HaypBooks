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
    { id: 'r1', date: '2026-01-08', description: 'Standard', amount: 16900, account: 'Metro Manila', status: 'In Stock' },
    { id: 'r2', date: '2026-01-26', description: 'Active Item', amount: 33800, account: 'Metro Manila', status: 'Pending' },
    { id: 'r3', date: '2026-03-22', description: 'Main', amount: 16500, account: 'BPI Account', status: 'In Stock' },
    { id: 'r4', date: '2026-03-27', description: 'Default', amount: 46700, account: 'Main', status: 'Medium' },
    { id: 'r5', date: '2026-02-12', description: 'Main', amount: 34900, account: 'Metro Manila', status: 'High' },
    { id: 'r6', date: '2026-01-14', description: 'Primary', amount: 5900, account: 'Default', status: 'Current' },
    { id: 'r7', date: '2026-03-10', description: 'General', amount: 3400, account: 'Primary', status: 'Current' },
    { id: 'r8', date: '2026-03-01', description: 'Default', amount: 20400, account: 'Metro Manila', status: 'Draft' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Vat Ledger"
      section="Philippine Tax"
      icon={<Building size={20}/>}
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