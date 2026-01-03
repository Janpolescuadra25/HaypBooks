import { NextResponse } from 'next/server'

/**
 * Proxy signup to backend during development and forwards essential cookies.
 * This ensures the real backend creates OTPs and returns dev-only `_devOtp`.
 */
export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    const backendBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000'
    const url = `${backendBase.replace(/\/$/, '')}/api/auth/signup`

    const backendRes = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // Forward cookies if present (defensive; signup usually doesn't need them)
        cookie: req.headers.get('cookie') ?? '',
      },
      body: bodyText,
    })

    const respText = await backendRes.text().catch(() => '')
    let respJson: any = null
    try { respJson = respText ? JSON.parse(respText) : null } catch (e) { respJson = { raw: respText } }

    // Build Next response with backend body + status, and forward any Set-Cookie headers
    // so the browser stores cookies against the frontend origin.
    const nextRes = NextResponse.json(respJson || {}, { status: backendRes.status })

    const setCookies: string[] = (backendRes.headers as any).getSetCookie?.() ?? []
    for (const c of setCookies) {
      nextRes.headers.append('set-cookie', c)
    }

    return nextRes
  } catch (error) {
    console.error('Proxy signup error:', error)
    return NextResponse.json({ error: 'Signup proxy failed' }, { status: 500 })
  }
}
