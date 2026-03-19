import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, _ctx: { params: { slug: string } }) {
  return new NextResponse('', { status: 200, headers: { 'Content-Type': 'text/csv' } })
}
