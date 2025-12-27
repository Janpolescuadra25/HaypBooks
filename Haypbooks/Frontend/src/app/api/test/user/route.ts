import { NextResponse } from 'next/server'
import { db } from '@/mock/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const email = url.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'missing email' }, { status: 400 })
  const u = (db.users || []).find((x: any) => x.email === email)
  return NextResponse.json(u || null)
}