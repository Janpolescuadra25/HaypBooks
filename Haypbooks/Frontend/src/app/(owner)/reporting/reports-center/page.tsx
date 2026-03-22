'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FileText, Clock, CheckCircle2 } from 'lucide-react'

interface CategoryCard {
  title: string
  href: string
  description: string
}

const CATEGORIES: CategoryCard[] = [
  { title: 'Financial Statements', href: '/reporting/reports-center/financial-statements', description: 'Balance sheet, P&L, cash flows and equity reports.' },
  { title: 'Accountant Reports', href: '/reporting/reports-center/accountant-reports', description: 'Trial balance, general ledger, journals and transaction detail.' },
  { title: 'Banking Reports', href: '/reporting/reports-center/banking-reports', description: 'Bank reconciliation, statements and cash summary.' },
  { title: 'Sales Reports', href: '/reporting/reports-center/sales-reports', description: 'Sales by customer, by item, A/R aging and balance details.' },
  { title: 'Expense Reports', href: '/reporting/reports-center/expense-reports', description: 'Expenses by vendor, A/P aging, vendor balances and PO tracking.' },
  { title: 'Inventory Reports', href: '/reporting/reports-center/inventory-reports', description: 'Inventory valuation, stock status and on-hand quantities.' },
  { title: 'Project Reports', href: '/reporting/reports-center/project-reports', description: 'Project profitability, time tracking and budget vs actual.' },
  { title: 'Payroll Reports', href: '/reporting/reports-center/payroll-reports', description: 'Payroll summary, employee earnings and tax liability.' },
  { title: 'Tax Reports', href: '/reporting/reports-center/tax-reports', description: 'Sales tax summary, VAT return and withholding tax.' },
]

export default function Page() {
  const [refreshTime] = useState(() => new Date().toLocaleTimeString())

  return (
    <div className="p-4 sm:p-6 min-h-full flex flex-col">
      {/* Header */}
      <div className="border-l-4 border-emerald-500 pl-4 mb-8">
        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">
          / REPORTING &amp; ANALYTICS
        </p>
        <h1 className="text-3xl font-black text-emerald-900 tracking-tight">REPORTS CENTER</h1>
        <p className="text-slate-600 mt-1 max-w-2xl">
          Deploy advanced data models and generate high-fidelity financial reports for strategic business intelligence.
        </p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="flex items-start gap-4 p-6 bg-white rounded-xl border border-emerald-100 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">MODULE: REPORTS</p>
              <h3 className="text-lg font-bold text-emerald-900 mb-1">{cat.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{cat.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  REAL-TIME
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  VERIFIED
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-emerald-100 flex flex-wrap justify-between gap-2 text-xs text-slate-400 uppercase tracking-widest">
        <span>SYSTEM STATUS: OPERATIONAL</span>
        <span>DATA REFRESH: {refreshTime}</span>
        <span>REPORTING ENGINE V4.2.0</span>
      </div>
    </div>
  )
}
