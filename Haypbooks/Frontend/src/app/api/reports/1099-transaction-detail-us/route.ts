import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

function toISO(d: Date) { return d.toISOString().slice(0,10) }

function generate(start?: string | null, end?: string | null) {
  // Deterministic transaction list with an eligible flag
  const base = new Date((end || new Date().toISOString().slice(0,10)) + 'T00:00:00Z')
  const day = (offset: number) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() - offset); return d.toISOString().slice(0,10) }
  const rows = [
    { date: day(60), vendor: 'Ace Consulting LLC', tin: 'XX-XXXX123', amount: 1200, account: 'Contractor Expense', memo: 'Consulting Jan', eligible: true },
    { date: day(40), vendor: 'Blue Ocean Design', tin: 'XX-XXXX987', amount: 290, account: 'Contractor Expense', memo: 'Design Feb', eligible: false },
    { date: day(20), vendor: 'Cedar Tech Services', tin: 'XX-XXXX555', amount: 310.5, account: 'Contractor Expense', memo: 'IT Support Mar', eligible: true },
    { date: day(10), vendor: 'Delta Contractors', tin: 'XX-XXXX222', amount: 6500, account: 'Contractor Expense', memo: 'Project Alpha', eligible: true },
  ]
  return rows.filter(r => (!start || r.date >= start) && (!end || r.date <= end))
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
  const rows = generate(start, end)
  const totals = { amount: rows.reduce((s,r)=>s+r.amount,0) }
  return NextResponse.json({ rows, totals, start, end, period })
}
