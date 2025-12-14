import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { getClosedThrough } from '@/lib/periods'
import { isDateInClosedPeriod, buildClosedPeriodErrorPayload } from '@/lib/period-lock'
import { getCheck, voidCheck } from '../../store'
import { db } from '@/mock/db'

type VoidBody = {
  voidDate?: string
  reason?: string
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = params.id
  const curr = getCheck(id)
  if (!curr) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (curr.status === 'void') return NextResponse.json({ error: 'Already void' }, { status: 409 })

  let body: VoidBody = {}
  try { body = await req.json() } catch { /* no body */ }
  const today = new Date().toISOString().slice(0,10)
  const voidDate = (body?.voidDate && body.voidDate.slice(0,10)) || today

  const cp = isDateInClosedPeriod(voidDate)
  const closed = getClosedThrough()
  if (cp) return NextResponse.json(buildClosedPeriodErrorPayload(cp.closedThrough, cp.requestedDate), { status: 400 })

  // Determine void mode: if original date falls in closed period, record mode as 'reversal'
  let mode: 'flat' | 'reversal' = 'flat'
  if (closed) {
    const od = new Date(curr.date + 'T00:00:00Z')
    const cd = new Date(closed + 'T00:00:00Z')
    if (!isNaN(od.valueOf()) && !isNaN(cd.valueOf()) && od.getTime() <= cd.getTime()) {
      mode = 'reversal'
    }
  }

  const updated = voidCheck(id, voidDate, mode)
  // Audit: record void action with mode
  if (updated) {
    ;(db.auditEvents ||= []).push({
      id: `aud_${Date.now()}`,
      ts: new Date().toISOString(),
      actor: 'system',
      action: 'check:void',
      entityType: 'check',
      entityId: updated.id,
      before: { status: curr.status },
      after: { status: updated.status, voidedAt: updated.voidedAt, voidMode: updated.voidMode },
      meta: { reason: body?.reason, number: updated.number, account: updated.account }
    } as any)
  }
  return NextResponse.json({ check: updated })
}
