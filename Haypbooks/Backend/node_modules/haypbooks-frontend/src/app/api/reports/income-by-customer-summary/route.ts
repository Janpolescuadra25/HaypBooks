import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type Row = {
  customer: string
  transactions: number
  qty: number
  amount: number
}


function generateRows(asOfIso: string): Row[] {
  const seed = Number(asOfIso.slice(-2)) || 15
  // Use slightly different math than sales to ensure variation but deterministic
  const aTx = 3 + (seed % 2) // 3..4
  const bTx = 2 + (seed % 3) // 2..4
  const aQty = 5 + (seed % 5) // 5..9
  const bQty = 4 + (seed % 4) // 4..7
  const aAmt = 2000 + (seed % 6) * 110 // 2000..2650
  const bAmt = 1200 + (seed % 5) * 130 // 1200..1820
  return [
    { customer: 'Customer A', transactions: aTx, qty: aQty, amount: aAmt },
    { customer: 'Customer B', transactions: bTx, qty: bQty, amount: bAmt },
  ]
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  const rows = generateRows(asOfIso)
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; acc.qty += r.qty; acc.transactions += r.transactions; return acc }, { amount: 0, qty: 0, transactions: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
