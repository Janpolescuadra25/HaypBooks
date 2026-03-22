'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Account Defaults"
      module="SETTINGS"
      breadcrumb="Settings / Accounting Settings / Account Defaults"
      purpose="Account Defaults sets the default GL accounts used automatically when transactions are created — to prevent users from needing to manually select accounts for every transaction. Common defaults include: default accounts receivable account, default accounts payable account, default bank account for payments, default income account for sales, default retained earnings account, default FX gain/loss accounts, default bad debt expense account, and default rounding account. These defaults flow into invoice, bill, payment, and journal entry creation."
      components={[
        { name: 'AR Default Account', description: 'The default GL account debited when an invoice is created (Accounts Receivable).' },
        { name: 'AP Default Account', description: 'The default GL account credited when a bill is created (Accounts Payable).' },
        { name: 'Default Bank Account', description: 'The default bank/cash account used in payment transactions if not manually overridden.' },
        { name: 'Retained Earnings Account', description: 'GL account for year-end retained earnings close entry.' },
        { name: 'FX Gain/Loss Accounts', description: 'GL accounts for realized and unrealized FX gains and losses.' },
        { name: 'Rounding Account', description: 'GL account for minor rounding differences in calculations.' },
        { name: 'Tax Payable Accounts', description: 'Default GL accounts for VAT Output Payable, Input VAT Receivable, and withholding tax payable.' },
      ]}
      tabs={['AR/AP Defaults', 'Cash & Bank', 'Revenue & Cost', 'Tax Accounts', 'Other Defaults']}
      features={[
        'System-wide GL account default configuration',
        'Prevents missing accounts on transaction creation',
        'Retained earnings and year-end close accounts',
        'FX gain/loss account assignment',
        'Tax payable and creditable account setup',
        'Overridable per transaction or per entity',
      ]}
      dataDisplayed={[
        'All configured default accounts',
        'Account code and name for each default',
        'Last modified and modified by',
        'Accounts with no default configured (gaps)',
      ]}
      userActions={[
        'Set or change default GL accounts',
        'Map tax accounts to GL accounts',
        'Configure retained earnings account',
        'Update FX gain/loss accounts',
        'Verify all required defaults are configured',
      ]}
      relatedPages={[
        { label: 'Chart of Accounts', href: '/accounting/core-accounting/chart-of-accounts' },
        { label: 'Fiscal Year', href: '/settings/company/fiscal-year' },
        { label: 'Currencies', href: '/settings/company/currencies' },
        { label: 'Tax Mapping', href: '/philippine-tax/compliance/tax-mapping' },
      ]}
    />
  )
}

