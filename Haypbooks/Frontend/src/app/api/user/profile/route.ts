import { NextResponse } from 'next/server'
import { getPermissionsForRole, getRoleFromCookies } from '@/lib/rbac-server'

const BACKEND = (
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:4000'
).replace(/\/$/, '')

/**
 * GET /api/user/profile
 * Proxies to /api/users/me and adapts the response shape for the ProfileCard component.
 * Falls back to a mock when NEXT_PUBLIC_USE_MOCK_API=true.
 */
export async function GET(req: Request) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
    const role = getRoleFromCookies()
    return NextResponse.json({
      id: 'u_1',
      name: 'Demo User',
      email: 'demo@haypbooks.test',
      role,
      permissions: getPermissionsForRole(role),
      features: { payments: true, payroll: false, inventory: false, projects: false, budgets: false },
      company: { id: 'c_1', name: 'Demo Company', currency: 'USD' },
    })
  }

  try {
    const backendRes = await fetch(`${BACKEND}/api/users/me`, {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') ?? '',
        accept: 'application/json',
      },
    })

    if (!backendRes.ok) {
      const text = await backendRes.text().catch(() => '')
      let json: any = null
      try { json = text ? JSON.parse(text) : null } catch { json = { raw: text } }
      return NextResponse.json(json ?? {}, { status: backendRes.status })
    }

    const me = await backendRes.json()

    // Adapt /api/users/me shape → ProfileCard expected shape
    const firstName = me.firstName || ''
    const lastName = me.lastName || ''
    const name = [firstName, lastName].filter(Boolean).join(' ') || me.email || 'Unknown'
    const firstCompany = (me.companies ?? [])[0] ?? null
    const role = getRoleFromCookies()

    return NextResponse.json({
      id: me.id,
      name,
      email: me.email,
      role: me.role ?? role,
      permissions: getPermissionsForRole(role),
      features: { payments: true, payroll: false, inventory: false, projects: false, budgets: false },
      company: firstCompany
        ? { id: firstCompany.id, name: firstCompany.name, currency: firstCompany.currency ?? 'USD' }
        : { id: '', name: '', currency: 'USD' },
    })
  } catch (error) {
    console.error('[/api/user/profile] Backend proxy error:', error)
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 })
  }
}
