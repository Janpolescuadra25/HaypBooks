'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Tax Mapping"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Compliance / Tax Mapping"
      badge="PH ONLY"
      purpose="Tax Mapping configures how each vendor, income type, and transaction type is assigned to the correct BIR tax classification — Alphanumeric Tax Code (ATC) for EWT, VAT classification (VATable, VAT-exempt, zero-rated), and income tax classification. Correct tax mapping ensures that when a bill is entered for a vendor, the right EWT rate is automatically applied, and when sales invoices are created, the correct VAT treatment is used. Tax mapping is the foundation of automated BIR form generation."
      components={[
        { name: 'Vendor Tax Classification', description: 'Per vendor: EWT ATC code, income type, applicable EWT rate, and whether subject to VAT. Auto-populated on bills.' },
        { name: 'Income Type ATC Library', description: 'All BIR ATC codes with description, applicable rate, and tax base coverage (professional fees, rental, goods, etc.).' },
        { name: 'VAT Rate Configuration', description: 'Income and expense accounts mapped to: Standard VAT (12%), Zero-rated (0%), VAT-exempt, or Out-of-scope.' },
        { name: 'Transaction Tax Rules', description: 'Rule-based tax assignment: if vendor category = Professional Services, apply ATC WC000 at 10%.' },
      ]}
      tabs={['Vendor Tax Map', 'ATC Library', 'VAT Mapping', 'Transaction Rules']}
      features={[
        'Vendor-level EWT ATC code assignment',
        'BIR ATC code library with rates',
        'GL account VAT classification',
        'Auto-application of EWT on bill entry',
        'VAT treatment mapping by account and transaction',
        'Tax mapping export for audit review',
      ]}
      dataDisplayed={[
        'All vendors with current tax classification',
        'ATC library with rates',
        'GL accounts with VAT treatment',
        'Transaction rules configured',
        'Vendors with incomplete tax mapping',
      ]}
      userActions={[
        'Assign ATC code to a vendor',
        'Update EWT rate for a vendor',
        'Map GL accounts to VAT treatment',
        'Create transaction-level tax rules',
        'Review vendors with missing tax mapping',
        'Export tax mapping for audit',
      ]}
      relatedPages={[
        { label: 'Form 2307', href: '/philippine-tax/bir-forms/form-2307' },
        { label: 'Form 1601EQ', href: '/philippine-tax/bir-forms/form-1601eq' },
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
        { label: 'Chart of Accounts', href: '/accounting/core-accounting/chart-of-accounts' },
      ]}
    />
  )
}

