import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

// Simple ratio set using mock P&L and Balance Sheet aggregates
// Liquidity: Current Ratio, Quick Ratio
// Profitability: Gross Margin %, Net Margin %
// Efficiency: AR Turnover, Inventory Turnover, AP Turnover
// Leverage: Debt-to-Equity

export type RatioRow = {
  metric: string
  value: number
  unit?: '%' | 'x'
  note?: string
}

function round(n: number, d = 2) { return Math.round(n * 10 ** d) / 10 ** d }

function generateMockAggregates(asOfIso: string) {
  const seed = Number(asOfIso.slice(-2)) || 14
  const revenue = 120000 + seed * 1000
  const cogs = 72000 + seed * 600
  const operatingExpenses = 30000 + seed * 400
  const netIncome = revenue - cogs - operatingExpenses

  const currentAssets = 80000 + seed * 500
  const inventory = 20000 + seed * 200
  const ar = 18000 + seed * 150
  const cash = currentAssets - inventory - ar
  const currentLiabilities = 45000 + seed * 300
  const ap = 16000 + seed * 120
  const totalDebt = 90000 + seed * 700
  const equity = 110000 + seed * 800

  // Activity assumptions
  const creditSales = revenue * 0.7
  const averageAR = ar * 0.9
  const costOfSales = cogs
  const averageInventory = inventory * 0.95
  const creditPurchases = cogs * 0.6
  const averageAP = ap * 0.92

  return {
    revenue, cogs, operatingExpenses, netIncome,
    currentAssets, inventory, ar, cash, currentLiabilities, ap, totalDebt, equity,
    creditSales, averageAR, costOfSales, averageInventory, creditPurchases, averageAP,
  }
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  const { start, end } = deriveRange(qStart && qEnd ? 'Custom' : period, qStart, qEnd)

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  const agg = generateMockAggregates(asOfIso)

  const rows: RatioRow[] = []
  // Liquidity
  const currentRatio = agg.currentAssets / agg.currentLiabilities
  const quickRatio = (agg.currentAssets - agg.inventory) / agg.currentLiabilities
  rows.push({ metric: 'Current Ratio', value: round(currentRatio, 2), unit: 'x' })
  rows.push({ metric: 'Quick Ratio', value: round(quickRatio, 2), unit: 'x' })

  // Profitability
  const grossMarginPct = (agg.revenue - agg.cogs) / agg.revenue * 100
  const netMarginPct = agg.netIncome / agg.revenue * 100
  rows.push({ metric: 'Gross Margin', value: round(grossMarginPct, 2), unit: '%' })
  rows.push({ metric: 'Net Margin', value: round(netMarginPct, 2), unit: '%' })

  // Efficiency
  const arTurnover = agg.creditSales / Math.max(agg.averageAR, 1)
  const invTurnover = agg.costOfSales / Math.max(agg.averageInventory, 1)
  const apTurnover = agg.creditPurchases / Math.max(agg.averageAP, 1)
  rows.push({ metric: 'A/R Turnover', value: round(arTurnover, 2), unit: 'x' })
  rows.push({ metric: 'Inventory Turnover', value: round(invTurnover, 2), unit: 'x' })
  rows.push({ metric: 'A/P Turnover', value: round(apTurnover, 2), unit: 'x' })

  // Leverage
  const debtToEquity = agg.totalDebt / Math.max(agg.equity, 1)
  rows.push({ metric: 'Debt to Equity', value: round(debtToEquity, 2), unit: 'x' })

  return NextResponse.json({ rows, asOf: asOfIso, start: start || null, end: end || null, period: period || null })
}
