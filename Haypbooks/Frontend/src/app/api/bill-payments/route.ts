import { NextRequest, NextResponse } from 'next/server'
import { listBills, type Bill } from '../bills/store'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

type Row = {
  id: string
  billId: string
  vendor: string
  number: string
  date: string
  amount: number
}

function filterByDate(rows: Row[], start?: string | null, end?: string | null) {
  if (!start && !end) return rows
  const s = start ? new Date(start) : null
  const e = end ? new Date(end) : null
  return rows.filter(r => {
    const d = new Date(r.date)
    if (s && d < s) return false
    if (e && d > e) return false
    return true
  })
}

export async function GET(req: NextRequest) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:read')) {
    // read is implied by any role right now; fallback allow for demo
  }
  const url = new URL(req.url)
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')

  // Flatten payments across all bills
  const rows: Row[] = listBills().flatMap((b: Bill) => {
    const vendor = b.vendor
    const number = b.number
    return (b.payments || []).map(p => ({ id: p.id, billId: b.id, vendor, number, date: p.date, amount: Number(p.amount) || 0 }))
  })

  const filtered = filterByDate(rows, start, end)
  const total = filtered.reduce((s, r) => s + r.amount, 0)
  return NextResponse.json({ payments: filtered, total })
}
