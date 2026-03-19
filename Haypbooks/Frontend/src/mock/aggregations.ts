import { db } from './db'

interface DateRange { start?: string; end?: string }

function inRange(dateIso: string, { start, end }: DateRange): boolean {
  if (start && dateIso.slice(0,10) < start) return false
  if (end && dateIso.slice(0,10) > end) return false
  return true
}

export function computeProfitLoss(range: DateRange) {
  let revenue = 0
  let expenses = 0
  for (const t of db.transactions) {
    if (!inRange(t.date, range)) continue
    if (t.category === 'Income') revenue += t.amount
    else if (t.category === 'Expense') expenses += Math.abs(t.amount)
  }
  const cogs = 0 // placeholder until item / account classification
  const grossProfit = revenue - cogs
  const operatingIncome = grossProfit - expenses
  const otherIncome = 0
  const netIncome = operatingIncome + otherIncome
  return {
    revenue, cogs, grossProfit, expenses, operatingIncome, otherIncome, netIncome,
    lines: [
      { name: 'Revenue', amount: revenue },
      { name: 'Cost of Goods Sold', amount: -cogs },
      { name: 'Gross Profit', amount: grossProfit },
      { name: 'Operating Expenses', amount: -expenses },
      { name: 'Operating Income', amount: operatingIncome },
      { name: 'Other Income', amount: otherIncome },
      { name: 'Net Income', amount: netIncome },
    ]
  }
}

export function computeTrialBalance(range: DateRange) {
  // Accumulate from journal entries if present; fallback to transactions for cash if no journals
  let map: Record<string,{ name: string; debit: number; credit: number }> = {}
  if (db.journalEntries && db.journalEntries.length) {
    for (const je of db.journalEntries) {
      if (!inRange(je.date, range)) continue
      for (const l of je.lines) {
        const acc = db.accounts.find(a => a.id === l.accountId)
        if (!acc) continue
        const key = acc.number
        if (!map[key]) map[key] = { name: acc.name, debit: 0, credit: 0 }
        map[key].debit += l.debit
        map[key].credit += l.credit
      }
    }
  } else {
    // Legacy fallback
    for (const t of db.transactions) {
      if (!inRange(t.date, range)) continue
      if (t.category === 'Income') {
        // Cash DR already implied; represent as credit to revenue
        const cash = '1000'; const rev = '4000'
        if (!map[cash]) map[cash] = { name: 'Cash', debit: 0, credit: 0 }
        if (!map[rev]) map[rev] = { name: 'Sales Revenue', debit: 0, credit: 0 }
        map[cash].debit += t.amount
        map[rev].credit += t.amount
      } else if (t.category === 'Expense') {
        const cash = '1000'; const exp = '6000'
        if (!map[cash]) map[cash] = { name: 'Cash', debit: 0, credit: 0 }
        if (!map[exp]) map[exp] = { name: 'Operating Expenses', debit: 0, credit: 0 }
        map[exp].debit += Math.abs(t.amount)
        map[cash].credit += Math.abs(t.amount)
      } else if (t.category === 'Transfer') {
        // Ignore for simplified trial balance
      }
    }
  }
  const rows: { number: string; name: string; debit: number; credit: number }[] = []
  for (const [number, v] of Object.entries(map)) {
    if (v.debit === 0 && v.credit === 0) continue
    rows.push({ number, name: v.name, debit: v.debit, credit: v.credit })
  }
  const totals = rows.reduce((acc, r) => ({ debit: acc.debit + r.debit, credit: acc.credit + r.credit }), { debit: 0, credit: 0 })
  if (totals.debit !== totals.credit) {
    const delta = totals.debit - totals.credit
    if (delta > 0) rows.push({ number: '3000', name: 'Retained Earnings', debit: 0, credit: delta })
    else rows.push({ number: '3000', name: 'Retained Earnings', debit: -delta, credit: 0 })
  }
  const finalTotals = rows.reduce((acc, r) => ({ debit: acc.debit + r.debit, credit: acc.credit + r.credit }), { debit: 0, credit: 0 })
  return { rows, totals: finalTotals, balanced: finalTotals.debit === finalTotals.credit }
}

export function computeBalanceSheet(range: DateRange) {
  // Basic derivation including AR & AP from open invoices/bills plus cash and retained earnings proxy
  const pl = computeProfitLoss(range)
  let cash = 0
  for (const t of db.transactions) {
    if (!inRange(t.date, range)) continue
    cash += t.amount
  }
  // Accounts Receivable: invoice balances where date in range
  let ar = 0
  for (const inv of db.invoices) {
    if (!inRange(inv.date, range)) continue
    ar += inv.balance
  }
  // Accounts Payable: bill balances where dueDate in range
  let ap = 0
  for (const bill of db.bills) {
    if (!inRange(bill.dueDate, range)) continue
    ap += bill.balance
  }
  const assets = [
    { name: 'Cash', amount: cash },
    { name: 'Accounts Receivable', amount: ar }
  ]
  const liabilities: { name: string; amount: number }[] = []
  if (ap !== 0) liabilities.push({ name: 'Accounts Payable', amount: ap })
  const equity = [{ name: 'Retained Earnings', amount: pl.netIncome }]
  const totalAssets = assets.reduce((s,a)=>s+a.amount,0)
  const totalLiab = liabilities.reduce((s,l)=>s+l.amount,0)
  let equityTotal = equity.reduce((s,e)=>s+e.amount,0)
  const delta = totalAssets - (totalLiab + equityTotal)
  if (Math.abs(delta) > 0.0001) { equity[0].amount += delta; equityTotal += delta }
  return { assets, liabilities, equity, totals: { assets: totalAssets, liabilities: totalLiab, equity: equityTotal }, balanced: Math.abs(totalAssets - (totalLiab + equityTotal)) < 0.01 }
}

// Adjusted Trial Balance computation: derive unadjusted (non-adjusting), adjustments (adjusting & non-reversing), final
export function computeAdjustedTrialBalance(range: DateRange) {
  const map: Record<string, { name: string; unadjDebit: number; unadjCredit: number; adjDebit: number; adjCredit: number }> = {}
  for (const je of db.journalEntries || []) {
    if (!inRange(je.date, range)) continue
    for (const l of je.lines) {
      const acc = db.accounts.find(a => a.id === l.accountId)
      if (!acc) continue
      const slot = map[acc.number] || { name: acc.name, unadjDebit: 0, unadjCredit: 0, adjDebit: 0, adjCredit: 0 }
      if (je.adjusting && !je.reversing) {
        slot.adjDebit += l.debit
        slot.adjCredit += l.credit
      } else if (!je.adjusting) {
        slot.unadjDebit += l.debit
        slot.unadjCredit += l.credit
      } else if (je.adjusting && je.reversing) {
        // Reversing entries conceptually impact current period 'unadjusted opening'; include in unadj for simplicity
        slot.unadjDebit += l.debit
        slot.unadjCredit += l.credit
      }
      map[acc.number] = slot
    }
  }
  const rows = Object.entries(map).map(([number, v]) => {
    const finalDebit = v.unadjDebit + v.adjDebit
    const finalCredit = v.unadjCredit + v.adjCredit
    // Spread after to preserve computed fields clarity
    return { number, name: v.name, unadjDebit: v.unadjDebit, unadjCredit: v.unadjCredit, adjDebit: v.adjDebit, adjCredit: v.adjCredit, finalDebit, finalCredit }
  })
  // Balance check & retained earnings plug if needed for final columns only (unadjusted may be off if no entries posted)
  let totalFinalDebit = 0, totalFinalCredit = 0
  for (const r of rows) { totalFinalDebit += r.finalDebit; totalFinalCredit += r.finalCredit }
  if (totalFinalDebit !== totalFinalCredit) {
    const number = '3999'
    const name = 'Balancing / Retained Earnings'
    const diff = totalFinalDebit - totalFinalCredit
    if (diff > 0) rows.push({ number, name, unadjDebit: 0, unadjCredit: 0, adjDebit: 0, adjCredit: 0, finalDebit: 0, finalCredit: diff })
    else rows.push({ number, name, unadjDebit: 0, unadjCredit: 0, adjDebit: 0, adjCredit: 0, finalDebit: -diff, finalCredit: 0 })
  }
  const totals = rows.reduce((acc, r: any) => {
    acc.unadjDebit += r.unadjDebit; acc.unadjCredit += r.unadjCredit; acc.adjDebit += r.adjDebit; acc.adjCredit += r.adjCredit; acc.finalDebit += r.finalDebit; acc.finalCredit += r.finalCredit; return acc
  }, { unadjDebit: 0, unadjCredit: 0, adjDebit: 0, adjCredit: 0, finalDebit: 0, finalCredit: 0 })
  const balanced = totals.finalDebit === totals.finalCredit
  return { rows, totals, balanced }
}

// Aging helpers (simple bucket logic based on invoice.date / bill.dueDate)
interface AgingRow { name: string; current: number; 30: number; 60: number; 90: number; '120+': number; total: number }
export interface AgingDetailRow { id: string; number: string; type: 'invoice' | 'bill'; date: string; dueDate: string; daysPastDue: number; balance: number; bucket: string }
const bucketsOrder = ['current','30','60','90','120+'] as const

function bucketForAge(days: number) {
  if (days <= 0) return 'current'
  if (days <= 30) return '30'
  if (days <= 60) return '60'
  if (days <= 90) return '90'
  return '120+'
}

export function computeARAging(asOf: Date, opts?: { detail?: boolean; customerId?: string }) {
  const map = new Map<string, any>()
  const details: AgingDetailRow[] = []
  for (const inv of db.invoices) {
    if (inv.balance <= 0) continue
    if (inv.status === 'draft') continue // drafts excluded
    if (opts?.customerId && inv.customerId !== opts.customerId) continue
    const rawDue = inv.dueDate || inv.date
    const due = new Date(rawDue)
    if (isNaN(due.valueOf())) continue
    const pastDueDays = Math.max(0, Math.floor((asOf.getTime() - due.getTime()) / 86400000))
    const includeInCurrentEvenIfFuture = due > asOf
    const ageForBucket = includeInCurrentEvenIfFuture ? 0 : pastDueDays
    const bucket = bucketForAge(ageForBucket)
    const custName = db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId
    const row = map.get(custName) || { name: custName, current:0, 30:0, 60:0, 90:0, '120+':0 }
    row[bucket] += inv.balance
    map.set(custName, row)
    if (opts?.detail) {
      details.push({ id: inv.id, number: inv.number, type: 'invoice', date: inv.date, dueDate: rawDue, daysPastDue: pastDueDays, balance: inv.balance, bucket })
    }
  }
  const rows: AgingRow[] = Array.from(map.values())
    .map(r => ({ ...r, total: r.current + r['30'] + r['60'] + r['90'] + r['120+'] }))
    .sort((a,b) => String(a.name).localeCompare(String(b.name)))
  const totals = rows.reduce((acc:any,r)=>{ for (const b of bucketsOrder) acc[b]=(acc[b]||0)+r[b]; acc.total=(acc.total||0)+r.total; return acc }, {} as any)
  return { rows, totals, details: opts?.detail ? details : undefined }
}

export function computeAPAging(asOf: Date, opts?: { detail?: boolean; vendorId?: string }) {
  const map = new Map<string, any>()
  const details: AgingDetailRow[] = []
  const asOfIso = asOf.toISOString().slice(0,10)
  for (const bill of db.bills) {
    // Compute open balance as of asOf date (exclude payments/credits posted after as-of)
    const paidUpTo = (bill.payments || []).filter(p => p.date && p.date.slice(0,10) <= asOfIso).reduce((s,p)=> s + (Number(p.amount)||0), 0)
    const balanceAsOf = Math.max(0, Number(((Number(bill.total)||0) - paidUpTo).toFixed(2)))
    if (balanceAsOf <= 0) continue
    if (opts?.vendorId && bill.vendorId !== opts.vendorId) continue
    const due = new Date(bill.dueDate)
    if (isNaN(due.valueOf())) continue
    const pastDueDays = Math.max(0, Math.floor((asOf.getTime() - due.getTime()) / 86400000))
    const includeInCurrentEvenIfFuture = due > asOf
    const ageForBucket = includeInCurrentEvenIfFuture ? 0 : pastDueDays
    const bucket = bucketForAge(ageForBucket)
    const venName = db.vendors.find(v => v.id === bill.vendorId)?.name || bill.vendorId
    const row = map.get(venName) || { name: venName, current:0, 30:0, 60:0, 90:0, '120+':0 }
    row[bucket] += balanceAsOf
    map.set(venName, row)
    if (opts?.detail) {
      details.push({ id: bill.id, number: bill.number, type: 'bill', date: bill.dueDate, dueDate: bill.dueDate, daysPastDue: pastDueDays, balance: balanceAsOf, bucket })
    }
  }
  const rows: AgingRow[] = Array.from(map.values())
    .map(r => ({ ...r, total: r.current + r['30'] + r['60'] + r['90'] + r['120+'] }))
    .sort((a,b) => String(a.name).localeCompare(String(b.name)))
  const totals = rows.reduce((acc:any,r)=>{ for (const b of bucketsOrder) acc[b]=(acc[b]||0)+r[b]; acc.total=(acc.total||0)+r.total; return acc }, {} as any)
  return { rows, totals, details: opts?.detail ? details : undefined }
}

export function listUnpaidBills(range: DateRange) {
  // Return bills with balance > 0 (open or scheduled or approval states) in date range
  const rows = db.bills.filter(b => b.balance > 0 && inRange(b.dueDate, range)).map(b => {
    const vendorName = db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId
    return {
      vendor: vendorName,
      number: b.number,
      billDate: (b as any).billDate || b.dueDate,
      dueDate: b.dueDate,
      terms: (b as any).terms || 'Due on receipt',
      amountDue: b.balance,
    }
  })
  const totals = rows.reduce((acc, r) => { acc.amountDue += r.amountDue; return acc }, { amountDue: 0 })
  return { rows, totals }
}

// ---------------- Customer Statement (A/R) ----------------
export interface CustomerStatementLineBase { id: string; date: string; type: string; description: string; amount: number; impact: number; runningBalance: number }
export interface CustomerStatementInvoiceLine extends CustomerStatementLineBase { type: 'invoice'; number: string; dueDate?: string; invoiceBalance: number }
export interface CustomerStatementPaymentLine extends CustomerStatementLineBase { type: 'payment'; appliedToInvoiceId?: string; appliedToInvoiceNumber?: string }
export interface CustomerStatementCreditMemoLine extends CustomerStatementLineBase { type: 'credit_memo'; number: string; remaining: number }
export type CustomerStatementLine = CustomerStatementInvoiceLine | CustomerStatementPaymentLine | CustomerStatementCreditMemoLine

export function computeCustomerStatement(customerId: string, asOf: Date, opts?: { start?: Date | null; type?: 'balance-forward' | 'transaction' | 'open-item' }) {
  // Collect relevant AR impacting entities up to asOf date.
  const lines: CustomerStatementLine[] = []
  const asOfIso = asOf.toISOString().slice(0,10)
  const start: Date | null = opts?.start ?? null
  const startIso: string | null = start ? start.toISOString().slice(0,10) : null
  const type = opts?.type || null
  // Invoices
  for (const inv of db.invoices) {
    if (inv.customerId !== customerId) continue
    if (inv.date.slice(0,10) > asOfIso) continue
    // Determine payments applied up to asOf
    const paymentsUpTo = inv.payments.filter(p => p.date.slice(0,10) <= asOfIso)
    const paidAmount = paymentsUpTo.reduce((s,p)=>s+p.amount,0)
    const invoiceBalanceAsOf = Math.max(0, inv.total - paidAmount)
    // Transaction filtering by type
    const includeByType = ((): { includeInvoice: boolean; includePayments: boolean } => {
      // Default (null type): include full history up to as-of (legacy behavior)
      if (!type) return { includeInvoice: true, includePayments: true }
      if (type === 'open-item') {
        // Only include invoices that still have a balance as of the as-of date; omit payments/credits
        return { includeInvoice: invoiceBalanceAsOf > 0, includePayments: false }
      }
      // For ranged types, include only if within the window [start, asOf]
      if (type === 'transaction' || type === 'balance-forward') {
        const inWindow = startIso ? (inv.date.slice(0,10) >= startIso && inv.date.slice(0,10) <= asOfIso) : (inv.date.slice(0,10) <= asOfIso)
        return { includeInvoice: inWindow, includePayments: true }
      }
      return { includeInvoice: true, includePayments: true }
    })()

    if (includeByType.includeInvoice) {
      lines.push({
        id: inv.id,
        date: inv.date,
        type: 'invoice',
        description: `Invoice ${inv.number}`,
        number: inv.number,
        dueDate: inv.dueDate,
        amount: inv.total,
        impact: inv.total, // increases A/R
        invoiceBalance: invoiceBalanceAsOf,
        runningBalance: 0, // placeholder, compute later
      } as CustomerStatementInvoiceLine)
    }
    // Individual payment lines (only those up to asOf)
    if (includeByType.includePayments) {
      for (const p of paymentsUpTo) {
        // For ranged types, only include payments inside the window when start is provided
        const pIso = p.date.slice(0,10)
        const includePayment = !startIso || (pIso >= startIso && pIso <= asOfIso)
        if (!includePayment) continue
        lines.push({
          id: p.id,
          date: p.date,
          type: 'payment',
          description: `Payment applied to ${inv.number}`,
          appliedToInvoiceId: inv.id,
          appliedToInvoiceNumber: inv.number,
          amount: -p.amount,
          impact: -p.amount, // reduces A/R
          runningBalance: 0,
        } as CustomerStatementPaymentLine)
      }
    }
  }
  // Credit memos
  const creditMemos: any[] = (db as any).creditMemos || []
  for (const cm of creditMemos) {
    if (cm.customerId !== customerId) continue
    if (cm.date.slice(0,10) > asOfIso) continue
    // Include credits according to type
    let includeCredit = true
    if (type === 'open-item') includeCredit = false
    if ((type === 'transaction' || type === 'balance-forward') && startIso) includeCredit = cm.date.slice(0,10) >= startIso
    if (includeCredit) {
      lines.push({
        id: cm.id,
        date: cm.date,
        type: 'credit_memo',
        description: `Credit Memo ${cm.number}`,
        number: cm.number,
        remaining: cm.remaining,
        amount: -cm.total,
        impact: -cm.total,
        runningBalance: 0,
      } as CustomerStatementCreditMemoLine)
    }
  }
  // Sort lines deterministically:
  // 1) date asc
  // 2) type order (invoice, credit_memo, payment) for same day
  // 3) tie-break by business identifier (number) or id to maintain stable same-day ordering
  const typeOrder: Record<string, number> = { 'invoice': 0, 'credit_memo': 1, 'payment': 2 }
  lines.sort((a,b) => {
    const d = a.date.localeCompare(b.date)
    if (d !== 0) return d
    const t = (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9)
    if (t !== 0) return t
    // Prefer human-facing numbers when available, fall back to ids
    const aKey = (a as any).number || a.id || ''
    const bKey = (b as any).number || b.id || ''
    return String(aKey).localeCompare(String(bKey))
  })
  // Compute opening balance for balance-forward when a start date is provided
  let openingBalance = 0
  if (type === 'balance-forward' && startIso) {
    // Sum all impacts strictly before the start date
    let priorImpact = 0
    // Walk through all historical items prior to start date
    // Invoices
    for (const inv of db.invoices) {
      if (inv.customerId !== customerId) continue
      const invIso = inv.date.slice(0,10)
      if (invIso < startIso) priorImpact += inv.total
      for (const p of inv.payments) {
        const pIso = p.date.slice(0,10)
        if (pIso < startIso) priorImpact -= p.amount
      }
    }
    // Credit memos
    for (const cm of creditMemos) {
      if (cm.customerId !== customerId) continue
      const cmIso = cm.date.slice(0,10)
      if (cmIso < startIso) priorImpact -= cm.total
    }
    openingBalance = Number(priorImpact.toFixed(2))
    // Add a synthetic Balance Forward line at start date
    lines.unshift({
      id: `bf_${customerId}_${startIso}`,
      date: startIso,
      type: 'invoice', // display as positive balance line
      description: 'Balance Forward',
      amount: openingBalance,
      impact: openingBalance,
      runningBalance: 0,
    } as any)
  }

  // Compute running balance
  let running = 0
  for (const l of lines) {
    running += l.impact
    l.runningBalance = Number(running.toFixed(2))
  }
  const totals = lines.reduce((acc, l) => {
    if (l.type === 'invoice') acc.invoices += l.amount
    if (l.type === 'payment') acc.payments += l.amount
    if (l.type === 'credit_memo') acc.credits += l.amount
    acc.net = acc.invoices + acc.payments + acc.credits
    return acc
  }, { invoices: 0, payments: 0, credits: 0, net: 0 })
  // Aging snapshot for outstanding invoices only as of date
  const { rows: agingRows, totals: agingTotals } = computeARAging(asOf, { customerId })
  return { customerId, asOf: asOfIso, lines, totals, aging: { rows: agingRows, totals: agingTotals } }
}

// ---------------- Vendor Statement (A/P) ----------------
export interface VendorStatementLineBase { id: string; date: string; type: string; description: string; amount: number; impact: number; runningBalance: number }
export interface VendorStatementBillLine extends VendorStatementLineBase { type: 'bill'; number: string; dueDate?: string; billBalance: number }
export interface VendorStatementPaymentLine extends VendorStatementLineBase { type: 'payment'; appliedToBillId?: string; appliedToBillNumber?: string }
export interface VendorStatementCreditLine extends VendorStatementLineBase { type: 'vendor_credit'; number: string; remaining: number }
export type VendorStatementLine = VendorStatementBillLine | VendorStatementPaymentLine | VendorStatementCreditLine

export function computeVendorStatement(vendorId: string, asOf: Date, opts?: { start?: Date | null; type?: 'balance-forward' | 'transaction' | 'open-item' }) {
  const lines: VendorStatementLine[] = []
  const asOfIso = asOf.toISOString().slice(0,10)
  const start: Date | null = opts?.start ?? null
  const startIso: string | null = start ? start.toISOString().slice(0,10) : null
  const type = opts?.type || null
  // Bills up to as-of
  for (const bill of db.bills) {
    if (bill.vendorId !== vendorId) continue
    const billIso = (bill.billDate || bill.dueDate || bill.billDate)!.slice(0,10)
    if (billIso > asOfIso) continue
    // Payments up to as-of
    const paysUpTo = (bill.payments || []).filter(p => (p.date || '').slice(0,10) <= asOfIso)
    const paidAmt = paysUpTo.reduce((s,p)=> s + (Number(p.amount)||0), 0)
    const billBalanceAsOf = Math.max(0, Number(((Number(bill.total)||0) - paidAmt).toFixed(2)))
    // Determine inclusion by type selection
    const includeByType = ((): { includeBill: boolean; includePayments: boolean } => {
      if (!type) return { includeBill: true, includePayments: true }
      if (type === 'open-item') {
        return { includeBill: billBalanceAsOf > 0, includePayments: false }
      }
      if (type === 'transaction' || type === 'balance-forward') {
        const inWindow = startIso ? (billIso >= startIso && billIso <= asOfIso) : (billIso <= asOfIso)
        return { includeBill: inWindow, includePayments: true }
      }
      return { includeBill: true, includePayments: true }
    })()

    if (includeByType.includeBill) {
      lines.push({
        id: bill.id,
        date: billIso,
        type: 'bill',
        description: `Bill ${bill.number}`,
        number: bill.number,
        dueDate: bill.dueDate,
        amount: Number(bill.total)||0,
        impact: Number(bill.total)||0, // increases A/P
        billBalance: billBalanceAsOf,
        runningBalance: 0,
      } as VendorStatementBillLine)
    }
    if (includeByType.includePayments) {
      for (const p of paysUpTo) {
        const pIso = String(p.date || '').slice(0,10)
        const includePayment = !startIso || (pIso >= startIso && pIso <= asOfIso)
        if (!includePayment) continue
        lines.push({
          id: p.id,
          date: p.date,
          type: 'payment',
          description: `Payment applied to ${bill.number}`,
          appliedToBillId: bill.id,
          appliedToBillNumber: bill.number,
          amount: -Number(p.amount)||0,
          impact: -Number(p.amount)||0, // reduces A/P
          runningBalance: 0,
        } as VendorStatementPaymentLine)
      }
    }
  }
  // Vendor credits up to as-of
  const vendorCredits: any[] = (db as any).vendorCredits || []
  for (const vc of vendorCredits) {
    if (vc.vendorId !== vendorId) continue
    const vcIso = String(vc.date || '').slice(0,10)
    if (vcIso > asOfIso) continue
    let includeCredit = true
    if (type === 'open-item') includeCredit = false
    if ((type === 'transaction' || type === 'balance-forward') && startIso) includeCredit = vcIso >= startIso
    if (includeCredit) {
      lines.push({
        id: vc.id,
        date: vcIso,
        type: 'vendor_credit',
        description: `Vendor Credit ${vc.number}`,
        number: vc.number,
        remaining: Number(vc.remaining)||0,
        amount: -Number(vc.total)||0,
        impact: -Number(vc.total)||0, // reduces A/P
        runningBalance: 0,
      } as VendorStatementCreditLine)
    }
  }
  // Stable ordering: date asc, then bill -> vendor_credit -> payment, then human identifier/ids
  const typeOrder: Record<string, number> = { 'bill': 0, 'vendor_credit': 1, 'payment': 2 }
  lines.sort((a,b) => {
    const d = a.date.localeCompare(b.date)
    if (d !== 0) return d
    const t = (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9)
    if (t !== 0) return t
    const aKey = (a as any).number || a.id || ''
    const bKey = (b as any).number || b.id || ''
    return String(aKey).localeCompare(String(bKey))
  })
  // Balance forward opening line if requested
  if (type === 'balance-forward' && startIso) {
    let priorImpact = 0
    for (const bill of db.bills) {
      if (bill.vendorId !== vendorId) continue
      const bIso = String(bill.billDate || bill.dueDate || '').slice(0,10)
      if (bIso && bIso < startIso) priorImpact += Number(bill.total)||0
      for (const p of (bill.payments || [])) {
        const pIso = String(p.date || '').slice(0,10)
        if (pIso && pIso < startIso) priorImpact -= Number(p.amount)||0
      }
    }
    for (const vc of vendorCredits) {
      if (vc.vendorId !== vendorId) continue
      const vcIso = String(vc.date || '').slice(0,10)
      if (vcIso && vcIso < startIso) priorImpact -= Number(vc.total)||0
    }
    const opening = Number(priorImpact.toFixed(2))
    lines.unshift({
      id: `bf_${vendorId}_${startIso}`,
      date: startIso,
      type: 'bill', // represent as positive balance line
      description: 'Balance Forward',
      amount: opening,
      impact: opening,
      runningBalance: 0,
    } as any)
  }

  // Running balance
  let running = 0
  for (const l of lines) { running += l.impact; l.runningBalance = Number(running.toFixed(2)) }
  const totals = lines.reduce((acc, l) => {
    if (l.type === 'bill') acc.bills += l.amount
    if (l.type === 'payment') acc.payments += l.amount
    if (l.type === 'vendor_credit') acc.credits += l.amount
    acc.net = acc.bills + acc.payments + acc.credits
    return acc
  }, { bills: 0, payments: 0, credits: 0, net: 0 })
  const { rows: agingRows, totals: agingTotals } = computeAPAging(asOf, { vendorId })
  return { vendorId, asOf: asOfIso, lines, totals, aging: { rows: agingRows, totals: agingTotals } }
}

// ---------------- Vendor A/P Snapshot (balance banner) ----------------
export interface VendorAPSnapshot {
  vendorId: string
  asOf: string
  openBills: number
  openBalance: number
  unappliedCredits: number
  netPayable: number
  lastPaymentDate?: string | null
  nextDueDate?: string | null
  overdueBalance?: number
  daysSinceLastPayment?: number | null
  riskLevel?: 'low' | 'moderate' | 'elevated' | 'critical'
}

export function computeVendorAPSnapshot(vendorId: string, asOf: Date): VendorAPSnapshot {
  const asOfIso = asOf.toISOString().slice(0,10)
  let openBills = 0
  let openBalance = 0
  let lastPaymentDate: string | null = null
  let nextDueDate: string | null = null
  let overdueBalance = 0
  for (const bill of db.bills) {
    if (bill.vendorId !== vendorId) continue
    const billDateIso = (bill.billDate || bill.dueDate || '').slice(0,10)
    if (billDateIso && billDateIso > asOfIso) continue
    const pays = (bill.payments || []).filter(p => (p.date || '').slice(0,10) <= asOfIso)
    const paidAmt = pays.reduce((s,p)=> s + (Number(p.amount)||0), 0)
    const balAsOf = Math.max(0, Number(((Number(bill.total)||0) - paidAmt).toFixed(2)))
    if (balAsOf > 0) {
      openBills++
      openBalance += balAsOf
      const dueIso = String(bill.dueDate || billDateIso).slice(0,10)
      if (dueIso) {
        if (!nextDueDate || dueIso < nextDueDate) nextDueDate = dueIso
        if (dueIso < asOfIso) overdueBalance += balAsOf
      }
    }
    for (const p of pays) {
      const pIso = String(p.date || '').slice(0,10)
      if (pIso && pIso <= asOfIso) {
        if (!lastPaymentDate || pIso > lastPaymentDate) lastPaymentDate = pIso
      }
    }
  }
  // Unapplied credits: remaining on vendor credits dated <= as-of
  let unappliedCredits = 0
  const vendorCredits: any[] = (db as any).vendorCredits || []
  for (const vc of vendorCredits) {
    if (vc.vendorId !== vendorId) continue
    const vcIso = String(vc.date || '').slice(0,10)
    if (vcIso && vcIso > asOfIso) continue
    unappliedCredits += Number(vc.remaining) || 0
  }
  const netPayable = Number((openBalance - unappliedCredits).toFixed(2))
  const daysSinceLastPayment = lastPaymentDate ? Math.max(0, Math.floor((asOf.getTime() - new Date(lastPaymentDate).getTime())/86400000)) : null
  // Risk heuristic similar to A/R: based on overdue ratio and payment recency
  let riskLevel: VendorAPSnapshot['riskLevel'] = 'low'
  const overdueRatio = openBalance > 0 ? overdueBalance / openBalance : 0
  if (overdueRatio > 0.5 || (daysSinceLastPayment !== null && daysSinceLastPayment > 90)) riskLevel = 'critical'
  else if (overdueRatio > 0.3 || (daysSinceLastPayment !== null && daysSinceLastPayment > 60)) riskLevel = 'elevated'
  else if (overdueRatio > 0.15 || (daysSinceLastPayment !== null && daysSinceLastPayment > 45)) riskLevel = 'moderate'
  return {
    vendorId,
    asOf: asOfIso,
    openBills,
    openBalance: Number(openBalance.toFixed(2)),
    unappliedCredits: Number(unappliedCredits.toFixed(2)),
    netPayable,
    lastPaymentDate,
    nextDueDate,
    overdueBalance: Number(overdueBalance.toFixed(2)),
    daysSinceLastPayment,
    riskLevel,
  }
}

// ---------------- Customer A/R Snapshot (balance banner) ----------------
export interface CustomerARSnapshot {
  customerId: string
  asOf: string
  openInvoices: number
  openBalance: number
  unappliedCredits: number
  netReceivable: number
  lastPaymentDate?: string | null
  nextDueDate?: string | null
  overdueBalance?: number
  daysSinceLastPayment?: number | null
  riskLevel?: 'low' | 'moderate' | 'elevated' | 'critical'
  creditLimit?: number | null
  creditUtilizationPct?: number | null
  // Promises-to-Pay metrics (optional)
  openPromises?: number | null
  nextPromiseDate?: string | null
  promiseAgingDays?: number | null
}

export function computeCustomerARSnapshot(customerId: string, asOf: Date): CustomerARSnapshot {
  const asOfIso = asOf.toISOString().slice(0,10)
  let openInvoices = 0
  let openBalance = 0
  let lastPaymentDate: string | null = null
  let nextDueDate: string | null = null
  let overdueBalance = 0
  for (const inv of db.invoices) {
    if (inv.customerId !== customerId) continue
    if (inv.date.slice(0,10) > asOfIso) continue // future invoice
    // Derive balance as of (exclude future payments)
    const paidUpTo = inv.payments.filter(p => p.date.slice(0,10) <= asOfIso).reduce((s,p)=>s+p.amount,0)
    const balAsOf = Math.max(0, inv.total - paidUpTo)
    if (balAsOf > 0 && inv.status !== 'void') {
      openInvoices++
      openBalance += balAsOf
      const dueIso = (inv.dueDate || inv.date).slice(0,10)
      if (!nextDueDate || dueIso < nextDueDate) nextDueDate = dueIso
      if (dueIso < asOfIso) overdueBalance += balAsOf
    }
    // Track latest payment date for customer
    for (const p of inv.payments) {
      const pIso = p.date.slice(0,10)
      if (pIso <= asOfIso) {
        if (!lastPaymentDate || pIso > lastPaymentDate) lastPaymentDate = pIso
      }
    }
  }
  // Unapplied credits: remaining on credit memos dated <= as-of
  let unappliedCredits = 0
  const creditMemos: any[] = (db as any).creditMemos || []
  for (const cm of creditMemos) {
    if (cm.customerId !== customerId) continue
    if (cm.date.slice(0,10) > asOfIso) continue
    unappliedCredits += (cm.remaining ?? 0)
  }
  const netReceivable = Number((openBalance - unappliedCredits).toFixed(2))
  const daysSinceLastPayment = lastPaymentDate ? Math.max(0, Math.floor((asOf.getTime() - new Date(lastPaymentDate).getTime())/86400000)) : null
  const customer = db.customers.find(c => c.id === customerId) as any
  const creditLimit: number | null = customer?.creditLimit ? Number(customer.creditLimit) : null
  const creditUtilizationPct = creditLimit ? Number(((openBalance / creditLimit) * 100).toFixed(1)) : null
  // Risk heuristic: factors: overdue ratio & days since last payment & credit utilization
  let riskLevel: CustomerARSnapshot['riskLevel'] = 'low'
  const overdueRatio = openBalance > 0 ? overdueBalance / openBalance : 0
  if (overdueRatio > 0.5 || (daysSinceLastPayment !== null && daysSinceLastPayment > 90) || (creditUtilizationPct !== null && creditUtilizationPct > 120)) riskLevel = 'critical'
  else if (overdueRatio > 0.3 || (daysSinceLastPayment !== null && daysSinceLastPayment > 60) || (creditUtilizationPct !== null && creditUtilizationPct > 100)) riskLevel = 'elevated'
  else if (overdueRatio > 0.15 || (daysSinceLastPayment !== null && daysSinceLastPayment > 45) || (creditUtilizationPct !== null && creditUtilizationPct > 80)) riskLevel = 'moderate'
  // Promises metrics derived similar to Collections Overview
  const promises: any[] = (db as any).promises || []
  const openPs = promises.filter(p => p.customerId === customerId && p.status === 'open')
  const brokenPs = promises.filter(p => p.customerId === customerId && p.status === 'broken')
  let nextPromiseDate: string | null = null
  for (const p of openPs) {
    if (!nextPromiseDate || p.promisedDate < nextPromiseDate) nextPromiseDate = p.promisedDate
  }
  let promiseAgingDays: number | null = null
  for (const p of brokenPs) {
    const days = Math.max(0, Math.floor((asOf.getTime() - new Date(p.promisedDate).getTime())/86400000))
    if (promiseAgingDays == null || days > promiseAgingDays) promiseAgingDays = days
  }
  return { customerId, asOf: asOfIso, openInvoices, openBalance: Number(openBalance.toFixed(2)), unappliedCredits: Number(unappliedCredits.toFixed(2)), netReceivable, lastPaymentDate, nextDueDate, overdueBalance: Number(overdueBalance.toFixed(2)), daysSinceLastPayment, riskLevel, creditLimit, creditUtilizationPct, openPromises: openPs.length || null, nextPromiseDate, promiseAgingDays }
}

// ---------------- Collections Overview (multi-customer prioritization) ----------------
export interface CollectionsCustomerRow {
  customerId: string
  name: string
  openInvoices: number
  openBalance: number
  overdueBalance: number
  netReceivable: number
  lastPaymentDate?: string | null
  daysSinceLastPayment?: number | null
  nextDueDate?: string | null
  creditLimit?: number | null
  creditUtilizationPct?: number | null
  riskLevel: NonNullable<CustomerARSnapshot['riskLevel']>
  lastReminderDate?: string | null
  daysSinceLastReminder?: number | null
  maxReminderCount?: number | null
  worstDunningStage?: 'Stage1' | 'Stage2' | 'Stage3' | 'Stage4' | null
  openPromises?: number | null
  nextPromiseDate?: string | null
  promiseAgingDays?: number | null
}

export interface CollectionsOverviewResult {
  asOf: string
  rows: CollectionsCustomerRow[]
  totals: { customers: number; openBalance: number; overdueBalance: number; netReceivable: number }
}

export function computeCollectionsOverview(asOf: Date): CollectionsOverviewResult {
  const asOfIso = asOf.toISOString().slice(0,10)
  const rows: CollectionsCustomerRow[] = []
  for (const cust of db.customers) {
    const snap = computeCustomerARSnapshot(cust.id, asOf)
    if (snap.openBalance === 0 && snap.unappliedCredits === 0) continue // skip inactive/no exposure customers
    // Reminder tracking aggregation
    let lastReminder: string | null = null
    let maxReminderCount: number = 0
    let worstStage: 'Stage1' | 'Stage2' | 'Stage3' | 'Stage4' | null = null
    for (const inv of db.invoices) {
      if (inv.customerId !== cust.id) continue
      if (inv.lastReminderDate) {
        if (!lastReminder || inv.lastReminderDate > lastReminder) lastReminder = inv.lastReminderDate
      }
      if (inv.reminderCount && inv.reminderCount > maxReminderCount) maxReminderCount = inv.reminderCount
      if (inv.dunningStage) {
        const order: Record<string, number> = { Stage1:1, Stage2:2, Stage3:3, Stage4:4 }
        if (!worstStage || order[inv.dunningStage] > order[worstStage]) worstStage = inv.dunningStage
      }
    }
    const daysSinceLastReminder = lastReminder ? Math.floor((asOf.getTime() - new Date(lastReminder).getTime())/86400000) : null
    // Promise metrics (open promises with future or today promisedDate)
    const promises: any[] = (db as any).promises || []
    const openPs = promises.filter(p => p.customerId === cust.id && p.status === 'open')
    const brokenPs = promises.filter(p => p.customerId === cust.id && p.status === 'broken')
    let nextPromiseDate: string | null = null
    for (const p of openPs) {
      if (!nextPromiseDate || p.promisedDate < nextPromiseDate) nextPromiseDate = p.promisedDate
    }
    // Promise aging: max days past due among broken promises (if any)
    let promiseAgingDays: number | null = null
    for (const p of brokenPs) {
      const days = Math.max(0, Math.floor((asOf.getTime() - new Date(p.promisedDate).getTime())/86400000))
      if (promiseAgingDays == null || days > promiseAgingDays) promiseAgingDays = days
    }
    rows.push({
      customerId: cust.id,
      name: cust.name,
      openInvoices: snap.openInvoices,
      openBalance: snap.openBalance,
      overdueBalance: snap.overdueBalance || 0,
      netReceivable: snap.netReceivable,
      lastPaymentDate: snap.lastPaymentDate,
      daysSinceLastPayment: snap.daysSinceLastPayment ?? null,
      nextDueDate: snap.nextDueDate,
      creditLimit: snap.creditLimit ?? null,
      creditUtilizationPct: snap.creditUtilizationPct ?? null,
      riskLevel: snap.riskLevel || 'low',
      lastReminderDate: lastReminder,
      daysSinceLastReminder,
      maxReminderCount: maxReminderCount || null,
      worstDunningStage: worstStage,
      openPromises: openPs.length || null,
      nextPromiseDate,
      promiseAgingDays,
    })
  }
  // Sort by riskLevel severity then overdueBalance desc then openBalance desc
  const rank: Record<string, number> = { critical: 4, elevated: 3, moderate: 2, low: 1 }
  rows.sort((a,b)=>{
    const dr = (rank[b.riskLevel]||0) - (rank[a.riskLevel]||0)
    if (dr !== 0) return dr
    if (b.overdueBalance !== a.overdueBalance) return b.overdueBalance - a.overdueBalance
    return b.openBalance - a.openBalance
  })
  const totals = rows.reduce((acc,r)=>{ acc.customers++; acc.openBalance += r.openBalance; acc.overdueBalance += r.overdueBalance; acc.netReceivable += r.netReceivable; return acc }, { customers:0, openBalance:0, overdueBalance:0, netReceivable:0 })
  totals.openBalance = Number(totals.openBalance.toFixed(2))
  totals.overdueBalance = Number(totals.overdueBalance.toFixed(2))
  totals.netReceivable = Number(totals.netReceivable.toFixed(2))
  return { asOf: asOfIso, rows, totals }
}
