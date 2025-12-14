import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'
import { flags } from '@/lib/flags'
import { generateRows as sharedGenerateRows, filterRowsByTag } from './shared'

type Row = {
  date: string
  type: string
  number: string
  customer: string
  item: string
  qty: number
  rate: number
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
  const customer = url.searchParams.get('customer') || undefined
  const tag = url.searchParams.get('tag') || undefined
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  let rows = sharedGenerateRows(asOfIso, start, end)
  if (customer) rows = rows.filter(r => r.customer === customer)
  if (flags.tags && tag) rows = filterRowsByTag(rows as any, tag) as any
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; return acc }, { amount: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
