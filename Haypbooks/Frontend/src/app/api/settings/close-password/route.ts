import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { setClosePassword } from '@/mock/db'
import '@/mock/seed'

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  // Require settings:write permission for updating close password
  const canAdmin = hasPermission(role, 'settings:write')
  if (!canAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json().catch(()=>({})) as { password?: string }
  try {
    setClosePassword(body.password)
    return NextResponse.json({ ok: true, enabled: !!body.password })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || 'Failed') }, { status: 400 })
  }
}