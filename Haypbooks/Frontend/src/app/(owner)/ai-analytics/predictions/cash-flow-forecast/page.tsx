'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cash Flow Forecast"
      module="AI & ANALYTICS"
      breadcrumb="AI & Analytics / Predictions / Cash Flow Forecast"
      purpose="Cash Flow Forecast uses AI and historical financial data to predict the company's future cash position by week and by month for the next 12 months. The model combines: (1) confirmed inflows — outstanding invoices by due date weighted by payment probability, recurring income; (2) confirmed outflows — outstanding bills, payroll, loan amortizations, tax obligations; (3) predicted items — based on historical patterns (seasonal revenue, recurring expenses). The forecast helps the business proactively identify cash shortfall periods and plan financing requirements in advance."
      components={[
        { name: 'Cash Position Chart', description: 'Line chart: projected cash balance by week/month for the next 12 months with confidence bands.' },
        { name: 'Inflow Forecast', description: 'All expected inflows: outstanding AR by due date + payment probability, recurring contracts, expected new sales.' },
        { name: 'Outflow Forecast', description: 'All expected outflows: outstanding AP by due date, payroll schedule, tax payment dates, loan payments.' },
        { name: 'Scenario Analysis', description: 'Best case / base case / worst case scenarios with adjustable assumptions.' },
        { name: 'Shortfall Alerts', description: 'Periods where projected cash balance falls below the minimum threshold — alerts to take action.' },
      ]}
      tabs={['Cash Position Overview', 'Inflow Forecast', 'Outflow Forecast', 'Scenarios', 'Shortfall Alerts']}
      features={[
        'AI-powered 12-month cash flow forecast',
        'Separate inflow and outflow prediction',
        'AR payment probability weighting',
        'Known scheduled payments: tax, payroll, loans',
        'Scenario builder (best/base/worst case)',
        'Cash shortfall early warning',
        'Forecast vs. actual comparison (rolling update)',
      ]}
      dataDisplayed={[
        'Projected cash balance by week/month',
        'Major expected inflows and timing',
        'Major expected outflows and timing',
        'Shortfall periods with estimated gap',
        'AI prediction confidence by period',
      ]}
      userActions={[
        'View 12-month cash flow forecast',
        'Adjust inflow and outflow assumptions',
        'Run best/worst case scenarios',
        'Identify cash shortfall periods',
        'Export cash flow forecast',
        'Compare forecast vs. actual as time passes',
      ]}
      relatedPages={[
        { label: 'Insights Dashboard', href: '/ai-analytics/insights/insights-dashboard' },
        { label: 'Revenue Predictions', href: '/ai-analytics/predictions/revenue-predictions' },
        { label: 'Cash Flow Statement', href: '/reporting/reports-center/financial-statements/cash-flow-statement' },
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
      ]}
    />
  )
}

