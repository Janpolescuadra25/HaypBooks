import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'
import { todayIso } from '@/lib/date'
import { generateRows, Row, filterRowsByTag } from './shared'
import { flags } from '@/lib/flags'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const qStart = url.searchParams.get('start')
  const qEnd = url.searchParams.get('end')
  const product = url.searchParams.get('product') || undefined
  const tag = url.searchParams.get('tag') || undefined
  const { start, end } = deriveRange(qStart && qEnd ? 'Custom' : period, qStart, qEnd)

  const asOfIso = end || todayIso()
  let rows = generateRows(asOfIso, start, end)
  if (product) rows = rows.filter(r => r.product === product)
  if (flags.tags && tag) rows = filterRowsByTag(rows, tag)
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; acc.qty += r.qty; acc.transactions += r.transactions; return acc }, { amount: 0, qty: 0, transactions: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
