import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

type AgingRow = {
  vendorId: string
  name: string
  current: number
  '30': number
  '60': number
  '90': number
  '120+': number
  total: number
}

function daysBetween(aIso: string, bIso: string) {
  const a = new Date(aIso + 'T00:00:00Z')
  const b = new Date(bIso + 'T00:00:00Z')
  const ms = b.getTime() - a.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function balanceAsOfBill(bill: any, asOfIso: string): number {
  const paid = (bill.payments || []).filter((p: any) => String(p.date || '').slice(0,10) <= asOfIso)
    .reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
  const total = Number(bill.total || 0)
  return Math.max(0, Number((total - paid).toFixed(2)))
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
  const asOf = (end || new Date().toISOString().slice(0,10))

  const rowsMap = new Map<string, AgingRow>()
  for (const bill of db.bills) {
    if (!bill || bill.status === 'void') continue
    const billDate = String(bill.billDate || bill.dueDate || '').slice(0,10)
    if (billDate > asOf) continue
    const bal = balanceAsOfBill(bill, asOf)
    if (!(bal > 0)) continue
    const ven = db.vendors.find(v => v.id === bill.vendorId)
    const name = ven?.name || 'Vendor'
    const key = ven?.id || bill.vendorId || 'unknown'
    let row = rowsMap.get(key)
    if (!row) {
      row = { vendorId: key, name, current: 0, '30': 0, '60': 0, '90': 0, '120+': 0, total: 0 }
      rowsMap.set(key, row)
    }
    const dueIso = String(bill.dueDate || bill.billDate || '').slice(0,10)
    const diff = daysBetween(dueIso, asOf)
    if (diff <= 0) row.current += bal
    else if (diff <= 30) row['30'] += bal
    else if (diff <= 60) row['60'] += bal
    else if (diff <= 90) row['90'] += bal
    else row['120+'] += bal
    row.total += bal
  }

  const rows = Array.from(rowsMap.values()).sort((a,b)=> a.name.localeCompare(b.name))
  const totals = rows.reduce((acc, r) => {
    acc.current += r.current; acc['30'] += r['30']; acc['60'] += r['60']; acc['90'] += r['90']; acc['120+'] += r['120+']; acc.total += r.total
    return acc
  }, { current: 0, '30': 0, '60': 0, '90': 0, '120+': 0, total: 0 } as any)

  return NextResponse.json({ start: start || null, end: end || null, asOf, rows, totals })
}
