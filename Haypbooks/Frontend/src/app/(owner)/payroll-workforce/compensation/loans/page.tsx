'use client'

import { useState } from 'react'
import { Users, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import { statusColors, badgeColors } from '@/components/owner/statusColors'

const columns = [
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', badgeColors },
    { key: 'contact', label: 'Contact', type: 'text' },
    { key: 'balance', label: 'Balance', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status', statusColors }
]

const mockData = [
    { id: 'r1', name: 'Default', type: 'Fixed', contact: 'Acme Corp', balance: 32900, status: 'Enabled' },
    { id: 'r2', name: 'Q1 2026', type: 'Direct', contact: 'Metro Manila', balance: 13000, status: 'Processing' },
    { id: 'r3', name: 'Sample Entry', type: 'Annual', contact: 'Default', balance: 37200, status: 'Closed' },
    { id: 'r4', name: 'BPI Account', type: 'Variable', contact: 'Acme Corp', balance: 29600, status: 'Processing' },
    { id: 'r5', name: 'Metro Manila', type: 'Direct', contact: 'Active Item', balance: 13600, status: 'Draft' },
    { id: 'r6', name: 'Sample Entry', type: 'Monthly', contact: 'Metro Manila', balance: 34000, status: 'Open' },
    { id: 'r7', name: 'Acme Corp', type: 'Annual', contact: 'Q1 2026', balance: 49100, status: 'Open' },
    { id: 'r8', name: 'BPI Account', type: 'Operating', contact: 'Acme Corp', balance: 27900, status: 'Pending' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Loans"
      section="Payroll & Workforce"
      icon={<Users size={20}/>}
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
