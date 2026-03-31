'use client'

import { useState } from 'react'
import { Network, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Primary', type: 'Annual', contact: 'Monthly', balance: 2100, status: 'Enabled' },
    { id: 'r2', name: 'BPI Account', type: 'Monthly', contact: 'Primary', balance: 21200, status: 'Completed' },
    { id: 'r3', name: 'Metro Manila', type: 'Monthly', contact: 'Standard', balance: 30800, status: 'Processing' },
    { id: 'r4', name: 'Default', type: 'Variable', contact: 'Default', balance: 37600, status: 'Processing' },
    { id: 'r5', name: 'Acme Corp', type: 'Variable', contact: 'Monthly', balance: 22100, status: 'Draft' },
    { id: 'r6', name: 'Sample Entry', type: 'Variable', contact: 'Sample Entry', balance: 5900, status: 'Open' },
    { id: 'r7', name: 'Active Item', type: 'Quarterly', contact: 'Default', balance: 10300, status: 'Approved' },
    { id: 'r8', name: 'General', type: 'Annual', contact: 'Sample Entry', balance: 12500, status: 'Connected' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Consolidation"
      section="Organization"
      icon={<Network size={20}/>}
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