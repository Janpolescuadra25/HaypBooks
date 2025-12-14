import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { computeCollectionsOverview } from '@/mock/aggregations'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const asOf = searchParams.get('asOf') || new Date().toISOString().slice(0,10)
  const customerId = searchParams.get('customerId') || undefined
  const asOfDate = new Date(asOf + 'T00:00:00Z')
  let overview = computeCollectionsOverview(asOfDate)
  if (customerId) {
    const rows = overview.rows.filter(r => r.customerId === customerId)
    const totals = rows.reduce((acc,r)=>{ acc.customers++; acc.openBalance += r.openBalance; acc.overdueBalance += r.overdueBalance; acc.netReceivable += r.netReceivable; return acc }, { customers:0, openBalance:0, overdueBalance:0, netReceivable:0 })
    totals.openBalance = Number(totals.openBalance.toFixed(2))
    totals.overdueBalance = Number(totals.overdueBalance.toFixed(2))
    totals.netReceivable = Number(totals.netReceivable.toFixed(2))
    overview = { ...overview, rows, totals }
  }
  return NextResponse.json({ overview })
}
