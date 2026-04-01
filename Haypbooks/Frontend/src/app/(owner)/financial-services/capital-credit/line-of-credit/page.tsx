'use client'

import { useState } from 'react'
import { Wallet, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Active Item', sku: 'Sample Entry', category: 'Annual', price: 29700, qty: 31, status: 'Closed' },
    { id: 'r2', name: 'Acme Corp', sku: 'Sample Entry', category: 'Fixed', price: 46000, qty: 82, status: 'Pending' },
    { id: 'r3', name: 'Metro Manila', sku: 'Default', category: 'Annual', price: 28000, qty: 21, status: 'High' },
    { id: 'r4', name: 'Sample Entry', sku: 'Acme Corp', category: 'Standard', price: 10300, qty: 82, status: 'Filed' },
    { id: 'r5', name: 'Acme Corp', sku: 'Standard', category: 'Annual', price: 300, qty: 71, status: 'Connected' },
    { id: 'r6', name: 'Monthly', sku: 'Main', category: 'Fixed', price: 31300, qty: 39, status: 'Open' },
    { id: 'r7', name: 'BPI Account', sku: 'Sample Entry', category: 'Annual', price: 35900, qty: 52, status: 'High' },
    { id: 'r8', name: 'Q1 2026', sku: 'Metro Manila', category: 'Quarterly', price: 27300, qty: 66, status: 'Medium' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Line Of Credit"
      section="Financial Services"
      icon={<Wallet size={20}/>}
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
