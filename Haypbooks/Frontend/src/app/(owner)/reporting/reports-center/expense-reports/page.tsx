'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Expense Reports'
      module='REPORTING'
      breadcrumb='Reporting / Reports Center / Expense Reports'
      purpose='Central hub for all expense-related reporting, including expense summaries by category, vendor analysis, employee expense reimbursement reports, budget-vs-actual for expenses, and policy compliance monitoring. Enables cost control and financial oversight of all company expenditures.'
      components={[
        { name: 'Expense Summary by Category', description: 'Total spend by expense category for any date range' },
        { name: 'Vendor Spend Analysis', description: 'Ranking and breakdown of spending by vendor' },
        { name: 'Employee Expense Report', description: 'Per-employee expense reimbursement detail and history' },
        { name: 'Policy Compliance Checker', description: 'Flags expenses that exceeded policy limits or lacked required receipts' },
        { name: 'Budget vs. Actual for Expenses', description: 'Compares actual expense spending to budgeted amounts by category' },
        { name: 'Recurring Expense Trend', description: 'Tracks recurring expense patterns month over month' },
      ]}
      tabs={['Expense Summary', 'By Vendor', 'By Employee', 'Policy Compliance', 'Budget vs. Actual']}
      features={['Multi-dimension expense analysis (category, vendor, employee)', 'Policy compliance violation flagging', 'Budget vs. actual expense comparison', 'Receipt verification status tracking', 'Expense trend analysis', 'Department and project expense rollup', 'Export for management review']}
      dataDisplayed={['Total expenses by period', 'Top expense categories', 'Top vendors by spend', 'Per-employee reimbursement amount', 'Policy violations count and amount', 'Budget variance by category', 'Month-over-month expense trend']}
      userActions={['View expense summary by category', 'Analyze vendor spend concentration', 'Review employee reimbursement reports', 'Identify policy violations', 'Compare to expense budget', 'Export expense analysis', 'Drill into category or vendor detail']}
      relatedPages={[
        { label: 'Standard Reports', href: '/reporting/standard-reports' },
        { label: 'Financial Statements', href: '/reporting/reports-center/financial-statements' },
        { label: 'Budget vs. Actual', href: '/projects/financials/budget-vs-actual' },
      ]}
    />
  )
}

