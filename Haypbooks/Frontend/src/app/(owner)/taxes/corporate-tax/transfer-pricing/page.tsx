'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TransferPricingPage() {
  return (
    <PageDocumentation
      title="Transfer Pricing"
      module="TAXES"
      badge="ENT"
      breadcrumb="Taxes / Corporate Tax / Transfer Pricing"
      purpose="Transfer Pricing documents and manages the pricing of intercompany transactions between related entities in different tax jurisdictions, ensuring compliance with the arm's length principle required by OECD guidelines and local tax laws. This module maintains transfer pricing schedules, documents the pricing methodology, and calculates adjustments needed to align intercompany pricing with market rates. Proper documentation reduces the risk of transfer pricing audits and penalties."
      components={[
        { name: 'Intercompany Transaction Register', description: 'Log of all cross-entity transactions subject to transfer pricing rules with amounts and parties.' },
        { name: 'Pricing Method Selector', description: 'Configuration for the transfer pricing method: CUP, Cost Plus, TNMM, Resale Price, or Profit Split.' },
        { name: 'Comparable Data Input', description: 'Fields to enter or link to external comparable transaction data supporting the chosen pricing method.' },
        { name: "Arm's Length Range Calculator", description: "Tool to calculate the acceptable arm's length range and flag any out-of-range intercompany prices." },
        { name: 'Documentation Report Generator', description: 'Generates a transfer pricing documentation report in the format required for the OECD master file.' },
      ]}
      tabs={['Transaction Register', 'Pricing Methods', 'Benchmarking', 'Documentation', 'Adjustments']}
      features={[
        'Register all intercompany transactions by entity pair and type',
        'Select and configure the appropriate transfer pricing method',
        "Input comparable data to support arm's length benchmarking",
        "Calculate arm's length range",
        'Generate OECD master file transfer pricing documentation',
        "Record year-end true-up adjustments to align with arm's length",
      ]}
      dataDisplayed={[
        'Intercompany transaction parties, type, and amount',
        'Selected pricing method and basis',
        'Comparable transaction data and interquartile range',
        "Actual vs. arm's length price variance",
        'Documentation completion status',
      ]}
      userActions={[
        'Add or edit intercompany transaction records',
        'Set transfer pricing method per transaction type',
        'Enter benchmarking comparable data',
        "Calculate arm's length range",
        'Generate transfer pricing documentation report',
      ]}
    />
  )
}

