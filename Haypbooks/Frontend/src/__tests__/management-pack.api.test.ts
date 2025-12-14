import { GET } from '@/app/api/reports/pack/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Management pack export API', () => {
  it('returns CSV when format omitted', async () => {
    const url = 'http://localhost/api/reports/pack/export?reports=profit-and-loss,balance-sheet&preset=YTD'
    const res: any = await GET(makeReq(url))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('attachment;')
  })

  it('returns PDF placeholder when format=pdf', async () => {
    const url = 'http://localhost/api/reports/pack/export?format=pdf&reports=profit-and-loss&preset=ThisMonth'
    const res: any = await GET(makeReq(url))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
  })
})
