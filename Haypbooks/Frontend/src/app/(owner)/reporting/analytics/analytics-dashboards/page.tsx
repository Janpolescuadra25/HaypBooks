'use client'

import React, { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'

interface DashboardDataPoint {
  month: string
  revenue: number
  expenses: number
  profit: number
  transactions: number
}

const defaultStartDate = new Date(new Date().setMonth(new Date().getMonth() - 5))
const defaultEndDate = new Date()

const generateMockData = (startDate: Date, endDate: Date): DashboardDataPoint[] => {
  const data: DashboardDataPoint[] = []
  const current = new Date(startDate)
  while (current <= endDate) {
    const revenue = Math.round(40000 + Math.random() * 20000)
    const expenses = Math.round(18000 + Math.random() * 12000)
    data.push({
      month: format(current, 'MMM yyyy'),
      revenue,
      expenses,
      profit: revenue - expenses,
      transactions: Math.round(120 + Math.random() * 60),
    })
    current.setMonth(current.getMonth() + 1)
  }
  return data
}

export default function Page() {
  const [startDate, setStartDate] = useState(format(defaultStartDate, 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(defaultEndDate, 'yyyy-MM-dd'))
  const [dashboardData, setDashboardData] = useState<DashboardDataPoint[]>(() => generateMockData(defaultStartDate, defaultEndDate))

  const totals = useMemo(() => ({
    revenue: dashboardData.reduce((sum, item) => sum + item.revenue, 0),
    expenses: dashboardData.reduce((sum, item) => sum + item.expenses, 0),
    profit: dashboardData.reduce((sum, item) => sum + item.profit, 0),
    transactions: dashboardData.reduce((sum, item) => sum + item.transactions, 0),
  }), [dashboardData])

  const handleLoad = () => {
    const from = new Date(startDate)
    const to = new Date(endDate)
    setDashboardData(generateMockData(from, to))
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboards</h1>
          <p className="text-sm text-gray-600 mt-1">Key business metrics and trends for your organization.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="pt-6">
            <button
              type="button"
              onClick={handleLoad}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Load Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Total Revenue</p>
          <p className="mt-3 text-2xl font-bold text-emerald-700">${totals.revenue.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Total Expenses</p>
          <p className="mt-3 text-2xl font-bold text-rose-600">${totals.expenses.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Net Profit</p>
          <p className={`mt-3 text-2xl font-bold ${totals.profit < 0 ? 'text-rose-600' : 'text-sky-700'}`}>
            ${totals.profit.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Total Transactions</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{totals.transactions.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue vs Expenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" />
              <Bar dataKey="expenses" fill="#F43F5E" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Profit Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
