'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Tax Deadlines"
      module="TAXES"
      breadcrumb="Taxes / Tax Calendar / Tax Deadlines"
      purpose="Tax Deadlines provides a focused list view of all upcoming tax filing and payment deadlines across all tax types — VAT, EWT, income tax, compensation withholding tax, and local taxes. Unlike the Philippine Tax Compliance Calendar which includes government agency contributions and local government fees, the Tax Deadlines page focuses specifically on BIR obligations. Users can quickly see what is due in the next 30/60/90 days and plan their tax preparation work accordingly."
      components={[
        { name: 'Upcoming Deadlines List', description: 'All BIR-related deadlines sorted by date: form, tax type, period covered, deadline, days remaining, and status.' },
        { name: 'Due-This-Month Panel', description: 'Quick panel: everything due in the current month with urgency flags (past due, due in <7 days, on track).' },
        { name: 'Annual Tax Calendar Grid', description: 'Month-by-month grid showing which forms are due each month across VAT, EWT, income tax, and compensation WT.' },
        { name: 'Filing Status Integration', description: 'Directly link to associated form generators from each deadline line.' },
      ]}
      tabs={['Upcoming Deadlines', 'This Month', 'Annual Grid', 'Filing Status']}
      features={[
        'Focused BIR tax deadline calendar',
        'Days remaining countdown per deadline',
        'Direct link to form generators',
        'Annual deadline grid view',
        'Past due alerts',
        'Integration with compliance calendar',
      ]}
      dataDisplayed={[
        'All BIR deadlines by form and period',
        'Days remaining per deadline',
        'Filing status (filed/pending/overdue)',
        'Annual grid of deadlines',
      ]}
      userActions={[
        'View upcoming tax deadlines',
        'Navigate to form generator from deadline',
        'View full year tax deadline calendar',
        'Export deadline list',
      ]}
      relatedPages={[
        { label: 'Tax Compliance Calendar', href: '/philippine-tax/compliance/tax-compliance-calendar' },
        { label: 'VAT Returns', href: '/taxes/vat/vat-returns' },
        { label: 'EWT', href: '/taxes/withholding-tax/ewt' },
        { label: 'Quarterly ITR', href: '/taxes/income-tax/quarterly-itr' },
      ]}
    />
  )
}

