'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Insurance Policies"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Insurance / Insurance Policies"
      purpose="Insurance Policies manages the inventory of all business insurance policies — property, liability, business interruption, health/life, vehicle, D&O (directors and officers), and professional indemnity. It tracks policy coverage details, premiums, renewal dates, insurer contacts, and claims history. Prepaid premium amortization is handled automatically with journal entries to allocate the cost over the policy period."
      components={[
        { name: 'Policy Registry', description: 'All active insurance policies with type, insurer, policy number, sum insured, annual premium, and renewal date.' },
        { name: 'Premium Amortization Schedule', description: 'Monthly amortization of prepaid premiums with automatic journal entry generation over the policy period.' },
        { name: 'Claims Log', description: 'Record and track insurance claims: date of loss, claim type, claim amount, status, and payout received.' },
        { name: 'Renewal Alerts', description: 'Policies expiring within 30/60/90 days highlighted with renewal notification and broker contact.' },
        { name: 'Coverage Summary', description: 'Total coverage value by insurance category for risk management reporting.' },
      ]}
      tabs={['All Policies', 'By Type', 'Expiring Soon', 'Claims', 'Amortization']}
      features={[
        'Comprehensive insurance policy register',
        'Automated prepaid premium amortization',
        'Insurance claim lifecycle tracking',
        'Renewal calendar with advance alerts',
        'Coverage gap analysis',
        'Integration with GL for prepaid and expense accounts',
      ]}
      dataDisplayed={[
        'Policy name, type, insurer, and policy number',
        'Sum insured and annual premium amount',
        'Policy start date, end date, and renewal date',
        'Prepaid premium balance and monthly expense',
        'Claims filed with amounts and status',
        'Total coverage by category',
      ]}
      userActions={[
        'Add a new insurance policy',
        'Record premium payment',
        'Generate amortization schedule',
        'File a new insurance claim',
        'Update claim status and payout received',
        'Renew or update policy at renewal',
        'Export insurance register for risk review',
      ]}
      relatedPages={[
        { label: 'Fixed Assets', href: '/accounting/fixed-assets/asset-register' },
        { label: 'Prepaid Expenses', href: '/expenses/bills/prepaid-expenses' },
          { label: 'Balance Sheet', href: '/reporting/reports-center/financial-statements/balance-sheet' },
      ]}
    />
  )
}

