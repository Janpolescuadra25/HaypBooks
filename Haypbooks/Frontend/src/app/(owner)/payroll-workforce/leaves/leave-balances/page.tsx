'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Leave Balances"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Leaves / Leave Balances"
      purpose="Leave Balances provides the current and historical leave credit balances for all employees across all leave types. HR administrators see the full organization view; employees see their own balances. The balance is computed from: annual entitlement + carried over from prior year + any special grants - approved leaves taken. Year-end leave balance determines how many days convert to cash (per monetization policy) and how many carry over to the next year."
      components={[
        { name: 'Balance Summary Grid', description: 'Per employee: opening balance, entitlement, taken, balance for each leave type.' },
        { name: 'Leave Ledger per Employee', description: 'Chronological leave transaction history: entitlement credits, leave filings, adjustments.' },
        { name: 'Year-End Computation', description: 'At year-end: compute monetizable days vs. carry-forward days per policy.' },
        { name: 'Balance Adjustment Tool', description: 'HR manual balance adjustment for corrections with reason and authorization.' },
      ]}
      tabs={['Balance Summary', 'Leave Ledger', 'Year-End', 'Adjustments', 'By Department']}
      features={[
        'Real-time leave balance per employee per type',
        'Opening balance + entitlement - taken calculation',
        'Manual balance adjustment with audit trail',
        'Year-end leave monetization and carry-over',
        'Leave balance trend per employee',
        'Export balances for audit or payroll verification',
      ]}
      dataDisplayed={[
        'All employees with leave balances per type',
        'Leave taken YTD per employee',
        'Employees with zero balance (over-utilized leave)',
        'Balances available for year-end conversion',
        'Leave entitlement by employment classification',
      ]}
      userActions={[
        'View leave balance for any employee',
        'Adjust a leave balance with reason',
        'Run year-end leave computation',
        'Export leave balance report',
        'View individual leave ledger',
      ]}
      relatedPages={[
        { label: 'Leave Requests', href: '/payroll-workforce/leaves/leave-requests' },
        { label: 'Leave Policy', href: '/payroll-workforce/leaves/leave-policy' },
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Benefits', href: '/payroll-workforce/compensation/benefits' },
      ]}
    />
  )
}

