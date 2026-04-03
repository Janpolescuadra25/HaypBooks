'use client'

import { useState } from 'react'
import { Shield, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import { statusColors } from '@/components/owner/statusColors'

const columns = [
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
    { key: 'account', label: 'Account', type: 'text' },
    { key: 'status', label: 'Status', type: 'status', statusColors }
]

const mockData = [
    { id: 'r1', date: '2026-01-07', description: 'Primary', amount: 28100, account: 'Acme Corp', status: 'Completed' },
    { id: 'r2', date: '2026-01-13', description: 'Main', amount: 29400, account: 'Metro Manila', status: 'Filed' },
    { id: 'r3', date: '2026-03-11', description: 'Primary', amount: 10400, account: 'Monthly', status: 'Current' },
    { id: 'r4', date: '2026-03-27', description: 'Standard', amount: 33700, account: 'Default', status: 'Active' },
    { id: 'r5', date: '2026-02-09', description: 'Sample Entry', amount: 44100, account: 'Active Item', status: 'In Stock' },
    { id: 'r6', date: '2026-01-12', description: 'Primary', amount: 22400, account: 'General', status: 'Completed' },
    { id: 'r7', date: '2026-02-02', description: 'Q1 2026', amount: 1600, account: 'Monthly', status: 'Paid' },
    { id: 'r8', date: '2026-02-26', description: 'Primary', amount: 7900, account: 'Active Item', status: 'Open' }
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Audit Log"
      section="Compliance"
      icon={<Shield size={20}/>}
      columns={columns}
      data={[]}
      emptyTitle="Coming soon"
      emptyDescription="Audit Log is under development and will be available soon."
      searchable={false}
      showCreate={false}
      showExport={false}
    />
  )
}
