'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/api-client'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'

type PaymentRow = {
  id: string
  paymentNumber: string
  customer: string
  date: string
  method: string
  amount: string
  appliedTo: string
  status: 'Completed' | 'Pending' | 'Failed' | 'Reversed'
}

export default function CustomerPaymentsPage() {
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get(`/companies/${companyId}/payments`)
      setItems(Array.isArray(data) ? data : data?.items || data?.records || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchData() }, [fetchData])
  const [search, setSearch] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [methodFilter, setMethodFilter] = useState('All')
  const [helpOpen, setHelpOpen] = useState(false)

  // Data fetched from API (see fetchData above)

  const filtered = useMemo(() => {
    let list = items

    if (dateStart) list = list.filter((row) => row.date >= dateStart)
    if (dateEnd) list = list.filter((row) => row.date <= dateEnd)
    if (methodFilter !== 'All') list = list.filter((row) => row.method === methodFilter)

    if (!search) return list

    const q = search.toLowerCase()
    return list.filter((row) =>
      row.paymentNumber.toLowerCase().includes(q) ||
      row.customer.toLowerCase().includes(q) ||
      row.method.toLowerCase().includes(q) ||
      row.amount.toLowerCase().includes(q) ||
      row.appliedTo.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
    )
  }, [items, search, dateStart, dateEnd, methodFilter])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Payments</h1>
            <p className="text-sm text-slate-500 mt-1">Record and manage customer payments</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">New Payment</button>
            <button
              onClick={() => setHelpOpen((cur) => !cur)}
              type="button"
              aria-label="Open documentation for Customer Payments"
              className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-lg font-bold"
            >
              ?
            </button>
          </div>
        </div>

        <div className="px-6 pb-4 grid gap-3 sm:grid-cols-4">
          <input
            title="Search payments"
            placeholder="Search by payment, customer, method, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Start date"
          />
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="End date"
          />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            aria-label="Filter by payment method"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </select>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3">Payment #</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Applied To</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={20} className="px-4 py-10 text-center">
                    <p className="text-rose-500 font-medium">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-sm text-emerald-600 hover:underline">Try again</button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No payments found.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.paymentNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{row.date}</td>
                    <td className="px-4 py-3 text-slate-600">{row.method}</td>
                    <td className="px-4 py-3 text-slate-600">{row.amount}</td>
                    <td className="px-4 py-3 text-slate-600">{row.appliedTo}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${
                      row.status === 'Completed' ? 'text-emerald-700' :
                      row.status === 'Pending' ? 'text-amber-700' :
                      row.status === 'Failed' ? 'text-rose-700' :
                      'text-slate-600'
                    }`}>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">Customer Payments Documentation</h2>
              <button onClick={() => setHelpOpen(false)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">✕</button>
            </div>
            <div className="p-4 text-sm text-slate-700 space-y-3">
              <p>Record and track incoming customer payments with flexible methods.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create payments manually and apply to outstanding invoices.</li>
                <li>Filter and report by date ranges and payment methods.</li>
                <li>Monitor status from pending to completed, plus failed/reversed flows.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
