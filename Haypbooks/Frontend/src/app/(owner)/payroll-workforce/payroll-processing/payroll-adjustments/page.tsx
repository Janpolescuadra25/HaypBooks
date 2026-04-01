'use client'

import { useState } from 'react'
import { Users, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Sample Entry', sku: 'Active Item', category: 'Premium', price: 13700, qty: 74, status: 'Connected' },
    { id: 'r2', name: 'Acme Corp', sku: 'Active Item', category: 'Operating', price: 700, qty: 91, status: 'Current' },
    { id: 'r3', name: 'Acme Corp', sku: 'Default', category: 'Basic', price: 31200, qty: 75, status: 'Draft' },
    { id: 'r4', name: 'Monthly', sku: 'Standard', category: 'Monthly', price: 43600, qty: 94, status: 'Pending' },
    { id: 'r5', name: 'Q1 2026', sku: 'General', category: 'Basic', price: 22800, qty: 25, status: 'Completed' },
    { id: 'r6', name: 'Primary', sku: 'Active Item', category: 'Premium', price: 38000, qty: 4, status: 'In Stock' },
    { id: 'r7', name: 'Default', sku: 'BPI Account', category: 'Premium', price: 34600, qty: 48, status: 'Processing' },
    { id: 'r8', name: 'Default', sku: 'Q1 2026', category: 'Monthly', price: 31300, qty: 19, status: 'High' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Payroll Adjustments"
      section="Payroll & Workforce"
      icon={<Users size={20}/>}
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
