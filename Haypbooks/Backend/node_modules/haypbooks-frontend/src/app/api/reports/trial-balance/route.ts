import { NextResponse } from 'next/server'
import { deriveRange } from '@/lib/report-helpers'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db } from '@/mock/db'
import '@/mock/seed'

type TBRow = { 
  number: string
  name: string
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'
  debit: number
  credit: number
  balance: number
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Compute Trial Balance based on actual account balances and journal entries
 * This provides a true accounting trial balance that reflects all transactions
 */
function computeTrialBalance(asOfDate?: string): { rows: TBRow[]; totals: { debit: number; credit: number }; balanced: boolean } {
  const accounts = db.accounts || []
  const journalEntries = db.journalEntries || []
  
  // Initialize account balances from zero; derive balances strictly from journals
  // This avoids double-counting any operational transaction tallies stored on accounts
  const accountBalances = new Map<string, number>()
  accounts.forEach(acc => {
    accountBalances.set(acc.id, 0)
  })
  
  // Apply journal entries up to asOfDate
  journalEntries.forEach(je => {
    const entryDate = je.date.slice(0, 10)
    if (!asOfDate || entryDate <= asOfDate) {
      je.lines.forEach(line => {
        const currentBalance = accountBalances.get(line.accountId) || 0
        const netEffect = (line.debit || 0) - (line.credit || 0)
        accountBalances.set(line.accountId, currentBalance + netEffect)
      })
    }
  })
  
  // Build trial balance rows with proper debit/credit presentation
  const rows: TBRow[] = []
  
  accounts
    .filter(acc => acc.active !== false) // Only include active accounts
    .sort((a, b) => a.number.localeCompare(b.number)) // Sort by account number
    .forEach(acc => {
      const balance = accountBalances.get(acc.id) || 0
      
      // Determine debit/credit presentation based on account type and balance
      let debit = 0
      let credit = 0
      
      // Normal balance sides for account types:
      // Assets & Expenses: Debit normal (positive = debit, negative = credit)
      // Liabilities, Equity & Income: Credit normal (positive = credit, negative = debit)
      if (acc.type === 'Asset' || acc.type === 'Expense') {
        if (balance >= 0) {
          debit = balance
        } else {
          credit = Math.abs(balance)
        }
      } else { // Liability, Equity, Income (credit-normal)
        if (balance >= 0) {
          // Net debit balance on a credit-normal account shows in Debit column
          debit = balance
        } else {
          // Net credit balance shows in Credit column
          credit = Math.abs(balance)
        }
      }
      
      // Only include accounts with non-zero balances in trial balance
      if (debit !== 0 || credit !== 0) {
        rows.push({
          number: acc.number,
          name: acc.name,
          type: acc.type,
          debit,
          credit,
          balance
        })
      }
    })
  
  // Calculate totals
  const totals = rows.reduce(
    (acc, row) => {
      acc.debit += row.debit
      acc.credit += row.credit
      return acc
    },
    { debit: 0, credit: 0 }
  )
  
  return {
    rows,
    totals,
    balanced: Math.abs(totals.debit - totals.credit) < 0.01 // Allow for small rounding differences
  }
}

export async function GET(req: Request) {
  // Check permissions for financial reports
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  // Align semantics with core statements: treat ThisMonth as MTD and ThisQuarter as QTD
  const alias = period === 'ThisMonth' ? 'MTD' : period === 'ThisQuarter' ? 'QTD' : period
  const startQ = url.searchParams.get('start') || undefined
  const endQ = url.searchParams.get('end') || undefined
  const dr = deriveRange(alias, startQ, endQ)
  const start = dr.start || startQ
  const end = dr.end || endQ
  
  // For trial balance, we typically use the end date as "as of" date
  const asOfDate = end || todayIso()
  
  // Compute actual trial balance from accounting data
  const trialBalance = computeTrialBalance(asOfDate)

  const payload = {
    period,
    start: start || null,
    end: end || null,
    asOf: asOfDate,
    rows: trialBalance.rows,
    totals: trialBalance.totals,
    balanced: trialBalance.balanced,
    // Additional metadata for accounting compliance
    accountingMethod: db.settings?.accountingMethod || 'accrual',
    baseCurrency: db.settings?.baseCurrency || 'USD',
    generatedAt: new Date().toISOString()
  }
  
  return NextResponse.json(payload)
}
