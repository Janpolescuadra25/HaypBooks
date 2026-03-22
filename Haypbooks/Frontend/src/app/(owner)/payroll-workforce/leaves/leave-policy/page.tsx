'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Leave Policy"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Leaves / Leave Policy"
      purpose="Leave Policy configures the leave rules for the organization — annual VL/SL entitlement per employment classification, accrual method (upfront vs. monthly accrual), carry-over maximum, monetization rate, leave filing lead time requirements, and special leave types (maternity leave, paternity leave, solo parent leave, VAWC leave, etc.) as required by Philippine labor law. These rules drive automated leave balance calculations and ensure compliance with the Labor Code."
      components={[
        { name: 'Leave Type Library', description: 'All configured leave types: name, code, legal basis (if mandatory), annual entitlement days, and paid/unpaid classification.' },
        { name: 'Entitlement Rules', description: 'Days per employment type (Regular: 15 VL + 15 SL, Probationary: prorated, etc.) and accrual method (upfront or monthly).' },
        { name: 'Carry-Over Rules', description: 'How many unused leave days carry over to next year vs. forfeit vs. monetize.' },
        { name: 'Filing Requirements', description: 'Minimum advance filing notice per leave type (e.g., VL: 5 days notice; SL: file upon return with medical cert).' },
        { name: 'Monetization Settings', description: 'Rate for leave monetization at year-end or upon separation (usually daily equivalent of basic pay).' },
      ]}
      tabs={['Leave Types', 'Entitlement Rules', 'Carry-Over Rules', 'Filing Rules', 'Monetization']}
      features={[
        'Complete leave type configuration',
        'Philippine legal mandatory leave types (ML, PL, SL, VL, VAWC, etc.)',
        'Accrual method: monthly or upfront',
        'Carry-over and forfeiture rules',
        'Leave monetization at year-end',
        'Employee group differentiated entitlements',
      ]}
      dataDisplayed={[
        'All configured leave types',
        'Entitlement days per type per classification',
        'Carry-over and forfeiture rules',
        'Monetization rate',
        'BIR-relevant leave details (maternity pay treatment)',
      ]}
      userActions={[
        'Create or edit a leave type',
        'Set entitlement days per employment classification',
        'Configure accrual method',
        'Set carry-over limit',
        'Configure monetization rate',
        'Enable or disable a leave type',
      ]}
      relatedPages={[
        { label: 'Leave Requests', href: '/payroll-workforce/leaves/leave-requests' },
        { label: 'Leave Balances', href: '/payroll-workforce/leaves/leave-balances' },
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
      ]}
    />
  )
}

