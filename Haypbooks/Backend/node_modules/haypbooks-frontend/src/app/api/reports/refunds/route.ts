import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded, listCustomerRefunds, listVendorRefunds } from '@/mock/db'

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const start = url.searchParams.get('start') || undefined
  const end = url.searchParams.get('end') || undefined
  const customerId = url.searchParams.get('customerId') || undefined
  const vendorId = url.searchParams.get('vendorId') || undefined
  const type = url.searchParams.get('type') as ('ar'|'ap'|null) | null
  // Gather
  const ar = type === 'ap' ? [] : listCustomerRefunds({ customerId }).map(r => ({
    id: r.id, date: r.date.slice(0,10), amount: r.amount, method: r.method, reference: r.reference,
    type: 'ar' as const, entityId: r.customerId, linkId: r.creditMemoId
  }))
  const ap = type === 'ar' ? [] : listVendorRefunds({ vendorId }).map(r => ({
    id: r.id, date: r.date.slice(0,10), amount: r.amount, method: r.method, reference: r.reference,
    type: 'ap' as const, entityId: r.vendorId, linkId: r.vendorCreditId
  }))
  let rows = [...ar, ...ap]
  if (start) rows = rows.filter(r => r.date >= start!)
  if (end) rows = rows.filter(r => r.date <= end!)
  rows.sort((a,b)=> b.date.localeCompare(a.date))
  const totals = rows.reduce((acc, r) => { acc.count++; acc.amount += Number(r.amount)||0; return acc }, { count: 0, amount: 0 })
  return NextResponse.json({ rows, totals, start: start || null, end: end || null, asOf: (end || new Date().toISOString().slice(0,10)) })
}
