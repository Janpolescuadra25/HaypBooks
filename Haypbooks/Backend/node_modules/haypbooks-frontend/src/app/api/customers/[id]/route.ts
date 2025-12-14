import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { cookies } from 'next/headers'
import { logEvent } from '@/lib/audit'
import { ensureSampleCustomers, getCustomer, updateCustomer, addCustomer } from '../store'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'customers:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params.id
  ensureSampleCustomers()
  const customer = getCustomer(id)
  if (!customer) {
    // Fallback sample if specific id wasn't seeded
    const idx = parseInt(id.replace(/\D/g, '').slice(-1) || '1', 10)
    return NextResponse.json({ customer: {
      id,
      name: `Customer ${idx}`,
      terms: (['Net 15','Net 30','Due on receipt'] as const)[idx % 3],
      email: `customer${idx}@example.com`,
      phone: `555-01${String(idx).padStart(2,'0')}`,
    } })
  }
  return NextResponse.json({ customer })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'customers:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params.id
  const body = await req.json().catch(() => ({}))
  const name = String(body?.name || '').trim()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  const terms = String(body?.terms || '')
  const email = String(body?.email || '')
  const phone = String(body?.phone || '')
  ensureSampleCustomers()
  let updated = updateCustomer(id, { name, terms, email, phone })
  if (!updated) {
    updated = addCustomer({ id, name, terms, email, phone })
  }
  const userId = cookies().get('userId')?.value || 'u_anon'
  logEvent({ userId, action: 'customer:update', entity: 'customer', entityId: id, meta: { name, terms, email, phone } })
  return NextResponse.json({ customer: updated })
}
