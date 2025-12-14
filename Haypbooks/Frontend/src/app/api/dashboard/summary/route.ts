import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import { computeARAging, computeAPAging, computeProfitLoss } from '@/mock/aggregations'

type FinancialRatio = {
  name: string
  value: number
  previousValue: number
  change: number
  changePercent: number
  benchmark: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  description: string
}

type TrendData = {
  period: string
  revenue: number
  expenses: number
  netIncome: number
  cashFlow: number
}

type CashFlowForecast = {
  period: string
  projectedInflow: number
  projectedOutflow: number
  netCashFlow: number
  cumulativeCash: number
}

function normalizeRange(period?: string | null) {
  const p = period || 'YTD'
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  let start: string
  let end: string
  if (p === 'MTD' || p === 'ThisMonth') {
    start = iso(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)))
    end = iso(today)
  } else if (p === 'QTD' || p === 'ThisQuarter') {
    const qStartMonth = Math.floor(today.getUTCMonth() / 3) * 3
    start = iso(new Date(Date.UTC(today.getUTCFullYear(), qStartMonth, 1)))
    end = iso(today)
  } else if (p === 'Last12') {
    start = iso(new Date(today.getTime() - 364 * 86400000))
    end = iso(today)
  } else if (p === 'LastMonth') {
    const firstThisMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
    const e = new Date(firstThisMonth.getTime() - 86400000)
    start = iso(new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), 1)))
    end = iso(e)
  } else if (p === 'LastQuarter') {
    const q = Math.floor(today.getUTCMonth() / 3)
    const startQ = new Date(Date.UTC(today.getUTCFullYear(), q * 3, 1))
    const e = new Date(startQ.getTime() - 86400000)
    start = iso(new Date(Date.UTC(e.getUTCFullYear(), Math.floor(e.getUTCMonth() / 3) * 3, 1)))
    end = iso(e)
  } else {
    // YTD default
    start = iso(new Date(Date.UTC(today.getUTCFullYear(), 0, 1)))
    end = iso(today)
  }
  return { start, end }
}

function prevRangeOf(startIso: string, endIso: string) {
  const dayMs = 86400000
  const start = new Date(startIso + 'T00:00:00Z')
  const end = new Date(endIso + 'T00:00:00Z')
  const days = Math.max(1, Math.floor((end.getTime() - start.getTime()) / dayMs) + 1)
  const prevEnd = new Date(start.getTime() - dayMs)
  const prevStart = new Date(prevEnd.getTime() - (days - 1) * dayMs)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { start: iso(prevStart), end: iso(prevEnd) }
}

function inRange(dateIso: string, start?: string, end?: string) {
  if (start && dateIso.slice(0, 10) < start) return false
  if (end && dateIso.slice(0, 10) > end) return false
  return true
}

/**
 * Calculate comprehensive financial ratios for business intelligence
 */
function calculateFinancialRatios(currentPL: any, prevPL: any, arTotal: number, apTotal: number, arPrev: number, apPrev: number, cash: number): FinancialRatio[] {
  const ratios: FinancialRatio[] = []
  
  // Gross Profit Margin
  const grossMargin = currentPL.revenue > 0 ? ((currentPL.revenue - currentPL.cogs) / currentPL.revenue) * 100 : 0
  const prevGrossMargin = prevPL.revenue > 0 ? ((prevPL.revenue - prevPL.cogs) / prevPL.revenue) * 100 : 0
  ratios.push({
    name: 'Gross Profit Margin',
    value: grossMargin,
    previousValue: prevGrossMargin,
    change: grossMargin - prevGrossMargin,
    changePercent: prevGrossMargin > 0 ? ((grossMargin - prevGrossMargin) / prevGrossMargin) * 100 : 0,
    benchmark: 40, // Industry benchmark 40%
    status: grossMargin >= 40 ? 'excellent' : grossMargin >= 30 ? 'good' : grossMargin >= 20 ? 'fair' : 'poor',
    description: 'Percentage of revenue remaining after cost of goods sold'
  })
  
  // Net Profit Margin
  const netMargin = currentPL.revenue > 0 ? (currentPL.netIncome / currentPL.revenue) * 100 : 0
  const prevNetMargin = prevPL.revenue > 0 ? (prevPL.netIncome / prevPL.revenue) * 100 : 0
  ratios.push({
    name: 'Net Profit Margin',
    value: netMargin,
    previousValue: prevNetMargin,
    change: netMargin - prevNetMargin,
    changePercent: prevNetMargin !== 0 ? ((netMargin - prevNetMargin) / Math.abs(prevNetMargin)) * 100 : 0,
    benchmark: 10, // Industry benchmark 10%
    status: netMargin >= 15 ? 'excellent' : netMargin >= 10 ? 'good' : netMargin >= 5 ? 'fair' : 'poor',
    description: 'Percentage of revenue that becomes profit after all expenses'
  })
  
  // Current Ratio (simplified: Cash + AR / AP)
  const currentAssets = cash + arTotal
  const currentLiabilities = apTotal
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0
  const prevCurrentAssets = cash + arPrev // Simplified for previous period
  const prevCurrentLiabilities = apPrev
  const prevCurrentRatio = prevCurrentLiabilities > 0 ? prevCurrentAssets / prevCurrentLiabilities : 0
  ratios.push({
    name: 'Current Ratio',
    value: currentRatio,
    previousValue: prevCurrentRatio,
    change: currentRatio - prevCurrentRatio,
    changePercent: prevCurrentRatio > 0 ? ((currentRatio - prevCurrentRatio) / prevCurrentRatio) * 100 : 0,
    benchmark: 2.0, // Industry benchmark 2:1
    status: currentRatio >= 2.5 ? 'excellent' : currentRatio >= 2.0 ? 'good' : currentRatio >= 1.5 ? 'fair' : 'poor',
    description: 'Ability to pay short-term obligations with current assets'
  })
  
  // Days Sales Outstanding (DSO)
  const dailySales = currentPL.revenue / 365
  const dso = dailySales > 0 ? arTotal / dailySales : 0
  const prevDailySales = prevPL.revenue / 365
  const prevDSO = prevDailySales > 0 ? arPrev / prevDailySales : 0
  ratios.push({
    name: 'Days Sales Outstanding',
    value: dso,
    previousValue: prevDSO,
    change: dso - prevDSO,
    changePercent: prevDSO > 0 ? ((dso - prevDSO) / prevDSO) * 100 : 0,
    benchmark: 30, // Industry benchmark 30 days
    status: dso <= 30 ? 'excellent' : dso <= 45 ? 'good' : dso <= 60 ? 'fair' : 'poor',
    description: 'Average number of days to collect receivables'
  })
  
  // Operating Expense Ratio
  const operatingExpenses = currentPL.expenses - currentPL.cogs
  const opExpenseRatio = currentPL.revenue > 0 ? (operatingExpenses / currentPL.revenue) * 100 : 0
  const prevOperatingExpenses = prevPL.expenses - prevPL.cogs
  const prevOpExpenseRatio = prevPL.revenue > 0 ? (prevOperatingExpenses / prevPL.revenue) * 100 : 0
  ratios.push({
    name: 'Operating Expense Ratio',
    value: opExpenseRatio,
    previousValue: prevOpExpenseRatio,
    change: opExpenseRatio - prevOpExpenseRatio,
    changePercent: prevOpExpenseRatio > 0 ? ((opExpenseRatio - prevOpExpenseRatio) / prevOpExpenseRatio) * 100 : 0,
    benchmark: 25, // Industry benchmark 25%
    status: opExpenseRatio <= 20 ? 'excellent' : opExpenseRatio <= 25 ? 'good' : opExpenseRatio <= 35 ? 'fair' : 'poor',
    description: 'Operating expenses as percentage of revenue'
  })
  
  return ratios
}

/**
 * Generate trend data for the last 12 months
 */
function generateTrendData(): TrendData[] {
  const trends: TrendData[] = []
  const today = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().slice(0, 10)
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().slice(0, 10)
    
    const pl = computeProfitLoss({ start, end })
    
    // Calculate cash flow (simplified as net income + depreciation - capex)
    const cashFlow = pl.netIncome // Simplified for demo
    
    trends.push({
      period: monthDate.toISOString().slice(0, 7), // YYYY-MM format
      revenue: pl.revenue,
      expenses: pl.expenses,
      netIncome: pl.netIncome,
      cashFlow
    })
  }
  
  return trends
}

/**
 * Generate cash flow forecast for next 3 months
 */
function generateCashFlowForecast(currentCash: number): CashFlowForecast[] {
  const forecasts: CashFlowForecast[] = []
  const today = new Date()
  let cumulativeCash = currentCash
  
  // Get historical averages for projection
  const recentTrends = generateTrendData().slice(-3) // Last 3 months
  const avgMonthlyRevenue = recentTrends.reduce((sum, t) => sum + t.revenue, 0) / recentTrends.length
  const avgMonthlyExpenses = recentTrends.reduce((sum, t) => sum + t.expenses, 0) / recentTrends.length
  
  for (let i = 1; i <= 3; i++) {
    const forecastDate = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const period = forecastDate.toISOString().slice(0, 7)
    
    // Apply growth trend (simplified 5% growth assumption)
    const growthFactor = 1 + (0.05 * i / 12) // 5% annual growth
    const projectedInflow = avgMonthlyRevenue * growthFactor
    const projectedOutflow = avgMonthlyExpenses * growthFactor
    const netCashFlow = projectedInflow - projectedOutflow
    
    cumulativeCash += netCashFlow
    
    forecasts.push({
      period,
      projectedInflow,
      projectedOutflow,
      netCashFlow,
      cumulativeCash
    })
  }
  
  return forecasts
}

/**
 * Calculate key performance indicators with targets and status
 */
function calculateKPIs(currentPL: any, prevPL: any, arTotal: number, apTotal: number, cash: number) {
  const kpis = [
    {
      name: 'Monthly Recurring Revenue',
      value: currentPL.revenue / 12, // Simplified monthly average
      target: 100000,
      unit: 'currency',
      trend: currentPL.revenue > prevPL.revenue ? 'up' : 'down',
      trendPercent: prevPL.revenue > 0 ? ((currentPL.revenue - prevPL.revenue) / prevPL.revenue) * 100 : 0
    },
    {
      name: 'Customer Acquisition Cost',
      value: currentPL.expenses * 0.15, // Simplified as 15% of expenses
      target: 500,
      unit: 'currency',
      trend: 'down', // Lower is better
      trendPercent: -5.2 // Mock improvement
    },
    {
      name: 'Cash Runway (Months)',
      value: cash > 0 && currentPL.expenses > 0 ? (cash / (currentPL.expenses / 12)) : 0,
      target: 6,
      unit: 'months',
      trend: 'up',
      trendPercent: 12.5
    },
    {
      name: 'Profit Margin',
      value: currentPL.revenue > 0 ? (currentPL.netIncome / currentPL.revenue) * 100 : 0,
      target: 15,
      unit: 'percentage',
      trend: currentPL.netIncome > prevPL.netIncome ? 'up' : 'down',
      trendPercent: prevPL.netIncome !== 0 ? ((currentPL.netIncome - prevPL.netIncome) / Math.abs(prevPL.netIncome)) * 100 : 0
    }
  ]
  
  return kpis.map(kpi => ({
    ...kpi,
    status: kpi.value >= kpi.target ? 'on-track' : kpi.value >= kpi.target * 0.8 ? 'at-risk' : 'behind',
    achievementPercent: kpi.target > 0 ? (kpi.value / kpi.target) * 100 : 0
  }))
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!db.seeded) { try { seedIfNeeded() } catch {} }

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  const enhanced = url.searchParams.get('enhanced') === 'true'
  const { start, end } = normalizeRange(period)
  const prev = prevRangeOf(start, end)
  const asOf = end

  // P&L-like KPIs
  const pl = computeProfitLoss({ start, end })
  const plPrev = computeProfitLoss({ start: prev.start, end: prev.end })

  // Cash balance (current from account), and a prev proxy via transactions over prev range
  const cashAcc = db.accounts.find(a => a.number === '1000')
  const cash = cashAcc ? cashAcc.balance : 0
  let prevCash = 0
  for (const t of db.transactions) {
    if (inRange(t.date, prev.start, prev.end)) prevCash += t.amount
  }

  // AR/AP totals as of date (and previous period end)
  const { totals: arTotals } = computeARAging(new Date(asOf + 'T00:00:00Z'))
  const { totals: apTotals } = computeAPAging(new Date(asOf + 'T00:00:00Z'))
  const { totals: arPrevTotals } = computeARAging(new Date(prev.end + 'T00:00:00Z'))
  const { totals: apPrevTotals } = computeAPAging(new Date(prev.end + 'T00:00:00Z'))

  // Recent transactions (latest 5)
  const recent = db.transactions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map(tx => ({ id: tx.id, date: tx.date.slice(0, 10), description: tx.description, amount: tx.amount, category: tx.category }))

  // Counts
  const openInvoices = db.invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'void').length
  const overdueInvoices = db.invoices.filter(inv => inv.status === 'overdue').length
  const openBills = db.bills.filter(b => b.status !== 'paid' && b.status !== 'void').length
  const overdueBills = db.bills.filter(b => b.status === 'overdue').length

  const payload: any = {
    period,
    start,
    end,
    asOf,
    kpis: {
      revenue: { current: pl.revenue, prev: plPrev.revenue },
      expenses: { current: pl.expenses, prev: plPrev.expenses },
      netIncome: { current: pl.netIncome, prev: plPrev.netIncome },
      cash: { current: cash, prev: prevCash },
      ar: { current: Number(arTotals?.total || 0), prev: Number(arPrevTotals?.total || 0) },
      ap: { current: Number(apTotals?.total || 0), prev: Number(apPrevTotals?.total || 0) },
    },
    recentTransactions: recent,
    counts: { openInvoices, overdueInvoices, openBills, overdueBills },
  }

  // Enhanced analytics
  if (enhanced) {
    payload.financialRatios = calculateFinancialRatios(
      pl, plPrev,
      Number(arTotals?.total || 0),
      Number(apTotals?.total || 0),
      Number(arPrevTotals?.total || 0),
      Number(apPrevTotals?.total || 0),
      cash
    )
    
    payload.trendData = generateTrendData()
    payload.cashFlowForecast = generateCashFlowForecast(cash)
    payload.performanceKPIs = calculateKPIs(
      pl, plPrev,
      Number(arTotals?.total || 0),
      Number(apTotals?.total || 0),
      cash
    )
    
    // Additional business intelligence
    payload.businessInsights = {
      revenueGrowthRate: plPrev.revenue > 0 ? ((pl.revenue - plPrev.revenue) / plPrev.revenue) * 100 : 0,
      expenseGrowthRate: plPrev.expenses > 0 ? ((pl.expenses - plPrev.expenses) / plPrev.expenses) * 100 : 0,
      cashBurnRate: pl.expenses / 12, // Monthly burn rate
      runwayMonths: cash > 0 && pl.expenses > 0 ? (cash / (pl.expenses / 12)) : 0,
      customerCount: db.customers?.length || 0,
      averageInvoiceValue: openInvoices > 0 ? (Number(arTotals?.total || 0) / openInvoices) : 0,
      paymentTermsCompliance: openInvoices > 0 ? ((openInvoices - overdueInvoices) / openInvoices) * 100 : 100
    }
  }

  return NextResponse.json(payload)
}
