import { NextRequest, NextResponse } from 'next/server'
import { db, seedIfNeeded, listVendorRefunds as dbListVendorRefunds, createVendorRefund as dbCreateVendorRefund } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'

export async function GET(req: NextRequest) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const vendorId = url.searchParams.get('vendorId') || undefined
  const refunds = dbListVendorRefunds({ vendorId }).map(r => ({
    id: r.id,
    vendorId: r.vendorId,
    date: r.date.slice(0,10),
    amount: Number(r.amount) || 0,
    method: r.method,
    reference: r.reference,
    vendorCreditId: r.vendorCreditId,
  }))
  return NextResponse.json({ refunds, total: refunds.length })
}

export async function POST(req: NextRequest) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({} as any))
  const vendorId = String(body?.vendorId || '')
  const amount = Number(body?.amount)
  const date = typeof body?.date === 'string' && /\d{4}-\d{2}-\d{2}/.test(body.date) ? body.date : undefined
  const method = body?.method ? String(body.method) : undefined
  const reference = body?.reference ? String(body.reference) : undefined
  const vendorCreditId = body?.vendorCreditId ? String(body.vendorCreditId) : undefined

  if (!vendorId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'Amount must be > 0' }, { status: 400 })

    // Closed-period enforcement with structured payload
    const requestedDate = (date || new Date().toISOString().slice(0,10))
    const cp = isDateInClosedPeriod(requestedDate)
    if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })

  try {
    const refund = dbCreateVendorRefund({ vendorId, amount, date, method, reference, vendorCreditId })
    return NextResponse.json({ refund })
  } catch (e: any) {
    const raw = String(e?.message || '')
    if (/not found/i.test(raw)) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
      if (/closed period/i.test(raw)) {
        const cp2 = isDateInClosedPeriod(requestedDate)
        if (cp2) return NextResponse.json(buildClosedPeriodErrorPayload(cp2.closedThrough, cp2.requestedDate), { status: 400 })
        return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
      }
    if (/Amount must be > 0/i.test(raw)) return NextResponse.json({ error: raw }, { status: 400 })
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
