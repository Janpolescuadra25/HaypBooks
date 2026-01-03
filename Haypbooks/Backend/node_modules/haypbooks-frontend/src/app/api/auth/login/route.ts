import { NextResponse } from 'next/server'

/**
 * Proxy login to the backend so browser cookies are set against the frontend origin.
 * This keeps the UI behavior consistent with backend auth + refresh token cookies.
 */
export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    const backendBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000'
    const url = `${backendBase.replace(/\/$/, '')}/api/auth/login`

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
    const setCookies: string[] = (backendRes.headers as any).getSetCookie?.() ?? []
    for (const c of setCookies) {
      nextRes.headers.append('set-cookie', c)
    }

    return nextRes
  } catch (error) {
    console.error('Proxy login error:', error)
    return NextResponse.json({ error: 'Login proxy failed' }, { status: 500 })
  }
}
