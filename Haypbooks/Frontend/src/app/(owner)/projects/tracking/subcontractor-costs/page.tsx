'use client'

import { useState } from 'react'
import { FolderKanban, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Default', type: 'Operating', contact: 'Sample Entry', balance: 49300, status: 'Approved' },
    { id: 'r2', name: 'Main', type: 'Operating', contact: 'Sample Entry', balance: 18700, status: 'Filed' },
    { id: 'r3', name: 'Primary', type: 'Basic', contact: 'Q1 2026', balance: 17800, status: 'Approved' },
    { id: 'r4', name: 'Sample Entry', type: 'Revenue', contact: 'General', balance: 4400, status: 'Completed' },
    { id: 'r5', name: 'Metro Manila', type: 'Revenue', contact: 'Sample Entry', balance: 9500, status: 'Closed' },
    { id: 'r6', name: 'Standard', type: 'Premium', contact: 'Sample Entry', balance: 37600, status: 'Current' },
    { id: 'r7', name: 'Acme Corp', type: 'Revenue', contact: 'General', balance: 3700, status: 'Pending' },
    { id: 'r8', name: 'Acme Corp', type: 'Monthly', contact: 'Monthly', balance: 16100, status: 'Approved' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Subcontractor Costs"
      section="Projects"
      icon={<FolderKanban size={20}/>}
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
