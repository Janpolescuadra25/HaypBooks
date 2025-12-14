import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, findEstimate as dbFindEstimate, updateEstimate as dbUpdateEstimate, deleteEstimate as dbDeleteEstimate } from '@/mock/db'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const est = dbFindEstimate(params.id)
  if (!est) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ estimate: est })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const est = dbUpdateEstimate(params.id, body)
  return NextResponse.json({ estimate: est })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const ok = dbDeleteEstimate(params.id)
  return NextResponse.json({ ok })
}
