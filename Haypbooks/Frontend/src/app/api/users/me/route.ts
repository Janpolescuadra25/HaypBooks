import { NextResponse } from 'next/server'

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000').replace(/\/$/, '')

/**
 * Proxy GET /api/users/me to the backend.
 * Must be a dedicated route (not a rewrite) so httpOnly cookies are forwarded
 * correctly from the browser to the backend and back.
 */
export async function GET(req: Request) {
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
    console.error('[proxy /api/users/me] error:', error)
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 502 })
  }
}
