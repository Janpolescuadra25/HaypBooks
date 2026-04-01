'use client'

import { useState } from 'react'
import { Package, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'General', sku: 'Acme Corp', category: 'Operating', price: 10600, qty: 30, status: 'Draft' },
    { id: 'r2', name: 'General', sku: 'Standard', category: 'Annual', price: 17600, qty: 66, status: 'Draft' },
    { id: 'r3', name: 'Standard', sku: 'General', category: 'Direct', price: 46000, qty: 24, status: 'Active' },
    { id: 'r4', name: 'Default', sku: 'Acme Corp', category: 'Premium', price: 40500, qty: 6, status: 'Closed' },
    { id: 'r5', name: 'Metro Manila', sku: 'Monthly', category: 'Operating', price: 10700, qty: 28, status: 'Filed' },
    { id: 'r6', name: 'Default', sku: 'General', category: 'Revenue', price: 20200, qty: 21, status: 'Processing' },
    { id: 'r7', name: 'General', sku: 'Metro Manila', category: 'Standard', price: 16000, qty: 32, status: 'Filed' },
    { id: 'r8', name: 'Acme Corp', sku: 'Active Item', category: 'Standard', price: 42300, qty: 21, status: 'Approved' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Reorder Points"
      section="Inventory"
      icon={<Package size={20}/>}
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
