import { NextRequest, NextResponse } from 'next/server'
import { db, seedIfNeeded, listCustomerPayments as dbListCustomerPayments, createCustomerPayment as dbCreateCustomerPayment } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'

type Row = {
  id: string
  customerId: string
  customer: string
  date: string
  amountReceived: number
  amountAllocated: number
  amountUnapplied: number
  status: string
  allocations: { invoiceId: string; invoiceNumber: string; amount: number }[]
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
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:read')) {
    // Allow read for demo parity (same pattern as bill-payments)
  }
  const url = new URL(req.url)
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const q = (url.searchParams.get('q') || '').toLowerCase()
  const customerId = url.searchParams.get('customerId') || undefined

  const rows: Row[] = dbListCustomerPayments({ customerId }).map(p => {
    const cust = (db.customers || []).find(c => c.id === p.customerId)
    const allocations = (p.allocations || []).map(a => {
      const inv = (db.invoices || []).find(i => i.id === a.invoiceId)
      return { invoiceId: a.invoiceId, invoiceNumber: inv?.number || a.invoiceId, amount: a.amount }
    })
    return {
      id: p.id,
      customerId: p.customerId,
      customer: cust?.name || p.customerId,
      date: p.date,
      amountReceived: Number(p.amountReceived || 0),
      amountAllocated: Number(p.amountAllocated || 0),
      amountUnapplied: Number(p.amountUnapplied || 0),
      status: String(p.status || ''),
      allocations,
    }
  })

  const filteredByDate = filterByDate(rows, start, end)
  const filtered = filteredByDate.filter(r => {
    if (!q) return true
    const allocText = r.allocations.map(a => `${a.invoiceNumber}:${a.amount}`).join(' ').toLowerCase()
    return r.id.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) || allocText.includes(q)
  })
  const totals = filtered.reduce((acc, r) => {
    acc.received += Number(r.amountReceived || 0)
    acc.allocated += Number(r.amountAllocated || 0)
    acc.unapplied += Number(r.amountUnapplied || 0)
    return acc
  }, { received: 0, allocated: 0, unapplied: 0 })

  return NextResponse.json({ customerPayments: filtered, totals })
}

export async function POST(req: NextRequest) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({} as any))
  const customerId = String(body?.customerId || '')
  const amountReceived = Number(body?.amountReceived)
  const date = typeof body?.date === 'string' && /\d{4}-\d{2}-\d{2}/.test(body.date) ? body.date : undefined
  const method = body?.method ? String(body.method) : undefined
  const reference = body?.reference ? String(body.reference) : undefined
  const autoCreditUnapplied = Boolean(body?.autoCreditUnapplied)
  const depositAccountNumber = typeof body?.depositAccountNumber === 'string' ? body.depositAccountNumber : undefined
  const allocations = Array.isArray(body?.allocations) ? body.allocations.filter((a: any) => a && a.invoiceId && Number(a.amount) > 0).map((a: any) => ({ invoiceId: String(a.invoiceId), amount: Number(a.amount) })) : []

  if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 })
  if (!Number.isFinite(amountReceived) || amountReceived <= 0) return NextResponse.json({ error: 'amountReceived must be > 0' }, { status: 400 })

  // Closed-period enforcement with structured payload
  const requestedDate = (date || new Date().toISOString().slice(0,10))
  const cp = isDateInClosedPeriod(requestedDate)
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })

  try {
  const cp = dbCreateCustomerPayment({ customerId, amountReceived, allocations, date, method, reference, autoCreditUnapplied, depositAccountNumber })
    // Collect updated invoices affected by this payment (those with allocations)
    const touchedIds = Array.from(new Set((cp.allocations || []).map(a => a.invoiceId)))
    const updatedInvoices = touchedIds.map(id => {
      const inv = (db.invoices || []).find(i => i.id === id)
      return inv ? { id: inv.id, number: inv.number, balance: inv.balance, status: inv.status } : { id, number: id, balance: 0, status: 'unknown' }
    })
    return NextResponse.json({ customerPayment: cp, invoices: updatedInvoices })
  } catch (e: any) {
    const raw = String(e?.message || '')
    if (/not found/i.test(raw)) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    if (/exceeds/i.test(raw)) return NextResponse.json({ error: raw }, { status: 400 })
  if (/closed period/i.test(raw)) {
    const cp2 = isDateInClosedPeriod(requestedDate)
    if (cp2) return NextResponse.json(buildClosedPeriodErrorPayload(cp2.closedThrough, cp2.requestedDate), { status: 400 })
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
  if (/Deposit must go to an Asset account/i.test(raw)) return NextResponse.json({ error: raw }, { status: 400 })
  if (/Target account not found/i.test(raw)) return NextResponse.json({ error: raw }, { status: 400 })
    if (/must be > 0/i.test(raw)) return NextResponse.json({ error: raw }, { status: 400 })
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
