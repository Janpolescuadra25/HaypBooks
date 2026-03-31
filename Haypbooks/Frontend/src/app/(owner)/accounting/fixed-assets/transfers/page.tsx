'use client'

import { useState } from 'react'
import { Calculator, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'General', sku: 'Standard', category: 'Revenue', price: 30800, qty: 44, status: 'Current' },
    { id: 'r2', name: 'Metro Manila', sku: 'Sample Entry', category: 'Premium', price: 15100, qty: 80, status: 'Enabled' },
    { id: 'r3', name: 'Sample Entry', sku: 'Primary', category: 'Standard', price: 3500, qty: 9, status: 'In Stock' },
    { id: 'r4', name: 'Monthly', sku: 'Q1 2026', category: 'Quarterly', price: 13300, qty: 33, status: 'Closed' },
    { id: 'r5', name: 'Primary', sku: 'Main', category: 'Premium', price: 44700, qty: 10, status: 'Open' },
    { id: 'r6', name: 'Active Item', sku: 'Main', category: 'Fixed', price: 29100, qty: 27, status: 'Active' },
    { id: 'r7', name: 'Standard', sku: 'Standard', category: 'Monthly', price: 8300, qty: 79, status: 'Paid' },
    { id: 'r8', name: 'Primary', sku: 'Monthly', category: 'Direct', price: 4400, qty: 6, status: 'Connected' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Transfers"
      section="Accounting"
      icon={<Calculator size={20}/>}
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