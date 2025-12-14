import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { getCheck, markPrinted } from '../../store'
import { db } from '@/mock/db'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'bills:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = params.id
  const curr = getCheck(id)
  if (!curr) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (curr.status === 'void') return NextResponse.json({ error: 'Cannot mark a void check as printed' }, { status: 409 })
  const updated = markPrinted(id)
  if (updated) {
    ;(db.auditEvents ||= []).push({
      id: `aud_${Date.now()}`,
      ts: new Date().toISOString(),
      actor: 'system',
      action: 'check:printed',
      entityType: 'check',
      entityId: updated.id,
      after: { printedAt: updated.printedAt, status: updated.status },
      meta: { number: updated.number, account: updated.account }
    } as any)
  }
  return NextResponse.json({ check: updated })
}
