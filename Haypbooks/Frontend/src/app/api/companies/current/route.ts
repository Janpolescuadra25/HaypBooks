import { NextResponse } from 'next/server'

const MOCK_COMPANY = {
  id: '6c7cf4bd-ea1b-4b26-896e-5ebe59eebf55',
  name: 'Haypbooks Demo Company',
  currency: 'USD',
  fiscalYearStart: '01-01',
  plan: 'professional',
  country: 'US',
  taxId: '12-3456789',
  createdAt: new Date().toISOString(),
}

export async function GET(req: Request) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== 'true') {
    const backendBase = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:4000'
    try {
      const res = await fetch(`${backendBase}/api/companies/current`, { headers: new Headers(req.headers) })
      const body = await res.text()
      return new Response(body, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
    } catch {
      return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 })
    }
  }
  return NextResponse.json(MOCK_COMPANY)
}
