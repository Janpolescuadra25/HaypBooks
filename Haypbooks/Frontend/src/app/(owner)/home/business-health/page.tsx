'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
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

function formatChange(value: number) {
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

export default function BusinessHealthPage() {
  const { companyId, loading: companyIdLoading, error: companyIdError } = useCompanyId()
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) return
    setLoading(true)
    ;(async () => {
      try {
        const response = await homeService.getBusinessHealth(companyId)
        setHealth(response?.data ?? response)
        setFeedback(null)
      } catch (error: any) {
        setFeedback(error?.message || 'Failed to load business health data')
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

  const kpis = health?.kpis
  const revenueTrend = health?.revenueTrend ?? []
  const expenseBreakdown = health?.expenseBreakdown ?? []
  const cashFlow = health?.cashFlow ?? []
  const hasData = Boolean(kpis && (revenueTrend.length || expenseBreakdown.length || cashFlow.length))

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
        No business health data available. Connect your accounts to see insights.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{feedback}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatAmount(kpis.totalRevenue ?? kpis.revenue ?? 0)}
          subtitle={formatChange(kpis.revenueChange ?? 0)}
          positive={(kpis.revenueChange ?? 0) >= 0}
        />
        <StatCard
          title="Net Income"
          value={formatAmount(kpis.netIncome ?? 0)}
          subtitle={formatChange(kpis.netIncomeChange ?? 0)}
          positive={(kpis.netIncomeChange ?? 0) >= 0}
        />
        <StatCard
          title="Total Expenses"
          value={formatAmount(kpis.totalExpenses ?? kpis.expenses ?? 0)}
          subtitle={formatChange(kpis.totalExpensesChange ?? kpis.expensesChange ?? 0)}
          positive={(kpis.totalExpensesChange ?? kpis.expensesChange ?? 0) <= 0}
        />
        <StatCard
          title="Profit Margin"
          value={`${((kpis.profitMargin ?? 0) * 100).toFixed(1)}%`}
          subtitle={formatChange((kpis.profitMarginChange ?? 0) * 100)}
          positive={(kpis.profitMarginChange ?? 0) >= 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Revenue Trend</h2>
            <p className="text-sm text-slate-500">Monthly revenue and expenses over time</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#F43F5E" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Expense Breakdown</h2>
            <p className="text-sm text-slate-500">Category distribution of expenses</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expenseBreakdown} innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label>
                {expenseBreakdown.map((entry: any, index: number) => (
                  <Cell key={entry.name || index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Cash Flow</h2>
          <p className="text-sm text-slate-500">Income versus expenses each month</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cashFlow}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#10B981" />
            <Bar dataKey="expenses" fill="#F43F5E" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
