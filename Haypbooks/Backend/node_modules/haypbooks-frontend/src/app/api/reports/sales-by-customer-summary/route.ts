import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'
import { flags } from '@/lib/flags'
import { generateRows, filterRowsByTag } from './shared'

type Row = {
  customer: string
  transactions: number
  qty: number
  amount: number
}


// generator moved to shared.ts

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const tag = url.searchParams.get('tag') || undefined
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  let rows = generateRows(asOfIso, start, end)
  if (flags.tags && tag) rows = filterRowsByTag(rows, tag)
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; acc.qty += r.qty; acc.transactions += r.transactions; return acc }, { amount: 0, qty: 0, transactions: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
