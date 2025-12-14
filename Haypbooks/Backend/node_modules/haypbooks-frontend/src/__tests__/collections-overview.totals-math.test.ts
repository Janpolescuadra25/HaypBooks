import { GET as GET_EXPORT } from '@/app/api/collections/overview/export/route'

const makeReq = (url: string) => new Request(url)

function parseCurrency(s: string): number {
  // Remove common currency symbols and grouping, keep sign and decimals
  const cleaned = s.replace(/[^0-9\-\.]/g, '')
  const n = Number(cleaned)
  return isNaN(n) ? 0 : n
}

// Minimal CSV splitter that respects quotes
function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { // escaped quote
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else {
      if (ch === ',') {
        out.push(cur)
        cur = ''
      } else if (ch === '"') {
        inQuotes = true
      } else {
        cur += ch
      }
    }
  }
  out.push(cur)
  return out
}

describe('Collections Overview CSV export — Totals math', () => {
  test('Totals equal the sum of data rows for Open Balance, Overdue, Net', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/collections/overview/export?asOf=2025-09-04'))
    expect(res.status).toBe(200)
    const lines = (await res.text()).trim().split(/\r?\n/)
    if (lines.length < 2) return // header-only edge case
    const header = splitCsvLine(lines[0])
    const idxOpen = header.indexOf('Open Balance')
    const idxOverdue = header.indexOf('Overdue')
    const idxNet = header.indexOf('Net Receivable')
    expect(idxOpen).toBeGreaterThan(-1)
    expect(idxOverdue).toBeGreaterThan(-1)
    expect(idxNet).toBeGreaterThan(-1)

    // All data rows are from 1..last-1; the last line is the Totals row
    const totalRow = splitCsvLine(lines[lines.length - 1])
    const dataRows = lines.slice(1, lines.length - 1).map(splitCsvLine)

  const sumOpen = dataRows.reduce((acc: number, r: string[]) => acc + parseCurrency(r[idxOpen] || '0'), 0)
  const sumOverdue = dataRows.reduce((acc: number, r: string[]) => acc + parseCurrency(r[idxOverdue] || '0'), 0)
  const sumNet = dataRows.reduce((acc: number, r: string[]) => acc + parseCurrency(r[idxNet] || '0'), 0)

    const totalOpen = parseCurrency(totalRow[idxOpen] || '0')
    const totalOverdue = parseCurrency(totalRow[idxOverdue] || '0')
    const totalNet = parseCurrency(totalRow[idxNet] || '0')

    // Use a tolerance for floating rounding
    const tol = 0.01
    expect(Math.abs(totalOpen - sumOpen)).toBeLessThanOrEqual(tol)
    expect(Math.abs(totalOverdue - sumOverdue)).toBeLessThanOrEqual(tol)
    expect(Math.abs(totalNet - sumNet)).toBeLessThanOrEqual(tol)
  })
})
