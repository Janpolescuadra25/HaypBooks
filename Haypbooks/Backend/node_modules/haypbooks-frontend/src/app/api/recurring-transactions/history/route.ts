import { NextRequest, NextResponse } from 'next/server'
import { listHistory } from '../store'

function requireRole(req: NextRequest, role: string) {
  const r = req.headers.get('x-role') || req.cookies.get('role')?.value || 'viewer'
  const order = ['viewer','user','admin']
  return order.indexOf(r) >= order.indexOf(role)
}

export async function GET(req: NextRequest) {
  if (!requireRole(req,'user')) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const url = new URL(req.url)
  const templateId = url.searchParams.get('templateId') || undefined
  const start = url.searchParams.get('start') || undefined
  const end = url.searchParams.get('end') || undefined
  const data = listHistory({ templateId, start, end })
  return NextResponse.json({ data })
}
