import { NextResponse } from 'next/server'
import { addBankRule, listBankRules, seedIfNeeded, db, deleteBankRule } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

export async function GET() {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  return NextResponse.json({ rules: listBankRules() })
}

export async function POST(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const { name, textIncludes, amountEquals, setCategory, setStatus } = body || {}
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const rule = addBankRule({ name, textIncludes, amountEquals, setCategory, setStatus })
  return NextResponse.json({ rule }, { status: 201 })
}

export async function DELETE(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'journal:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const ok = deleteBankRule(id)
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
