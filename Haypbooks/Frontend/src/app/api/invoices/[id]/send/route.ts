import { NextResponse } from 'next/server'
import { db, updateInvoice as dbUpdateInvoice } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { logEvent } from '@/lib/audit'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const inv = dbUpdateInvoice(id, { status: 'sent' })
    const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
    return NextResponse.json({ invoice })
  } catch (e: any) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }
}
