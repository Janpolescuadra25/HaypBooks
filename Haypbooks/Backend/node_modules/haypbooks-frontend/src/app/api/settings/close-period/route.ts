import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { closePeriod, db } from '@/mock/db'
import '@/mock/seed'

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({})) as { date?: string; password?: string }
  const date: string | undefined = body?.date
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })
  // If a close password is configured, require it
  if (db.settings?.closePassword) {
    if (!body.password || body.password !== db.settings.closePassword) {
      return NextResponse.json({ error: 'Close password required or incorrect' }, { status: 403 })
    }
  }
  try {
    const closed = closePeriod(date)
    return NextResponse.json({ closed })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
