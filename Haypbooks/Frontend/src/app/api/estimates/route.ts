import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { seedIfNeeded, listEstimates as dbListEstimates, createEstimate as dbCreateEstimate } from '@/mock/db'

export async function GET(request: Request) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') || '1')
  const limit = Number(searchParams.get('limit') || '20')
  const start = searchParams.get('start') || undefined
  const end = searchParams.get('end') || undefined
  const status = searchParams.get('status') || undefined
  const { rows, total } = dbListEstimates({ start, end, status, page, limit })
  return NextResponse.json({ estimates: rows, total })
}

export async function POST(request: Request) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'invoices:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  try {
    const est = dbCreateEstimate({ number: body.number, customerId: body.customerId, date: body.date, lines: body.lines || [], terms: body.terms, expiryDate: body.expiryDate })
    return NextResponse.json({ estimate: est })
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : 'Failed to create estimate'
    // Map closed-period and validation errors to 400 for consistency
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
