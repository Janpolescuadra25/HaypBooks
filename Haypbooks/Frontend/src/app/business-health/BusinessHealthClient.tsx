'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  Gauge,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useCompanyCurrency } from '@/hooks/useCompanyCurrency'
import { formatCurrency as sharedFormatCurrency } from '@/lib/format'

type HealthMetrics = {
  totalAssets: number
  totalLiabilities: number
  equity: number
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  grossMargin: number
  debtToEquity: number | null
  healthScore: number
}

type LiquidityMetrics = {
  currentAssets: number
  currentLiabilities: number
  currentRatio: number | null
  quickRatio: number | null
}

type ProfitabilityMetrics = {
  grossMargin: number
  netMargin: number
  netIncome: number
  totalRevenue: number
}

type TrendPoint = {
  month: string
  label: string
  revenue: number
  expenses: number
  netIncome: number
  healthScore: number
}

type TrendsResponse = {
  trends: TrendPoint[]
}

type CashPosition = {
  accounts: Array<{
    id: string
    accountName: string
    currentBalance: number
    currency?: string
  }>
  totalCash: number
}

type ReceivablesSummary = {
  outstanding: number
  invoiceCount: number
}

type PayablesSummary = {
  outstanding: number
  billCount: number
}

type OverdueItem = {
  id: string
  type: 'invoice' | 'bill'
  invoiceNumber?: string
  billNumber?: string
  balance?: number
  totalAmount?: number
  dueDate: string
  status: string
}

type OverdueSummary = {
  items: OverdueItem[]
  count: number
  totalOverdueValue: number
}

type DashboardData = {
  metrics: HealthMetrics
  liquidity: LiquidityMetrics
  profitability: ProfitabilityMetrics
  trends: TrendsResponse
  cash: CashPosition
  receivables: ReceivablesSummary
  payables: PayablesSummary
  overdue: OverdueSummary
}

function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return 'n/a'
  return `${value.toFixed(1)}%`
}

function formatRatio(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return 'n/a'
  return `${value.toFixed(2)}x`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function scoreTone(score: number) {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-rose-700 bg-rose-50 border-rose-200'
}

function ratioTone(value: number | null, healthyThreshold: number) {
  if (value == null) return 'text-slate-600 bg-slate-100'
  if (value >= healthyThreshold) return 'text-emerald-700 bg-emerald-50'
  return 'text-amber-700 bg-amber-50'
}

function TrendChart({ points, formatCurrency }: { points: TrendPoint[]; formatCurrency: (value: number) => string }) {
  const width = 520
  const height = 180

  const scoreValues = points.map((point) => point.healthScore)
  const minScore = Math.min(...scoreValues, 0)
  const maxScore = Math.max(...scoreValues, 100)
  const range = Math.max(maxScore - minScore, 1)
  const step = points.length > 1 ? width / (points.length - 1) : width

  const path = points.map((point, index) => {
    const x = index * step
    const y = height - ((point.healthScore - minScore) / range) * height
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  const area = `${path} L ${width} ${height} L 0 ${height} Z`

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Six Month Trend</h3>
          <p className="mt-1 text-lg font-semibold text-slate-900">Health score and monthly earnings</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <div>Latest score</div>
          <div className="text-xl font-bold text-slate-900">{points.at(-1)?.healthScore ?? 0}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height + 32}`} className="h-56 min-w-[520px] w-full">
          <defs>
            <linearGradient id="business-health-score" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <line
              key={tick}
              x1="0"
              x2={width}
              y1={tick * height}
              y2={tick * height}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          <path d={area} fill="url(#business-health-score)" />
          <path d={path} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />

          {points.map((point, index) => {
            const x = index * step
            const y = height - ((point.healthScore - minScore) / range) * height
            return (
              <g key={point.month}>
                <circle cx={x} cy={y} r="4.5" fill="#0f766e" stroke="#ffffff" strokeWidth="2" />
                <text x={x} y={height + 20} textAnchor="middle" fill="#64748b" fontSize="11">
                  {point.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {points.slice(-3).map((point) => (
          <div key={point.month} className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{point.label}</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">Net {formatCurrency(point.netIncome)}</div>
            <div className="text-xs text-slate-500">Revenue {formatCurrency(point.revenue)} | Expense {formatCurrency(point.expenses)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: typeof Gauge
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
          <div className="mt-1 text-sm text-slate-500">{hint}</div>
        </div>
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default function BusinessHealthClient() {
  const { currency } = useCompanyCurrency()
  const formatCurrency = useCallback((value: number) => sharedFormatCurrency(value, currency), [currency])
  const [companyId, setCompanyId] = useState('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/companies/recent', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : [])
      .then((companies: Array<{ id: string }>) => {
        if (companies.length > 0) setCompanyId(companies[0].id)
        else setLoading(false)
      })
      .catch(() => {
        setError('Failed to resolve a company for this workspace.')
        setLoading(false)
      })
  }, [])

  const load = useCallback(async () => {
    if (!companyId) return

    setLoading(true)
    setError('')

    try {
      const [metrics, liquidity, profitability, trends, cash, receivables, payables, overdue] = await Promise.all([
        apiClient.get(`/companies/${companyId}/health/metrics`),
        apiClient.get(`/companies/${companyId}/health/liquidity`),
        apiClient.get(`/companies/${companyId}/health/profitability`),
        apiClient.get(`/companies/${companyId}/health/trends`),
        apiClient.get(`/companies/${companyId}/dashboard/cash-position`),
        apiClient.get(`/companies/${companyId}/dashboard/receivables`),
        apiClient.get(`/companies/${companyId}/dashboard/payables`),
        apiClient.get(`/companies/${companyId}/overdue/all`),
      ])

      setData({
        metrics: metrics.data,
        liquidity: liquidity.data,
        profitability: profitability.data,
        trends: trends.data,
        cash: cash.data,
        receivables: receivables.data,
        payables: payables.data,
        overdue: overdue.data,
      })
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message ?? loadError?.message ?? 'Failed to load business health data.')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    void load()
  }, [load])

  const derived = useMemo(() => {
    if (!data) return null

    const financialScore = data.metrics.healthScore
    const operationalScore = clamp(
      50 + (data.liquidity.currentRatio ?? 0) * 15 - data.overdue.count * 4,
      0,
      100,
    )
    const resilienceScore = clamp(
      60 + (data.profitability.netMargin > 0 ? data.profitability.netMargin : data.profitability.netMargin / 2) - (data.metrics.debtToEquity ?? 0) * 10,
      0,
      100,
    )

    const primaryAlert = data.overdue.count > 0
      ? {
          title: `${data.overdue.count} overdue item${data.overdue.count === 1 ? '' : 's'} need attention`,
          body: `${formatCurrency(data.overdue.totalOverdueValue)} is past due across receivables and payables.`,
          href: '/sales/accounts-receivable/aging-summary',
          label: 'Review overdue balances',
        }
      : (data.profitability.netIncome < 0
          ? {
              title: 'Net income is negative',
              body: `Current net income is ${formatCurrency(data.profitability.netIncome)}. Review expense pressure and margin erosion.`,
              href: '/reporting/financial-statements',
              label: 'Open statements',
            }
          : {
              title: 'No critical issues detected',
              body: 'Core liquidity, profitability, and overdue indicators are currently inside acceptable ranges.',
              href: '/home/dashboard',
              label: 'Open dashboard',
            })

    return {
      financialScore,
      operationalScore: Math.round(operationalScore),
      resilienceScore: Math.round(resilienceScore),
      primaryAlert,
    }
  }, [data])

  if (!companyId && !loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Business Health</h1>
          <p className="mt-3 text-slate-600">No company is available for this workspace yet. Create or select a company first.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_35%),linear-gradient(135deg,#0f172a,#134e4a)] p-7 text-white shadow-lg lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-100">Business Health</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Operational and financial signal, based on live company data.</h1>
            <p className="mt-3 max-w-2xl text-sm text-teal-50/90">
              This view now reads from posted activity, outstanding balances, and cash position instead of static samples.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/reporting/financial-statements"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Open statements
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
            ))}
          </div>
        ) : data && derived ? (
          <>
            <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Overall Score</div>
                    <div className="mt-3 flex items-end gap-3">
                      <div className="text-6xl font-black text-slate-900">{data.metrics.healthScore}</div>
                      <div className={`mb-2 rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(data.metrics.healthScore)}`}>
                        {data.metrics.healthScore >= 80 ? 'Strong' : data.metrics.healthScore >= 60 ? 'Watchlist' : 'At risk'}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Built from profitability, balance sheet strength, and active obligations.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revenue</div>
                      <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(data.metrics.totalRevenue)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Net income</div>
                      <div className={`mt-2 text-2xl font-bold ${data.metrics.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCurrency(data.metrics.netIncome)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cash on hand</div>
                      <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(data.cash.totalCash)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Primary Alert</div>
                <div className="mt-4 flex items-start gap-3">
                  <div className={`rounded-xl p-3 ${data.overdue.count > 0 || data.profitability.netIncome < 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {data.overdue.count > 0 || data.profitability.netIncome < 0 ? <ShieldAlert className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{derived.primaryAlert.title}</h2>
                    <p className="mt-2 text-sm text-slate-500">{derived.primaryAlert.body}</p>
                    <Link href={derived.primaryAlert.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800">
                      {derived.primaryAlert.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Current ratio" value={formatRatio(data.liquidity.currentRatio)} hint={`Current assets ${formatCurrency(data.liquidity.currentAssets)}`} icon={Gauge} />
              <MetricCard label="Quick ratio" value={formatRatio(data.liquidity.quickRatio)} hint={`Current liabilities ${formatCurrency(data.liquidity.currentLiabilities)}`} icon={TrendingUp} />
              <MetricCard label="Gross margin" value={formatPercent(data.profitability.grossMargin)} hint={`Revenue ${formatCurrency(data.profitability.totalRevenue)}`} icon={BarChart3} />
              <MetricCard label="Debt to equity" value={formatRatio(data.metrics.debtToEquity)} hint={`Equity ${formatCurrency(data.metrics.equity)}`} icon={TrendingDown} />
            </div>

            <TrendChart points={data.trends.trends} formatCurrency={formatCurrency} />

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Health Breakdown</h3>
                  <Gauge className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-4 space-y-4">
                  {[
                    { label: 'Financial', value: derived.financialScore, tone: scoreTone(derived.financialScore) },
                    { label: 'Operational', value: derived.operationalScore, tone: scoreTone(derived.operationalScore) },
                    { label: 'Resilience', value: derived.resilienceScore, tone: scoreTone(derived.resilienceScore) },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${item.tone}`}>{item.value}</span>
                      </div>
                      <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: 10 }).map((_, segmentIndex) => (
                          <div
                            key={`${item.label}-${segmentIndex}`}
                            className={`h-2 rounded-full ${segmentIndex < Math.round(item.value / 10) ? 'bg-teal-600' : 'bg-slate-100'}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Working Capital</h3>
                  <Wallet className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Receivables</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(data.receivables.outstanding)}</div>
                    <div className="mt-1 text-sm text-slate-500">{data.receivables.invoiceCount} open invoices</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payables</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(data.payables.outstanding)}</div>
                    <div className="mt-1 text-sm text-slate-500">{data.payables.billCount} open bills</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Balance Sheet Posture</h3>
                  <Banknote className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assets</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(data.metrics.totalAssets)}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Liabilities</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(data.metrics.totalLiabilities)}</div>
                  </div>
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${ratioTone(data.liquidity.currentRatio, 1.2)}`}>
                    {data.liquidity.currentRatio != null && data.liquidity.currentRatio >= 1.2 ? 'Liquidity currently healthy' : 'Liquidity needs attention'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Active Alerts</h3>
                  <AlertTriangle className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-4 space-y-3">
                  {data.overdue.items.length > 0 ? data.overdue.items.slice(0, 5).map((item) => {
                    const label = item.type === 'invoice' ? item.invoiceNumber : item.billNumber
                    return (
                      <div key={`${item.type}-${item.id}`} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{item.type === 'invoice' ? 'Overdue invoice' : 'Overdue bill'} {label ? `(${label})` : ''}</div>
                            <div className="mt-1 text-sm text-slate-500">Due {new Date(item.dueDate).toLocaleDateString()} | Status {item.status}</div>
                          </div>
                          <div className="text-sm font-bold text-rose-700">{formatCurrency(Number(item.balance ?? item.totalAmount ?? 0))}</div>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                      No overdue receivables or payables are currently open.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Cash Accounts</h3>
                  <Wallet className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-4 space-y-3">
                  {data.cash.accounts.length > 0 ? data.cash.accounts.slice(0, 6).map((account) => (
                    <div key={account.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{account.accountName}</div>
                        <div className="text-xs text-slate-500">{account.currency ?? 'USD'}</div>
                      </div>
                      <div className={`text-sm font-bold ${Number(account.currentBalance) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCurrency(Number(account.currentBalance ?? 0))}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      No active bank accounts are connected for this company.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}