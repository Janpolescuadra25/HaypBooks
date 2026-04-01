'use client'

import { useState } from 'react'
import { Landmark, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Q1 2026', sku: 'Main', category: 'Operating', price: 18000, qty: 31, status: 'Pending' },
    { id: 'r2', name: 'BPI Account', sku: 'General', category: 'Basic', price: 2900, qty: 15, status: 'Current' },
    { id: 'r3', name: 'Primary', sku: 'Primary', category: 'Revenue', price: 41900, qty: 15, status: 'Approved' },
    { id: 'r4', name: 'Q1 2026', sku: 'Acme Corp', category: 'Annual', price: 49700, qty: 34, status: 'Paid' },
    { id: 'r5', name: 'Sample Entry', sku: 'Active Item', category: 'Operating', price: 29500, qty: 59, status: 'Processing' },
    { id: 'r6', name: 'Standard', sku: 'Monthly', category: 'Fixed', price: 3600, qty: 73, status: 'Connected' },
    { id: 'r7', name: 'General', sku: 'Main', category: 'Premium', price: 25700, qty: 92, status: 'In Stock' },
    { id: 'r8', name: 'Default', sku: 'Metro Manila', category: 'Variable', price: 47300, qty: 57, status: 'Low' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Intercompany Transfers"
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
