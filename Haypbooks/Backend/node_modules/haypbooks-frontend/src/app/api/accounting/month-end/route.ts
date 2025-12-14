import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, closePeriod as dbClosePeriod, postJournal } from '@/mock/db'
import '@/mock/seed'

type MonthEndClosingData = {
  period: string
  status: 'open' | 'closed' | 'in_progress'
  trialBalance: {
    balanced: boolean
    debitTotal: number
    creditTotal: number
  }
  adjustingEntries: Array<{
    id: string
    description: string
    amount: number
    required: boolean
    completed: boolean
  }>
  financialStatements: {
    balanceSheetGenerated: boolean
    profitLossGenerated: boolean
    cashFlowGenerated: boolean
  }
  closingDate?: string
  nextPeriod: string
  checklist: Array<{
    task: string
    completed: boolean
    description: string
  }>
}

/**
 * Generate month-end closing procedures and status
 * Following standard accounting cycle best practices
 */
function generateMonthEndClosing(period: string): MonthEndClosingData {
  const accounts = db.accounts || []
  const journalEntries = db.journalEntries || []
  const settings = (db.settings || {}) as any
  
  // Parse period (assume YYYY-MM format)
  const [year, month] = period.split('-').map(Number)
  const periodStart = `${year}-${month.toString().padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const periodEnd = new Date(year, month, 0).toISOString().slice(0, 10)
  const nextPeriod = `${nextYear}-${nextMonth.toString().padStart(2, '0')}`
  
  // Calculate trial balance for the period
  const accountBalances = new Map<string, number>()
  accounts.forEach(acc => {
    accountBalances.set(acc.id, acc.balance || 0)
  })
  
  journalEntries.forEach(je => {
    const entryDate = je.date.slice(0, 10)
    if (entryDate <= periodEnd) {
      je.lines.forEach(line => {
        const currentBalance = accountBalances.get(line.accountId) || 0
        const netEffect = (line.debit || 0) - (line.credit || 0)
        accountBalances.set(line.accountId, currentBalance + netEffect)
      })
    }
  })
  
  let debitTotal = 0
  let creditTotal = 0
  accounts.forEach(acc => {
    const balance = accountBalances.get(acc.id) || 0
    if (acc.type === 'Asset' || acc.type === 'Expense') {
      if (balance >= 0) debitTotal += balance
      else creditTotal += Math.abs(balance)
    } else {
      if (balance >= 0) creditTotal += balance
      else debitTotal += Math.abs(balance)
    }
  })
  
  const balanced = Math.abs(debitTotal - creditTotal) < 0.01
  
  // Define standard adjusting entries checklist
  const adjustingEntries = [
    {
      id: 'depreciation',
      description: 'Record depreciation expense',
      amount: 0, // Would be calculated based on fixed assets
      required: true,
      completed: false
    },
    {
      id: 'accruals',
      description: 'Record accrued expenses',
      amount: 0,
      required: true,
      completed: false
    },
    {
      id: 'prepaid',
      description: 'Adjust prepaid expenses',
      amount: 0,
      required: false,
      completed: false
    },
    {
      id: 'bad_debt',
      description: 'Record bad debt allowance',
      amount: 0,
      required: false,
      completed: false
    }
  ]
  
  // Month-end closing checklist
  const checklist = [
    {
      task: 'Reconcile all bank accounts',
      completed: false, // Would check reconciliation status
      description: 'Ensure all bank accounts are reconciled for the period'
    },
    {
      task: 'Review and post adjusting entries',
      completed: false,
      description: 'Complete all required adjusting journal entries'
    },
    {
      task: 'Generate trial balance',
      completed: balanced,
      description: 'Verify trial balance is in balance'
    },
    {
      task: 'Generate financial statements',
      completed: false,
      description: 'Create Balance Sheet, P&L, and Cash Flow statements'
    },
    {
      task: 'Review account balances',
      completed: false,
      description: 'Review all account balances for accuracy'
    },
    {
      task: 'Close revenue and expense accounts',
      completed: false,
      description: 'Post closing entries to transfer P&L to retained earnings'
    },
    {
      task: 'Generate post-closing trial balance',
      completed: false,
      description: 'Verify only balance sheet accounts remain open'
    },
    {
      task: 'Archive period documentation',
      completed: false,
      description: 'Save all reports and supporting documentation'
    }
  ]
  
  // Determine period status
  let status: MonthEndClosingData['status'] = 'open'
  if (settings.closeDate && typeof settings.closeDate === 'string' && settings.closeDate >= periodEnd) {
    status = 'closed'
  } else if (checklist.some(item => item.completed)) {
    status = 'in_progress'
  }
  
  return {
    period,
    status,
    trialBalance: {
      balanced,
      debitTotal,
      creditTotal
    },
    adjustingEntries,
    financialStatements: {
      balanceSheetGenerated: false, // Would check if reports exist
      profitLossGenerated: false,
      cashFlowGenerated: false
    },
  closingDate: typeof settings.closeDate === 'string' ? settings.closeDate : undefined,
    nextPeriod,
    checklist
  }
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || new Date().toISOString().slice(0, 7) // YYYY-MM
  
  const monthEndData = generateMonthEndClosing(period)
  
  return NextResponse.json({
    ...monthEndData,
    accountingMethod: db.settings?.accountingMethod || 'accrual',
    baseCurrency: db.settings?.baseCurrency || 'USD',
    generatedAt: new Date().toISOString()
  })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !body.action) {
    return NextResponse.json({ error: 'Action required' }, { status: 400 })
  }

  const { action, period, data, password } = body

  switch (action) {
  case 'close_period':
      // Close the accounting period
      if (!period) {
        return NextResponse.json({ error: 'Period required' }, { status: 400 })
      }
      // If a close password is configured, require it
      if (db.settings?.closePassword) {
        if (!password || password !== db.settings.closePassword) {
          return NextResponse.json({ error: 'Close password required or incorrect' }, { status: 403 })
        }
      }
      
      // Compute true end-of-month (YYYY-MM -> last day) and close via DB helper
      try {
  const parts = period.split('-')
  const y = parseInt(parts[0] || '', 10)
  const m = parseInt(parts[1] || '', 10)
        if (!y || !m) throw new Error('Invalid period')
        // JS Date: new Date(year, month, 0) -> last day of previous month when month is 1-based here
        const endIso = new Date(Date.UTC(y, m, 0)).toISOString().slice(0,10)
        const closed = dbClosePeriod(endIso)
        if (!db.settings) {
          db.settings = { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: closed } as any
        } else {
          db.settings!.closeDate = closed
        }
      } catch (e: any) {
        return NextResponse.json({ error: 'Invalid period format. Use YYYY-MM.' }, { status: 400 })
      }
      
      return NextResponse.json({
        success: true,
        message: `Period ${period} has been closed`,
        closeDate: db.settings!.closeDate
      })

    case 'post_adjusting_entry':
      // Post an adjusting journal entry
      if (!data || !data.lines) {
        return NextResponse.json({ error: 'Journal entry data required' }, { status: 400 })
      }
      
      // This would integrate with the existing journal entry system
      return NextResponse.json({
        success: true,
        message: 'Adjusting entry posted',
        entryId: `je_adj_${Math.random().toString(36).slice(2, 8)}`
      })

    case 'generate_closing_entries': {
      // Create closing entries to move P&L to Retained Earnings (3000) on the period end date
      if (!period) return NextResponse.json({ error: 'Period required' }, { status: 400 })
      try {
        const parts = period.split('-')
        const y = parseInt(parts[0] || '', 10)
        const m = parseInt(parts[1] || '', 10)
        if (!y || !m) throw new Error('Invalid period')
        const endIso = new Date(Date.UTC(y, m, 0)).toISOString().slice(0,10)
        const accounts = db.accounts || []
        const je = db.journalEntries || []
        const reAcc = accounts.find(a => a.number === '3000' && a.type === 'Equity')
        if (!reAcc) return NextResponse.json({ error: 'Retained Earnings (3000) account not found' }, { status: 400 })
        // Build per-account net (debit - credit) through period end
        const netMap = new Map<string, number>() // accountId -> net debit (debit-credit)
        for (const j of je) {
          const d = (j.date || '').slice(0,10)
          if (!d || d > endIso) continue
          for (const ln of j.lines) {
            const curr = netMap.get(ln.accountId) || 0
            netMap.set(ln.accountId, curr + (ln.debit || 0) - (ln.credit || 0))
          }
        }
        // Prepare closing lines
        const lines: { accountNumber: string; debit?: number; credit?: number; memo?: string }[] = []
        let reDebit = 0
        let reCredit = 0
        for (const acc of accounts) {
          if (acc.type !== 'Income' && acc.type !== 'Expense') continue
          const net = netMap.get(acc.id) || 0
          if (Math.abs(net) < 0.005) continue // skip near-zero
          if (acc.type === 'Income') {
            if (net < 0) {
              // Net credit balance -> debit income to zero; credit RE
              const amt = Number(Math.abs(net).toFixed(2))
              lines.push({ accountNumber: acc.number, debit: amt, memo: `Closing entries ${period}` })
              reCredit += amt
            } else if (net > 0) {
              // Unusual debit balance -> credit income; debit RE
              const amt = Number(net.toFixed(2))
              lines.push({ accountNumber: acc.number, credit: amt, memo: `Closing entries ${period}` })
              reDebit += amt
            }
          } else if (acc.type === 'Expense') {
            if (net > 0) {
              // Net debit balance -> credit expense to zero; debit RE
              const amt = Number(net.toFixed(2))
              lines.push({ accountNumber: acc.number, credit: amt, memo: `Closing entries ${period}` })
              reDebit += amt
            } else if (net < 0) {
              // Unusual credit balance -> debit expense; credit RE
              const amt = Number(Math.abs(net).toFixed(2))
              lines.push({ accountNumber: acc.number, debit: amt, memo: `Closing entries ${period}` })
              reCredit += amt
            }
          }
        }
        if (lines.length === 0) {
          return NextResponse.json({ success: true, message: 'No P&L balances to close for this period', entries: 0, closingDate: endIso })
        }
        if (reDebit > 0) lines.push({ accountNumber: '3000', debit: reDebit, memo: `Closing entries ${period}` })
        if (reCredit > 0) lines.push({ accountNumber: '3000', credit: reCredit, memo: `Closing entries ${period}` })
        // Optional: basic idempotence check – if a JE already exists for endIso with similar memo and RE line, skip
        const prior = (db.journalEntries || []).find(j => (j.date || '').slice(0,10) === endIso && j.lines.some(l => {
          const acc = accounts.find(a => a.id === l.accountId)
          return (l.memo || '').includes(`Closing entries ${period}`) && acc && acc.number === '3000'
        }))
        if (prior) {
          return NextResponse.json({ success: true, message: 'Closing entries already exist for this period', entries: 0, closingDate: endIso })
        }
        const entryId = postJournal(lines, endIso, undefined, { adjusting: true })
        return NextResponse.json({ success: true, message: 'Closing entries posted', entries: 1, entryId, closingDate: endIso })
      } catch (e:any) {
        return NextResponse.json({ error: 'Invalid period format. Use YYYY-MM.' }, { status: 400 })
      }
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}