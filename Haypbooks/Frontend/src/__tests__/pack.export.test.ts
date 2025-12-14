import { GET as PACK_EXP } from '@/app/api/reports/pack/export/route'

const makeReq = (url: string) => new Request(url)

describe('Management Pack export', () => {
  test('CSV: caption present and filename tokens applied', async () => {
    const url = 'http://localhost/api/reports/pack/export?format=csv&preset=Custom&end=2025-09-04&name=Q3 Snapshot&reports=trial-balance,profit-loss'
    const res: any = await PACK_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
  expect(lines[0].startsWith('As of ')).toBe(true)
  const cd = res.headers.get('Content-Disposition') as string
  expect(cd).toContain('management-pack-asof-2025-09-04')
    expect(cd).toContain('_q3-snapshot')
  })

  test('PDF: filename mirrors CSV naming with .pdf extension', async () => {
    const url = 'http://localhost/api/reports/pack/export?format=pdf&preset=Custom&start=2025-08-01&end=2025-09-30&name=Board Pack&reports=trial-balance'
    const res: any = await PACK_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('management-pack-2025-08-01_to_2025-09-30_board-pack.pdf')
    const ct = res.headers.get('Content-Type') as string
    expect(ct).toBe('application/pdf')
  })
})
