import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange as deriveRangeShared } from '@/lib/report-helpers'
import { db, seedIfNeeded } from '@/mock/db'

type Row = { vendor: string; type: string; number: string; billDate: string; dueDate: string; aging: number; openBalance: number }

const deriveRange = deriveRangeShared

function computeOpenBalanceAsOf(bill: any, asOfIso: string) {
  const paidToDate = (bill.payments || [])
    .filter((p: any) => p.appliedToType === 'bill' && p.appliedToId === bill.id && p.date && p.date.slice(0,10) <= asOfIso)
    .reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
  const open = Math.max(0, Number(((Number(bill.total) || 0) - paidToDate).toFixed(2)))
  return open
}

function daysPastDue(bill: any, asOfIso: string) {
  const dueIso = (bill.dueDate || bill.billDate || '').slice(0,10)
  if (!dueIso) return 0
  const dd = new Date(dueIso + 'T00:00:00Z')
  const ad = new Date(asOfIso + 'T00:00:00Z')
  const diff = Math.floor((ad.getTime() - dd.getTime()) / 86400000)
  return Math.max(0, diff)
}

function inBucketLabel(dpd: number): 'current' | '30' | '60' | '90' | '120+' {
  if (dpd === 0) return 'current'
  if (dpd <= 30) return '30'
  if (dpd <= 60) return '60'
  if (dpd <= 90) return '90'
  return '120+'
}

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const vendor = url.searchParams.get('vendor') || undefined
  const vendorId = url.searchParams.get('vendorId') || undefined
  const bucket = (url.searchParams.get('bucket') || undefined) as undefined | 'current' | '30' | '60' | '90' | '120+'
  let start = url.searchParams.get('start')
  let end = url.searchParams.get('end')
  const derived = deriveRange(period, start, end)
  start = derived.start || start
  end = derived.end || end
  const asOfIso = end || new Date().toISOString().slice(0,10)

  seedIfNeeded()
  const rows: Row[] = []
  for (const bill of db.bills) {
    if (vendorId && bill.vendorId !== vendorId) continue
    if (bill.status === 'void') continue
    const bDate = (bill.billDate || bill.dueDate || '').slice(0,10)
    if (start && bDate < start) continue
    if (end && bDate > end) continue
    const open = computeOpenBalanceAsOf(bill, asOfIso)
    if (open <= 0) continue
    const dpd = daysPastDue(bill, asOfIso)
    const vendorName = db.vendors.find(v => v.id === bill.vendorId)?.name || 'Unknown vendor'
    rows.push({
      vendor: vendorName,
      type: 'Bill',
      number: bill.number,
      billDate: bDate,
      dueDate: (bill.dueDate || bill.billDate || '').slice(0,10),
      aging: dpd,
      openBalance: open,
    })
  }

  let filtered = rows
  if (vendor) filtered = filtered.filter(r => r.vendor === vendor)
  if (bucket) filtered = filtered.filter(r => inBucketLabel(r.aging) === bucket)
  filtered.sort((a,b) => a.vendor.localeCompare(b.vendor) || a.dueDate.localeCompare(b.dueDate))

  const totals = filtered.reduce((acc, r) => { acc.openBalance += r.openBalance; return acc }, { openBalance: 0 })
  return NextResponse.json({ rows: filtered, totals, asOf: asOfIso, start: start || null, end: end || null, period: (period || null) })
}
