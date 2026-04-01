'use client'

import { useState } from 'react'
import { Shield, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Metro Manila', type: 'Direct', contact: 'Primary', balance: 28100, status: 'Pending' },
    { id: 'r2', name: 'Metro Manila', type: 'Revenue', contact: 'Monthly', balance: 40800, status: 'In Stock' },
    { id: 'r3', name: 'Metro Manila', type: 'Quarterly', contact: 'General', balance: 19500, status: 'Processing' },
    { id: 'r4', name: 'Metro Manila', type: 'Quarterly', contact: 'Active Item', balance: 38700, status: 'Low' },
    { id: 'r5', name: 'Standard', type: 'Variable', contact: 'Default', balance: 800, status: 'Connected' },
    { id: 'r6', name: 'BPI Account', type: 'Revenue', contact: 'Default', balance: 36700, status: 'In Stock' },
    { id: 'r7', name: 'Acme Corp', type: 'Quarterly', contact: 'Primary', balance: 22400, status: 'Low' },
    { id: 'r8', name: 'Metro Manila', type: 'Quarterly', contact: 'Sample Entry', balance: 20600, status: 'Active' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Data Classification"
      section="Compliance"
      icon={<Shield size={20}/>}
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
