import { NextRequest, NextResponse } from 'next/server'
import { buildCsvFilename, parseCsvVersionFlag } from '@/lib/csv'
import { buildCsvRangeOrDate } from '@/lib/report-helpers'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import { formatCurrency } from '@/lib/format'

// Consistent CSV escaping (commas, quotes, and newlines)
function csvEscape(v: any): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

function toCsv(rows: Array<{ vendor: string; number: string; date: string; amount: number }>, baseCurrency: string): string {
  const header = ['Vendor','Bill Number','Payment Date','Amount'].map(csvEscape).join(',') + '\n'
  const lines = rows.map(r => [
    csvEscape(r.vendor),
    csvEscape(r.number),
    csvEscape(r.date),
    csvEscape(formatCurrency(Number(r.amount) || 0, baseCurrency))
  ].join(','))
  return header + lines.join('\n') + '\n'
}

export async function GET(req: NextRequest) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  if (!db.seeded) { try { seedIfNeeded() } catch {}
  }
  const url = new URL(req.url)
  // CSV-Version opt-in (aliases supported)
  const versionFlag = parseCsvVersionFlag(req)
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  // Compute caption using shared helper to align with CSV policy (range or bare date);
  // we currently do not prepend it to the CSV body to avoid changing consumer expectations.
  const caption = buildCsvRangeOrDate(start, end, end || new Date().toISOString().slice(0,10))
  const rows = (db.bills || []).flatMap((b: any) => (b.payments || []).map((p: any) => ({
    vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId || 'Vendor',
    number: b.number,
    date: p.date,
    amount: Number(p.amount) || 0,
  })))
    .filter(r => {
      const d = new Date(r.date)
      return (!start || d >= new Date(start)) && (!end || d <= new Date(end))
    })

  // Build CSV body: optional CSV-Version first, then caption + spacer, then header/body
  const parts: string[] = []
  if (versionFlag) parts.push('CSV-Version,1')
  parts.push(String(caption))
  parts.push('')
  const baseCurrency = (db.settings?.baseCurrency as string) || 'USD'
  const csvBody = toCsv(rows, baseCurrency)
  parts.push(csvBody.trimEnd())
  const csv = parts.join('\n') + '\n'
  const asOf = (end || new Date().toISOString().slice(0,10))
  const filename = buildCsvFilename('bill-payments', { start: start || undefined, end: end || undefined, asOfIso: asOf })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store'
    }
  })
}
