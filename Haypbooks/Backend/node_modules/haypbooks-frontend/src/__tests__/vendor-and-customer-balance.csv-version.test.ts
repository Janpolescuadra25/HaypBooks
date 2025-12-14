import { GET as VB_D_GET } from '@/app/api/reports/vendor-balance-detail/export/route'
import { GET as CBD_GET } from '@/app/api/reports/customer-balance-detail/export/route'
import { GET as CBS_GET } from '@/app/api/reports/customer-balance-summary/export/route'

const makeReq = (u: string) => new Request(u)

describe('Vendor/Customer Balance exports — CSV-Version prelude', () => {
  test('vendor-balance-detail: omits by default; includes when opted-in', async () => {
    const noFlag: any = await VB_D_GET(makeReq('http://test/api/reports/vendor-balance-detail/export?end=2025-09-04'))
    const noText = await noFlag.text()
    expect(noText.split('\n', 1)[0].startsWith('CSV-Version')).toBe(false)

    const yesFlag: any = await VB_D_GET(makeReq('http://test/api/reports/vendor-balance-detail/export?end=2025-09-04&csvVersion=1'))
    const yesText = await yesFlag.text()
    expect(yesText.split('\n', 1)[0]).toBe('CSV-Version,1')
  })

  test('customer-balance-detail: omits by default; includes when opted-in', async () => {
    const noFlag: any = await CBD_GET(makeReq('http://test/api/reports/customer-balance-detail/export?end=2025-09-04'))
    const noText = await noFlag.text()
    expect(noText.split('\n', 1)[0].startsWith('CSV-Version')).toBe(false)

    const yesFlag: any = await CBD_GET(makeReq('http://test/api/reports/customer-balance-detail/export?end=2025-09-04&csvVersion=1'))
    const yesText = await yesFlag.text()
    expect(yesText.split('\n', 1)[0]).toBe('CSV-Version,1')
  })

  test('customer-balance-summary: omits by default; includes when opted-in', async () => {
    const noFlag: any = await CBS_GET(makeReq('http://test/api/reports/customer-balance-summary/export?end=2025-09-04'))
    const noText = await noFlag.text()
    expect(noText.split('\n', 1)[0].startsWith('CSV-Version')).toBe(false)

    const yesFlag: any = await CBS_GET(makeReq('http://test/api/reports/customer-balance-summary/export?end=2025-09-04&csvVersion=1'))
    const yesText = await yesFlag.text()
    expect(yesText.split('\n', 1)[0]).toBe('CSV-Version,1')
  })
})
