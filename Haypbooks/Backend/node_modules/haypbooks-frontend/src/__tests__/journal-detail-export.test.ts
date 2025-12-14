import { GET as handler } from '@/app/api/journal/[id]/export/route'

describe('Journal detail CSV export', () => {
  it('returns CSV with As of and Totals', async () => {
    const req = new Request('http://localhost/api/journal/123/export')
    const res: any = await handler(req as any, { params: { id: '123' } } as any)
    const text = await res.text()
    expect(res.headers.get('Content-Type')).toContain('text/csv')
  expect(text).toMatch(/Journal JE-1\d{5}/)
  expect(text).toMatch(/As of /)
    expect(text).toMatch(/Totals,,,/)
  })
})
