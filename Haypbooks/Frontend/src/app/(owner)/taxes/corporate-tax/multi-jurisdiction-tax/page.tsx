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
    { id: 'r1', date: '2026-02-16', description: 'Primary', amount: 4100, account: 'Sample Entry', status: 'Active' },
    { id: 'r2', date: '2026-02-22', description: 'Main', amount: 21700, account: 'Standard', status: 'Pending' },
    { id: 'r3', date: '2026-01-20', description: 'Sample Entry', amount: 5000, account: 'BPI Account', status: 'Approved' },
    { id: 'r4', date: '2026-03-21', description: 'General', amount: 33200, account: 'Default', status: 'Filed' },
    { id: 'r5', date: '2026-01-08', description: 'Sample Entry', amount: 19700, account: 'Active Item', status: 'Open' },
    { id: 'r6', date: '2026-01-05', description: 'Active Item', amount: 30400, account: 'BPI Account', status: 'Open' },
    { id: 'r7', date: '2026-01-17', description: 'Monthly', amount: 20800, account: 'Main', status: 'Connected' },
    { id: 'r8', date: '2026-03-23', description: 'BPI Account', amount: 13400, account: 'Active Item', status: 'Paid' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Multi Jurisdiction Tax"
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