import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { voidInvoice, findInvoice, db } from '@/mock/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(()=> ({}))
  const { createReversing, reason, reversalDate } = body || {}
  const inv = findInvoice(params.id)
  if (!inv) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  try {
    voidInvoice(inv.id, { createReversing, reason, reversalDate })
    const audit = (db.auditEvents || []).filter(e => e.entityType === 'invoice' && e.entityId === inv.id).slice(-5)
    return NextResponse.json({ invoice: inv, audit })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 400 })
  }
}
