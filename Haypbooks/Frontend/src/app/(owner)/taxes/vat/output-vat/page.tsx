'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Output VAT"
      module="TAXES"
      breadcrumb="Taxes / VAT / Output VAT"
      purpose="Output VAT tracks all VAT collected from customers on sales invoices and other VATable transactions. Output VAT is a liability — collected on behalf of the BIR and remitted through the monthly 2550M and quarterly 2550Q. This page shows all output VAT transactions, segregated by standard rate (12%), zero-rate (0%), and VAT-exempt. The summary feeds directly into the VAT return computation. It also provides the SLSP (Summary List of Sales) required as an attachment to the quarterly 2550Q."
      components={[
        { name: 'Output VAT Register', description: 'All sales transactions with output VAT: date, customer, invoice reference, gross amount, VAT rate, and VAT amount.' },
        { name: 'VAT Classification', description: 'Breakdown by VAT type: Standard (12%), zero-rated exports, VAT-exempt transactions.' },
        { name: 'SLSP Generator', description: 'Summary List of Sales and Purchases (SLSP) — BIR quarterly attachment for all customers with sales above the threshold.' },
        { name: 'Credit Note VAT Adjustment', description: 'Credit notes reducing output VAT from the current period.' },
      ]}
      tabs={['Output VAT Register', 'By Classification', 'SLSP / RELIEF', 'Credit Note Adjustments']}
      features={[
        'Complete output VAT transaction register',
        'VAT classification breakdown (12%/0%/exempt)',
        'SLSP generation for quarterly BIR attachment',
        'Credit note output VAT adjustment',
        'Output VAT aging and remittance status',
        'Threshold-based customer reporting',
      ]}
      dataDisplayed={[
        'All output VAT by invoice',
        'Total by VAT rate classification',
        'Customers subject to SLSP reporting',
        'Credit note VAT adjustments',
        'Output VAT remitted vs. outstanding',
      ]}
      userActions={[
        'View output VAT for any period',
        'Generate SLSP for quarterly filing',
        'Review credit note VAT adjustments',
        'Export output VAT register',
        'Verify output VAT vs. invoiced amounts',
      ]}
      relatedPages={[
        { label: 'VAT Returns', href: '/taxes/vat/vat-returns' },
        { label: 'Input VAT', href: '/taxes/vat/input-vat' },
        { label: 'Form 2550Q', href: '/philippine-tax/bir-forms/form-2550q' },
        { label: 'Invoices', href: '/sales/billing/invoices' },
      ]}
    />
  )
}

