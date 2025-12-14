import { GET } from '@/app/api/reports/standard/[slug]/route'

function makeReq(path: string, qs?: Record<string, string>) {
  const url = new URL(`http://localhost${path}`)
  if (qs) Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v))
  return new Request(url.toString())
}

async function callStandard(slug: string, qs?: Record<string, string>) {
  const req = makeReq(`/api/reports/standard/${slug}`, qs)
  return GET(req as any, { params: { slug } })
}

describe('Standard reports API', () => {
  it('retail-sales-by-channel returns expected columns and filters by channel', async () => {
    const res: any = await callStandard('retail-sales-by-channel')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.columns).toEqual(['Channel', 'Orders', 'Gross Sales', 'Discounts', 'Net Sales'])
    expect(body.rows.length).toBeGreaterThan(1)

  const onlyOnline: any = await callStandard('retail-sales-by-channel', { channel: 'Online' })
  const onlineBody = await onlyOnline.json()
  expect(onlineBody.rows.length).toBe(2) // Online + Total
  expect(onlineBody.rows[0][0]).toBe('Online')
  expect(onlineBody.rows[1][0]).toBe('Total')
  })

  it('construction-job-profitability filters by minMargin', async () => {
  const res: any = await callStandard('construction-job-profitability')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.columns).toEqual(['Job', 'Revenue', 'Costs', 'Gross Margin', 'Margin %'])
  expect(body.rows.length).toBe(6) // 5 jobs + Total

  const filtered: any = await callStandard('construction-job-profitability', { minMargin: '60' })
    const fbody = await filtered.json()
    expect(fbody.rows.every((r: any[]) => parseFloat(String(r[4]).replace('%','')) >= 60)).toBe(true)
    expect(fbody.rows.length).toBeLessThanOrEqual(body.rows.length)
  })

  it('psa-utilization filters by minUtil', async () => {
  const res: any = await callStandard('psa-utilization')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.columns).toEqual(['Consultant', 'Billable Hours', 'Non-billable Hours', 'Utilization %'])
  expect(body.rows.length).toBe(6) // 5 consultants + Total

  const filtered: any = await callStandard('psa-utilization', { minUtil: '85' })
    const fbody = await filtered.json()
    expect(fbody.rows.every((r: any[]) => parseFloat(String(r[3]).replace('%','')) >= 85)).toBe(true)
    expect(fbody.rows.length).toBeLessThanOrEqual(body.rows.length)
  })

  it('healthcare-revenue-cycle supports financial-only view', async () => {
  const res: any = await callStandard('healthcare-revenue-cycle')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.columns).toEqual(['Stage', 'Count', 'Amount'])
  expect(body.rows.length).toBe(6) // 5 stages + Total

  const finOnly: any = await callStandard('healthcare-revenue-cycle', { view: 'financial-only' })
    const fbody = await finOnly.json()
    const stages = fbody.rows.map((r: any[]) => r[0])
    expect(stages).toEqual(['Charges', 'Payments', 'Adjustments', 'Total'])
  })

  it('manufacturing-wip-inventory supports minTurn filter', async () => {
    const res: any = await callStandard('manufacturing-wip-inventory', { minTurn: '4' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.columns).toEqual(['SKU', 'On Hand', 'WIP Units', 'WIP Value', 'Turns'])
    expect(body.rows.every((r: any[]) => Number(r[4]) >= 4)).toBe(true)
  })

  it('saas-mrr-churn filters by segment', async () => {
    const res: any = await callStandard('saas-mrr-churn', { segment: 'Enterprise' })
    const body = await res.json()
    expect(body.columns).toEqual(['Segment', 'MRR', 'New MRR', 'Expansion', 'Contraction', 'Churn %'])
  expect(body.rows.length).toBe(2) // Enterprise + Total
  expect(body.rows[0][0]).toBe('Enterprise')
  expect(body.rows[1][0]).toBe('Total')
  })

  it('non-profit-fund-activity filters by restriction and has totals', async () => {
    const res: any = await callStandard('non-profit-fund-activity', { restriction: 'Unrestricted' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.columns).toEqual(['Fund', 'Restriction', 'Revenue', 'Expenses', 'Net Change'])
    const fundRestrictions = body.rows.map((r: any[]) => r[1])
    // All rows except total should be Unrestricted
    expect(body.rows.every((r: any[]) => r[0] === 'Total' || r[1] === 'Unrestricted')).toBe(true)
    expect(body.rows.some((r: any[]) => r[0] === 'Total')).toBe(true)
  })

  it('education-grant-spend-vs-budget filters by program and has totals', async () => {
    const res: any = await callStandard('education-grant-spend-vs-budget', { program: 'STEM' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.columns).toEqual(['Grant', 'Program', 'Budget', 'Actual Spend', 'Variance'])
    // All rows except total should be STEM
    expect(body.rows.every((r: any[]) => r[0] === 'Total' || r[1] === 'STEM')).toBe(true)
    expect(body.rows.some((r: any[]) => r[0] === 'Total')).toBe(true)
  })

  it('government-fund-balance filters by program and has totals', async () => {
    const res: any = await callStandard('government-fund-balance', { program: 'Public Safety' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.columns).toEqual(['Program', 'Opening Balance', 'Revenues', 'Expenditures', 'Transfers', 'Ending Balance'])
    expect(body.rows.every((r: any[]) => r[0] === 'Total' || r[0] === 'Public Safety')).toBe(true)
    expect(body.rows.some((r: any[]) => r[0] === 'Total')).toBe(true)
  })

  it('hospitality-occupancy-revpar filters by property and has totals', async () => {
    const res: any = await callStandard('hospitality-occupancy-revpar', { property: 'Resort' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.columns).toEqual(['Property', 'Rooms Available', 'Rooms Sold', 'Occupancy %', 'ADR', 'RevPAR'])
    expect(body.rows.length).toBe(2) // Resort + Total
    expect(body.rows[0][0]).toBe('Resort')
    expect(body.rows[1][0]).toBe('Total')
  })

  it('ecommerce-return-rate-by-category filters by category and has totals', async () => {
    const res: any = await callStandard('ecommerce-return-rate-by-category', { category: 'Electronics' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.columns).toEqual(['Category', 'Orders', 'Returns', 'Return Rate %', 'Revenue', 'Refunds', 'Net Revenue'])
    expect(body.rows.length).toBe(2)
    expect(body.rows[0][0]).toBe('Electronics')
    expect(body.rows[1][0]).toBe('Total')
  })
})
