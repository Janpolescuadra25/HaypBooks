'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function ZeroRatedExemptPage() {
  return (
    <PageDocumentation
      title="Zero-Rated & Exempt Sales"
      module="TAXES"
      badge="PH ONLY"
      breadcrumb="Taxes / Sales & Output Tax / Zero-Rated & Exempt"
      purpose="Zero-Rated & Exempt Sales manages the separate recording and reporting of sales transactions that are subject to 0% VAT (zero-rated) or entirely outside the VAT system (exempt), which must be reported separately on the VAT return. Zero-rated sales still allow the seller to claim input VAT credits, while VAT-exempt sales do not. This distinction is critical for accurate VAT return filing and avoiding disallowance of input VAT claims."
      components={[
        { name: 'Zero-Rated Sales Register', description: 'List of all zero-rated sales transactions with customer, invoice, amount, and qualifying basis (export, PEZA, etc.).' },
        { name: 'Exempt Sales Register', description: 'Separate list of VAT-exempt transactions with exemption category and supporting documentation status.' },
        { name: 'Supporting Document Tracker', description: 'Grid showing which zero-rated sales have required supporting export documents (e.g., BOC export declarations).' },
        { name: 'Input VAT Attribution', description: 'Tool to correctly attribute input VAT between zero-rated, exempt, and taxable sales using the direct attribution or pro-rata method.' },
        { name: 'Filing Schedule Rows', description: 'Pre-formatted data rows for Schedule 1 and Schedule 2 of the quarterly VAT return (BIR Form 2550-Q).' },
      ]}
      tabs={['Zero-Rated Sales', 'Exempt Sales', 'Supporting Documents', 'Input VAT Attribution', 'VAT Return Schedules']}
      features={[
        'Separate zero-rated and exempt sales into distinct registers',
        'Track required export documentation for zero-rated sales',
        'Attribute input VAT between zero-rated and exempt activities',
        'Prevent incorrect input VAT claims on exempt sales',
        'Export data for VAT return schedules 1 and 2',
        'Flag zero-rated entries missing supporting documentation',
      ]}
      dataDisplayed={[
        'Customer name and invoice number',
        'Zero-rated or exempt sales amount',
        'Qualifying basis or exemption category',
        'Supporting document reference number',
        'Input VAT attribution percentage',
      ]}
      userActions={[
        'Classify sales as zero-rated or exempt',
        'Upload supporting export documentation',
        'Review input VAT attribution calculation',
        'Export zero-rated/exempt schedule for VAT return',
        'Flag entries with missing documentation',
      ]}
    />
  )
}

