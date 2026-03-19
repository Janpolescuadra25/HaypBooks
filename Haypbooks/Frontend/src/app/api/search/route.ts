import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  const url = new URL(_req.url)
  const q = url.searchParams.get('q') ?? ''
  return NextResponse.json({ query: q, groups: {} })
}
