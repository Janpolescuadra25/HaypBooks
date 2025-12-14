import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { ensureSampleStatements, listStatements } from '../../statements/store'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  ensureSampleStatements()
  let rows = listStatements().map((s) => ({ customer: s.customer, date: s.date, amountDue: s.amountDue, status: s.status }))
  // Deterministic ordering: newest first by date (desc), then customer asc
  rows.sort((a, b) => {
    const d = b.date.localeCompare(a.date)
    if (d !== 0) return d
    return a.customer.localeCompare(b.customer)
  })
  if (q) rows = rows.filter((r) => r.customer.toLowerCase().includes(q))
  return NextResponse.json({ rows })
}
