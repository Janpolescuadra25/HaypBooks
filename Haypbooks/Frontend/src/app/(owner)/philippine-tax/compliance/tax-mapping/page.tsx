'use client'

import { useState } from 'react'
import { Building, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'General', type: 'Direct', contact: 'Default', balance: 36000, status: 'Open' },
    { id: 'r2', name: 'Standard', type: 'Monthly', contact: 'Q1 2026', balance: 44400, status: 'Closed' },
    { id: 'r3', name: 'BPI Account', type: 'Premium', contact: 'Monthly', balance: 32400, status: 'Pending' },
    { id: 'r4', name: 'General', type: 'Direct', contact: 'Q1 2026', balance: 6900, status: 'Low' },
    { id: 'r5', name: 'Active Item', type: 'Monthly', contact: 'Primary', balance: 5600, status: 'Processing' },
    { id: 'r6', name: 'Monthly', type: 'Operating', contact: 'Monthly', balance: 32200, status: 'Medium' },
    { id: 'r7', name: 'Default', type: 'Monthly', contact: 'Acme Corp', balance: 17000, status: 'Active' },
    { id: 'r8', name: 'Q1 2026', type: 'Revenue', contact: 'Metro Manila', balance: 32800, status: 'Filed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Tax Mapping"
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
