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
    { id: 'r1', name: 'BPI Account', sku: 'Main', category: 'Monthly', price: 31300, qty: 52, status: 'Draft' },
    { id: 'r2', name: 'Acme Corp', sku: 'Primary', category: 'Quarterly', price: 12600, qty: 45, status: 'Paid' },
    { id: 'r3', name: 'Standard', sku: 'BPI Account', category: 'Quarterly', price: 45600, qty: 96, status: 'Low' },
    { id: 'r4', name: 'BPI Account', sku: 'Q1 2026', category: 'Basic', price: 36800, qty: 76, status: 'High' },
    { id: 'r5', name: 'Active Item', sku: 'Main', category: 'Premium', price: 6400, qty: 70, status: 'Draft' },
    { id: 'r6', name: 'Main', sku: 'Acme Corp', category: 'Annual', price: 40200, qty: 79, status: 'Closed' },
    { id: 'r7', name: 'Metro Manila', sku: 'Acme Corp', category: 'Annual', price: 20200, qty: 60, status: 'Medium' },
    { id: 'r8', name: 'BPI Account', sku: 'Standard', category: 'Operating', price: 46800, qty: 65, status: 'Current' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Units Of Measure"
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
