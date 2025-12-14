import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'
import { db } from '@/mock/db'
import '@/mock/seed'

type PLLine = {
  name: string
  accountNumber?: string
  amount: number
  isSubtotal?: boolean
}

type ProfitLossData = {
  period: string
  start: string | null
  end: string | null
  lines: PLLine[]
  totals: {
    revenue: number
    cogs: number
    grossProfit: number
    expenses: number
    operatingIncome: number
    otherIncome: number
    netIncome: number
  }
  prevLines?: PLLine[]
  prevTotals?: any
  accountingMethod: string
  baseCurrency: string
  generatedAt: string
}

/**
 * Generate Profit & Loss statement from real accounting data
 * Shows Revenue - Expenses = Net Income for the specified period
 */
function computeProfitLoss(startDate: string | null, endDate: string | null): Omit<ProfitLossData, 'period' | 'start' | 'end' | 'prevLines' | 'prevTotals'> {
  const accounts = db.accounts || []
  const journalEntries = db.journalEntries || []
  
  // Calculate account balances for the period
  const accountBalances = new Map<string, number>()
  
  // For P&L, we want activity within the period, not cumulative balances
  journalEntries.forEach(je => {
    const entryDate = je.date.slice(0, 10)
    const inPeriod = (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate)
    
    if (inPeriod) {
      je.lines.forEach(line => {
        const currentBalance = accountBalances.get(line.accountId) || 0
        const netEffect = (line.debit || 0) - (line.credit || 0)
        accountBalances.set(line.accountId, currentBalance + netEffect)
      })
    }
  })
  
  // Categorize accounts for P&L presentation
  const revenueAccounts: PLLine[] = []
  const cogsAccounts: PLLine[] = []
  const expenseAccounts: PLLine[] = []
  
  accounts
    .filter(acc => acc.active !== false && (acc.type === 'Income' || acc.type === 'Expense'))
    .sort((a, b) => a.number.localeCompare(b.number))
    .forEach(acc => {
      const balance = accountBalances.get(acc.id) || 0
      
      // Skip zero activity accounts
      if (Math.abs(balance) < 0.01) return
      
      const accountInfo: PLLine = {
        name: acc.name,
        accountNumber: acc.number,
        amount: balance
      }
      
      if (acc.type === 'Income') {
        // Income accounts have credit normal balance, show as positive revenue
        revenueAccounts.push({
          ...accountInfo,
          amount: balance // Keep natural balance (should be positive for revenue)
        })
      } else if (acc.type === 'Expense') {
        // Check if this is COGS based on account number/name
        const isCOGS = acc.number.startsWith('5') || acc.name.toLowerCase().includes('cost of goods') || acc.name.toLowerCase().includes('cogs')
        
        if (isCOGS) {
          cogsAccounts.push({
            ...accountInfo,
            amount: Math.abs(balance) // Show as positive expense
          })
        } else {
          expenseAccounts.push({
            ...accountInfo,
            amount: Math.abs(balance) // Show as positive expense
          })
        }
      }
    })
  
  // Calculate totals
  const revenue = revenueAccounts.reduce((sum, acc) => sum + acc.amount, 0)
  const cogs = cogsAccounts.reduce((sum, acc) => sum + acc.amount, 0)
  const grossProfit = revenue - cogs
  const expenses = expenseAccounts.reduce((sum, acc) => sum + acc.amount, 0)
  const operatingIncome = grossProfit - expenses
  const otherIncome = 0 // TODO: Add other income logic if needed
  const netIncome = operatingIncome + otherIncome
  
  // Build the formatted lines for display
  const lines: PLLine[] = [
    ...revenueAccounts,
    { name: 'Total Revenue', amount: revenue, isSubtotal: true },
    ...cogsAccounts,
    { name: 'Total Cost of Goods Sold', amount: cogs, isSubtotal: true },
    { name: 'Gross Profit', amount: grossProfit, isSubtotal: true },
    ...expenseAccounts,
    { name: 'Total Operating Expenses', amount: expenses, isSubtotal: true },
    { name: 'Operating Income', amount: operatingIncome, isSubtotal: true },
    { name: 'Net Income', amount: netIncome, isSubtotal: true }
  ]
  
  return {
    lines,
    totals: {
      revenue,
      cogs,
      grossProfit,
      expenses,
      operatingIncome,
      otherIncome,
      netIncome
    },
    accountingMethod: db.settings?.accountingMethod || 'accrual',
    baseCurrency: db.settings?.baseCurrency || 'USD',
    generatedAt: new Date().toISOString()
  }
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  const compare = url.searchParams.get('compare') === '1'
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  
  // Preserve semantics: ThisMonth -> MTD, ThisQuarter -> QTD
  const alias = period === 'ThisMonth' ? 'MTD' : period === 'ThisQuarter' ? 'QTD' : period
  const { start, end } = deriveRange(alias, qStart, qEnd) as { start: string | null; end: string | null }
  
  // Generate current period P&L
  const currentPL = computeProfitLoss(start, end)
  
  // Generate comparative P&L if requested
  let prevPL = null
  if (compare && start && end) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const periodLength = endDate.getTime() - startDate.getTime()
    
    // Calculate prior period dates
    const priorEndDate = new Date(startDate.getTime() - 1)
    const priorStartDate = new Date(priorEndDate.getTime() - periodLength)
    
    prevPL = computeProfitLoss(
      priorStartDate.toISOString().slice(0, 10),
      priorEndDate.toISOString().slice(0, 10)
    )
  }
  
  const payload: ProfitLossData = {
    period,
    start,
    end,
    ...currentPL,
    ...(prevPL && {
      prevLines: prevPL.lines,
      prevTotals: prevPL.totals
    })
  }

  return NextResponse.json(payload)
}
