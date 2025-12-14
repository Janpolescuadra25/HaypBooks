"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import Amount from '@/components/Amount'

type Expense = {
  id: string
  vendor: string
  amount: number
  category: string
  date: string
}

type ExpenseSummary = {
  total: number
  count: number
  recent: Expense[]
}

export default function ExpensesWidget() {
  const [summary, setSummary] = useState<ExpenseSummary>({
    total: 0,
    count: 0,
    recent: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        type ExpensesApiResponse = { summary?: ExpenseSummary }
        const data = await api<ExpensesApiResponse>('/api/dashboard/expenses')
        setSummary(data?.summary || summary)
      } catch (err) {
        console.error('Failed to load expenses', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded h-32" />
  }

  return (
    <div className="glass-card !shadow-none border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Expenses</h3>
        <Link href="/expenses/new" className="btn-primary btn-xs">
          + New expense
        </Link>
      </div>
      
      <div className="mb-4 p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white">
        <p className="text-sm opacity-90 mb-1">This Month</p>
        <p className="text-3xl font-bold">
          <Amount value={summary.total} />
        </p>
        <p className="text-sm opacity-90 mt-1">{summary.count} transaction{summary.count !== 1 ? 's' : ''}</p>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-slate-500 uppercase">Recent Expenses</h4>
        {summary.recent.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No recent expenses</p>
        ) : (
          summary.recent.slice(0, 5).map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{expense.vendor}</p>
                <p className="text-xs text-slate-500">{expense.category}</p>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-semibold text-slate-900">
                  <Amount value={expense.amount} />
                </p>
                <p className="text-xs text-slate-500">{expense.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3 text-sm">
        <Link href="/expenses" className="text-sky-600 hover:text-sky-700 font-medium">
          View all expenses
        </Link>
        <Link href="/bills" className="text-sky-600 hover:text-sky-700 font-medium">
          Bills
        </Link>
      </div>
    </div>
  )
}
