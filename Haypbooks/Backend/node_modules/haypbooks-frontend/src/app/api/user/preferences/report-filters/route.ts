import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type PrefPayload = { filters: Record<string, string>; updatedAt: string }

// Simple in-memory store keyed by user+reportKey during dev.
// Note: This resets on server restart and is intended for mock/demo only.
const store = new Map<string, PrefPayload>()

function getUserKey() {
  const email = cookies().get('email')?.value || 'demo@haypbooks.test'
  return email
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const reportKey = searchParams.get('reportKey') || ''
  if (!reportKey) {
    return NextResponse.json({ error: 'reportKey is required' }, { status: 400 })
  }
  const key = `${getUserKey()}::${reportKey}`
  const payload = store.get(key) || { filters: {}, updatedAt: new Date(0).toISOString() }
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null)
  const reportKey = String(body?.reportKey || '')
  const filters = (body?.filters && typeof body.filters === 'object') ? body.filters as Record<string, string> : null
  if (!reportKey || !filters) {
    return NextResponse.json({ error: 'reportKey and filters are required' }, { status: 400 })
  }
  const key = `${getUserKey()}::${reportKey}`
  const payload: PrefPayload = { filters, updatedAt: new Date().toISOString() }
  store.set(key, payload)
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
