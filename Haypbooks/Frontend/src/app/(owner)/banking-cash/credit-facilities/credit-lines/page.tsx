'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Credit Lines"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Credit Facilities / Credit Lines"
      purpose="Credit Lines under Banking & Cash provides the operational view of active credit line drawdowns and repayments from the banking perspective — managing the bank account movements associated with each credit facility. While the Financial Services module handles the financial accounting, this page focuses on the treasury operations: tracking available credit, scheduling drawdowns, ensuring accounts are funded when needed, and managing communication with the bank relationship manager."
      components={[
        { name: 'Available Credit Dashboard', description: 'Total credit available vs. utilized displayed per facility with real-time available balance.' },
        { name: 'Drawdown Request Form', description: 'Request a drawdown from a credit line: amount, purpose, target bank account, and requested value date.' },
        { name: 'Drawdown Approval', description: 'Approval workflow for drawdown requests — typically CFO approval required above threshold.' },
        { name: 'Credit Line Schedule', description: 'Upcoming repayment schedule for all active drawdowns with bank reference.' },
        { name: 'Bank Contact Manager', description: 'Contact details for bank relationship manager per credit facility.' },
      ]}
      tabs={['Available Credit', 'Request Drawdown', 'Repayment Schedule', 'Bank Contacts']}
      features={[
        'Real-time available credit per facility',
        'Drawdown request and approval workflow',
        'Automatic repayment scheduling',
        'Bank relationship manager contacts',
        'Credit facility utilization alerts (approaching limit)',
        'Integration with Financial Services loan management',
      ]}
      dataDisplayed={[
        'Credit limit and available balance per facility',
        'Current drawdown amounts and interest accruing',
        'Upcoming repayment dates and amounts',
        'Bank relationship contacts',
        'Credit utilization percentage',
      ]}
      userActions={[
        'View available credit across facilities',
        'Request a credit line drawdown',
        'Approve a drawdown request',
        'Record a repayment',
        'Set utilization alert threshold',
      ]}
      relatedPages={[
        { label: 'Treasury Overview', href: '/banking-cash/treasury/treasury-overview' },
        { label: 'Loan Management', href: '/financial-services/credit-facilities/loan-management' },
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'Vendor Payments', href: '/banking-cash/payments/vendor-payments' },
      ]}
    />
  )
}

