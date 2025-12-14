import { NextResponse } from 'next/server'
import { db } from '@/mock/db'

export async function GET() {
  // Allow only when running in development or when mock mode is explicitly enabled
  if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API !== 'true') {
    return NextResponse.json({ error: 'mock snapshot endpoint restricted' }, { status: 403 })
  }

  // Return a deep-cloned snapshot of the in-memory DB so clients can persist it
  const snapshot = structuredClone(db)
  return NextResponse.json({ snapshot })
}
