import { NextResponse } from 'next/server'

// Use BACKEND_INTERNAL_URL (server-only) or NEXT_PUBLIC_API_URL, falling back
// to the local dev backend. NEXT_PUBLIC_API_URL may be unset in dev when the
// frontend relies on the Next.js proxy — in that case we still need to know
// the backend address for server-side fetch calls.
const BACKEND = (
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:4000'
).replace(/\/$/, '')

const MOCK_USER = {
  id: 'mock-user-1',
  email: 'owner@haypbooks.com',
  firstName: 'Demo',
  lastName: 'User',
  role: 'owner',
  companyId: '6c7cf4bd-ea1b-4b26-896e-5ebe59eebf55',
}

/**
 * Proxy GET /api/users/me to the backend.
 * Must be a dedicated route (not a rewrite) so httpOnly cookies are forwarded
 * correctly from the browser to the backend and back.
 */
export async function GET(req: Request) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
    return NextResponse.json(MOCK_USER)
  }

  try {
    const backendRes = await fetch(`${BACKEND}/api/users/me`, {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') ?? '',
        accept: 'application/json',
      },
    })

    const text = await backendRes.text().catch(() => '')
    let json: any = null
    try { json = text ? JSON.parse(text) : null } catch { json = { raw: text } }

    const nextRes = NextResponse.json(json ?? {}, { status: backendRes.status })

    // Forward any Set-Cookie headers the backend sends back
    const setCookies: string[] = (backendRes.headers as any).getSetCookie?.() ?? []
    for (const c of setCookies) {
      nextRes.headers.append('set-cookie', c)
    }

    return nextRes
  } catch (error) {
    console.error('[/api/users/me] Backend proxy error:', error)
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 })
  }
}
