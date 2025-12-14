import { NextResponse } from 'next/server'
import type { InvoiceLayout, CompanyInfo } from '@/types/invoiceLayout'
import { DEFAULT_LAYOUT, DEFAULT_COMPANY } from '@/types/invoiceLayout'

// Mock backend: module-scoped in-memory storage
let MOCK_COMPANY: CompanyInfo = { ...DEFAULT_COMPANY }
let MOCK_LAYOUT: InvoiceLayout = { ...DEFAULT_LAYOUT }

export async function GET() {
  return NextResponse.json({ company: MOCK_COMPANY, layout: MOCK_LAYOUT })
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    if (body?.company) {
      MOCK_COMPANY = { ...MOCK_COMPANY, ...body.company }
    }
    if (body?.layout) {
      MOCK_LAYOUT = { ...MOCK_LAYOUT, ...body.layout }
    }
    return NextResponse.json({ ok: true, company: MOCK_COMPANY, layout: MOCK_LAYOUT })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Invalid payload' }, { status: 400 })
  }
}
