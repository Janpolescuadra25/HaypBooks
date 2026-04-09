import { NextResponse } from 'next/server'

/**
 * Proxy token refresh to the backend so the new token and refreshToken
 * Set-Cookie headers are forwarded to the browser against the frontend origin.
 *
 * Without this proxy, the Next.js rewrite concatenates multiple Set-Cookie
 * values with commas, corrupting the token cookies and breaking the refresh flow.
 * Login/logout already use this pattern — this route fixes it for token refresh.
 */
export async function POST(req: Request) {
  try {
    const backendBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000'
    const url = `${backendBase.replace(/\/$/, '')}/api/auth/refresh`

    const backendRes = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: req.headers.get('cookie') ?? '',
      },
    })

    const respText = await backendRes.text().catch(() => '')
    let respJson: any = null
    try {
      respJson = respText ? JSON.parse(respText) : null
    } catch {
      respJson = { raw: respText }
    }

    const nextRes = NextResponse.json(respJson || {}, { status: backendRes.status })

    // Forward every Set-Cookie header individually to avoid comma-concatenation corruption
    const setCookies: string[] = (backendRes.headers as any).getSetCookie?.() ?? []
    for (const c of setCookies) {
      nextRes.headers.append('set-cookie', c)
    }

    return nextRes
  } catch (error) {
    console.error('Proxy refresh error:', error)
    return NextResponse.json({ error: 'Token refresh proxy failed' }, { status: 500 })
  }
}
