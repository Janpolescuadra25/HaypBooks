import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const backendBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000'
    const url = `${backendBase.replace(/\/$/, '')}/api/auth/logout`

    const cookieHeader = cookies().toString()
    const backendRes = await fetch(url, {
      method: 'POST',
      headers: {
        cookie: cookieHeader,
      },
    })

    const respText = await backendRes.text().catch(() => '')
    let respJson: any = null
    try {
      respJson = respText ? JSON.parse(respText) : null
    } catch {
      respJson = { raw: respText }
    }

    const nextRes = NextResponse.json(respJson || { ok: true }, { status: backendRes.status })

    const setCookies: string[] = (backendRes.headers as any).getSetCookie?.() ?? []
    for (const c of setCookies) {
      nextRes.headers.append('set-cookie', c)
    }

    // Also defensively clear local cookies for the frontend origin.
    try {
      cookies().delete('authToken')
      cookies().delete('refreshToken')
      cookies().delete('token')
      cookies().delete('email')
      cookies().delete('userId')
      cookies().delete('role')
    } catch {}

    return nextRes
  } catch (error) {
    console.error('Proxy logout error:', error)
    // Even if backend logout fails, clear local cookies so UI can proceed.
    try {
      cookies().delete('authToken')
      cookies().delete('refreshToken')
      cookies().delete('token')
      cookies().delete('email')
      cookies().delete('userId')
      cookies().delete('role')
    } catch {}
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}
