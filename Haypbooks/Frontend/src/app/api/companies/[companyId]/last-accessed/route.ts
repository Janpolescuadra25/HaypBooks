import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== 'true') {
    const backendBase = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:4000'
    try {
      const { pathname } = new URL(req.url)
      const res = await fetch(`${backendBase}${pathname}`, { method: 'PATCH', headers: new Headers(req.headers) })
      return new Response(null, { status: res.status })
    } catch {
      return NextResponse.json({ ok: true }) // last-accessed is fire-and-forget; degrade gracefully
    }
  }
  return NextResponse.json({ ok: true })
}
