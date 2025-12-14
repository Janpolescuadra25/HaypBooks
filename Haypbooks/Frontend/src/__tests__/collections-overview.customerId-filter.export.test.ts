import { seedIfNeeded, db, createInvoice, updateInvoice, applyPaymentToInvoice } from '@/mock/db'
import { GET as GET_EXPORT } from '@/app/api/collections/overview/export/route'

const makeReq = (url: string) => new Request(url)

// Minimal CSV splitter that respects quotes
function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++ } else { inQuotes = false }
      } else { cur += ch }
    } else {
      if (ch === ',') { out.push(cur); cur = '' }
      else if (ch === '"') { inQuotes = true }
      else { cur += ch }
    }
  }
  out.push(cur)
  return out
}

function parseCurrency(s: string): number { const n = Number((s || '').replace(/[^0-9\-\.]/g, '')); return isNaN(n) ? 0 : n }

describe('Collections Overview CSV export — customerId filter', () => {
  beforeAll(() => { seedIfNeeded() })

  test('filters rows and recomputes totals; filename uses as-of token', async () => {
    const baseTs = Date.now()
    const makeCust = (suffix: string) => { const c = { id: `coll_filter_csv_${suffix}_${baseTs}`, name: `CollFilterCSV ${suffix}` }; db.customers.push(c as any); return c }
    const target = makeCust('target')
    const other = makeCust('other')

    const asOf = '2025-09-04'
    // Seed invoices for both customers
    const invT = createInvoice({ number: `T_${baseTs}`, customerId: target.id, date: asOf, lines: [{ description: 'Svc', amount: 450 }] })
    updateInvoice(invT.id, { status: 'sent' })
    applyPaymentToInvoice(invT.id, 50)

    const invO = createInvoice({ number: `O_${baseTs}`, customerId: other.id, date: asOf, lines: [{ description: 'Svc', amount: 300 }] })
    updateInvoice(invO.id, { status: 'sent' })

    const url = `http://localhost/api/collections/overview/export?asOf=${asOf}&customerId=${target.id}`
    const res: any = await GET_EXPORT(makeReq(url))
    expect(res.status).toBe(200)
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    // Filename should include only the as-of token; no customerId token is expected
    expect(disp).toContain(`collections-overview-asof-${asOf}`)

    const lines = body.trim().split(/\r?\n/)
    const header = splitCsvLine(lines[0])
    const idxCustomer = header.indexOf('Customer')
    const idxOpen = header.indexOf('Open Balance')
    const idxOverdue = header.indexOf('Overdue')
    const idxNet = header.indexOf('Net Receivable')
    expect(idxCustomer).toBeGreaterThan(-1)
    expect(idxOpen).toBeGreaterThan(-1)
    expect(idxOverdue).toBeGreaterThan(-1)
    expect(idxNet).toBeGreaterThan(-1)

    const dataRows = lines.slice(1, lines.length - 1).map(splitCsvLine)
    // All rows should be for the target customer
    expect(dataRows.length).toBeGreaterThan(0)
    for (const r of dataRows) { expect(r[idxCustomer]).toContain('CollFilterCSV target') }

    const totals = splitCsvLine(lines[lines.length - 1])
  const sumOpen = dataRows.reduce((acc: number, r: string[]) => acc + parseCurrency(r[idxOpen] || '0'), 0)
  const sumOverdue = dataRows.reduce((acc: number, r: string[]) => acc + parseCurrency(r[idxOverdue] || '0'), 0)
  const sumNet = dataRows.reduce((acc: number, r: string[]) => acc + parseCurrency(r[idxNet] || '0'), 0)
    const tol = 0.01
    expect(Math.abs(parseCurrency(totals[idxOpen] || '0') - sumOpen)).toBeLessThanOrEqual(tol)
    expect(Math.abs(parseCurrency(totals[idxOverdue] || '0') - sumOverdue)).toBeLessThanOrEqual(tol)
    expect(Math.abs(parseCurrency(totals[idxNet] || '0') - sumNet)).toBeLessThanOrEqual(tol)
  })
})
