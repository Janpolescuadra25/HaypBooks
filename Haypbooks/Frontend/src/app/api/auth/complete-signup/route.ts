import { NextResponse } from 'next/server'

/**
 * Proxy complete-signup to the backend so all Set-Cookie headers
 * (token, refreshToken, email, userId, role, isAccountant) are forwarded
 * to the browser against the frontend origin.
 *
 * Without this proxy, the Next.js rewrite concatenates multiple Set-Cookie
 * values with commas, corrupting every cookie. Login/logout already use
 * explicit proxies for the same reason — this route fixes it for signup completion.
 */
export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    const backendBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000'
    const url = `${backendBase.replace(/\/$/, '')}/api/auth/complete-signup`

    const backendRes = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: req.headers.get('cookie') ?? '',
      },
      body: bodyText,
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
    console.error('Proxy complete-signup error:', error)
    return NextResponse.json({ error: 'Signup completion proxy failed' }, { status: 500 })
  }
}
