import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'
import '@/mock/seed'

export async function GET() {
  seedIfNeeded()
  const role = getRoleFromCookies()
  // Reuse a read-safe permission; settings are read-only here and safe for users who can read invoices
  if (!hasPermission(role as any, 'invoices:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const settings = db.settings || { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true }
  return NextResponse.json({ settings })
}

export async function PUT(request: Request) {
  seedIfNeeded()
  const role = getRoleFromCookies()
  if (!hasPermission(role as any, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  const allowed: Array<keyof typeof db.settings> = ['accountingMethod','baseCurrency','allowBackdated'] as any
  const before = { ...(db.settings || {}) }
  db.settings = db.settings || { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true }
  for (const k of allowed) {
    if (k in body) (db.settings as any)[k] = body[k]
  }
  // audit
  try {
    // lightweight inline audit to avoid circular imports
    const { auditEvents } = db as any
    auditEvents?.push({ id: `aud_${Date.now()}`, ts: new Date().toISOString(), actor: 'system', action: 'update', entityType: 'settings', entityId: 'company', before, after: { ...db.settings } })
  } catch {}
  return NextResponse.json({ settings: db.settings })
}
