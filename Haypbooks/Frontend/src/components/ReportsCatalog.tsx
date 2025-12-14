"use client"
import Link from 'next/link'
import type { Route } from 'next'

function getSavedHubPeriod(): { preset?: string; start?: string; end?: string } | null {
  try {
    return JSON.parse(localStorage.getItem('reportsHubPeriod') || 'null') as { preset?: string; start?: string; end?: string } | null
  } catch { return null }
}
import { useEffect, useMemo, useState } from 'react'

function getSavedPeriodLabel(): string | null {
  try {
    const saved = JSON.parse(localStorage.getItem('reportsHubPeriod') || 'null') as { preset?: string; start?: string; end?: string } | null
    if (!saved || !saved.preset) return null
    if (saved.preset === 'Custom') {
      return saved.start && saved.end ? `Custom: ${saved.start} → ${saved.end}` : 'Custom'
    }
    return saved.preset
  } catch { return null }
}

type Item = { title: string; slug: string; desc?: string }
type Category = { name: string; items: Item[] }

// Map certain standard report slugs to existing implemented routes
const implementedRoutes: Record<string, string> = {
  'profit-and-loss': '/reports/profit-loss',
  'profit-and-loss-comparison': '/reports/profit-loss?compare=1',
  'profit-and-loss-by-month': '/reports/profit-loss-by-month',
  'quarterly-profit-and-loss-summary': '/reports/profit-loss-by-quarter',
  'balance-sheet': '/reports/balance-sheet',
  'cash-flow': '/reports/cash-flow',
  'trial-balance': '/reports/trial-balance',
  'ar-aging-summary': '/reports/ar-aging',
  'ap-aging-summary': '/reports/ap-aging',
  'ap-aging-detail': '/reports/ap-aging-detail',
  'ar-aging-detail': '/reports/ar-aging-detail',
  'open-invoices': '/reports/open-invoices',
  'account-ledger': '/reports/account-ledger',
  'retained-earnings': '/reports/retained-earnings',
  'general-ledger-list': '/reports/general-ledger-list',
  'closing-date': '/reports/closing-date',
  'account-list': '/reports/account-list',
  'journal': '/reports/journal',
  'transaction-detail-by-account': '/reports/transaction-detail-by-account',
  'adjusted-trial-balance': '/reports/adjusted-trial-balance',
  'invalid-journal-transactions': '/reports/invalid-journal-transactions',
  'transaction-list-with-splits': '/reports/transaction-list-with-splits',
  'transaction-report': '/reports/transaction-report',
  'transaction-list-by-date': '/reports/transaction-list-by-date',
  'invoice-list-by-date': '/reports/invoice-list-by-date',
  'sales-by-customer-summary': '/reports/sales-by-customer-summary',
  'sales-by-product-detail': '/reports/sales-by-product-detail',
  'sales-by-product-summary': '/reports/sales-by-product-summary',
  'transactions-by-customer': '/reports/transactions-by-customer',
  'transactions-by-vendor': '/reports/transactions-by-vendor',
  'purchases-by-vendor-detail': '/reports/purchases-by-vendor-detail',
  'purchases-by-product-detail': '/reports/purchases-by-product-detail',
  'purchases-by-product-summary': '/reports/purchases-by-product-summary',
  'check-detail': '/reports/check-detail',
  'open-po-detail': '/reports/open-po-detail',
  'open-po-list-by-vendor': '/reports/open-po-list-by-vendor',
  'unpaid-bills': '/reports/unpaid-bills',
  'vendor-balance-detail': '/reports/vendor-balance-detail',
  'vendor-balance-summary': '/reports/vendor-balance-summary',
  'customer-balance-summary': '/reports/customer-balance-summary',
  'customer-balance-detail': '/reports/customer-balance-detail',
  'collections-report': '/reports/collections-report',
  'collections-overview': '/reports/collections-overview',
  'invoices-and-received-payments': '/reports/invoices-and-received-payments',
  'bill-payment-list': '/reports/bill-payment-list',
  'vendor-contact-list': '/reports/vendor-contact-list',
  'vendor-phone-list': '/reports/vendor-phone-list',
  '1099-contractor-balance-detail-us': '/reports/1099-contractor-balance-detail-us',
  '1099-contractor-balance-summary-us': '/reports/1099-contractor-balance-summary-us',
  '1099-transaction-detail-us': '/reports/1099-transaction-detail-us',
  'income-by-customer-summary': '/reports/income-by-customer-summary',
  'expenses-by-vendor-summary': '/reports/expenses-by-vendor-summary',
  'purchase-list': '/reports/purchase-list',
  'customer-contact-list': '/reports/customer-contact-list',
  'customer-phone-list': '/reports/customer-phone-list',
  'employee-contact-list': '/reports/employee-contact-list',
  'employee-phone-list': '/reports/employee-phone-list',
  'payment-method-list': '/reports/payment-method-list',
  'product-service-list': '/reports/product-service-list',
  'terms-list': '/reports/terms-list',
  'deposit-detail': '/reports/deposit-detail',
  'statement-list': '/reports/statement-list',
  'unbilled-charges': '/reports/unbilled-charges',
  'tax-liability': '/reports/tax-liability',
  'tax-summary': '/reports/tax-summary',
  'tax-detail': '/reports/tax-detail',
  'budget-vs-actual': '/reports/budget-vs-actual',
  'ratio-analysis': '/reports/ratio-analysis',
  'open-credits-ar': '/reports/open-credits?type=ar',
  'open-credits-ap': '/reports/open-credits?type=ap',
}

function toHref(slug: string): string {
  return implementedRoutes[slug] || `/reports/standard/${slug}`
}

// Build a report href that merges:
// - existing query in base route (e.g., compare=1)
// - saved hub period (period/start/end)
// - deterministic back reference from=/reports
function buildReportHref(slug: string): string {
  const base = toHref(slug)
  // Use URL to safely merge params even if base already has a query
  const u = new URL(base, 'https://app.local')
  const params = u.searchParams
  const saved = getSavedHubPeriod()
  if (saved?.preset) {
    params.set('period', saved.preset)
    if (saved.preset === 'Custom') {
      if (saved.start) params.set('start', saved.start)
      if (saved.end) params.set('end', saved.end)
    } else {
      // Clear custom bounds if switching away from Custom
      params.delete('start')
      params.delete('end')
    }
  }
  // Always include deterministic back to the hub
  params.set('from', '/reports')
  const q = params.toString()
  return `${u.pathname}${q ? `?${q}` : ''}`
}

const data: Category[] = [
  {
    name: 'Overview',
    items: [
      { title: 'Profit and loss', slug: 'profit-and-loss' },
      { title: 'Profit and Loss Comparison', slug: 'profit-and-loss-comparison' },
      { title: 'Profit and Loss Detail', slug: 'profit-and-loss-detail' },
      { title: 'Profit and Loss by Month', slug: 'profit-and-loss-by-month' },
      { title: 'Balance sheet', slug: 'balance-sheet' },
      { title: 'Balance Sheet Comparison', slug: 'balance-sheet-comparison' },
      { title: 'Balance Sheet Detail', slug: 'balance-sheet-detail' },
      { title: 'Balance Sheet Summary', slug: 'balance-sheet-summary' },
      { title: 'Statement of Cash Flows', slug: 'cash-flow' },
      { title: 'Business snapshot', slug: 'business-snapshot' },
      { title: 'Custom summary report', slug: 'custom-summary-report' },
      { title: 'Profit and Loss % of Total Income', slug: 'profit-and-loss-percent-of-total-income' },
      { title: 'Profit and Loss by Customer', slug: 'profit-and-loss-by-customer' },
      { title: 'Profit and Loss YTD Comparison', slug: 'profit-and-loss-ytd-comparison' },
      { title: 'Quarterly Profit and Loss Summary', slug: 'quarterly-profit-and-loss-summary' },
      { title: 'Profit and Loss by Tag Group Report', slug: 'profit-and-loss-by-tag-group' },
      { title: 'Audit Log', slug: 'audit-log' },
      { title: 'Budget vs Actual', slug: 'budget-vs-actual' },
      { title: 'Financial Ratio Analysis', slug: 'ratio-analysis' },
    ],
  },
  {
    name: 'Sales and customers',
    items: [
      { title: 'Sales by Customer Detail', slug: 'sales-by-customer-detail' },
      { title: 'Sales by Customer Summary', slug: 'sales-by-customer-summary' },
      { title: 'Sales by Product/Service Detail', slug: 'sales-by-product-detail' },
      { title: 'Sales by Product/Service Summary', slug: 'sales-by-product-summary' },
      { title: 'Transaction List by Customer', slug: 'transactions-by-customer' },
      { title: 'Income by Customer Summary', slug: 'income-by-customer-summary' },
      { title: 'Customer Contact List', slug: 'customer-contact-list' },
      { title: 'Customer Phone List', slug: 'customer-phone-list' },
      { title: 'Deposit Detail', slug: 'deposit-detail' },
      { title: 'Estimates & Progress Invoicing Summary by Customer', slug: 'estimates-progress-invoicing-summary-by-customer' },
      { title: 'Estimates by Customer', slug: 'estimates-by-customer' },
      { title: 'Payment Method List', slug: 'payment-method-list' },
      { title: 'Physical Inventory Worksheet', slug: 'physical-inventory-worksheet' },
      { title: 'Product/Service List', slug: 'product-service-list' },
      { title: 'Sales by Customer Type Detail', slug: 'sales-by-customer-type-detail' },
      { title: 'Time Activities by Customer Detail', slug: 'time-activities-by-customer-detail' },
      { title: 'Transaction List by Tag Group Report', slug: 'transactions-by-tag-group' },
    ],
  },
  {
    name: 'Who owes you',
    items: [
      { title: 'A/R Aging Summary Report', slug: 'ar-aging-summary' },
      { title: 'A/R Aging Detail Report', slug: 'ar-aging-detail' },
  { title: 'Open Credits (Customers)', slug: 'open-credits-ar' },
      { title: 'Open Invoices', slug: 'open-invoices' },
      { title: 'Customer Balance Detail', slug: 'customer-balance-detail' },
      { title: 'Customer Balance Summary', slug: 'customer-balance-summary' },
      { title: 'Collections Report', slug: 'collections-report' },
      { title: 'Invoice List by Date', slug: 'invoice-list-by-date' },
      { title: 'Invoices and Received Payments', slug: 'invoices-and-received-payments' },
      { title: 'Terms List', slug: 'terms-list' },
      { title: 'Unbilled Charges', slug: 'unbilled-charges' },
      { title: 'Unbilled Time', slug: 'unbilled-time' },
      { title: 'Statement List Report', slug: 'statement-list' },
    ],
  },
  {
    name: 'What you owe',
    items: [
      { title: 'A/P Aging Summary Report', slug: 'ap-aging-summary' },
      { title: 'A/P Aging Detail Report', slug: 'ap-aging-detail' },
  { title: 'Open Credits (Vendors)', slug: 'open-credits-ap' },
      { title: 'Unpaid Bills', slug: 'unpaid-bills' },
      { title: 'Vendor Balance Detail', slug: 'vendor-balance-detail' },
      { title: 'Vendor Balance Summary', slug: 'vendor-balance-summary' },
      { title: 'Bill Payment List', slug: 'bill-payment-list' },
  { title: '1099 Contractor Balance Detail', slug: '1099-contractor-balance-detail-us' },
  { title: '1099 Contractor Balance Summary', slug: '1099-contractor-balance-summary-us' },
    ],
  },
  {
    name: 'Expenses and vendors',
    items: [
      { title: 'Purchases by Vendor Detail', slug: 'purchases-by-vendor-detail' },
      { title: 'Transaction List by Vendor', slug: 'transactions-by-vendor' },
      { title: 'Open Purchase Order Detail', slug: 'open-po-detail' },
      { title: 'Open Purchase Order List by Vendor', slug: 'open-po-list-by-vendor' },
      { title: 'Check Detail Report', slug: 'check-detail' },
      { title: 'Expenses by Vendor Summary', slug: 'expenses-by-vendor-summary' },
      { title: 'Purchase List', slug: 'purchase-list' },
      { title: 'Purchases by Product/Service Detail', slug: 'purchases-by-product-detail' },
  { title: 'Purchases by Product/Service Summary', slug: 'purchases-by-product-summary' },
      { title: 'Vendor Contact List', slug: 'vendor-contact-list' },
      { title: 'Vendor Phone List', slug: 'vendor-phone-list' },
  { title: '1099 Transaction Detail Report', slug: '1099-transaction-detail-us' },
    ],
  },
  {
    name: 'Payroll',
    items: [
      { title: 'Employee Contact List', slug: 'employee-contact-list' },
      { title: 'Payroll Reports', slug: 'payroll-reports' },
      { title: 'Recent Edited Time Activities', slug: 'recent-edited-time-activities' },
      { title: 'Time Activities by Employee Detail', slug: 'time-activities-by-employee-detail' },
    ],
  },
  {
    name: 'Employees',
    items: [
      { title: 'Employee Contact List', slug: 'employee-contact-list' },
      { title: 'Recent Edited Time Activities', slug: 'recent-edited-time-activities' },
      { title: 'Time Activities by Employee Detail', slug: 'time-activities-by-employee-detail' },
    ],
  },
  {
    name: 'Sales tax / VAT/GST',
    items: [
      { title: 'Tax Summary', slug: 'tax-summary' },
      { title: 'Tax Detail', slug: 'tax-detail' },
      { title: 'Tax Liability', slug: 'tax-liability' },
    ],
  },
  {
    name: 'For my accountant',
    items: [
      { title: 'Trial Balance', slug: 'trial-balance' },
      { title: 'General Ledger Report', slug: 'account-ledger' },
      { title: 'Account List', slug: 'account-list' },
      { title: 'Adjusted Trial Balance', slug: 'adjusted-trial-balance' },
      { title: 'Transaction Detail by Account', slug: 'transaction-detail-by-account' },
      { title: 'Statement of Cash Flows', slug: 'cash-flow' },
      { title: 'Retained Earnings', slug: 'retained-earnings' },
      { title: 'Closing Date', slug: 'closing-date' },
      { title: 'General Ledger List', slug: 'general-ledger-list' },
      { title: 'Invalid Journal Transactions', slug: 'invalid-journal-transactions' },
      { title: 'Journal', slug: 'journal' },
      { title: 'Profit and Loss Comparison', slug: 'profit-and-loss-comparison' },
      { title: 'Profit and Loss by Tag Group Report', slug: 'profit-and-loss-by-tag-group' },
      { title: 'Profit and Loss Report', slug: 'profit-and-loss' },
      { title: 'Reconciliation Reports', slug: 'reconciliation-reports' },
      { title: 'Recurring Template List Report', slug: 'recurring-template-list' },
      { title: 'Transaction List with Splits', slug: 'transaction-list-with-splits' },
      { title: 'Transaction Report', slug: 'transaction-report' },
      { title: 'Transaction List by Date Report', slug: 'transaction-list-by-date' },
    ],
  },
]

export default function ReportsCatalog() {
  const [q, setQ] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [recents, setRecents] = useState<string[]>([])
  // Removed period label display per request
  const [periodLabel, setPeriodLabel] = useState<string | null>(null)

  const index = useMemo(() => {
    const m = new Map<string, Item>()
    data.forEach((c) => c.items.forEach((i) => m.set(i.slug, i)))
    return m
  }, [])

  useEffect(() => {
    try {
      const fav = JSON.parse(localStorage.getItem('reportsFavorites') || '[]') as string[]
      const recent = JSON.parse(localStorage.getItem('reportsRecents') || '[]') as string[]
  setFavorites(Array.isArray(fav) ? fav : [])
  setRecents(Array.isArray(recent) ? recent : [])
  // No longer display period label helper text
    } catch {}
  }, [])

  // Refresh period label when the hub filter changes (storage event from other tabs) or on visibility
  // Removed live updates for period label since it's no longer shown
  useEffect(() => {
    return () => {}
  }, [])

  function toggleFavorite(slug: string) {
    setFavorites((prev) => {
      const has = prev.includes(slug)
      const next = has ? prev.filter((s) => s !== slug) : [slug, ...prev].slice(0, 30)
      try { localStorage.setItem('reportsFavorites', JSON.stringify(next)) } catch {}
      return next
    })
  }

  function recordRecent(slug: string) {
    setRecents((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, 8)
      try { localStorage.setItem('reportsRecents', JSON.stringify(next)) } catch {}
      return next
    })
  }
  function pinFavoriteFirst(slug: string) {
    setFavorites((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)]
      try { localStorage.setItem('reportsFavorites', JSON.stringify(next)) } catch {}
      return next
    })
  }
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return data
    return data
      .map((c) => ({
        name: c.name,
        items: c.items.filter((i) => i.title.toLowerCase().includes(needle)),
      }))
      .filter((c) => c.items.length > 0)
  }, [q])

  const favItems = useMemo(() => favorites.map((s) => index.get(s)).filter(Boolean) as Item[], [favorites, index])
  const recentItems = useMemo(() => recents.map((s) => index.get(s)).filter(Boolean) as Item[], [recents, index])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reports…"
          className="w-full md:w-80 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm"
          aria-label="Search standard reports"
        />
      </div>
  {!q && favItems.length > 0 && (
        <section className="glass-card">
          <h3 className="text-slate-900 font-semibold mb-2">Favorites</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {favItems.map((it) => (
              <div key={it.slug} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <Link
                    href={buildReportHref(it.slug) as Route}
                    onClick={() => recordRecent(it.slug)}
                    className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    aria-label={`Open ${it.title}`}
                  >
                    <span className="truncate">{it.title}</span>
                  </Link>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button className="p-1" title="Pin to top" aria-label={`Pin ${it.title} first`} onClick={() => pinFavoriteFirst(it.slug)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                  <button className="p-1" aria-label={`Unfavorite ${it.title}`} onClick={() => toggleFavorite(it.slug)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
  {!q && recentItems.length > 0 && (
        <section className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-900 font-semibold">Recent</h3>
            <button
              className="text-xs text-slate-500 hover:text-slate-700 underline"
              onClick={() => { setRecents([]); try { localStorage.setItem('reportsRecents', '[]') } catch {} }}
            >Clear</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {recentItems.map((it) => (
              <div key={it.slug} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <Link
                    href={buildReportHref(it.slug) as Route}
                    onClick={() => recordRecent(it.slug)}
                    className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    aria-label={`Open ${it.title}`}
                  >
                    <span className="truncate">{it.title}</span>
                  </Link>
                </div>
                <button className="ml-2" aria-label={`${favorites.includes(it.slug) ? 'Unfavorite' : 'Favorite'} ${it.title}`} onClick={() => toggleFavorite(it.slug)}>
                  {favorites.includes(it.slug) ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="space-y-2">
        {filtered.map((cat) => (
          <section key={cat.name} className="glass-card">
            <h3 className="text-slate-900 font-semibold mb-2">{cat.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {cat.items.map((it) => {
                const isFav = favorites.includes(it.slug)
                return (
                  <div key={it.slug} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <Link
                        href={buildReportHref(it.slug) as Route}
                        onClick={() => recordRecent(it.slug)}
                        className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        aria-label={`Open ${it.title}`}
                      >
                        <span className="truncate">{it.title}</span>
                      </Link>
                    </div>
                    <button className="ml-2" aria-label={`${isFav ? 'Unfavorite' : 'Favorite'} ${it.title}`} onClick={() => toggleFavorite(it.slug)}>
                      {isFav ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="glass-card text-sm text-slate-600">No reports match your search.</div>
        )}
      </div>
    </div>
  )
}
