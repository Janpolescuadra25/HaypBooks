'use client'

import { useState } from 'react'
import { Building, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import { statusColors, badgeColors } from '@/components/owner/statusColors'

const columns = [
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'sku', label: 'SKU', type: 'text' },
    { key: 'category', label: 'Category', type: 'badge', badgeColors },
    { key: 'price', label: 'Price', type: 'currency' },
    { key: 'qty', label: 'Quantity', type: 'number' },
    { key: 'status', label: 'Status', type: 'status', statusColors }
]

const mockData = [
    { id: 'r1', name: 'General', sku: 'Metro Manila', category: 'Premium', price: 36000, qty: 19, status: 'Processing' },
    { id: 'r2', name: 'BPI Account', sku: 'Q1 2026', category: 'Premium', price: 12300, qty: 33, status: 'High' },
    { id: 'r3', name: 'Monthly', sku: 'Primary', category: 'Revenue', price: 48400, qty: 24, status: 'Approved' },
    { id: 'r4', name: 'Acme Corp', sku: 'General', category: 'Standard', price: 16500, qty: 59, status: 'Pending' },
    { id: 'r5', name: 'Standard', sku: 'Monthly', category: 'Operating', price: 24600, qty: 64, status: 'Medium' },
    { id: 'r6', name: 'Default', sku: 'BPI Account', category: 'Operating', price: 17000, qty: 3, status: 'Approved' },
    { id: 'r7', name: 'Sample Entry', sku: 'Metro Manila', category: 'Variable', price: 23300, qty: 84, status: 'Pending' },
    { id: 'r8', name: 'General', sku: 'Standard', category: 'Annual', price: 5400, qty: 62, status: 'High' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Community Tax"
      section="Philippine Tax"
      icon={<Building size={20}/>}
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