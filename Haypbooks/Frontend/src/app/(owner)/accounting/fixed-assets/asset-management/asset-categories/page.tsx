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
    { id: 'r1', name: 'Q1 2026', sku: 'Main', category: 'Direct', price: 29200, qty: 22, status: 'In Stock' },
    { id: 'r2', name: 'Acme Corp', sku: 'Monthly', category: 'Revenue', price: 48400, qty: 18, status: 'Active' },
    { id: 'r3', name: 'Active Item', sku: 'Metro Manila', category: 'Premium', price: 35800, qty: 33, status: 'Filed' },
    { id: 'r4', name: 'Metro Manila', sku: 'Acme Corp', category: 'Operating', price: 36800, qty: 39, status: 'High' },
    { id: 'r5', name: 'General', sku: 'Primary', category: 'Annual', price: 38700, qty: 12, status: 'Draft' },
    { id: 'r6', name: 'Q1 2026', sku: 'Q1 2026', category: 'Variable', price: 20200, qty: 85, status: 'Low' },
    { id: 'r7', name: 'Primary', sku: 'Standard', category: 'Monthly', price: 23900, qty: 71, status: 'Enabled' },
    { id: 'r8', name: 'Active Item', sku: 'Acme Corp', category: 'Annual', price: 34800, qty: 7, status: 'Paid' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Asset Categories"
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