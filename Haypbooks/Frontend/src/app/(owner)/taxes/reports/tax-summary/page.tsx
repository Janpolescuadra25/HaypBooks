'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Tax Summary Report"
      module="TAXES"
      breadcrumb="Taxes / Reports / Tax Summary"
      purpose="The Tax Summary Report is the executive-level tax position report — it consolidates all tax obligations and filings for the year-to-date into a single view: total VAT paid and remitted, total EWT withheld and remitted, total corporate income tax paid (quarterly), total compensation withheld and remitted, and effective tax rate. It serves as the tax manager's or CFO's view for monitoring tax compliance status and understanding the company's total tax burden."
      components={[
        { name: 'Tax Payments Summary', description: 'Total tax paid per tax type YTD: VAT, EWT, CIT quarterly, compensation WT.' },
        { name: 'Filing Status Overview', description: 'All tax filings for the year with status (filed, pending).' },
        { name: 'Effective Tax Rate', description: 'Effective tax rate = total income tax / net income before tax. Trend by quarter.' },
        { name: 'Tax vs. Revenue Chart', description: 'Total tax burden as % of revenue by quarter.' },
        { name: 'Tax Risk Summary', description: 'Overdue filings, underpaid taxes, or potential issues identified.' },
      ]}
      tabs={['Tax Payments', 'Filing Status', 'Effective Tax Rate', 'Tax Burden', 'Risk Summary']}
      features={[
        'Consolidated tax summary by type',
        'Effective tax rate computation and trend',
        'All filing status in one place',
        'Tax burden as percentage of revenue',
        'Tax risk and overdue alert summary',
      ]}
      dataDisplayed={[
        'Total tax paid per type YTD',
        'Filing status for all periods',
        'Effective corporate income tax rate',
        'Tax burden by quarter',
        'Risk items identified',
      ]}
      userActions={[
        'View consolidated tax summary',
        'Filter by tax type or period',
        'Export tax summary report',
        'Drill down to filing details',
      ]}
      relatedPages={[
        { label: 'VAT Returns', href: '/taxes/vat/vat-returns' },
        { label: 'EWT', href: '/taxes/withholding-tax/ewt' },
        { label: 'Annual ITR', href: '/taxes/income-tax/annual-itr' },
        { label: 'Tax Compliance Calendar', href: '/philippine-tax/compliance/tax-compliance-calendar' },
      ]}
    />
  )
}

