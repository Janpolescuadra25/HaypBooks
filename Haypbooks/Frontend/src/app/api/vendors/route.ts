import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { cookies } from 'next/headers'
import { logEvent } from '@/lib/audit'
import { addVendor, ensureSampleVendors, listVendors } from './store'

export async function GET(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'vendors:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').toLowerCase()
  ensureSampleVendors()
  const all = listVendors()
  const list = q ? all.filter(v => v.name.toLowerCase().includes(q)) : all
  return NextResponse.json({ vendors: list })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'vendors:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const name = String(body?.name || '').trim()
  const terms = String(body?.terms || '')
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  ensureSampleVendors()
  const id = `ven_${Math.random().toString(36).slice(2, 8)}`
  const created = addVendor({ id, name, terms })
  const userId = cookies().get('userId')?.value || 'u_anon'
  logEvent({ userId, action: 'vendor:create', entity: 'vendor', entityId: id, meta: { name, terms } })
  return NextResponse.json({ vendor: created })
}
