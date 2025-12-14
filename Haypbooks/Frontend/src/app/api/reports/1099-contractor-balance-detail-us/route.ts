import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

function toISO(d: Date) { return d.toISOString().slice(0,10) }

function generate(asOfIso: string) {
  // Per-vendor open 1099-eligible payments (nonemployee comp) and YTD total
  const rows = [
    { vendorId: 'V100', vendor: 'Ace Consulting LLC', tin: 'XX-XXXX123', ytd: 2200.00 },
    { vendorId: 'V200', vendor: 'Blue Ocean Design', tin: 'XX-XXXX987', ytd: 580.00 },
    { vendorId: 'V300', vendor: 'Cedar Tech Services', tin: 'XX-XXXX555', ytd: 610.50 },
    { vendorId: 'V400', vendor: 'Delta Contractors', tin: 'XX-XXXX222', ytd: 13000.00 },
  ]
  return rows
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const period = url.searchParams.get('period')
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end
  const asOfIso = (end || toISO(new Date()))
  const rows = generate(asOfIso).map(r => ({ ...r, eligible: r.ytd >= 600 }))
  const totals = { eligibleCount: rows.filter(r => r.eligible).length, totalYtd: rows.reduce((s,r)=>s+r.ytd,0) }
  return NextResponse.json({ rows, totals, asOf: asOfIso, start, end, period })
}
