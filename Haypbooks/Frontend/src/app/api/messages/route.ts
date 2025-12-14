import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

export async function GET() {
  seedIfNeeded()
  // Public read of message library is allowed for now
  return NextResponse.json({ messages: db.messages || [] })
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'settings:write')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  seedIfNeeded()
  const raw = await req.text()
  let body: any = {}
  if (raw) {
    try { body = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }
  }
  if (!body || typeof body.body !== 'string') return NextResponse.json({ error: 'Missing message body' }, { status: 400 })

  const id = `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
  const now = new Date().toISOString()
  const m = { id, name: body.name || 'Untitled', body: body.body, authorId: role || 'system', createdAt: now, updatedAt: now, tags: body.tags || [] }
  db.messages!.push(m)
  return NextResponse.json({ message: m }, { status: 201 })
}
