'use client'

import { useState } from 'react'
import { Landmark, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'General', type: 'Operating', contact: 'General', balance: 47200, status: 'Pending' },
    { id: 'r2', name: 'Sample Entry', type: 'Operating', contact: 'Default', balance: 49000, status: 'Completed' },
    { id: 'r3', name: 'Q1 2026', type: 'Direct', contact: 'Primary', balance: 13100, status: 'Medium' },
    { id: 'r4', name: 'Default', type: 'Quarterly', contact: 'Monthly', balance: 46800, status: 'Low' },
    { id: 'r5', name: 'Q1 2026', type: 'Revenue', contact: 'Primary', balance: 9300, status: 'Connected' },
    { id: 'r6', name: 'Q1 2026', type: 'Quarterly', contact: 'Active Item', balance: 8600, status: 'Current' },
    { id: 'r7', name: 'Primary', type: 'Direct', contact: 'Metro Manila', balance: 33500, status: 'Completed' },
    { id: 'r8', name: 'Main', type: 'Variable', contact: 'General', balance: 5200, status: 'Filed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Vendor Payments"
      section="Banking & Cash"
      icon={<Landmark size={20}/>}
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
