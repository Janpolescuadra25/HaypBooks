'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function AuditTrailTaxCodePage() {
  return (
    <PageDocumentation
      title="Audit Trail by Tax Code"
      module="TAXES"
      breadcrumb="Taxes / Tax Reporting / Audit Trail by Tax Code"
      purpose="Audit Trail by Tax Code provides a transaction-level report organized by tax code, showing every transaction that generated tax within a selected period. Tax auditors and internal reviewers use this report to verify that the correct tax codes were applied to transactions and to trace any tax amount back to its originating source document. The report is formatted to match the structure required by tax authorities for supported audit file submissions."
      components={[
        { name: 'Tax Code Summary Table', description: 'Grouped report by tax code showing total taxable amount, tax collected, and transaction count.' },
        { name: 'Transaction Drill-Down', description: 'Expand any tax code group to see the individual transactions with date, reference, and tax amount.' },
        { name: 'Tax Code Filter', description: 'Dropdown to isolate the report to a single tax code or a custom selection.' },
        { name: 'Date Range Picker', description: 'Period selector for any custom date range or standard period preset.' },
        { name: 'SAF-T Export', description: 'Export the audit trail in Standard Audit File for Tax (SAF-T) format for regulatory submissions.' },
      ]}
      tabs={['Summary by Code', 'Transaction Detail', 'Anomaly Flags']}
      features={[
        'View all transactions grouped and totaled by tax code',
        'Drill down from tax code summary to individual transactions',
        'Identify anomalies such as incorrect tax codes or zero-tax on taxable items',
        'Export in SAF-T format for tax authority audit submissions',
        'Filter by tax code, period, or transaction type',
        'Compare tax code usage across periods',
      ]}
      dataDisplayed={[
        'Tax code and description',
        'Number of transactions per code',
        'Total taxable amount per code',
        'Total tax collected per code',
        'Transaction date, reference, and counterparty',
      ]}
      userActions={[
        'Select tax period for the audit trail',
        'Filter to specific tax codes',
        'Drill down to transaction detail',
        'Export SAF-T audit file',
        'Flag anomalous tax code usage for review',
      ]}
    />
  )
}

