import { NextRequest, NextResponse } from 'next/server'
import { findTemplate, updateTemplate } from '../store'

function requireRole(req: NextRequest, role: string) {
  const r = req.headers.get('x-role') || req.cookies.get('role')?.value || 'viewer'
  const order = ['viewer','user','admin']
  return order.indexOf(r) >= order.indexOf(role)
}

export async function POST(req: NextRequest) {
  if (!requireRole(req, 'user')) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json()
  const t = findTemplate(body.id)
  if (!t) return NextResponse.json({ error: 'not-found' }, { status: 404 })
  if (t.status !== 'paused') return NextResponse.json({ error: 'not-paused' }, { status: 409 })
  updateTemplate(t.id, { status: 'active' })
  return NextResponse.json({ data: t })
}
