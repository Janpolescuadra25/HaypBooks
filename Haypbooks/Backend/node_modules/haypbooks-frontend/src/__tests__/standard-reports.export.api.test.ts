import { GET as GetJson } from '@/app/api/reports/standard/[slug]/route'
import { GET as GetCsv } from '@/app/api/reports/standard/[slug]/export/route'

function makeReq(path: string, qs?: Record<string, string>) {
  const url = new URL(`http://localhost${path}`)
  if (qs) Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v))
  return new Request(url.toString())
}

async function call(slug: string, qs?: Record<string, string>) {
  const req = makeReq(`/api/reports/standard/${slug}/export`, qs)
  return GetCsv(req as any, { params: { slug } })
}

async function callJson(slug: string, qs?: Record<string, string>) {
  const req = makeReq(`/api/reports/standard/${slug}`, qs)
  return GetJson(req as any, { params: { slug } })
}

describe('Standard reports CSV export', () => {
  it('retail CSV header matches columns and respects channel filter', async () => {
    const jsonRes: any = await callJson('retail-sales-by-channel')
    const json = await jsonRes.json()
    const res: any = await call('retail-sales-by-channel')
    const text = await res.text()
    const [header, ...rest] = text.split(/\r?\n/)
    expect(header).toBe(json.columns.join(','))

  const filtered: any = await call('retail-sales-by-channel', { channel: 'POS' })
  const filteredText = await filtered.text()
  const lines = filteredText.trim().split(/\r?\n/)
  expect(lines.length).toBe(3) // header + one row + total
  expect(lines[1].startsWith('POS,')).toBe(true)
  expect(lines[2].startsWith('Total,')).toBe(true)
  })

  it('construction CSV filters by minMargin', async () => {
    const res: any = await call('construction-job-profitability', { minMargin: '60' })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[0]).toBe('Job,Revenue,Costs,Gross Margin,Margin %')
    // Ensure all rows have margin >= 60%
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      const pct = parseFloat(cols[4].replace('%', ''))
      expect(pct).toBeGreaterThanOrEqual(60)
    }
  })

  it('psa CSV filters by minUtil', async () => {
    const res: any = await call('psa-utilization', { minUtil: '85' })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[0]).toBe('Consultant,Billable Hours,Non-billable Hours,Utilization %')
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      const pct = parseFloat(cols[3].replace('%', ''))
      expect(pct).toBeGreaterThanOrEqual(85)
    }
  })

  it('healthcare CSV respects financial-only view', async () => {
    const res: any = await call('healthcare-revenue-cycle', { view: 'financial-only' })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
  expect(lines[0]).toBe('Stage,Count,Amount')
  expect(lines.length).toBe(1 + 3 + 1) // header + 3 rows + total
    expect(lines[1].startsWith('Charges,')).toBe(true)
    expect(lines[2].startsWith('Payments,')).toBe(true)
  expect(lines[3].startsWith('Adjustments,')).toBe(true)
  expect(lines[4].startsWith('Total,')).toBe(true)
  })

  it('manufacturing CSV respects minTurn filter', async () => {
    const res: any = await call('manufacturing-wip-inventory', { minTurn: '5' })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[0]).toBe('SKU,On Hand,WIP Units,WIP Value,Turns')
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      expect(parseFloat(cols[4])).toBeGreaterThanOrEqual(5)
    }
  })

  it('saas CSV filters by segment', async () => {
    const res: any = await call('saas-mrr-churn', { segment: 'SMB' })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
  expect(lines[0]).toBe('Segment,MRR,New MRR,Expansion,Contraction,Churn %')
  expect(lines.length).toBe(3) // header + one row + total
  expect(lines[1].startsWith('SMB,')).toBe(true)
  expect(lines[2].startsWith('Total,')).toBe(true)
  })

  it('non-profit CSV filters by restriction and has totals', async () => {
    const res: any = await call('non-profit-fund-activity', { restriction: 'Temporarily Restricted' })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[0]).toBe('Fund,Restriction,Revenue,Expenses,Net Change')
    // header + at least one row + total
    expect(lines.length).toBeGreaterThanOrEqual(3)
    // Ensure all data rows (except total) are Temporarily Restricted
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      if (cols[0] === 'Total') continue
      expect(cols[1]).toBe('Temporarily Restricted')
    }
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
  })

  it('education CSV filters by program and has totals', async () => {
    const res: any = await call('education-grant-spend-vs-budget', { program: 'Arts' })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[0]).toBe('Grant,Program,Budget,Actual Spend,Variance')
    expect(lines.length).toBeGreaterThanOrEqual(3)
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      if (cols[0] === 'Total') continue
      expect(cols[1]).toBe('Arts')
    }
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
  })

  it('government CSV filters by program and has totals', async () => {
    const res: any = await call('government-fund-balance', { program: 'Public Works' })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[0]).toBe('Program,Opening Balance,Revenues,Expenditures,Transfers,Ending Balance')
    expect(lines.length).toBeGreaterThanOrEqual(3)
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      if (cols[0] === 'Total') continue
      expect(cols[0]).toBe('Public Works')
    }
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
  })

  it('includes filter tokens in CSV filename for retail channel', async () => {
    const res: any = await call('retail-sales-by-channel', { channel: 'Marketplace', period: 'YTD' })
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toMatch(/retail-sales-by-channel-YTD_ch-marketplace\.csv/)
  })

  it('includes filter tokens in CSV filename for construction minMargin', async () => {
    const res: any = await call('construction-job-profitability', { minMargin: '60', period: 'QTD' })
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toMatch(/construction-job-profitability-QTD_mm60\.csv/)
  })

  it('includes filter tokens in CSV filename for non-profit restriction', async () => {
    const res: any = await call('non-profit-fund-activity', { restriction: 'Temporarily Restricted', period: 'MTD' })
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toMatch(/non-profit-fund-activity-MTD_res-temporarily-restricted\.csv/)
  })

  it('hospitality CSV filters by property and has tokens in filename', async () => {
    const res: any = await call('hospitality-occupancy-revpar', { property: 'Airport Hotel', period: 'YTD' })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[0]).toBe('Property,Rooms Available,Rooms Sold,Occupancy %,ADR,RevPAR')
    expect(lines.length).toBe(3) // header + one row + total
    expect(lines[1].startsWith('Airport Hotel,')).toBe(true)
    expect(lines[2].startsWith('Total,')).toBe(true)
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toMatch(/hospitality-occupancy-revpar-YTD_prop-airport-hotel\.csv/)
  })

  it('ecommerce CSV filters by category and has tokens in filename', async () => {
    const res: any = await call('ecommerce-return-rate-by-category', { category: 'Apparel', period: 'MTD' })
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[0]).toBe('Category,Orders,Returns,Return Rate %,Revenue,Refunds,Net Revenue')
    expect(lines.length).toBe(3)
    expect(lines[1].startsWith('Apparel,')).toBe(true)
    expect(lines[2].startsWith('Total,')).toBe(true)
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toMatch(/ecommerce-return-rate-by-category-MTD_cat-apparel\.csv/)
  })

  it('includes custom date range in filename when start and end are provided', async () => {
    const res: any = await call('retail-sales-by-channel', {
      period: 'Custom',
      start: '2025-01-01',
      end: '2025-01-31',
      channel: 'Marketplace',
    })
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toMatch(/retail-sales-by-channel-Custom_2025-01-01_to_2025-01-31_ch-marketplace\.csv/)
  })
})
