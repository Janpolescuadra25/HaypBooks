import { NextResponse } from 'next/server'
import { db } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const id = ctx?.params?.id
  const found = (db.messages || []).find((m: any) => m.id === id)
  if (!found) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  return NextResponse.json({ message: found })
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'settings:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = ctx?.params?.id
  const raw = await req.text()
  let body: any = {}
  if (raw) {
    try { body = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }
  }
  const idx = (db.messages || []).findIndex((m: any) => m.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  const now = new Date().toISOString()
  const existing = db.messages![idx]
  const updated = { ...existing, name: body.name ?? existing.name, body: body.body ?? existing.body, updatedAt: now, tags: body.tags ?? existing.tags }
  db.messages![idx] = updated
  return NextResponse.json({ message: updated })
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'settings:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = ctx?.params?.id
  const idx = (db.messages || []).findIndex((m: any) => m.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  db.messages!.splice(idx, 1)
  return NextResponse.json({ ok: true })
}
