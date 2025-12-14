import { GET as AR_SUM } from '@/app/api/reports/ar-aging/export/route'
import { GET as AP_SUM } from '@/app/api/reports/ap-aging/export/route'
import { GET as AR_DET } from '@/app/api/reports/ar-aging-detail/export/route'
import { GET as AP_DET } from '@/app/api/reports/ap-aging-detail/export/route'
import { GET as STMT_LIST } from '@/app/api/reports/statement-list/export/route'
import { GET as CUST_STMT } from '@/app/api/customers/[id]/statement/export/route'
import { seedIfNeeded, db } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('CSV-Version opt-in for aging and statements', () => {
  test('AR Aging summary: default omits, opt-in includes', async () => {
    const base = 'http://test/api/reports/ar-aging/export?asOf=2025-02-15'
    const noVer: any = await AR_SUM(makeReq(base))
    const noVerText = await noVer.text()
    expect(noVerText.split('\n',1)[0].startsWith('CSV-Version')).toBe(false)

    const withVer: any = await AR_SUM(makeReq(base + '&csvVersion=1'))
    const lines = (await withVer.text()).split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1].startsWith('As of')).toBe(true)
  })

  test('AP Aging summary: default omits, opt-in includes', async () => {
    const base = 'http://test/api/reports/ap-aging/export?asOf=2025-02-15'
    const noVer: any = await AP_SUM(makeReq(base))
    const noVerText = await noVer.text()
    expect(noVerText.split('\n',1)[0].startsWith('CSV-Version')).toBe(false)

    const withVer: any = await AP_SUM(makeReq(base + '&csvVersion=1'))
    const lines = (await withVer.text()).split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1].startsWith('As of')).toBe(true)
  })

  test('AR Aging detail: default omits, opt-in includes', async () => {
    const base = 'http://test/api/reports/ar-aging-detail/export?period=YTD&end=2025-02-15'
    const noVer: any = await AR_DET(makeReq(base))
    const noVerText = await noVer.text()
    expect(noVerText.split('\n',1)[0].startsWith('CSV-Version')).toBe(false)

    const withVer: any = await AR_DET(makeReq(base + '&csvVersion=1'))
    const lines = (await withVer.text()).split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
  })

  test('AP Aging detail: default omits, opt-in includes', async () => {
    const base = 'http://test/api/reports/ap-aging-detail/export?period=YTD&end=2025-02-15'
    const noVer: any = await AP_DET(makeReq(base))
    const noVerText = await noVer.text()
    expect(noVerText.split('\n',1)[0].startsWith('CSV-Version')).toBe(false)

    const withVer: any = await AP_DET(makeReq(base + '&csvVersion=1'))
    const lines = (await withVer.text()).split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
  })

  test('Statement List: default omits, opt-in includes', async () => {
    const base = 'http://test/api/reports/statement-list/export?end=2025-09-15'
    const noVer: any = await STMT_LIST(makeReq(base))
    const noVerText = await noVer.text()
    expect(noVerText.split('\n',1)[0].startsWith('CSV-Version')).toBe(false)

    const withVer: any = await STMT_LIST(makeReq(base + '&csvVersion=1'))
    const lines = (await withVer.text()).split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
  })

  test('Customer Statement: default omits, opt-in includes', async () => {
    seedIfNeeded()
    const custId = db.customers[0].id
    const base = `http://test/api/customers/${custId}/statement/export?asOf=2025-09-15`
    const noVer: any = await CUST_STMT(makeReq(base), { params: { id: custId } } as any)
    const noVerText = await noVer.text()
    expect(noVerText.split('\n',1)[0].startsWith('CSV-Version')).toBe(false)

    const withVer: any = await CUST_STMT(makeReq(base + '&csvVersion=1'), { params: { id: custId } } as any)
    const lines = (await withVer.text()).split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
  })
})
