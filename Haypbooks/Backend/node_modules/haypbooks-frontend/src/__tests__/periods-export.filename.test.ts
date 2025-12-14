import { GET as PERIODS_GET } from '@/app/api/periods/export/route'

describe('Periods CSV export filename', () => {
  test('includes as-of date suffix', async () => {
    const res: any = await PERIODS_GET(new Request('http://localhost/api/periods/export'))
    const cd = res.headers.get('Content-Disposition') as string
    // uses current date for as-of; assert prefix instead of exact date
    expect(cd).toContain('periods-asof-')
  })
})
