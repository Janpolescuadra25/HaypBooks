import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, listBills as dbListBills, createBill as dbCreateBill } from '@/mock/db'
import { getClosedThrough } from '@/lib/periods'
import { buildClosedPeriodErrorPayload } from '@/lib/period-lock'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const status = url.searchParams.get('status')
  const tag = url.searchParams.get('tag')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  let { rows: coreRows, total } = dbListBills({ start: start || undefined, end: end || undefined, status: status || undefined, page, limit })
  if (tag) {
    coreRows = coreRows.filter((b: any) => Array.isArray(b.tags) && b.tags.includes(tag))
    total = coreRows.length
  }
  const rows = coreRows.map((b: any) => ({
    ...b,
    vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId,
  }))
  return NextResponse.json({ bills: rows, total, page, limit })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const { number, vendorId, items, lines, billDate, terms, dueDate } = body || {}
  const normalizedLines = Array.isArray(lines) ? lines : (Array.isArray(items) ? items : [])
  if (!vendorId || normalizedLines.length === 0) {
    return NextResponse.json({ error: 'vendorId and at least one item are required' }, { status: 400 })
  }
  // Period lock enforcement
  const closed = getClosedThrough()
  if (closed) {
    const bDate: string = (typeof billDate === 'string' && billDate.length >= 10) ? billDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
    const d = new Date(bDate + 'T00:00:00Z')
    const c = new Date(closed + 'T00:00:00Z')
    if (!isNaN(d.valueOf()) && !isNaN(c.valueOf()) && d.getTime() <= c.getTime()) {
      return NextResponse.json(buildClosedPeriodErrorPayload(closed, bDate), { status: 400 })
    }
  }
  try {
    const bill = dbCreateBill({ number, vendorId, billDate, terms, dueDate: dueDate || undefined, lines: normalizedLines })
    const mapped = { ...bill, vendor: db.vendors.find(v => v.id === bill.vendorId)?.name || bill.vendorId }
    return NextResponse.json({ bill: mapped })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 400 })
  }
}
