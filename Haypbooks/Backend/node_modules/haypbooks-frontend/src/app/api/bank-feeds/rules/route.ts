import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  return NextResponse.json({ rows: [], meta: {} })
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest) {
  return NextResponse.json({ ok: true })
}
