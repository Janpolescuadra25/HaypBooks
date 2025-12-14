import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, listInvoices as dbListInvoices, createInvoice as dbCreateInvoice } from '@/mock/db'
import { getClosedThrough } from '@/lib/periods'
import { buildClosedPeriodErrorPayload } from '@/lib/period-lock'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const start = url.searchParams.get('start') || undefined
  const end = url.searchParams.get('end') || undefined
  const status = url.searchParams.get('status') || undefined
  const tag = url.searchParams.get('tag') || undefined
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  let { rows, total } = dbListInvoices({ start, end, status, page, limit })
  if (tag) {
    rows = rows.filter((inv: any) => Array.isArray(inv.tags) && inv.tags.includes(tag))
    total = rows.length
  }
  const mapped = rows.map(inv => ({
    id: inv.id,
    number: inv.number,
    customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId,
    status: inv.status,
    total: inv.total,
    date: inv.date,
    balance: inv.balance,
  }))
  return NextResponse.json({ invoices: mapped, total, page, limit })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({})) as any
  let { number, customerId, customer, lines, items, date, terms, dueDate } = body || {}
  const lineList = Array.isArray(lines) ? lines : (Array.isArray(items) ? items : [])
  if (!customerId && customer) {
    const found = db.customers.find(c => c.name === customer)
    if (found) customerId = found.id
  }
  if (!customerId && db.customers.length) customerId = db.customers[0].id
  if (!customerId || !Array.isArray(lineList) || lineList.length === 0) {
    return NextResponse.json({ error: 'number, customer/customerId and at least one line item are required' }, { status: 400 })
  }
  // Period lock: block invoices dated on/before closed date
  const closed = getClosedThrough()
  if (closed) {
    const invDateStr: string = (typeof date === 'string' && date.length >= 10) ? date.slice(0, 10) : new Date().toISOString().slice(0, 10)
    const d = new Date(invDateStr + 'T00:00:00Z')
    const c = new Date(closed + 'T00:00:00Z')
    if (!isNaN(d.valueOf()) && !isNaN(c.valueOf()) && d.getTime() <= c.getTime()) {
      return NextResponse.json(buildClosedPeriodErrorPayload(closed, invDateStr), { status: 400 })
    }
  }
  if (!number) number = `INV-${Math.floor(Math.random()*9000+1000)}`
  const inv = dbCreateInvoice({
    number,
    customerId,
    date: date || new Date().toISOString(),
    lines: lineList,
    terms,
    dueDate,
  })
  const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
  return NextResponse.json({ invoice })
}
