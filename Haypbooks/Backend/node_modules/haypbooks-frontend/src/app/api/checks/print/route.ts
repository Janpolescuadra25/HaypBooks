import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { buildCsvFilename, sanitizeToken } from '@/lib/csv'
import { todayIso } from '@/lib/date'

type PrintChecksPayload = {
  asOfIso?: string
  account?: string
  count?: number
  startNumber?: string | number
  preview?: boolean
}

export async function POST(req: Request) {
  const role = getRoleFromCookies()
  // Printing checks is a privileged action – require bills:write
  if (!hasPermission(role, 'bills:write')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let payload: PrintChecksPayload | undefined
  try {
    payload = await req.json()
  } catch {
    payload = {}
  }

  const asOfIso = (payload?.asOfIso && String(payload.asOfIso)) || todayIso()
  const acct = (payload?.account && sanitizeToken(String(payload.account))) || ''
  const tokens = acct ? [acct] : undefined

  // Build a standardized filename using the shared CSV helper, then swap to .pdf
  const baseName = buildCsvFilename('checks', { asOfIso, tokens })
  const pdfName = baseName.replace(/\.csv$/i, '.pdf')

  // Tiny PDF-file header bytes (same placeholder approach used elsewhere)
  const bytes = new Uint8Array([0x25,0x50,0x44,0x46,0x2D,0x31,0x2E,0x34,0x0A,0x25,0xE2,0xE3,0xCF,0xD3,0x0A])

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfName}"`,
      // Echo a couple of non-sensitive hints that might help client UX in the future
      'X-Checks-Count': String(payload?.count || ''),
    },
  })
}
