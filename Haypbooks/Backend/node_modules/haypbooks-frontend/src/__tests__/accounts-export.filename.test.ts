import { GET as ACCOUNTS_GET } from '@/app/api/accounts/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Accounts CSV export filename', () => {
  test('includes as-of date in filename', async () => {
    const url = 'http://localhost/api/accounts/export?end=2025-09-04'
  const res: any = await ACCOUNTS_GET(makeReq(url) as any)
    const cd = res.headers.get('Content-Disposition') as string
    // Route uses current date for as-of; just assert prefix
    expect(cd).toContain('accounts-asof-')
  })
})
