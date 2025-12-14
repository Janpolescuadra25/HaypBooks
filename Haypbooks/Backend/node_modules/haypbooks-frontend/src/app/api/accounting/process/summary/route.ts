import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import { computeARAging, computeAPAging, computeTrialBalance, computeProfitLoss } from '@/mock/aggregations'

function iso(d: Date) { return d.toISOString().slice(0, 10) }

function normalizeRange(period?: string | null) {
  const p = period || 'YTD'
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
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

export async function GET(req: Request) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || 'YTD'
  const { start, end } = normalizeRange(period)
  const asOfIso = end
  const asOfDate = new Date(asOfIso + 'T00:00:00Z')

  // Accounts Receivable snapshot
  const { totals: arTotals } = computeARAging(asOfDate)
  const openInvoices = db.invoices.filter(inv => inv.status !== 'void' && inv.balance > 0).length
  let earliestInvoiceDue: string | null = null
  for (const inv of db.invoices) {
    if (inv.status === 'void' || inv.balance <= 0) continue
    const dueIso = (inv.dueDate || inv.date).slice(0,10)
    if (!earliestInvoiceDue || dueIso < earliestInvoiceDue) earliestInvoiceDue = dueIso
  }
  // Unapplied credits from credit memos
  const creditMemos: any[] = (db as any).creditMemos || []
  const unappliedCredits = creditMemos
    .filter(cm => (cm.date || '').slice(0,10) <= asOfIso)
    .reduce((s,cm) => s + Number(cm.remaining || 0), 0)
  // Undeposited (customer) payments
  const undeposited = [] as { amount: number; date: string }[]
  for (const inv of db.invoices) {
    for (const p of inv.payments) {
      if (p.fundSource === 'undeposited' && !p.depositId) undeposited.push({ amount: p.amount, date: p.date })
    }
  }
  const undepositedSummary = {
    count: undeposited.length,
    total: Number(undeposited.reduce((s,p)=>s + p.amount, 0).toFixed(2))
  }

  // Deposits: last 30 days
  const dayMs = 86400000
  const thirtyAgo = new Date(asOfDate.getTime() - 29 * dayMs)
  const depositsLast30 = (db.deposits || []).filter(d => (d.date || '') >= iso(thirtyAgo) && (d.date || '') <= asOfIso)
  const depositsSummary = {
    last30: {
      count: depositsLast30.length,
      total: Number(depositsLast30.reduce((s,d)=> s + Number(d.total || 0), 0).toFixed(2))
    },
    totalCount: (db.deposits || []).length
  }

  // Accounts Payable snapshot
  const { totals: apTotals } = computeAPAging(asOfDate)
  const openBills = db.bills.filter(b => b.status !== 'void' && b.balance > 0).length
  let earliestBillDue: string | null = null
  for (const b of db.bills) {
    if (b.status === 'void' || b.balance <= 0) continue
    const rawDue: any = (b as any).dueDate || (b as any).billDate || asOfIso
    const dueIso = String(rawDue).slice(0,10)
    if (!earliestBillDue || dueIso < earliestBillDue) earliestBillDue = dueIso
  }
  const vendorCredits: any[] = (db as any).vendorCredits || []
  const apCreditsRemaining = vendorCredits
    .filter(vc => (vc.date || '').slice(0,10) <= asOfIso)
    .reduce((s,vc) => s + Number(vc.remaining || 0), 0)

  // GL sanity (trial balance balanced?)
  const tb = computeTrialBalance({ start, end: asOfIso })
  // Profit & Loss for KPI derivation
  const pl = computeProfitLoss({ start, end: asOfIso })

  // Period settings
  const settings = db.settings || { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true }

  // KPI approximations: DSO/DPO using ending AR/AP and period revenue/expenses
  const daysInPeriod = Math.max(1, Math.floor((new Date(asOfIso + 'T00:00:00Z').getTime() - new Date(start + 'T00:00:00Z').getTime()) / 86400000) + 1)
  const revenuePerDay = pl.revenue > 0 ? (pl.revenue / daysInPeriod) : 0
  const expensesPerDay = pl.expenses > 0 ? (pl.expenses / daysInPeriod) : 0
  const dsoDays = revenuePerDay > 0 ? Number(((arTotals?.total || 0) / revenuePerDay).toFixed(1)) : null
  const dpoDays = expensesPerDay > 0 ? Number(((apTotals?.total || 0) / expensesPerDay).toFixed(1)) : null

  const payload = {
    asOf: asOfIso,
    period: { start, end: asOfIso },
    ar: {
      customers: (db.customers || []).length,
      openInvoices,
      openBalance: Number((arTotals?.total || 0).toFixed(2)),
      overdueBalance: Number((
        (arTotals?.['30'] || 0) + (arTotals?.['60'] || 0) + (arTotals?.['90'] || 0) + (arTotals?.['120+'] || 0)
      ).toFixed(2)),
      unappliedCredits: Number(unappliedCredits.toFixed(2)),
      nextDueDate: earliestInvoiceDue,
    },
    receipts: {
      undeposited: undepositedSummary,
      deposits: depositsSummary,
    },
    ap: {
      vendors: (db.vendors || []).length,
      openBills,
      openBalance: Number((apTotals?.total || 0).toFixed(2)),
      overdueBalance: Number((
        (apTotals?.['30'] || 0) + (apTotals?.['60'] || 0) + (apTotals?.['90'] || 0) + (apTotals?.['120+'] || 0)
      ).toFixed(2)),
      creditsAvailable: Number(apCreditsRemaining.toFixed(2)),
      nextDueDate: earliestBillDue,
    },
    gl: {
      trialBalanceBalanced: !!tb?.balanced,
      accounts: (db.accounts || []).length,
      journalEntries: (db.journalEntries || []).length,
    },
    kpis: {
      dsoDays,
      dpoDays,
    },
    settings: {
      accountingMethod: settings.accountingMethod,
      closeDate: settings.closeDate,
      allowBackdated: settings.allowBackdated,
    },
  }

  return NextResponse.json(payload)
}
