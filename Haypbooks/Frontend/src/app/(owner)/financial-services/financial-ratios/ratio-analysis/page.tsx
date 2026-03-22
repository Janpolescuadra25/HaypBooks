'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Ratio Analysis"
      module="FINANCIAL SERVICES"
      breadcrumb="Financial Services / Financial Ratios / Ratio Analysis"
      purpose="Ratio Analysis computes a comprehensive suite of financial ratios from the company's financial statements, organized across four categories: Liquidity Ratios, Profitability Ratios, Leverage/Solvency Ratios, and Efficiency/Activity Ratios. Each ratio shows the calculated value, trend over the past 8 quarters, and benchmark comparison where available. This page serves as the quantitative foundation for financial analysis and lender presentations."
      components={[
        { name: 'Ratio Dashboard', description: 'Cards for each ratio group showing current period values with traffic-light indicators (good/caution/concerning).' },
        { name: 'Ratio Trend Charts', description: 'Line charts showing each ratio over the past 8 quarters for trend analysis.' },
        { name: 'Benchmark Comparison Panel', description: 'Industry averages for key ratios (when available) shown alongside company values.' },
        { name: 'Custom Ratio Builder', description: 'Define custom ratios using any GL account balances for business-specific metrics.' },
        { name: 'Ratio Report', description: 'Exportable one-page ratio analysis summary for management or lender presentations.' },
      ]}
      tabs={['Liquidity', 'Profitability', 'Solvency', 'Efficiency', 'Custom Ratios']}
      features={[
        '25+ pre-calculated standard financial ratios',
        'Quarterly trend analysis for each ratio',
        'Industry benchmark comparison (ENT)',
        'Custom ratio definition capability',
        'Traffic light status indicators per ratio',
        'Exportable ratio analysis report',
        'Calculation formula and interpretation shown per ratio',
      ]}
      dataDisplayed={[
        'Current ratio, quick ratio, cash ratio',
        'Gross margin, operating margin, net margin, EBITDA margin',
        'Debt-to-equity, debt-to-assets, interest coverage',
        'Inventory turnover, receivables turnover, payables turnover',
        'Return on assets (ROA), return on equity (ROE)',
        '8-quarter trend for each ratio',
      ]}
      userActions={[
        'View ratios for different financial periods',
        'Compare ratio to industry benchmark',
        'Create a custom ratio using GL accounts',
        'Add ratio interpretation notes',
        'Export ratio analysis report to PDF/Excel',
        'Share ratio report link',
      ]}
      relatedPages={[
        { label: 'Business Health', href: '/home/business-health' },
        { label: 'Performance', href: '/home/performance' },
        { label: 'Balance Sheet', href: '/reporting/reports-center/financial-statements/balance-sheet' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
        { label: 'Cash Flow Report', href: '/reporting/reports-center/financial-statements/cash-flow-statement' },
      ]}
    />
  )
}

