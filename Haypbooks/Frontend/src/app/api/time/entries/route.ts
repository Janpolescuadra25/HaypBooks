import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, listTimeEntries as dbList, createTimeEntry as dbCreate } from '@/mock/db'

export async function GET(request: Request) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId') || undefined
  const projectId = searchParams.get('projectId') || undefined
  const status = (searchParams.get('status') || undefined) as any
  const start = searchParams.get('start') || undefined
  const end = searchParams.get('end') || undefined
  const rows = dbList({ customerId, projectId, status, start, end })
  return NextResponse.json({ timeEntries: rows })
}

export async function POST(request: Request) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const te = dbCreate({ customerId: body.customerId, projectId: body.projectId, date: body.date, hours: body.hours, description: body.description, billable: body.billable, rate: body.rate, tags: body.tags })
  return NextResponse.json({ timeEntry: te })
}
