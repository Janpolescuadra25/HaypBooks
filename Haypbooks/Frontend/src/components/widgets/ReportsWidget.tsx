"use client"
import Link from 'next/link'
import type { Route } from 'next'

type ReportLink = {
  title: string
  description: string
  href: Route
  category: 'sales' | 'expenses' | 'accounting'
}

const reports: ReportLink[] = [
  {
    title: 'Sales by Customer',
    description: 'Revenue breakdown by customer',
    href: '/reports/sales-by-customer-summary',
    category: 'sales'
  },
  {
    title: 'Expense Breakdown',
    description: 'Expenses by category and vendor',
    href: '/reports/expenses-by-vendor-summary',
    category: 'expenses'
  },
  {
    title: 'A/R Aging Summary',
    description: 'Outstanding invoices by age',
    href: '/reports/ar-aging',
    category: 'accounting'
  },
  {
    title: 'A/P Aging Summary',
    description: 'Outstanding bills by age',
    href: '/reports/ap-aging',
    category: 'accounting'
  },
  {
    title: 'Profit & Loss',
    description: 'Income statement',
    href: '/reports/profit-loss',
    category: 'accounting'
  },
  {
    title: 'Balance Sheet',
    description: 'Assets, liabilities, and equity',
    href: '/reports/balance-sheet',
    category: 'accounting'
  },
  {
    title: 'Cash Flow',
    description: 'Cash inflows and outflows',
    href: '/reports/cash-flow',
    category: 'accounting'
  },
  {
    title: 'General Ledger',
    description: 'Complete transaction history',
    href: '/reports/general-ledger',
    category: 'accounting'
  }
]

export default function ReportsWidget() {
  const categoryColor = (category: string) => {
    switch (category) {
      case 'sales':
        return 'bg-sky-100 text-sky-700'
      case 'expenses':
        return 'bg-purple-100 text-purple-700'
      case 'accounting':
        return 'bg-slate-100 text-slate-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Reports & Insights</h3>
        <Link href="/reports" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          View all
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {reports.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 hover:border-sky-300 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-slate-900 text-sm group-hover:text-sky-700 transition-colors">
                {report.title}
              </h4>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoryColor(report.category)}`}>
                {report.category}
              </span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">{report.description}</p>
          </Link>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <Link href="/reports/custom" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          Create custom report →
        </Link>
      </div>
    </div>
  )
}
