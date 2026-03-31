'use client'

import { useState } from 'react'
import { FileText, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
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
    { id: 'r1', name: 'Standard', sku: 'Standard', category: 'Fixed', price: 4100, qty: 6, status: 'Active' },
    { id: 'r2', name: 'Q1 2026', sku: 'Main', category: 'Premium', price: 21700, qty: 51, status: 'Pending' },
    { id: 'r3', name: 'BPI Account', sku: 'Active Item', category: 'Revenue', price: 5000, qty: 33, status: 'Approved' },
    { id: 'r4', name: 'Default', sku: 'Active Item', category: 'Basic', price: 33200, qty: 84, status: 'Filed' },
    { id: 'r5', name: 'Sample Entry', sku: 'BPI Account', category: 'Revenue', price: 19700, qty: 70, status: 'Open' },
    { id: 'r6', name: 'Acme Corp', sku: 'Acme Corp', category: 'Variable', price: 30400, qty: 33, status: 'Open' },
    { id: 'r7', name: 'Acme Corp', sku: 'Standard', category: 'Annual', price: 20800, qty: 77, status: 'Connected' },
    { id: 'r8', name: 'General', sku: 'Main', category: 'Monthly', price: 13400, qty: 68, status: 'Paid' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Transfer Pricing"
      section="Tax"
      icon={<FileText size={20}/>}
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