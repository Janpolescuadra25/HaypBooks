'use client'

import { useState } from 'react'
import { Calculator, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'General', type: 'Fixed', contact: 'Sample Entry', balance: 30800, status: 'Filed' },
    { id: 'r2', name: 'Active Item', type: 'Direct', contact: 'Sample Entry', balance: 43300, status: 'Draft' },
    { id: 'r3', name: 'Main', type: 'Variable', contact: 'Sample Entry', balance: 32400, status: 'Paid' },
    { id: 'r4', name: 'Sample Entry', type: 'Revenue', contact: 'Primary', balance: 22000, status: 'Draft' },
    { id: 'r5', name: 'Monthly', type: 'Direct', contact: 'BPI Account', balance: 13400, status: 'In Stock' },
    { id: 'r6', name: 'Main', type: 'Premium', contact: 'Default', balance: 5100, status: 'Open' },
    { id: 'r7', name: 'Active Item', type: 'Standard', contact: 'Standard', balance: 29100, status: 'Closed' },
    { id: 'r8', name: 'Sample Entry', type: 'Fixed', contact: 'Standard', balance: 16900, status: 'Completed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Premium Management"
      section="Accounting"
      icon={<Calculator size={20}/>}
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
