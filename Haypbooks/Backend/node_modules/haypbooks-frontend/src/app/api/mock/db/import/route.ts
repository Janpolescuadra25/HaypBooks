import { NextResponse } from 'next/server'
import { db } from '@/mock/db'

function mergeSnapshotIntoDb(snapshot: any) {
  // Only merge keys that exist on the running DB and are arrays/objects
  for (const key of Object.keys(db)) {
    if (Object.prototype.hasOwnProperty.call(snapshot, key)) {
      try {
        // Replace arrays/objects only — avoid overwriting functions or prototypes
        const val = snapshot[key]
        if (Array.isArray(val) || (val && typeof val === 'object')) db[key] = val
      } catch (err) {
        // non-fatal — continue
      }
    }
  }
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_USE_MOCK_API !== 'true') {
    return NextResponse.json({ error: 'mock import endpoint restricted' }, { status: 403 })
  }

  try {
    const body = await req.json()
    if (!body || typeof body !== 'object' || !body.snapshot) return NextResponse.json({ error: 'missing snapshot' }, { status: 400 })
    mergeSnapshotIntoDb(body.snapshot)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
