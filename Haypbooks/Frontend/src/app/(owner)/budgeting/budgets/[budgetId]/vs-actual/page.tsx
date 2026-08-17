'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Minus, Wallet, DollarSign, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useCompanyId } from '@/hooks/useCompanyId'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { budgetService, type BudgetVsActualResponse } from '@/services/budget.service'
import { formatCurrency } from '@/lib/format'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonth(m: number | null): string {
  return m ? MONTH_LABELS[m - 1] ?? `M${m}` : 'Annual'
}

const varianceColor = (value: number) => {
  if (value > 0) return 'text-rose-600'
  if (value < 0) return 'text-emerald-600'
  return 'text-slate-500'
}

const varianceBg = (value: number) => {
  if (value > 0) return 'bg-rose-50'
  if (value < 0) return 'bg-emerald-50'
  return ''
}

const VarianceIcon = ({ value }: { value: number }) => {
  if (value > 0) return <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
  if (value < 0) return <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
  return <Minus className="h-3.5 w-3.5 text-slate-400" />
}

export default function BudgetVsActualPage() {
  const budgetId = useParams<{ budgetId: string }>()?.budgetId ?? ''
  const router = useRouter()
  const { companyId, loading: companyLoading } = useCompanyId()
  const { currency } = useCompanyCurrency()

  const [data, setData] = useState<BudgetVsActualResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const fetchVsActual = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await budgetService.getBudgetVsActual(companyId, budgetId, { from: from || undefined, to: to || undefined })
      setData(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load budget vs actual data')
    } finally {
      setLoading(false)
    }
  }, [companyId, budgetId, from, to])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) {
      setLoading(false)
      return
    }
    fetchVsActual()
  }, [companyLoading, companyId, fetchVsActual])

  const kpis = useMemo(() => {
    if (!data?.rows?.length) return { totalBudgeted: 0, totalActual: 0, totalVariance: 0 }
    let totalBudgeted = 0
    let totalActual = 0
    for (const row of data.rows) {
      totalBudgeted += Number(row.budgeted) || 0
      totalActual += Number(row.actual) || 0
    }
    return {
      totalBudgeted,
      totalActual,
      totalVariance: totalActual - totalBudgeted,
    }
  }, [data])

  const monthlySeries = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, index) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
      budgeted: 0,
      actual: 0,
    }))

    if (!data?.rows?.length) return months

    for (const row of data.rows) {
      const monthIndex = row.month ? row.month - 1 : 12
      if (monthIndex >= 0 && monthIndex < 12) {
        months[monthIndex].budgeted += Number(row.budgeted) || 0
        months[monthIndex].actual += Number(row.actual) || 0
      }
    }

    return months
  }, [data])

  const displayCurrency = data?.currency ?? currency

  const sortedRows = useMemo(() => {
    if (!data?.rows?.length) return []
    return [...data.rows].sort((a, b) => {
      const codeA = a.accountCode || 'zzz'
      const codeB = b.accountCode || 'zzz'
      if (codeA !== codeB) return codeA.localeCompare(codeB)
      return (a.month ?? 999) - (b.month ?? 999)
    })
  }, [data])

  if (companyLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/budgeting/budgets/${budgetId}`)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Budget vs Actual</h2>
          </div>
        </div>
        <button
          onClick={fetchVsActual}
          disabled={loading}
          title="Refresh"
          className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex gap-3 mb-4 flex-wrap">
          <button
            type="button"
            onClick={() => companyId && window.open(`/api/companies/${companyId}/reporting/budgets/${budgetId}/vs-actual/csv`)}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-medium"
            disabled={!companyId}
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => companyId && window.open(`/api/companies/${companyId}/reporting/budgets/${budgetId}/vs-actual/pdf`)}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-medium"
            disabled={!companyId}
          >
            Export PDF
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-slate-600">Period:</span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          {(from || to) && (
            <button
              onClick={() => { setFrom(''); setTo('') }}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <Wallet className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Budgeted</p>
              <p className="text-lg font-semibold text-slate-900 mt-0.5">{formatCurrency(kpis.totalBudgeted, displayCurrency)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <DollarSign className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Actual</p>
              <p className="text-lg font-semibold text-slate-900 mt-0.5">{formatCurrency(kpis.totalActual, displayCurrency)}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl border p-5 ${varianceBg(kpis.totalVariance) || 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${kpis.totalVariance > 0 ? 'bg-rose-100' : kpis.totalVariance < 0 ? 'bg-emerald-100' : 'bg-slate-100'}`}>
              <BarChart3 className={`h-5 w-5 ${varianceColor(kpis.totalVariance)}`} />
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide ${varianceColor(kpis.totalVariance)}`}>Total Variance</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <VarianceIcon value={kpis.totalVariance} />
                <p className={`text-lg font-semibold ${varianceColor(kpis.totalVariance)}`}>
                  {formatCurrency(Math.abs(kpis.totalVariance), currency)}
                  {kpis.totalVariance !== 0 && (
                    <span className="text-sm font-normal ml-1">
                      {kpis.totalVariance > 0 ? 'over' : 'under'} budget
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Monthly Budget vs Actual</h2>
          <p className="text-sm text-slate-500">Compare monthly budgeted and actual spending for the selected period.</p>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value} />
              <Legend />
              <Bar dataKey="budgeted" fill="#3b82f6" />
              <Bar dataKey="actual" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Line Item Variance</h2>
        </div>
        {error ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <p className="text-sm mb-2">{error}</p>
            <button onClick={fetchVsActual} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Retry</button>
          </div>
        ) : !data?.rows?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <BarChart3 className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-sm">No comparison data available</p>
            <p className="text-xs mt-1 text-slate-400">Budget lines with matching actual transactions will appear here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Account</th>
                <th className="text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Month</th>
                <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Budgeted</th>
                <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actual</th>
                <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Variance</th>
                <th className="text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Variance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRows.map((row, idx) => {
                const variance = Number(row.actual) - Number(row.budgeted)
                const budgetedNum = Number(row.budgeted)
                const variancePct = budgetedNum !== 0 ? (variance / budgetedNum) * 100 : 0
                return (
                  <tr key={`${row.accountId}-${row.month ?? 'annual'}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-slate-800">{row.accountName || '—'}</span>
                        {row.accountCode && <span className="text-xs text-slate-400 ml-2">{row.accountCode}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatMonth(row.month)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(Number(row.budgeted), displayCurrency)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(Number(row.actual), displayCurrency)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${varianceColor(variance)}`}>
                      <div className="flex items-center justify-end gap-1.5">
                        <VarianceIcon value={variance} />
                        {formatCurrency(Math.abs(variance), displayCurrency)}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${varianceColor(variance)}`}>
                      {variancePct !== 0 ? `${variancePct > 0 ? '+' : ''}${variancePct.toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {sortedRows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-800" colSpan={2}>Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(kpis.totalBudgeted, displayCurrency)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(kpis.totalActual, displayCurrency)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${varianceColor(kpis.totalVariance)}`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <VarianceIcon value={kpis.totalVariance} />
                      {formatCurrency(Math.abs(kpis.totalVariance), displayCurrency)}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${varianceColor(kpis.totalVariance)}`}>
                    {kpis.totalBudgeted !== 0 ? `${kpis.totalVariance > 0 ? '+' : ''}${((kpis.totalVariance / kpis.totalBudgeted) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  )
}
