"use client"
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import { api } from '@/lib/api'
import { formatMMDDYYYY } from '@/lib/date'
import Amount from '@/components/Amount'
import StatusBadge from '@/components/StatusBadge'

type Transaction = {
  id: string
  number: string
  customer: string
  customerId: string
  type: 'invoice' | 'receipt' | 'estimate' | 'credit-memo' | 'payment'
  amount: number
  status: 'open' | 'paid' | 'overdue' | 'pending'
  deliveryMethod: 'email' | 'print' | 'none'
  date: string
}

type CustomerBalance = {
  id: string
  name: string
  balance: number
  overdue: number
  lastActivity: string
}

type UnbilledItem = {
  id: string
  customer: string
  customerId: string
  description: string
  amount: number
  date: string
  type: 'time' | 'expense' | 'cost'
}

type MoneyBarTotals = {
  openInvoices: number
  paidInvoices: number
  unbilledItems: number
}

export default function SalesAllPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [customerBalances, setCustomerBalances] = useState<CustomerBalance[]>([])
  const [unbilledItems, setUnbilledItems] = useState<UnbilledItem[]>([])
  const [moneyBar, setMoneyBar] = useState<MoneyBarTotals>({ openInvoices: 0, paidInvoices: 0, unbilledItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'paid' | 'overdue'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'receipt' | 'estimate' | 'credit-memo'>('all')
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'email' | 'print' | 'none'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'ytd' | 'mtd' | 'last30' | 'last60' | 'last12'>('ytd')
  const [customerFilter, setCustomerFilter] = useState<string>('all')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api<{ transactions: Transaction[] }>('/api/sales/transactions').catch(() => ({ transactions: [] })),
      api<{ customers: CustomerBalance[] }>('/api/sales/customer-balances').catch(() => ({ customers: [] })),
      api<{ items: UnbilledItem[] }>('/api/sales/unbilled-items').catch(() => ({ items: [] })),
      api<MoneyBarTotals>('/api/sales/totals').catch(() => ({ openInvoices: 0, paidInvoices: 0, unbilledItems: 0 }))
    ])
      .then(([txRes, custRes, unbilledRes, totalsRes]) => {
        setTransactions(txRes.transactions)
        setCustomerBalances(custRes.customers)
        setUnbilledItems(unbilledRes.items)
        setMoneyBar(totalsRes)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (deliveryFilter !== 'all' && t.deliveryMethod !== deliveryFilter) return false
      if (customerFilter !== 'all' && t.customerId !== customerFilter) return false
      // Date filtering would be applied here based on dateFilter
      return true
    })
  }, [transactions, statusFilter, typeFilter, deliveryFilter, customerFilter])

  const customers = useMemo(() => {
    const uniqueCustomers = new Map<string, string>()
    transactions.forEach(t => uniqueCustomers.set(t.customerId, t.customer))
    return Array.from(uniqueCustomers.entries()).map(([id, name]) => ({ id, name }))
  }, [transactions])

  return (
    <div className="glass-card space-y-6">
      {/* Money Bar */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
            <div className="text-sm font-medium text-emerald-700">Open Invoices</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              <Amount value={moneyBar.openInvoices} />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="text-sm font-medium text-blue-700">Paid Invoices</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              <Amount value={moneyBar.paidInvoices} />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
            <div className="text-sm font-medium text-amber-700">Unbilled Items</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              <Amount value={moneyBar.unbilledItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-slate-700">Status:</label>
            <select 
              id="status-filter"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-sky-400/50 outline-none"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="type-filter" className="text-sm font-medium text-slate-700">Type:</label>
            <select 
              id="type-filter"
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-sky-400/50 outline-none"
            >
              <option value="all">All</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Sales Receipt</option>
              <option value="estimate">Estimate</option>
              <option value="credit-memo">Credit Memo</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="delivery-filter" className="text-sm font-medium text-slate-700">Delivery:</label>
            <select 
              id="delivery-filter"
              value={deliveryFilter} 
              onChange={(e) => setDeliveryFilter(e.target.value as any)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-sky-400/50 outline-none"
            >
              <option value="all">All</option>
              <option value="email">Email</option>
              <option value="print">Print</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="date-filter" className="text-sm font-medium text-slate-700">Period:</label>
            <select 
              id="date-filter"
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-sky-400/50 outline-none"
            >
              <option value="all">All Time</option>
              <option value="ytd">Year to Date</option>
              <option value="mtd">Month to Date</option>
              <option value="last30">Last 30 Days</option>
              <option value="last60">Last 60 Days</option>
              <option value="last12">Last 12 Months</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="customer-filter" className="text-sm font-medium text-slate-700">Customer:</label>
            <select 
              id="customer-filter"
              value={customerFilter} 
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-sky-400/50 outline-none"
            >
              <option value="all">All Customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {(statusFilter !== 'all' || typeFilter !== 'all' || deliveryFilter !== 'all' || customerFilter !== 'all') && (
            <button
              onClick={() => {
                setStatusFilter('all')
                setTypeFilter('all')
                setDeliveryFilter('all')
                setCustomerFilter('all')
              }}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 border-t border-slate-200 pt-6">
        {/* Sales Transactions Table - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Sales Transactions</h2>
              <div className="text-sm text-slate-600">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200">
                  <tr className="text-left">
                    <th className="pb-2 font-medium text-slate-700">Number</th>
                    <th className="pb-2 font-medium text-slate-700">Customer</th>
                    <th className="pb-2 font-medium text-slate-700">Type</th>
                    <th className="pb-2 font-medium text-slate-700 text-right">Amount</th>
                    <th className="pb-2 font-medium text-slate-700">Status</th>
                    <th className="pb-2 font-medium text-slate-700">Delivery</th>
                    <th className="pb-2 font-medium text-slate-700">Date</th>
                    <th className="pb-2 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">Loading transactions...</td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">No transactions found</td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3">
                          <Link href={`/sales/${t.type}s/${t.id}` as Route} className="text-sky-600 hover:underline font-medium">
                            {t.number}
                          </Link>
                        </td>
                        <td className="py-3 text-slate-700">{t.customer}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                            {t.type === 'invoice' ? 'Invoice' : t.type === 'receipt' ? 'Receipt' : t.type === 'estimate' ? 'Estimate' : t.type === 'credit-memo' ? 'Credit Memo' : 'Payment'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-medium"><Amount value={t.amount} /></td>
                        <td className="py-3"><StatusBadge value={t.status} /></td>
                        <td className="py-3 text-slate-600 capitalize">{t.deliveryMethod}</td>
                        <td className="py-3 text-slate-600">{formatMMDDYYYY(t.date)}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/sales/${t.type}s/${t.id}` as Route} className="text-xs text-sky-600 hover:underline">View</Link>
                            <span className="text-slate-300">|</span>
                            <Link href={`/sales/${t.type}s/${t.id}/edit` as Route} className="text-xs text-sky-600 hover:underline">Edit</Link>
                            {t.type === 'invoice' && t.status === 'open' && (
                              <>
                                <span className="text-slate-300">|</span>
                                <button className="text-xs text-sky-600 hover:underline">Pay</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unbilled Items Section */}
          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Unbilled Items</h2>
              <Link href={'/sales/unbilled' as any} className="text-sm text-sky-600 hover:underline">View All</Link>
            </div>

            <div className="space-y-3">
              {unbilledItems.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No unbilled items</p>
              ) : (
                unbilledItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{item.customer}</div>
                      <div className="text-sm text-slate-600">{item.description}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                          {item.type === 'time' ? 'Time Activity' : item.type === 'expense' ? 'Expense' : 'Cost'}
                        </span>
                        <span className="ml-2">{formatMMDDYYYY(item.date)}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-medium text-slate-900"><Amount value={item.amount} /></div>
                      <button className="text-xs text-sky-600 hover:underline mt-1">Create Invoice</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Balances & Reports */}
        <div className="space-y-6">
          {/* Customer Balances */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Customer Balances</h2>
              <Link href="/customers" className="text-sm text-sky-600 hover:underline">View All</Link>
            </div>

            <div className="space-y-3">
              {customerBalances.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No outstanding balances</p>
              ) : (
                customerBalances.slice(0, 8).map((customer) => (
                  <div key={customer.id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/customers/${customer.id}` as Route} className="font-medium text-slate-900 hover:text-sky-600">
                          {customer.name}
                        </Link>
                        <div className="text-xs text-slate-500 mt-1">Last activity: {formatMMDDYYYY(customer.lastActivity)}</div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="font-semibold text-slate-900"><Amount value={customer.balance} /></div>
                        {customer.overdue > 0 && (
                          <div className="text-xs text-red-600 font-medium mt-0.5">
                            <Amount value={customer.overdue} /> overdue
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button className="text-xs text-sky-600 hover:underline">Send Reminder</button>
                      <span className="text-slate-300">|</span>
                      <Link href={`/payments/new?customer=${customer.id}` as Route} className="text-xs text-sky-600 hover:underline">
                        Record Payment
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reports & Insights */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Reports & Insights</h2>
            
            <div className="space-y-2">
              <Link 
                href={'/reports/sales-by-customer' as any} 
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600">👥</span>
                  </div>
                  <span className="font-medium text-slate-900 group-hover:text-sky-600">Sales by Customer</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-600">→</span>
              </Link>

              <Link 
                href={'/reports/sales-by-product' as any} 
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600">📦</span>
                  </div>
                  <span className="font-medium text-slate-900 group-hover:text-sky-600">Sales by Product/Service</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-600">→</span>
              </Link>

              <Link 
                href="/reports/ar-aging" 
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600">📊</span>
                  </div>
                  <span className="font-medium text-slate-900 group-hover:text-sky-600">A/R Aging Summary</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-600">→</span>
              </Link>

              <Link 
                href={'/reports/invoice-list' as any} 
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600">📄</span>
                  </div>
                  <span className="font-medium text-slate-900 group-hover:text-sky-600">Invoice List</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-600">→</span>
              </Link>

              <Link 
                href="/reports" 
                className="flex items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium text-sky-600 hover:text-sky-700 mt-3"
              >
                View All Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
