import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { flags } from '@/lib/flags'
import { generateRows, filterRowsByTag, type Row } from './shared'
import { deriveRange } from '@/lib/report-helpers'

// generator imported from ./shared

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const item = url.searchParams.get('item') || undefined
  const tag = url.searchParams.get('tag') || undefined
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end

  const asOfIso = end || new Date().toISOString().slice(0, 10)
  let rows = generateRows(asOfIso, start, end)
  if (item) rows = rows.filter(r => r.item === item)
  if (flags.tags && tag) rows = filterRowsByTag(rows, tag)
  const totals = rows.reduce((acc, r) => { acc.amount += r.amount; acc.qty += r.qty; return acc }, { amount: 0, qty: 0 })
  return NextResponse.json({ rows, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
