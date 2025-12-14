import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { createAdjustingJournal } from '@/mock/db'
import '@/mock/seed'

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const { date, lines, reversing } = body || {}
  if (!date || !Array.isArray(lines) || !lines.length) return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  try {
    const result = createAdjustingJournal({ date, lines, reversing: !!reversing })
    return NextResponse.json({ journalEntryId: result.id, reversingId: result.reversingId || null })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
