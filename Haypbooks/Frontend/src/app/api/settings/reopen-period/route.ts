import { NextResponse, NextRequest } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { reopenPeriodWithAudit, db } from '@/mock/db'
import '@/mock/seed'

// Accept either NextRequest or plain Request for test convenience
export async function POST(req: NextRequest | Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = (req && typeof (req as any).json === 'function')
    ? await (req as any).json().catch(() => ({}))
    : ({} as { password?: string; reason?: string })
  if (db.settings?.closePassword) {
    if (!body.password || body.password !== db.settings.closePassword) {
      return NextResponse.json({ error: 'Close password required or incorrect' }, { status: 403 })
    }
  }
  reopenPeriodWithAudit(body.reason)
  return NextResponse.json({ reopened: true })
}
