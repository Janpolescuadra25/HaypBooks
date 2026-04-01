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
    { id: 'r1', name: 'Monthly', type: 'Monthly', contact: 'Sample Entry', balance: 45600, status: 'High' },
    { id: 'r2', name: 'Sample Entry', type: 'Revenue', contact: 'BPI Account', balance: 8300, status: 'High' },
    { id: 'r3', name: 'Active Item', type: 'Annual', contact: 'BPI Account', balance: 40400, status: 'Low' },
    { id: 'r4', name: 'Monthly', type: 'Variable', contact: 'BPI Account', balance: 33200, status: 'Enabled' },
    { id: 'r5', name: 'Acme Corp', type: 'Annual', contact: 'Active Item', balance: 38300, status: 'High' },
    { id: 'r6', name: 'Acme Corp', type: 'Revenue', contact: 'Standard', balance: 9500, status: 'Paid' },
    { id: 'r7', name: 'BPI Account', type: 'Premium', contact: 'BPI Account', balance: 24600, status: 'Enabled' },
    { id: 'r8', name: 'Main', type: 'Standard', contact: 'Default', balance: 2700, status: 'Enabled' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Connected Banks"
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
