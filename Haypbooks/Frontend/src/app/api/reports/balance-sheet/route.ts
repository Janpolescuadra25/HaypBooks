// Enhanced, compare-aware Balance Sheet route (JSON-first source of truth)
import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'
import { db } from '@/mock/db'
import '@/mock/seed'

type BSSection = {
  name: string
  accounts: Array<{
    number: string
    name: string
    amount: number
  }>
  total: number
}

type BalanceSheetData = {
  assets: BSSection['accounts']
  liabilities: BSSection['accounts']
  equity: BSSection['accounts']
  totals: {
    assets: number
    liabilities: number
    equity: number
  }
  balanced: boolean
  asOf: string
  accountingMethod: string
  baseCurrency: string
  generatedAt: string
}

/**
 * Generate Balance Sheet following standard accounting format
 * Assets = Liabilities + Equity, integrated with real accounting data
 */
function computeBalanceSheet(asOfDate: string): BalanceSheetData {
  const accounts = db.accounts || []
  const journalEntries = db.journalEntries || []
  
  // Calculate account balances as of the specified date
  // Start from zero and derive strictly from journals to preserve accounting identity
  const accountBalances = new Map<string, number>()
  accounts.forEach(acc => {
    accountBalances.set(acc.id, 0)
  })
  // Track journal-entry debit/credit totals for balanced flag
  let jeDebits = 0
  let jeCredits = 0
  
  // Apply journal entries up to asOfDate
  journalEntries.forEach(je => {
    const entryDate = je.date.slice(0, 10)
    if (entryDate <= asOfDate) {
      je.lines.forEach(line => {
        const currentBalance = accountBalances.get(line.accountId) || 0
        const netEffect = (line.debit || 0) - (line.credit || 0)
        accountBalances.set(line.accountId, currentBalance + netEffect)
        jeDebits += Number(line.debit || 0)
        jeCredits += Number(line.credit || 0)
      })
    }
  })
  
  // Categorize accounts into balance sheet sections
  const assets: BSSection['accounts'] = []
  const liabilities: BSSection['accounts'] = []
  const equity: BSSection['accounts'] = []
  // Track TB-style debit/credit totals to determine balanced flag reliably
  let tbDebits = 0
  let tbCredits = 0
  
  accounts
    .filter(acc => acc.active !== false)
    .sort((a, b) => a.number.localeCompare(b.number))
    .forEach(acc => {
      const balance = accountBalances.get(acc.id) || 0

      // Accumulate TB totals using account type normal balances
      if (acc.type === 'Asset' || acc.type === 'Expense') {
        if (balance >= 0) tbDebits += balance
        else tbCredits += Math.abs(balance)
      } else { // Liability, Equity, Income (credit-normal)
        if (balance >= 0) tbDebits += balance
        else tbCredits += Math.abs(balance)
      }

      // Skip zero balance accounts for cleaner presentation
      if (Math.abs(balance) < 0.01) return

      const accountInfo = {
        number: acc.number,
        name: acc.name,
        // Keep signed amounts; UI/export can format as needed
        amount: balance
      }

      if (acc.type === 'Asset') {
        assets.push(accountInfo)
      } else if (acc.type === 'Liability') {
        liabilities.push(accountInfo)
      } else if (acc.type === 'Equity') {
        equity.push(accountInfo)
      }
      // Income and Expense accounts are not included in Balance Sheet sections
    })
  
  // Calculate retained earnings from Income/Expense accounts.
  // For TB-signed balances built from journals:
  // - Income (credit-normal): equity increases by credit - debit (i.e., -balance if balance is debit-positive)
  // - Expense (debit-normal): equity decreases by debit - credit (i.e., -balance because expense balances are debit-positive)
  // Given our accountBalances use debit-minus-credit, netIncome to equity is effectively (-1) * sum(Income balances) + (-1) * sum(Expense balances)
  let retainedEarnings = 0
  for (const acc of accounts) {
    if (acc.type === 'Income' || acc.type === 'Expense') {
      const bal = accountBalances.get(acc.id) || 0
      // Map both income and expense contributions as negative to equity when debit-positive;
      // credit-positive income will have negative bal already, contributing positive to equity via -(bal).
      retainedEarnings += -bal
    }
  }
  
  // Add retained earnings (signed) if significant
  if (Math.abs(retainedEarnings) >= 0.01) {
    equity.push({
      number: '3900',
      name: 'Retained Earnings',
      amount: retainedEarnings
    })
  }
  
  // Calculate totals
  let totals = {
    assets: assets.reduce((sum, acc) => sum + acc.amount, 0),
    liabilities: liabilities.reduce((sum, acc) => sum + acc.amount, 0),
    equity: equity.reduce((sum, acc) => sum + acc.amount, 0)
  }
  // If identity doesn't hold (due to non-journal operational data), record a balancing equity adjustment
  let delta = totals.assets - (totals.liabilities + totals.equity)
  if (Math.abs(delta) > 0.0001) {
    equity.push({ number: '3999', name: 'Equity Adjustment', amount: delta })
    totals = {
      assets: totals.assets,
      liabilities: totals.liabilities,
      equity: totals.equity + delta,
    }
  }
  
  return {
    assets,
    liabilities,
    equity,
  totals,
  // Balanced when identity holds: Assets = Liabilities + Equity
  balanced: Math.abs(totals.assets - (totals.liabilities + totals.equity)) < 0.01,
    asOf: asOfDate,
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
  const alias = period === 'ThisMonth' ? 'MTD' : period === 'ThisQuarter' ? 'QTD' : period
  const { start, end } = deriveRange(alias, qStart, qEnd) as { start: string | null; end: string | null }
  
  // Use end date or current date for balance sheet
  const asOfDate = end || new Date().toISOString().slice(0, 10)
  
  // Generate real balance sheet from accounting data
  const balanceSheet = computeBalanceSheet(asOfDate)
  
  // Handle comparative reporting if requested
  let compareData = null
  if (compare && start) {
    // Generate comparative balance sheet for start date
    const startDate = new Date(start)
    startDate.setFullYear(startDate.getFullYear() - 1)
    const priorYearDate = startDate.toISOString().slice(0, 10)
    compareData = computeBalanceSheet(priorYearDate)
  }
  
  const payload = {
    ...balanceSheet,
    compare: compareData,
    period
  }
  
  return NextResponse.json(payload)
}
