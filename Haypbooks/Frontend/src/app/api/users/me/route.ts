import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : ''

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
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !BACKEND) {
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
    return NextResponse.json(MOCK_USER)
  }
}
