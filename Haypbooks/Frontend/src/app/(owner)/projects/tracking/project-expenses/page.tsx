'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Expenses'
      module='PROJECTS'
      breadcrumb='Projects / Tracking / Project Expenses'
      purpose='Tracks all out-of-pocket and vendor expenses charged to projects, whether billable or non-billable. Integrates with the expense management module to capture receipts, apply markup, and route expenses through approval before billing to the client.'
      components={[
        { name: 'Project Expense Log', description: 'List of all expenses tagged to projects with date, vendor, category, and billable flag' },
        { name: 'Receipt Capture Widget', description: 'Upload or link receipts directly to project expense entries' },
        { name: 'Markup Calculator', description: 'Applies configured markup percentage to billable project expenses' },
        { name: 'Expense Approval Workflow', description: 'Routes expenses through PM and finance approval before billing' },
        { name: 'Expense-to-Bill Integration', description: 'Pushes approved billable expenses into the billing queue' },
      ]}
      tabs={['All Expenses', 'Pending Approval', 'Billable', 'Billed']}
      features={['Receipt attachment per expense', 'Configurable markup percentage by expense category', 'Multi-level approval workflow', 'Automatic billable flag inheritance from project settings', 'Credit card import and reconciliation', 'Expense category budgets and overage alerts', 'Export for reimbursement processing']}
      dataDisplayed={['Expense date and vendor', 'Expense category', 'Amount and currency', 'Billable flag and markup percentage', 'Gross billable amount', 'Approval status', 'Receipt attachment status']}
      userActions={['Add new project expense', 'Attach receipt or invoice', 'Apply markup percentage', 'Submit for approval', 'Approve expense for billing', 'Mark expense as billed', 'Export project expense report']}
      relatedPages={[
        { label: 'Billable Review', href: '/projects/tracking/billable-review' },
        { label: 'Project Billing', href: '/projects/billing/project-billing' },
        { label: 'Expense Reports', href: '/expenses/reports/expense-reports' },
      ]}
    />
  )
}

