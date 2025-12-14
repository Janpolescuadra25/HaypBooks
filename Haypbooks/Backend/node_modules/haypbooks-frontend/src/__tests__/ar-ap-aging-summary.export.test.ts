import { GET as GET_AR } from '@/app/api/reports/ar-aging/export/route'
import { GET as GET_AP } from '@/app/api/reports/ap-aging/export/route'

describe('Aging Summary CSV exports', () => {
  test('AR export has caption/header/totals and filename format', async () => {
    const res: any = await GET_AR(new Request('http://localhost/api/reports/ar-aging/export?period=YTD&end=2025-09-04'))
    expect(res.status).toBe(200)
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain('ar-aging-YTD-asof-2025-09-04')
    const text = await res.text()
    const lines = text.trim().split('\n')
    expect(lines[0].startsWith('As of,')).toBe(true)
    expect(lines[1]).toBe('Customer,Current,30,60,90,120+,Total')
    expect(lines[lines.length-1].startsWith('Totals,')).toBe(true)
  })

  test('AP export has caption/header/totals and filename format', async () => {
    const res: any = await GET_AP(new Request('http://localhost/api/reports/ap-aging/export?period=YTD&end=2025-09-04'))
    expect(res.status).toBe(200)
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain('ap-aging-YTD-asof-2025-09-04')
    const text = await res.text()
    const lines = text.trim().split('\n')
    expect(lines[0].startsWith('As of,')).toBe(true)
    expect(lines[1]).toBe('Vendor,Current,30,60,90,120+,Total')
    expect(lines[lines.length-1].startsWith('Totals,')).toBe(true)
  })
})
