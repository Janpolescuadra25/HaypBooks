import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    cookies().delete('authToken')
    cookies().delete('refreshToken')
    cookies().delete('token') // legacy
  } catch {}
  return NextResponse.json({ ok: true })
}
