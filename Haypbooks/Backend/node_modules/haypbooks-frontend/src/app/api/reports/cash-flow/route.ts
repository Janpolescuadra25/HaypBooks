import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'
import { db } from '@/mock/db'
import '@/mock/seed'

type CashFlowLine = {
  name: string
  amount: number
  category: 'operations' | 'investing' | 'financing'
}

type CashFlowData = {
  period: string
  start: string | null
  end: string | null
  sections: {
    operations: number
    investing: number
    financing: number
  }
  netChange: number
  lines: CashFlowLine[]
  openingCash: number
  closingCash: number
  prev?: {
    sections: {
      operations: number
      investing: number
      financing: number
    }
    netChange: number
  }
}

/**
 * Generate Cash Flow Statement from real accounting data
 * Uses indirect method: starts with net income and adjusts for non-cash items
 */
function computeCashFlow(startDate: string | null, endDate: string | null): Omit<CashFlowData, 'period' | 'start' | 'end' | 'prev'> {
  const accounts = db.accounts || []
  const journalEntries = db.journalEntries || []
  const transactions = db.transactions || []
  
  // Get cash account balances
  const cashAccounts = accounts.filter(acc => 
    acc.type === 'Asset' && (acc.name.toLowerCase().includes('cash') || acc.number === '1000')
  )
  
  // Calculate opening cash balance (before period start)
  let openingCash = 0
  cashAccounts.forEach(acc => {
    openingCash += acc.balance || 0
  })
  
  // If we have a start date, calculate opening balance as of that date
  if (startDate) {
    const beforeStartEntries = journalEntries.filter(je => je.date < startDate)
    beforeStartEntries.forEach(je => {
      je.lines.forEach(line => {
        const account = accounts.find(acc => acc.id === line.accountId)
        if (account && cashAccounts.find(ca => ca.id === account.id)) {
          const netEffect = (line.debit || 0) - (line.credit || 0)
          openingCash += netEffect
        }
      })
    })
  }
  
  // Track cash flows during the period
  const periodEntries = journalEntries.filter(je => {
    const entryDate = je.date.slice(0, 10)
    const inPeriod = (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate)
    return inPeriod
  })
  
  // Calculate net income for operating activities (starting point for indirect method)
  const incomeAccounts = accounts.filter(acc => acc.type === 'Income' || acc.type === 'Expense')
  let netIncome = 0
  
  incomeAccounts.forEach(acc => {
    let accountActivity = 0
    periodEntries.forEach(je => {
      je.lines.forEach(line => {
        if (line.accountId === acc.id) {
          const netEffect = (line.debit || 0) - (line.credit || 0)
          accountActivity += netEffect
        }
      })
    })
    
    // Income increases cash (credit normal), Expense decreases cash (debit normal)
    if (acc.type === 'Income') {
      netIncome += accountActivity
    } else {
      netIncome -= Math.abs(accountActivity)
    }
  })
  
  // Analyze cash flows by category
  let operatingCashFlow = netIncome // Start with net income
  let investingCashFlow = 0
  let financingCashFlow = 0
  
  const lines: CashFlowLine[] = [
    { name: 'Net Income', amount: netIncome, category: 'operations' }
  ]
  
  // Analyze actual cash transactions to categorize flows
  const periodTransactions = transactions.filter(tx => {
    if (!startDate || !endDate) return true
    return tx.date >= startDate && tx.date <= endDate
  })
  
  // Categorize transactions into cash flow types
  periodTransactions.forEach(tx => {
    const account = accounts.find(acc => acc.id === tx.accountId)
    if (!account) return
    
    // Operating activities: revenue and expense transactions
    if (tx.category === 'Income' || tx.category === 'Expense') {
      // Already captured in net income, but track specific items
      if (tx.description.toLowerCase().includes('depreciation')) {
        lines.push({ name: 'Depreciation', amount: Math.abs(tx.amount), category: 'operations' })
        operatingCashFlow += Math.abs(tx.amount) // Add back non-cash expense
      }
    }
    
    // Investing activities: purchases/sales of assets
    else if (account.type === 'Asset' && !cashAccounts.find(ca => ca.id === account.id)) {
      if (tx.description.toLowerCase().includes('equipment') || 
          tx.description.toLowerCase().includes('investment') ||
          tx.description.toLowerCase().includes('asset')) {
        investingCashFlow += tx.amount
        lines.push({ 
          name: tx.description, 
          amount: tx.amount, 
          category: 'investing' 
        })
      }
    }
    
    // Financing activities: debt, equity transactions
    else if (account.type === 'Liability' || account.type === 'Equity') {
      if (tx.description.toLowerCase().includes('loan') ||
          tx.description.toLowerCase().includes('debt') ||
          tx.description.toLowerCase().includes('equity') ||
          tx.description.toLowerCase().includes('dividend')) {
        financingCashFlow += tx.amount
        lines.push({ 
          name: tx.description, 
          amount: tx.amount, 
          category: 'financing' 
        })
      }
    }
  })
  
  // Calculate net change in cash
  const netChange = operatingCashFlow + investingCashFlow + financingCashFlow
  const closingCash = openingCash + netChange
  
  return {
    sections: {
      operations: operatingCashFlow,
      investing: investingCashFlow,
      financing: financingCashFlow
    },
    netChange,
    lines,
    openingCash,
    closingCash
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
  const alias = period === 'ThisMonth' ? 'MTD' : period === 'ThisQuarter' ? 'QTD' : period
  const { start, end } = deriveRange(alias, qStart, qEnd) as { start: string | null; end: string | null }
  
  // Generate current period cash flow
  const currentCF = computeCashFlow(start, end)
  
  // Generate comparative cash flow if requested
  let prevCF: Omit<CashFlowData, 'period' | 'start' | 'end' | 'prev'> | null = null
  if (compare && start && end) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const periodLength = endDate.getTime() - startDate.getTime()
    
    // Calculate prior period dates
    const priorEndDate = new Date(startDate.getTime() - 1)
    const priorStartDate = new Date(priorEndDate.getTime() - periodLength)
    
    prevCF = computeCashFlow(
      priorStartDate.toISOString().slice(0, 10),
      priorEndDate.toISOString().slice(0, 10)
    )
  }
  
  const payload: CashFlowData = {
    period,
    start,
    end,
    ...currentCF,
    ...(prevCF && {
      prev: {
        sections: prevCF.sections,
        netChange: prevCF.netChange
      }
    })
  }

  return NextResponse.json(payload)
}
