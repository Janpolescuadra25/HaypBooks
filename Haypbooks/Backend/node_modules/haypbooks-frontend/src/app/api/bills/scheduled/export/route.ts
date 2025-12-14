import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename } from '@/lib/csv'
import { buildCsvCaption, deriveRange } from '@/lib/report-helpers'
import { todayIso } from '@/lib/date'
import { formatCurrency } from '@/lib/format'

function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const startOpt = start || undefined
  const endOpt = end || undefined

  // Filter only scheduled bills in the requested period (by due date)
  let rows = db.bills.slice().map(b => ({ ...b, d: b.dueDate.slice(0,10), sched: (b.scheduledDate ? String(b.scheduledDate).slice(0,10) : '') }))
  // Include any bill with a scheduledDate set, regardless of current status (status may be recalculated later)
  rows = rows.filter(r => !!r.sched)
  if (startOpt) rows = rows.filter(r => r.d >= startOpt)
  if (endOpt) rows = rows.filter(r => r.d <= endOpt)

  const lines: string[] = []
  lines.push(csvEscape(buildCsvCaption(startOpt || null, endOpt || null, endOpt || todayIso())))
  lines.push('')
  lines.push(['Bill #','Vendor','Due Date','Scheduled Date','Total','Balance'].map(csvEscape).join(','))
  for (const b of rows) {
    const vendor = db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId
    const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
    lines.push([
      b.number,
      vendor,
      b.d,
      b.sched,
      formatCurrency(Number(b.total) || 0, baseCurrency),
      formatCurrency(Number(b.balance) || 0, baseCurrency),
    ].map(csvEscape).join(','))
  }

  const filename = buildCsvFilename('scheduled-bills', { start: startOpt, end: endOpt, asOfIso: endOpt || todayIso() })
  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
