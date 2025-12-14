import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { cookies } from 'next/headers'
import { logEvent } from '@/lib/audit'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'vendors:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params.id
  const idx = parseInt(id.replace(/\D/g, '').slice(-1) || '1', 10)
  const vendor = {
    id,
    name: `Vendor ${idx}`,
    terms: (['Net 15','Net 30','Due on receipt'] as const)[idx % 3],
  }
  return NextResponse.json({ vendor })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'vendors:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params.id
  const body = await req.json().catch(() => ({}))
  const name = String(body?.name || '').trim()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  const terms = String(body?.terms || '')
  const vendor = { id, name, terms }
  const userId = cookies().get('userId')?.value || 'u_anon'
  logEvent({ userId, action: 'vendor:update', entity: 'vendor', entityId: id, meta: { name: vendor.name, terms } })
  return NextResponse.json({ vendor })
}
