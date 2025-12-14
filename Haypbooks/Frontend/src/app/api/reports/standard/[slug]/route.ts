import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(req.url)
  const period = (searchParams.get('period') || 'YTD') as any
  const start = searchParams.get('start') || null
  const end = searchParams.get('end') || null
  const compare = searchParams.get('compare') === '1'

  // Filters
  const channelFilter = searchParams.get('channel') || undefined
  const minMargin = searchParams.get('minMargin') ? parseFloat(searchParams.get('minMargin') as string) : undefined
  const minUtil = searchParams.get('minUtil') ? parseFloat(searchParams.get('minUtil') as string) : undefined
  const view = searchParams.get('view') || undefined
  const minTurn = searchParams.get('minTurn') ? parseFloat(searchParams.get('minTurn') as string) : undefined
  const segment = searchParams.get('segment') || undefined
  const restriction = searchParams.get('restriction') || undefined
  const program = searchParams.get('program') || undefined
  const property = searchParams.get('property') || undefined
  const category = searchParams.get('category') || undefined

  function money(n: number) { return Math.round(n * 100) / 100 }

  let columns: string[]
  let rows: any[][]

  switch (params.slug) {
    case 'retail-sales-by-channel': {
      columns = ['Channel', 'Orders', 'Gross Sales', 'Discounts', 'Net Sales']
      const channels = ['Online', 'POS', 'Marketplace', 'Wholesale', 'Other']
      const built = channels.map((ch, i) => {
        const orders = 120 + i * 25 // deterministic
        const gross = money(orders * (80 + i * 10))
        const discounts = money(gross * (0.05 + i * 0.01))
        const net = money(gross - discounts)
        return [ch, orders, gross, -discounts, net]
      })
      rows = channelFilter ? built.filter(r => r[0] === channelFilter) : built
      if (rows.length) {
        const totalOrders = rows.reduce((s, r) => s + Number(r[1]), 0)
        const totalGross = rows.reduce((s, r) => s + Number(r[2]), 0)
        const totalDiscounts = rows.reduce((s, r) => s + Number(r[3]), 0) // already negative
        const totalNet = rows.reduce((s, r) => s + Number(r[4]), 0)
        rows = [...rows, ['Total', totalOrders, money(totalGross), money(totalDiscounts), money(totalNet)]]
      }
      break
    }
    case 'construction-job-profitability': {
      columns = ['Job', 'Revenue', 'Costs', 'Gross Margin', 'Margin %']
      const jobs = ['Job A', 'Job B', 'Job C', 'Job D', 'Job E']
      const built = jobs.map((j, i) => {
        const rev = money(100000 + i * 25000) // deterministic increasing revenue
        const costRate = 0.4 + i * 0.1 // 40%,50%,60%,70%,80%
        const cost = money(rev * costRate)
        const gm = money(rev - cost)
        const pct = rev > 0 ? Math.round((gm / rev) * 100) : 0 // integer percent
        return [j, rev, -cost, gm, `${pct}%`]
      })
      rows = built
      if (typeof minMargin === 'number' && !Number.isNaN(minMargin)) {
        rows = rows.filter(r => parseFloat(String(r[4]).replace('%','')) >= minMargin)
      }
      if (rows.length) {
        const totalRev = rows.reduce((s, r) => s + Number(r[1]), 0)
        const totalCost = rows.reduce((s, r) => s + Math.abs(Number(r[2])), 0)
        const totalGm = rows.reduce((s, r) => s + Number(r[3]), 0)
        const weightedPct = totalRev > 0 ? Math.round((totalGm / totalRev) * 100) : 0
        rows = [...rows, ['Total', money(totalRev), -money(totalCost), money(totalGm), `${weightedPct}%`]]
      }
      break
    }
    case 'healthcare-revenue-cycle': {
      columns = ['Stage', 'Count', 'Amount']
      let stages = ['Charges', 'Payments', 'Adjustments', 'Denials', 'AR Pending']
      if (view === 'financial-only') {
        stages = ['Charges', 'Payments', 'Adjustments']
      }
      rows = stages.map((s, i) => {
        const count = 50 + i * 15 // deterministic
        const amtBase = 150 + i * 20
        const amt = money(count * amtBase)
        const signed = s === 'Payments' ? -amt : amt
        return [s, count, signed]
      })
      if (rows.length) {
        const totalCount = rows.reduce((s, r) => s + Number(r[1]), 0)
        const totalAmt = rows.reduce((s, r) => s + Number(r[2]), 0)
        rows = [...rows, ['Total', totalCount, money(totalAmt)]]
      }
      break
    }
    case 'psa-utilization': {
      columns = ['Consultant', 'Billable Hours', 'Non-billable Hours', 'Utilization %']
      const names = ['Taylor', 'Jordan', 'Avery', 'Riley', 'Casey']
      const built = names.map((n, i) => {
        const bill = 60 + i * 10 // 60,70,80,90,100
        const non = Math.max(5, 20 - i * 3) // 20,17,14,11,8 (floored at 5)
        const util = Math.round((bill / (bill + non)) * 100)
        return [n, bill, non, `${util}%`]
      })
      rows = built
      if (typeof minUtil === 'number' && !Number.isNaN(minUtil)) {
        rows = rows.filter(r => parseFloat(String(r[3]).replace('%','')) >= minUtil)
      }
      if (rows.length) {
        const totalBill = rows.reduce((s, r) => s + Number(r[1]), 0)
        const totalNon = rows.reduce((s, r) => s + Number(r[2]), 0)
        const util = Math.round((totalBill / (totalBill + totalNon)) * 100)
        rows = [...rows, ['Total', totalBill, totalNon, `${util}%`]]
      }
      break
    }
    case 'manufacturing-wip-inventory': {
      columns = ['SKU', 'On Hand', 'WIP Units', 'WIP Value', 'Turns']
      const skus = ['W-100', 'W-200', 'F-100', 'F-200', 'R-100']
      let built = skus.map((s, i) => {
        const onHand = 100 + i * 25
        const wipUnits = 10 + i * 5
        const wipValue = money(wipUnits * (200 + i * 50))
        const turns = Math.round(2 + i * 0.8) // 2,3,4,5,6
        return [s, onHand, wipUnits, wipValue, turns]
      })
      if (typeof minTurn === 'number' && !Number.isNaN(minTurn)) {
        built = built.filter(r => Number(r[4]) >= minTurn)
      }
      rows = built
      if (rows.length) {
        const totalOnHand = rows.reduce((s, r) => s + Number(r[1]), 0)
        const totalWipUnits = rows.reduce((s, r) => s + Number(r[2]), 0)
        const totalWipValue = rows.reduce((s, r) => s + Number(r[3]), 0)
        const avgTurns = Math.round(rows.reduce((s, r) => s + Number(r[4]), 0) / rows.length)
        rows = [...rows, ['Total', totalOnHand, totalWipUnits, money(totalWipValue), avgTurns]]
      }
      break
    }
    case 'saas-mrr-churn': {
      columns = ['Segment', 'MRR', 'New MRR', 'Expansion', 'Contraction', 'Churn %']
      const segs = ['SMB', 'Mid-Market', 'Enterprise']
      let built = segs.map((s, i) => {
        const mrr = money(50000 + i * 75000) // 50k,125k,200k
        const newMrr = money(8000 + i * 6000)
        const expansion = money(4000 + i * 3000)
        const contraction = money(2000 + i * 2500)
        const churnPct = 5 - i * 1.5 // 5,3.5,2
        return [s, Number(mrr), Number(newMrr), Number(expansion), -Number(contraction), `${churnPct}%`]
      })
      if (segment) built = built.filter(r => r[0] === segment)
      rows = built
      if (rows.length) {
        const totalMrr = rows.reduce((s, r) => s + Number(r[1]), 0)
        const totalNew = rows.reduce((s, r) => s + Number(r[2]), 0)
        const totalExp = rows.reduce((s, r) => s + Number(r[3]), 0)
        const totalCon = rows.reduce((s, r) => s + Number(r[4]), 0)
        const weightedChurn = totalMrr > 0 ? ((rows.reduce((acc, r) => acc + (Number(r[1]) * parseFloat(String(r[5]).replace('%',''))), 0) / totalMrr)).toFixed(1) : '0.0'
        rows = [...rows, ['Total', money(totalMrr), money(totalNew), money(totalExp), money(totalCon), `${weightedChurn}%`]]
      }
      break
    }
    case 'non-profit-fund-activity': {
      columns = ['Fund', 'Restriction', 'Revenue', 'Expenses', 'Net Change']
      const funds = [
        { name: 'General Operations', restriction: 'Unrestricted', rev: 85000, exp: 62000 },
        { name: 'Community Programs', restriction: 'Temporarily Restricted', rev: 65000, exp: 54000 },
        { name: 'Scholarship Endowment', restriction: 'Permanently Restricted', rev: 30000, exp: 5000 },
        { name: 'Capital Campaign', restriction: 'Temporarily Restricted', rev: 120000, exp: 45000 },
        { name: 'Emergency Relief', restriction: 'Unrestricted', rev: 40000, exp: 38000 },
      ]
      let built = funds.map(f => [f.name, f.restriction, money(f.rev), -money(f.exp), money(f.rev - f.exp)])
      if (restriction) built = built.filter(r => String(r[1]) === restriction)
      rows = built
      if (rows.length) {
        const totalRev = rows.reduce((s, r) => s + Number(r[2]), 0)
        const totalExp = rows.reduce((s, r) => s + Number(r[3]), 0)
        const totalNet = rows.reduce((s, r) => s + Number(r[4]), 0)
        rows = [...rows, ['Total', '', money(totalRev), money(totalExp), money(totalNet)]]
      }
      break
    }
    case 'education-grant-spend-vs-budget': {
      columns = ['Grant', 'Program', 'Budget', 'Actual Spend', 'Variance']
      const grants = [
        { name: 'NSF STEM Initiative', program: 'STEM', budget: 150000, spend: 120000 },
        { name: 'Arts in Schools', program: 'Arts', budget: 90000, spend: 75000 },
        { name: 'Youth Athletics Booster', program: 'Athletics', budget: 60000, spend: 58000 },
        { name: 'Robotics Expansion', program: 'STEM', budget: 80000, spend: 45000 },
      ]
      let built = grants.map(g => [g.name, g.program, money(g.budget), -money(g.spend), money(g.budget - g.spend)])
      if (program) built = built.filter(r => String(r[1]) === program)
      rows = built
      if (rows.length) {
        const totalBudget = rows.reduce((s, r) => s + Number(r[2]), 0)
        const totalSpend = rows.reduce((s, r) => s + Number(r[3]), 0)
        const totalVar = rows.reduce((s, r) => s + Number(r[4]), 0)
        rows = [...rows, ['Total', '', money(totalBudget), money(totalSpend), money(totalVar)]]
      }
      break
    }
    case 'government-fund-balance': {
      columns = ['Program', 'Opening Balance', 'Revenues', 'Expenditures', 'Transfers', 'Ending Balance']
      const programs = ['Public Safety', 'Public Works', 'Health & Human Services', 'Parks & Rec', 'General Government']
      let built = programs.map((p, i) => {
        const opening = money(200000 + i * 50000)
        const rev = money(150000 + i * 40000)
        const exp = money(130000 + i * 35000)
        const transfer = money((i % 2 === 0 ? -1 : 1) * (5000 + i * 1000)) // +/-
        const ending = money(opening + rev + transfer - exp)
        return [p, opening, rev, -exp, transfer, ending]
      })
      if (program) built = built.filter(r => String(r[0]) === program)
      rows = built
      if (rows.length) {
        const totalOpening = rows.reduce((s, r) => s + Number(r[1]), 0)
        const totalRev = rows.reduce((s, r) => s + Number(r[2]), 0)
        const totalExp = rows.reduce((s, r) => s + Number(r[3]), 0)
        const totalTransfers = rows.reduce((s, r) => s + Number(r[4]), 0)
        const totalEnding = rows.reduce((s, r) => s + Number(r[5]), 0)
        rows = [...rows, ['Total', money(totalOpening), money(totalRev), money(totalExp), money(totalTransfers), money(totalEnding)]]
      }
      break
    }
    case 'hospitality-occupancy-revpar': {
      // Occupancy % = Rooms Sold / Rooms Available
      // RevPAR = ADR * Occupancy%
      columns = ['Property', 'Rooms Available', 'Rooms Sold', 'Occupancy %', 'ADR', 'RevPAR']
      const props = [
        { name: 'Downtown Hotel', rooms: 300, sold: 210, adr: 150 },
        { name: 'Airport Hotel', rooms: 250, sold: 180, adr: 140 },
        { name: 'Resort', rooms: 400, sold: 320, adr: 220 },
        { name: 'Conference Center', rooms: 500, sold: 350, adr: 180 },
      ]
      let built = props.map((p) => {
        const occPct = Math.round((p.sold / p.rooms) * 100)
        const revpar = money(p.adr * (occPct / 100))
        return [p.name, p.rooms, p.sold, `${occPct}%`, money(p.adr), revpar]
      })
      if (property) built = built.filter(r => String(r[0]) === property)
      rows = built
      if (rows.length) {
        const totalRooms = rows.reduce((s, r) => s + Number(r[1]), 0)
        const totalSold = rows.reduce((s, r) => s + Number(r[2]), 0)
        const occ = totalRooms > 0 ? Math.round((totalSold / totalRooms) * 100) : 0
        // Weighted ADR by revenue per sold room
        // Compute total revenue as sum(ADR * rooms sold)
        const totalRevenue = rows.reduce((s, r) => s + (Number(r[4]) * Number(r[2])), 0)
        const avgAdr = totalSold > 0 ? money(totalRevenue / totalSold) : 0
        const totalRevpar = money((typeof avgAdr === 'number' ? avgAdr : Number(avgAdr)) * (occ / 100))
        rows = [...rows, ['Total', totalRooms, totalSold, `${occ}%`, money(typeof avgAdr === 'number' ? avgAdr : Number(avgAdr)), totalRevpar]]
      }
      break
    }
    case 'ecommerce-return-rate-by-category': {
      columns = ['Category', 'Orders', 'Returns', 'Return Rate %', 'Revenue', 'Refunds', 'Net Revenue']
      const cats = ['Apparel', 'Electronics', 'Home & Garden', 'Beauty', 'Sports']
      let built = cats.map((c, i) => {
        const orders = 400 + i * 60
        const returns = 20 + i * 8
        const ratePct = Math.round((returns / orders) * 100)
        const revenue = money(orders * (40 + i * 15))
        const refunds = money(returns * (40 + i * 15))
        const net = money(revenue - refunds)
        return [c, orders, returns, `${ratePct}%`, revenue, -refunds, net]
      })
      if (category) built = built.filter(r => String(r[0]) === category)
      rows = built
      if (rows.length) {
        const totalOrders = rows.reduce((s, r) => s + Number(r[1]), 0)
        const totalReturns = rows.reduce((s, r) => s + Number(r[2]), 0)
        const ratePct = totalOrders > 0 ? Math.round((totalReturns / totalOrders) * 100) : 0
        const totalRevenue = rows.reduce((s, r) => s + Number(r[4]), 0)
        const totalRefunds = rows.reduce((s, r) => s + Number(r[5]), 0)
        const totalNet = rows.reduce((s, r) => s + Number(r[6]), 0)
        rows = [...rows, ['Total', totalOrders, totalReturns, `${ratePct}%`, money(totalRevenue), money(totalRefunds), money(totalNet)]]
      }
      break
    }
    default: {
      // Simple mock table: 5 deterministic rows, last column numeric
      columns = ['Name', 'Category', 'Amount']
      rows = Array.from({ length: 5 }).map((_, i) => [
        `${params.slug.replace(/-/g, ' ')} Row ${i + 1}`,
        ['A', 'B', 'C'][i % 3],
        money((i - 2) * 2500),
      ])
    }
  }

  return NextResponse.json({ slug: params.slug, period, start, end, compare, columns, rows })
}
