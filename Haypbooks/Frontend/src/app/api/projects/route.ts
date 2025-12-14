import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, listProjects as dbList, createProject as dbCreate } from '@/mock/db'

export async function GET() {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const rows = dbList({})
  return NextResponse.json({ projects: rows })
}

export async function POST(request: Request) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const proj = dbCreate({ name: body.name, customerId: body.customerId, hourlyRate: body.hourlyRate, active: body.active, tags: body.tags })
  return NextResponse.json({ project: proj })
}
