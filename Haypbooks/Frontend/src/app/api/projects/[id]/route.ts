import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, findProject as dbFind, updateProject as dbUpdate, deleteProject as dbDelete } from '@/mock/db'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const proj = dbFind(params.id)
  if (!proj) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ project: proj })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const proj = dbUpdate(params.id, body)
  return NextResponse.json({ project: proj })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const ok = dbDelete(params.id)
  return NextResponse.json({ ok })
}
