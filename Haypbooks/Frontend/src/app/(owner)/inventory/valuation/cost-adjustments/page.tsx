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
    { id: 'r1', name: 'Primary', sku: 'Standard', category: 'Annual', price: 2100, qty: 75, status: 'Draft' },
    { id: 'r2', name: 'BPI Account', sku: 'Primary', category: 'Quarterly', price: 7600, qty: 24, status: 'Closed' },
    { id: 'r3', name: 'Standard', sku: 'Primary', category: 'Fixed', price: 45200, qty: 69, status: 'Medium' },
    { id: 'r4', name: 'Main', sku: 'Standard', category: 'Operating', price: 33100, qty: 47, status: 'Filed' },
    { id: 'r5', name: 'BPI Account', sku: 'Sample Entry', category: 'Variable', price: 2100, qty: 12, status: 'Open' },
    { id: 'r6', name: 'Active Item', sku: 'Q1 2026', category: 'Premium', price: 10300, qty: 38, status: 'Low' },
    { id: 'r7', name: 'Monthly', sku: 'Sample Entry', category: 'Direct', price: 24500, qty: 88, status: 'Draft' },
    { id: 'r8', name: 'Monthly', sku: 'Q1 2026', category: 'Fixed', price: 1400, qty: 10, status: 'Medium' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Cost Adjustments"
      section="Inventory"
      icon={<Package size={20}/>}
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