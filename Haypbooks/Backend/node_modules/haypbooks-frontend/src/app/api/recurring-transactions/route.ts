import { NextRequest, NextResponse } from 'next/server'
import { addTemplate, listTemplates, removeTemplate, seedIfEmpty, updateTemplate } from './store'

function requireRole(req: NextRequest, role: string) {
  const r = req.headers.get('x-role') || req.cookies.get('role')?.value || 'viewer'
  const order = ['viewer','user','admin']
  return order.indexOf(r) >= order.indexOf(role)
}

export async function GET() {
  seedIfEmpty()
  return NextResponse.json({ data: listTemplates() })
}

export async function POST(req: NextRequest) {
  if (!requireRole(req, 'user')) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const body = await req.json()
  const t = addTemplate(body)
  return NextResponse.json({ data: t }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  if (!requireRole(req, 'user')) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const { id, changes } = await req.json()
  const t = updateTemplate(id, changes)
  if (!t) return NextResponse.json({ error: 'not-found' }, { status: 404 })
  return NextResponse.json({ data: t })
}

export async function DELETE(req: NextRequest) {
  if (!requireRole(req, 'admin')) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url, 'http://test')
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id-required' }, { status: 400 })
  removeTemplate(id)
  return NextResponse.json({ ok: true })
}
