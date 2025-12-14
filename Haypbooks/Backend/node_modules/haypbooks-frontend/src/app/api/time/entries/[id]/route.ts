import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, listTimeEntries as dbList, updateTimeEntry as dbUpdate, deleteTimeEntry as dbDelete } from '@/mock/db'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const te = dbList({}).find(t => t.id === params.id)
  if (!te) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ timeEntry: te })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await request.json()
    const te = dbUpdate(params.id, body)
    return NextResponse.json({ timeEntry: te })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const ok = dbDelete(params.id)
    return NextResponse.json({ ok })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 400 })
  }
}
