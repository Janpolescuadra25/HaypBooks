import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, db } from '@/mock/db'
import { computeCustomerStatement } from '@/mock/aggregations'

// GET /api/customers/statements/pack?asOf=YYYY-MM-DD[&customerId=c1,c2,...][&start=YYYY-MM-DD][&type=summary|detail]
// Aggregates multiple customer statements (JSON-first for CSV export delegation)
export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const url = new URL(req.url)
  const asOfIso = url.searchParams.get('asOf') || new Date().toISOString().slice(0,10)
  const startIso = url.searchParams.get('start') || undefined
  const typeParam = url.searchParams.get('type') as any
  const stmtType = (typeParam === 'balance-forward' || typeParam === 'transaction' || typeParam === 'open-item') ? typeParam : undefined
  const idsParam = url.searchParams.get('customerId') || ''
  const idList = idsParam.split(',').map(s => s.trim()).filter(Boolean)
  const targetIds = idList.length ? idList : (db.customers || []).map(c => c.id)
  const asOf = new Date(asOfIso + 'T00:00:00Z')
  const start = startIso ? new Date(startIso + 'T00:00:00Z') : null
  const statements = targetIds.map(id => ({ id, statement: computeCustomerStatement(id, asOf, { start, type: stmtType }) }))
  return NextResponse.json({ asOf: asOfIso, start: startIso || null, type: stmtType || null, count: statements.length, statements })
}
