import { GET as REG_JSON } from '@/app/api/reports/bank-register/route'
import { GET as REG_CSV } from '@/app/api/reports/bank-register/export/route'

const makeReq = (url: string) => new Request(url)

describe('bank register CSV export', () => {
  it('includes CSV-Version prelude when requested and builds filename with acct token', async () => {
    const url = 'http://localhost/api/reports/bank-register/export?period=ThisMonth&csv=1'
    const res: any = await REG_CSV(makeReq(url) as any)
    expect(res.status).toBe(200)
    const cd = res.headers.get('content-disposition') || ''
    expect(cd).toMatch(/attachment; filename="bank-register-.*acct/i)
    const body = await res.text()
    const firstLine = body.split('\n')[0]
    expect(firstLine).toBe('CSV-Version,1')
  })
})
