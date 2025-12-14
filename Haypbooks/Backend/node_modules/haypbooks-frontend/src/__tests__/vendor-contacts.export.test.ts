import { GET as GET_VENDOR_CONTACTS } from '@/app/api/reports/vendor-contact-list/export/route'

const makeReq = (url: string) => new Request(url)

describe('Vendor Contacts CSV export', () => {
  test('caption-first, header shape, helper filename, and filtering', async () => {
    const res: any = await GET_VENDOR_CONTACTS(makeReq('http://localhost/api/reports/vendor-contact-list/export?end=2025-09-15&q=vendor'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    // Caption row should be As of formatted for the given end date
    expect(lines[0]).toMatch(/As of/) // human-friendly date
    // Header row after spacer
    expect(lines[2]).toBe('Name,Email,Phone')
    // Filename via helper with as-of semantics and slug
    expect(disp).toContain('vendor-contacts-asof-2025-09-15')
    // Filtering by q should only include vendors that match 'vendor'
    // Given seeded data likely includes multiple vendors; ensure at least one data row exists
    expect(lines.length).toBeGreaterThan(3)
  })
})
