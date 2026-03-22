'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxReconciliationPage() {
  return (
    <PageDocumentation
      title="Tax Reconciliation"
      module="TAXES"
      breadcrumb="Taxes / Purchase & Input Tax / Tax Reconciliation"
      purpose="Tax Reconciliation compares the taxes recorded in the general ledger against the amounts reported on filed tax returns to identify and resolve any discrepancies before they become audit findings. This module supports VAT reconciliation (ledger vs. return), withholding tax reconciliation (withheld vs. remitted), and income tax provision vs. actual tax due matches. Regular reconciliation is a key internal control in a compliant tax management process."
      components={[
        { name: 'Reconciliation Summary Table', description: 'Side-by-side comparison of GL tax account balances vs. filed return amounts by tax type.' },
        { name: 'Variance Analyzer', description: 'Drill-down tool showing transaction-level items causing the variance between GL and return.' },
        { name: 'Adjustment Entry Creator', description: 'Quick form to create a correcting journal entry for identified reconciling differences.' },
        { name: 'Period Selector', description: 'Month/quarter picker to run reconciliation for any past or current period.' },
        { name: 'Status Dashboard', description: 'Summary cards showing number of reconciling items, resolved items, and unresolved variances.' },
      ]}
      tabs={['VAT Reconciliation', 'Withholding Reconciliation', 'Income Tax Reconciliation', 'Adjustments']}
      features={[
        'Compare GL tax account balances to filed tax return figures',
        'Identify and classify reconciling differences by cause',
        'Drill into transaction detail causing each variance',
        'Create correcting journal entries for reconciling items',
        'Track resolution status of all identified differences',
        'Generate reconciliation summary report for internal audit',
      ]}
      dataDisplayed={[
        'Tax type and reconciliation period',
        'GL balance vs. return amount per tax category',
        'Reconciling items with amount and description',
        'Variance amount and classification',
        'Resolution status per reconciling item',
      ]}
      userActions={[
        'Run reconciliation for any tax type and period',
        'Drill into variance detail',
        'Create correcting journal entry',
        'Mark reconciling items as resolved',
        'Export reconciliation report',
      ]}
    />
  )
}

