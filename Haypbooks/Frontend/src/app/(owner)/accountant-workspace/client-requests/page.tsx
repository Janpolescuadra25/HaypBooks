'use client'

import { useState } from 'react'
import { UserCheck, List, CheckCircle, Calendar, DollarSign, Eye, Edit2, Trash2, Download } from 'lucide-react'
import OwnerPageTemplate from '@/components/owner/OwnerPageTemplate'
import { statusColors } from '@/components/owner/statusColors'

const columns = [
    { key: 'name', label: 'Task', type: 'text', sortable: true },
    { key: 'assignee', label: 'Assignee', type: 'text' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'priority', label: 'Priority', type: 'status', statusColors },
    { key: 'status', label: 'Status', type: 'status', statusColors },
]

const mockData = [
    { id: 'r1', name: 'Review Q1 Financials', assignee: 'John Doe', dueDate: '2026-03-15', priority: 'High', status: 'Open' },
    { id: 'r2', name: 'Prepare Tax Returns', assignee: 'Jane Smith', dueDate: '2026-03-20', priority: 'High', status: 'In Progress' },
    { id: 'r3', name: 'Audit Payroll Records', assignee: 'Bob Wilson', dueDate: '2026-02-28', priority: 'Medium', status: 'Completed' },
    { id: 'r4', name: 'Reconcile Bank Accounts', assignee: 'Alice Brown', dueDate: '2026-03-10', priority: 'Medium', status: 'Active' },
    { id: 'r5', name: 'Update Fixed Assets', assignee: 'Charlie Davis', dueDate: '2026-04-01', priority: 'Low', status: 'Pending' },
    { id: 'r6', name: 'Process Month-End Close', assignee: 'Diana Evans', dueDate: '2026-03-31', priority: 'High', status: 'Open' },
    { id: 'r7', name: 'Review Inventory Valuation', assignee: 'Frank Green', dueDate: '2026-03-25', priority: 'Low', status: 'Active' },
    { id: 'r8', name: 'File VAT Returns', assignee: 'Grace Harris', dueDate: '2026-04-05', priority: 'Medium', status: 'Pending' },
]

export default function Page() {
  const [data] = useState(mockData)

  return (
    <OwnerPageTemplate
      title="Client Requests"
      section="Accountant Workspace"
      icon={<UserCheck size={20}/>}
      columns={columns}
      data={data}
      searchable
      searchableFields={[]}
      summaryCards={[
        {label:'Total Records',value:8,icon:<List size={16}/>,bg:'bg-emerald-100',iconColor:'text-emerald-600'},
        {label:'Active',value:6,icon:<CheckCircle size={16}/>,bg:'bg-blue-100',iconColor:'text-blue-600'},
        {label:'This Month',value:3,icon:<Calendar size={16}/>,bg:'bg-amber-100',iconColor:'text-amber-600'},
      ]}
      bulkActions={[
        {label:'Export Selected',icon:<Download size={13}/>,onClick:(ids)=>{}},
        {label:'Delete Selected',icon:<Trash2 size={13}/>,onClick:(ids)=>{},variant:'danger'},
      ]}
      filters={[
        {key:'date_from',label:'Date Range',type:'date-range'},
      ]}
      showCreate
      createLabel="Create New"
      onCreate={()=>{}}
      showExport
      onRefresh={()=>{}}
      rowMenuItems={(row)=>[
        {label:'View',icon:<Eye size={14}/>,onClick:()=>{}},
        {label:'Edit',icon:<Edit2 size={14}/>,onClick:()=>{}},
        {label:'Delete',icon:<Trash2 size={14}/>,onClick:()=>{},variant:'danger'},
      ]}
    />
  )
}
