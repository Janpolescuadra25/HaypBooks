'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Budget vs. Actual"
      module="ACCOUNTING"
      breadcrumb="Accounting / Planning / Budget vs. Actual"
      purpose="Budget vs. Actual (BvA) is the performance monitoring report that compares actual financial results to the approved budget for any period. It highlights variances (favorable and unfavorable) by account, department, and P&L category, enabling management to identify where performance is diverging from plan. Variance drill-through lets users investigate the root cause of significant variances at the transaction level."
      components={[
        { name: 'BvA Summary Table', description: 'Account-level comparison: budget amount, actual amount, variance (amount and %), and F/U (favorable/unfavorable) indicator.' },
        { name: 'Variance Highlights', description: 'Top 5 favorable and unfavorable variances prominently displayed with one-click drill-through.' },
        { name: 'Period Selector', description: 'Month-to-date, quarter-to-date, and year-to-date toggle with specific period selection.' },
        { name: 'Department Filter', description: 'Filter BvA by department or cost center to see departmental performance vs. budget.' },
        { name: 'Variance Notes', description: 'Add management commentary to explain significant variances for board or CFO reporting.' },
      ]}
      tabs={['P&L BvA', 'Department BvA', 'Revenue Detail', 'Expense Detail', 'Variance Notes']}
      features={[
        'Period-level and year-to-date BvA views',
        'Favorable/unfavorable variance flagging',
        'Drill-through from BvA variance to transaction level',
        'Department-level BvA filtering',
        'Management commentary on variances',
        'Export BvA report for board packs',
        'Comparison to both original and revised budget',
      ]}
      dataDisplayed={[
        'Budget and actual by account for selected period',
        'Variance amount and variance percentage',
        'Favorable/unfavorable classification',
        'YTD budget, YTD actual, YTD variance',
        'Top variances ranked by materiality',
        'Prior period actual for reference',
      ]}
      userActions={[
        'Select period for BvA comparison',
        'Drill through a variance to transactions',
        'Filter by department or cost center',
        'Add variance commentary notes',
        'Export BvA to Excel or PDF',
        'Toggle between original and revised budget',
      ]}
      relatedPages={[
        { label: 'Budgets', href: '/accounting/planning/budgets' },
        { label: 'Forecasts', href: '/accounting/planning/forecasts' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
        { label: 'Performance', href: '/home/performance' },
      ]}
    />
  )
}

