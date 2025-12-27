import { NextResponse } from 'next/server'

/**
 * Proxy signup to backend during development and forwards essential cookies.
 * This ensures the real backend creates OTPs and returns dev-only `_devOtp`.
 */
export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    const backendBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000'
    const url = `${backendBase.replace(/\/$/, '')}/auth/signup`

    const backendRes = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: bodyText,
    })

    const respText = await backendRes.text().catch(() => '')
    let respJson: any = null
    try { respJson = respText ? JSON.parse(respText) : null } catch (e) { respJson = { raw: respText } }

    // Build Next response with backend body and status
    const nextRes = NextResponse.json(respJson || {}, { status: backendRes.status })

    // If backend returned fields useful for cookies, set them on the frontend response.
    // This mirrors backend behavior when running directly against it.
    if (respJson?.token) nextRes.cookies.set('token', String(respJson.token), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    if (respJson?.user?.email) nextRes.cookies.set('email', String(respJson.user.email), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    if (respJson?.user?.id) nextRes.cookies.set('userId', String(respJson.user.id), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    if (respJson?.user?.role) nextRes.cookies.set('role', String(respJson.user.role), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })

    return nextRes
  } catch (error) {
    console.error('Proxy signup error:', error)
    return NextResponse.json({ error: 'Signup proxy failed' }, { status: 500 })
  }
}
