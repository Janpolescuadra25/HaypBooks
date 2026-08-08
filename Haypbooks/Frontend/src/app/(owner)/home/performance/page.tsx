'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { homeService } from '@/services/home.service'
import { useCompanyId } from '@/hooks/useCompanyId'

const CATEGORY_COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#06B6D4', '#10B981', '#F43F5E']
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function formatAmount(value: number) {
  return currencyFormatter.format(value)
}

function formatPercent(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function StatCard({ title, value, subtitle, positive }: { title: string; value: string; subtitle: string; positive: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-4 rounded-[20px] border border-emerald-50 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <div className="w-5 h-5" />
        </div>
        <div className={`text-[10px] font-black ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </div>
      </div>
      <div className="space-y-0.5">
        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{subtitle}</p>
        <p className="text-xl font-black text-emerald-950">{value}</p>
        <h3 className="text-[11px] font-bold text-emerald-600/70">{title}</h3>
      </div>
    </motion.div>
  )
}

export default function PerformancePage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [period, setPeriod] = useState('This Month')
  const [performance, setPerformance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) return
    setLoading(true)
    ;(async () => {
      try {
        const response = await homeService.getPerformance(companyId)
        setPerformance(response?.data ?? response)
        setFeedback(null)
      } catch (error: any) {
        setFeedback(error?.message || 'Failed to load performance data')
      } finally {
        setLoading(false)
      }
    })()
  }, [companyId])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 3000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const kpis = performance?.kpis
  const revenueVsExpenses = performance?.revenueVsExpenses ?? []
  const profitMarginTrend = performance?.profitMarginTrend ?? []
  const topExpenses = performance?.topExpenses ?? []
  const hasData = Boolean(kpis && (revenueVsExpenses.length || profitMarginTrend.length || topExpenses.length))

  if (companyIdError) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{companyIdError}</div>
      </div>
    )
  }

  if (companyIdLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="min-h-[360px] flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No performance data available.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{feedback}</div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance</h1>
          <p className="text-sm text-slate-500">Review revenue, expenses, and profitability trends.</p>
        </div>
        <div>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
            <option>Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue"
          value={formatAmount(kpis.revenue ?? 0)}
          subtitle={formatPercent(kpis.revenueChange ?? 0)}
          positive={(kpis.revenueChange ?? 0) >= 0}
        />
        <StatCard
          title="Expenses"
          value={formatAmount(kpis.expenses ?? 0)}
          subtitle={formatPercent(kpis.expensesChange ?? 0)}
          positive={(kpis.expensesChange ?? 0) <= 0}
        />
        <StatCard
          title="Gross Profit"
          value={formatAmount(kpis.grossProfit ?? 0)}
          subtitle={`${((kpis.grossProfitMargin ?? 0) * 100).toFixed(1)}%`}
          positive={(kpis.grossProfitMargin ?? 0) >= 0}
        />
        <StatCard
          title="Net Profit"
          value={formatAmount(kpis.netProfit ?? 0)}
          subtitle={`${((kpis.netProfitMargin ?? 0) * 100).toFixed(1)}%`}
          positive={(kpis.netProfitMargin ?? 0) >= 0}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Revenue vs Expenses</h2>
          <p className="text-sm text-slate-500">Monthly performance compared side by side</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueVsExpenses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#10B981" />
            <Bar dataKey="expenses" fill="#F43F5E" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Profit Margin Trend</h2>
            <p className="text-sm text-slate-500">Margin percentage over time</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitMarginTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="margin" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Top Expense Categories</h2>
            <p className="text-sm text-slate-500">Largest expense categories by amount</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={topExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#3B82F6">
                {topExpenses.map((entry: any, index: number) => (
                  <Cell key={entry.category || index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
