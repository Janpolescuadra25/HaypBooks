'use client'

import { useState } from 'react'
import { Receipt, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Standard', type: 'Basic', contact: 'Main', balance: 48800, status: 'Draft' },
    { id: 'r2', name: 'Acme Corp', type: 'Direct', contact: 'Monthly', balance: 39700, status: 'Connected' },
    { id: 'r3', name: 'General', type: 'Premium', contact: 'General', balance: 35600, status: 'Paid' },
    { id: 'r4', name: 'Metro Manila', type: 'Operating', contact: 'Primary', balance: 10400, status: 'Completed' },
    { id: 'r5', name: 'Primary', type: 'Fixed', contact: 'Standard', balance: 30200, status: 'Pending' },
    { id: 'r6', name: 'Primary', type: 'Premium', contact: 'Main', balance: 7700, status: 'Connected' },
    { id: 'r7', name: 'General', type: 'Fixed', contact: 'Acme Corp', balance: 42400, status: 'Processing' },
    { id: 'r8', name: 'Default', type: 'Fixed', contact: 'General', balance: 7600, status: 'Pending' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Vendor Credit Notes"
      section="Expenses"
      icon={<Receipt size={20}/>}
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
