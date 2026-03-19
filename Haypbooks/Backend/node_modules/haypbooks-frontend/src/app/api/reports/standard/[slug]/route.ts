import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, _ctx: { params: { slug: string } }) {
  return NextResponse.json({ rows: [], meta: {} })
}
