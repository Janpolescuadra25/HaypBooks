import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { logEvent } from '@/lib/audit'
import { getClosedThrough } from '@/lib/periods'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'
import { deleteSalesReceipt, listSalesReceipts, seedSalesReceipts, upsertSalesReceipt } from './store'

function gen(page = 1, limit = 20) {
  return Array.from({ length: limit }, (_, i) => {
    const idx = (page - 1) * limit + i + 1
    return {
      id: `sr_${idx}`,
      date: new Date(Date.UTC(2025, 0, Math.max(1, (idx % 28) + 1))).toISOString(),
      customer: `Customer ${idx}`,
      description: `Sales receipt ${idx}`,
      amount: 50 + (idx % 20) * 5,
    }
  })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  seedSalesReceipts(gen(1, 60))
  const all = listSalesReceipts()
  const slice = all.slice((page - 1) * limit, (page - 1) * limit + limit)
  return NextResponse.json({ receipts: slice, total: all.length, page, limit })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({} as any))
  const { date, customer, description, amount } = body || {}
  if (!date || !customer || typeof amount !== 'number') {
    return NextResponse.json({ error: 'date, customer, amount are required' }, { status: 400 })
  }
  // Period lock: block receipts dated on/before closed date
  const cp = isDateInClosedPeriod(date)
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })
  const r = upsertSalesReceipt({ id: `sr_${Math.random().toString(36).slice(2,8)}`, date, customer, description, amount })
  logEvent({ userId: 'u_1', action: 'salesReceipt.create', entity: 'sales-receipt', entityId: r.id, meta: { amount: r.amount } })
  return NextResponse.json({ receipt: r })
}

export async function PUT(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({} as any))
  const { id, date, customer, description, amount } = body || {}
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  if (!date || !customer || typeof amount !== 'number') {
    return NextResponse.json({ error: 'date, customer, amount are required' }, { status: 400 })
  }
  // Period lock: prevent moving receipt into a closed period
  const cp = isDateInClosedPeriod(date)
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })
  const r = upsertSalesReceipt({ id, date, customer, description, amount })
  logEvent({ userId: 'u_1', action: 'salesReceipt.update', entity: 'sales-receipt', entityId: r.id, meta: { amount: r.amount } })
  return NextResponse.json({ receipt: r })
}

export async function DELETE(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  deleteSalesReceipt(id)
  logEvent({ userId: 'u_1', action: 'salesReceipt.delete', entity: 'sales-receipt', entityId: id })
  return NextResponse.json({ ok: true })
}
