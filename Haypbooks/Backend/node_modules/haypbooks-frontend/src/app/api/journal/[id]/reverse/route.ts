import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { reverseJournalEntry, seedIfNeeded } from '@/mock/db'
import { getClosedThrough } from '@/lib/periods'

export async function POST(req: Request, ctx?: { params: { id: string } }) {
  try { seedIfNeeded() } catch {}
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Support both Next.js route signature and direct test invocation without ctx
  let id = ctx?.params?.id
  if (!id) {
    try {
      const u = new URL(req.url)
      // Expect path like /api/journal/{id}/reverse
      const parts = u.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex(p => p === 'journal')
      if (idx !== -1 && parts[idx + 1]) id = parts[idx + 1]
    } catch {}
  }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body = await req.json().catch(() => null) as { date?: string; memo?: string } | null
  const requestedDate = body?.date
  // Optional pre-check: if client specifies a reversal date in a closed period, communicate clearly
  if (requestedDate && /\d{4}-\d{2}-\d{2}/.test(requestedDate)) {
    const closedThrough = getClosedThrough()
    if (closedThrough && requestedDate <= closedThrough) {
      return NextResponse.json({ error: `Accounting period is closed through ${closedThrough}. Choose a later reversal date or omit date to auto-pick next open day.` }, { status: 400 })
    }
  }

  try {
    const reversingId = reverseJournalEntry(id, { date: requestedDate, memo: body?.memo })
    return NextResponse.json({ reversingEntryId: reversingId })
  } catch (e: any) {
    const msg = String(e?.message || 'Failed to reverse journal')
    const status = /not found/i.test(msg) ? 404 : 400
    return NextResponse.json({ error: msg }, { status })
  }
}
