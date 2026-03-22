'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function VatSalesTaxPage() {
  return (
    <PageDocumentation
      title="VAT / Sales Tax"
      module="TAXES"
      breadcrumb="Taxes / Sales & Output Tax / VAT / Sales Tax"
      purpose="VAT / Sales Tax is the central management hub for tracking, calculating, and reporting the value-added tax or sales tax collected on all customer sales. This module summarizes output tax by jurisdiction, provides a period-end VAT position (output less input), and prepares the data needed for periodic VAT or sales tax returns. It supports both destination-based consumption taxes (VAT) and origin-based sales taxes depending on the business's operating jurisdictions."
      components={[
        { name: 'VAT Position Summary', description: 'Net VAT payable or refundable card showing output VAT, input VAT, and net position for the period.' },
        { name: 'Tax Rate Register', description: 'List of enabled VAT / sales tax rates with jurisdiction, rate %, effective date, and status.' },
        { name: 'Sales Tax Report Table', description: 'Breakdown of taxable sales and tax collected per jurisdiction for the reporting period.' },
        { name: 'Exemption Certificate Tracker', description: 'Storage for customer-provided exemption certificates with validity dates.' },
        { name: 'Period-End VAT Computation', description: 'Automated computation of VAT payable or carryforward for each reporting period.' },
      ]}
      tabs={['VAT Position', 'Sales Breakdown', 'Tax Rates', 'Exemptions', 'Returns']}
      features={[
        'View net VAT position (output minus input) per period',
        'Break down taxable sales and tax collected per jurisdiction',
        'Maintain a register of active VAT and sales tax rates',
        'Track customer exemption certificates and validity',
        'Compute period-end VAT payable or refund amount',
        'Export data for periodic VAT or sales tax return filing',
      ]}
      dataDisplayed={[
        'Output VAT total for period',
        'Input VAT credit total for period',
        'Net VAT payable or refundable',
        'Sales amounts by tax rate and jurisdiction',
        'Customer exemption certificates on file',
      ]}
      userActions={[
        'View VAT position for current or past period',
        'Add or update tax rate entries',
        'Upload customer exemption certificate',
        'Run period-end VAT computation',
        'Export VAT return data',
      ]}
    />
  )
}

