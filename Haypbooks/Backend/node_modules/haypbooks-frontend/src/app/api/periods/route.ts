import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { getClosedThrough, getPeriods, closeThrough } from '@/lib/periods'

export async function GET() {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ closedThrough: getClosedThrough(), periods: getPeriods() })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => null) as { action?: string; end?: string; closeThrough?: string } | null
  // Accept both shapes: { closeThrough: 'YYYY-MM-DD' } (preferred) or { action: 'close-through', end: 'YYYY-MM-DD' } (legacy)
  const end = body?.closeThrough || (body?.action === 'close-through' ? body?.end : undefined)
  if (!end) {
    return NextResponse.json({ error: 'Invalid body. Use { closeThrough: "YYYY-MM-DD" }' }, { status: 400 })
  }
  const p = closeThrough(end)
  return NextResponse.json({ closedThrough: p.end, period: p })
}
