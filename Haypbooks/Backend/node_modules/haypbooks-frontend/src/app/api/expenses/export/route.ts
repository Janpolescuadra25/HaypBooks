import { NextResponse } from 'next/server'
import { todayIso } from '@/lib/date'
import { buildCsvFilename, sanitizeToken, parseCsvVersionFlag } from '@/lib/csv'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'

// No dedicated expenses store in DB; derive from transactions categorized as Expense.

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  // CSV-Version opt-in using shared parser
  const versionFlag = parseCsvVersionFlag(req)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const startOpt = start || undefined
  const endOpt = end || undefined
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  // Map transactions -> expenses export row shape
  let rows = (db.transactions || [])
    .filter((t: any) => t.category === 'Expense')
    .map((t: any) => ({
      date: t.date.slice(0, 10),
      payee: t.description || 'Payee',
      category: 'Expense',
      memo: t.description || '',
      amount: t.amount,
    }))
  if (startOpt) rows = rows.filter(r => r.date >= startOpt)
  if (endOpt) rows = rows.filter(r => r.date <= endOpt)
  const asOfIso = endOpt || todayIso()
  const tokens: string[] = []
  if (period) tokens.push(`period-${sanitizeToken(period)}`)
  const filename = buildCsvFilename('expenses', { start: startOpt, end: endOpt, asOfIso, tokens })
  const out: string[] = []
  if (versionFlag) out.push('CSV-Version,1')
  out.push(buildCsvCaption(startOpt || null, endOpt || null, asOfIso))
  out.push(['Date', 'Payee', 'Category', 'Memo', 'Amount'].join(','))
  for (const r of rows) {
    out.push([r.date, r.payee, r.category, r.memo || '', String(r.amount)].join(','))
  }
  const body = out.join('\n')
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
