import { GET as PACK_EXP } from '@/app/api/reports/pack/export/route'

const mk = (u: string) => new Request(u)

describe('Management Pack with Adjusted Trial Balance', () => {
  test('CSV: caption present and filename stable when including ATB', async () => {
    const url = 'http://localhost/api/reports/pack/export?format=csv&preset=Custom&end=2025-09-04&name=Monthly Board&reports=profit-loss,adjusted-trial-balance'
    const res: any = await PACK_EXP(mk(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[0].startsWith('As of ')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    // As-of naming for Custom with only end date
    expect(cd).toContain('management-pack-asof-2025-09-04')
    expect(cd).toContain('_monthly-board')
  })
})
