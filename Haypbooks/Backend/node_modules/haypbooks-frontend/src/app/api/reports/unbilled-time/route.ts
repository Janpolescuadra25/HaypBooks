import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  return NextResponse.json({ rows: [], totals: {}, asOf: new Date().toISOString().slice(0, 10) })
}
