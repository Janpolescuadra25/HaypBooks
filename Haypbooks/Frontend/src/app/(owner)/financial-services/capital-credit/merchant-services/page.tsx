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
    { id: 'r1', name: 'Acme Corp', sku: 'Active Item', category: 'Variable', price: 500, qty: 53, status: 'Open' },
    { id: 'r2', name: 'BPI Account', sku: 'Sample Entry', category: 'Fixed', price: 41000, qty: 61, status: 'In Stock' },
    { id: 'r3', name: 'Metro Manila', sku: 'Acme Corp', category: 'Variable', price: 27600, qty: 93, status: 'Enabled' },
    { id: 'r4', name: 'Monthly', sku: 'Q1 2026', category: 'Premium', price: 6600, qty: 52, status: 'Active' },
    { id: 'r5', name: 'Active Item', sku: 'Default', category: 'Direct', price: 45900, qty: 14, status: 'Approved' },
    { id: 'r6', name: 'Q1 2026', sku: 'General', category: 'Basic', price: 1400, qty: 97, status: 'Medium' },
    { id: 'r7', name: 'Standard', sku: 'General', category: 'Direct', price: 40100, qty: 80, status: 'Closed' },
    { id: 'r8', name: 'Standard', sku: 'Sample Entry', category: 'Premium', price: 31900, qty: 11, status: 'Completed' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Merchant Services"
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
