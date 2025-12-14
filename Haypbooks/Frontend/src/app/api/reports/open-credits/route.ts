import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const start = url.searchParams.get('start') || undefined
  const end = url.searchParams.get('end') || new Date().toISOString().slice(0,10)
  const customerId = url.searchParams.get('customerId') || undefined
  const vendorId = url.searchParams.get('vendorId') || undefined
  const type = url.searchParams.get('type') as ('ar'|'ap'|null) | null

  // Collect AR credit memos (remaining balance as of end)
  const creditMemos: any[] = (db as any).creditMemos || []
  let arRows = type === 'ap' ? [] : creditMemos
    .filter(cm => (!customerId || cm.customerId === customerId))
    .filter(cm => (!start || cm.date.slice(0,10) >= start))
    .filter(cm => (end ? cm.date.slice(0,10) <= end : true))
    .map(cm => ({
      id: cm.id,
      date: cm.date.slice(0,10),
      side: 'ar' as const,
      number: cm.number,
      name: db.customers.find(c => c.id === cm.customerId)?.name || cm.customerId,
      entityId: cm.customerId,
      total: Number(cm.total)||0,
      remaining: Number(cm.remaining)||0,
      applied: Math.max(0, Number(cm.total)||0 - (Number(cm.remaining)||0))
    }))

  // Collect AP vendor credits
  const vendorCredits: any[] = (db as any).vendorCredits || []
  let apRows = type === 'ar' ? [] : vendorCredits
    .filter(vc => (!vendorId || vc.vendorId === vendorId))
    .filter(vc => (!start || String(vc.date||'').slice(0,10) >= start))
    .filter(vc => (end ? String(vc.date||'').slice(0,10) <= end : true))
    .map(vc => ({
      id: vc.id,
      date: String(vc.date||'').slice(0,10),
      side: 'ap' as const,
      number: vc.number,
      name: db.vendors.find(v => v.id === vc.vendorId)?.name || vc.vendorId,
      entityId: vc.vendorId,
      total: Number(vc.total)||0,
      remaining: Number(vc.remaining)||0,
      applied: Math.max(0, Number(vc.total)||0 - (Number(vc.remaining)||0))
    }))

  let rows = [...arRows, ...apRows]
  rows.sort((a,b)=> b.date.localeCompare(a.date) || String(a.number||a.id).localeCompare(String(b.number||b.id)))

  const totals = rows.reduce((acc, r) => {
    acc.count++
    acc.original += r.total
    acc.remaining += r.remaining
    acc.applied += r.applied
    return acc
  }, { count: 0, original: 0, remaining: 0, applied: 0 })

  return NextResponse.json({ rows, totals, start: start || null, end: end || null, asOf: end })
}
