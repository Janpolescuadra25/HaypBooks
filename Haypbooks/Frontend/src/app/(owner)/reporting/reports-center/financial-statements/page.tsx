'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Financial Statements'
      module='REPORTING'
      breadcrumb='Reporting / Reports Center / Financial Statements'
      purpose='Generates the core set of GAAP/IFRS financial statements: Income Statement (P&L), Balance Sheet, Cash Flow Statement, and Statement of Retained Earnings. Supports period-over-period comparison, multi-entity consolidation, and export in audit-ready formats.'
      components={[
        { name: 'Income Statement Generator', description: 'Produces profit and loss statement for any date range with revenue, expenses, and net income breakdown' },
        { name: 'Balance Sheet Builder', description: 'Generates balance sheet showing assets, liabilities, and equity at a point in time' },
        { name: 'Cash Flow Statement', description: 'Indirect or direct method cash flow statement with operating, investing, and financing sections' },
        { name: 'Statement of Retained Earnings', description: 'Shows opening equity, net income, dividends, and closing equity' },
        { name: 'Comparative Period Selector', description: 'Select up to 5 comparison periods for side-by-side display' },
        { name: 'Presentation Formatter', description: 'Controls grouping, subtotals, and line-item presentation for each statement' },
      ]}
      tabs={['Income Statement', 'Balance Sheet', 'Cash Flow', 'Retained Earnings', 'Comparative']}
      features={['GAAP and IFRS-compliant statement formats', 'Indirect and direct cash flow methods', 'Multi-period comparative view', 'Multi-entity consolidation with eliminations', 'Custom presentation with grouping controls', 'Export to PDF, Excel, and XBRL', 'Audit trail for every number']}
      dataDisplayed={['Revenue by category and total', 'Cost of goods sold and gross profit', 'Operating expenses and EBIT', 'Net income and EPS', 'Total assets, liabilities, and equity', 'Operating, investing, and financing cash flows', 'Period-over-period variances']}
      userActions={['Generate income statement', 'Generate balance sheet', 'Generate cash flow statement', 'Select comparison periods', 'Consolidate multi-entity financials', 'Export in PDF or Excel', 'Drill into any line item']}
      relatedPages={[
        { label: 'Standard Reports', href: '/reporting/standard-reports' },
        { label: 'Performance Center', href: '/reporting/performance-center' },
        { label: 'Custom Reports', href: '/reporting/custom-reports' },
      ]}
    />
  )
}

