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
    { id: 'r1', name: 'Main', type: 'Revenue', contact: 'BPI Account', balance: 16500, status: 'Pending' },
    { id: 'r2', name: 'General', type: 'Direct', contact: 'Q1 2026', balance: 7300, status: 'Enabled' },
    { id: 'r3', name: 'Standard', type: 'Revenue', contact: 'BPI Account', balance: 6700, status: 'Open' },
    { id: 'r4', name: 'Monthly', type: 'Quarterly', contact: 'Metro Manila', balance: 4900, status: 'Low' },
    { id: 'r5', name: 'BPI Account', type: 'Annual', contact: 'Q1 2026', balance: 17800, status: 'Filed' },
    { id: 'r6', name: 'Monthly', type: 'Standard', contact: 'Monthly', balance: 30500, status: 'Current' },
    { id: 'r7', name: 'Metro Manila', type: 'Revenue', contact: 'Active Item', balance: 44600, status: 'Draft' },
    { id: 'r8', name: 'Monthly', type: 'Revenue', contact: 'Main', balance: 39600, status: 'High' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Undeposited Funds"
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
