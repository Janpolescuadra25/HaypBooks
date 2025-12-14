import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import '../mock/seed' // ensure seeding once
import { listTransactions, createTransaction, updateTransaction, deleteTransaction, db, listInvoices, createInvoice, updateInvoice as dbUpdateInvoice, deleteInvoice as dbDeleteInvoice, findInvoice, applyPaymentToInvoice, listBills, createBill, updateBill as dbUpdateBill, deleteBill as dbDeleteBill, findBill, applyPaymentToBill, scheduleBill, cancelBillSchedule, billApprovalAction } from '../mock/db'
import { computeProfitLoss, computeTrialBalance, computeBalanceSheet, computeARAging, computeAPAging, listUnpaidBills, computeAdjustedTrialBalance } from '../mock/aggregations'
import { getRoleFromCookies, hasPermission } from '../lib/rbac'

// MSW handlers: can progressively replace mock-api direct mapping.
export const handlers = [
  // Customers (mocked)
  http.get('/api/customers', ({ request }) => {
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') || '').toLowerCase()
    const list = (db.customers || [])
    const rows = q ? list.filter(c => (c.name || '').toLowerCase().includes(q)) : list
    return HttpResponse.json({ customers: rows })
  }),
  http.post('/api/customers', async ({ request }) => {
    const body = await request.json().catch(() => ({} as any))
    // Light validation schema mirrors server with optional fields
    const schema = z.object({
      name: z.string().trim().min(1).max(140).optional(),
      title: z.string().trim().max(50).optional(),
      firstName: z.string().trim().max(80).optional(),
      middleName: z.string().trim().max(80).optional(),
      lastName: z.string().trim().max(80).optional(),
      suffix: z.string().trim().max(20).optional(),
      companyName: z.string().trim().max(140).optional(),
      displayName: z.string().trim().max(140).optional(),
      printName: z.string().trim().max(140).optional(),
      email: z.string().email().optional(),
      phone: z.string().trim().max(40).optional(),
      mobile: z.string().trim().max(40).optional(),
      fax: z.string().trim().max(40).optional(),
      other: z.string().trim().max(140).optional(),
      website: z.string().trim().url().optional(),
      terms: z.string().trim().max(40).optional(),
      paymentMethod: z.string().trim().max(60).optional(),
      deliveryOption: z.string().trim().max(60).optional(),
      language: z.string().trim().max(40).optional(),
      customerType: z.string().trim().max(60).optional(),
      taxExempt: z.boolean().optional(),
      taxExemptReason: z.string().trim().max(120).optional(),
      taxExemptDetails: z.string().trim().max(240).optional(),
      taxExemptAsOf: z.string().trim().optional(),
      billingAddress: z.object({
        line1: z.string().trim().max(120).optional(),
        line2: z.string().trim().max(120).optional(),
        city: z.string().trim().max(80).optional(),
        state: z.string().trim().max(40).optional(),
        zip: z.string().trim().max(30).optional(),
        country: z.string().trim().max(60).optional(),
      }).optional(),
      shippingAddressSame: z.boolean().optional(),
      shippingAddress: z.object({
        line1: z.string().trim().max(120).optional(),
        line2: z.string().trim().max(120).optional(),
        city: z.string().trim().max(80).optional(),
        state: z.string().trim().max(40).optional(),
        zip: z.string().trim().max(30).optional(),
        country: z.string().trim().max(60).optional(),
      }).optional(),
      notes: z.string().trim().max(500).optional(),
    }).superRefine((obj, ctx) => {
      if (obj.taxExempt && !obj.taxExemptReason) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tax exemption reason required', path: ['taxExemptReason'] })
    })

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
    }
    const p = parsed.data as any
    const resolveDisplayName = (x: any) => {
      if (x.displayName) return x.displayName
      const parts = [x.firstName, x.middleName, x.lastName].filter(Boolean)
      if (parts.length) return parts.join(' ')
      if (x.companyName) return x.companyName
      if (x.name) return x.name
      return 'Unnamed Customer'
    }
    const displayName = resolveDisplayName(p)
    const id = `cust_${Math.random().toString(36).slice(2,8)}`
    const customer = {
      id,
      name: displayName,
      firstName: p.firstName,
      middleName: p.middleName,
      lastName: p.lastName,
      suffix: p.suffix,
      title: p.title,
      companyName: p.companyName,
      printName: p.printName || displayName,
      email: p.email,
      phone: p.phone,
      mobile: p.mobile,
      fax: p.fax,
      other: p.other,
      website: p.website,
      terms: p.terms,
      paymentMethod: p.paymentMethod,
      deliveryOption: p.deliveryOption,
      language: p.language,
      customerType: p.customerType,
      taxExempt: p.taxExempt,
      taxExemptReason: p.taxExemptReason,
      taxExemptDetails: p.taxExemptDetails,
      taxExemptAsOf: p.taxExemptAsOf,
      billingAddress: p.billingAddress,
      shippingAddressSame: p.shippingAddressSame,
      shippingAddress: p.shippingAddress,
      notes: p.notes,
    }
    ;(db.customers ||= []).push(customer as any)
    return HttpResponse.json({ customer })
  }),
  // Tags catalog
  http.get('/api/tags', () => {
    const tags = (db.tags || []).map(t => ({ id: t.id, name: t.name, group: t.group || null }))
    // Also include simple groups aggregation for UI convenience
    const groups = Array.from(new Set(tags.map(t => t.group || 'Ungrouped')))
    return HttpResponse.json({ tags, groups })
  }),
  // Audit
  http.get('/api/audit', ({ request }) => {
    const url = new URL(request.url)
    const entity = url.searchParams.get('entity') || undefined
    const entityId = url.searchParams.get('entityId') || undefined
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const limitParam = url.searchParams.get('limit')
    const limit = Math.max(1, Math.min(200, limitParam ? Number(limitParam) || 50 : 50))
    let events = db.auditEvents || []
    if (entity) events = events.filter(e => e.entityType === entity)
    if (entityId) events = events.filter(e => e.entityId === entityId)
    if (start) events = events.filter(e => e.ts.slice(0,10) >= start)
    if (end) events = events.filter(e => e.ts.slice(0,10) <= end)
    events = events.slice(-limit).reverse() // latest first
    return HttpResponse.json({ events, count: events.length })
  }),
  http.get('/api/reports/trial-balance', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'YTD'
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const tb = computeTrialBalance({ start, end })
    return HttpResponse.json({
      period,
      start: start || null,
      end: end || null,
      asOf: (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString().slice(0,10),
      rows: tb.rows,
      totals: tb.totals,
      balanced: tb.balanced,
    })
  }),
  // Profit & Loss
  http.get('/api/reports/profit-loss', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'YTD'
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const compare = url.searchParams.get('compare') === '1'
    const pl = computeProfitLoss({ start, end })
    const payload: any = { period, totals: { revenue: pl.revenue, cogs: pl.cogs, grossProfit: pl.grossProfit, expenses: pl.expenses, operatingIncome: pl.operatingIncome, otherIncome: pl.otherIncome, netIncome: pl.netIncome }, lines: pl.lines }
    if (compare) {
      // naive previous period: scale by 0.95
      const scale = 0.95
      payload.prevTotals = {
        revenue: Math.round(pl.revenue * scale),
        cogs: Math.round(pl.cogs * scale),
        grossProfit: Math.round(pl.grossProfit * scale),
        expenses: Math.round(pl.expenses * scale),
        operatingIncome: Math.round(pl.operatingIncome * scale),
        otherIncome: Math.round(pl.otherIncome * scale),
        netIncome: Math.round(pl.netIncome * scale),
      }
      payload.prevLines = pl.lines.map((l: any) => ({ ...l, amount: Math.round(l.amount * scale) }))
    }
    return HttpResponse.json(payload)
  }),
  // Adjusted Trial Balance (dynamic)
  http.get('/api/reports/adjusted-trial-balance', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'YTD'
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const atb = computeAdjustedTrialBalance({ start, end })
    return HttpResponse.json({ period, start: start || null, end: end || null, asOf: (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString().slice(0,10), rows: atb.rows, totals: atb.totals, balanced: atb.balanced })
  }),

  // Cash Flow
  http.get('/api/reports/cash-flow', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'YTD'
    const compare = url.searchParams.get('compare') === '1'
    let start = url.searchParams.get('start') as string | null
    let end = url.searchParams.get('end') as string | null
    if (!start || !end) {
      const now = new Date()
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      const iso = (d: Date) => d.toISOString().slice(0, 10)
      if (period === 'MTD' || period === 'ThisMonth') {
        const s = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
        start = iso(s); end = iso(today)
      } else if (period === 'QTD' || period === 'ThisQuarter') {
        const qStartMonth = Math.floor(today.getUTCMonth() / 3) * 3
        const s = new Date(Date.UTC(today.getUTCFullYear(), qStartMonth, 1))
        start = iso(s); end = iso(today)
      } else if (period === 'YTD') {
        const s = new Date(Date.UTC(today.getUTCFullYear(), 0, 1))
        start = iso(s); end = iso(today)
      } else if (period === 'Last12') {
        const s = new Date(today.getTime() - 364 * 86400000)
        start = iso(s); end = iso(today)
      } else if (period === 'LastMonth') {
        const firstThisMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
        const e = new Date(firstThisMonth.getTime() - 86400000)
        const s = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), 1))
        start = iso(s); end = iso(e)
      } else if (period === 'LastQuarter') {
        const q = Math.floor(today.getUTCMonth() / 3)
        const startQ = new Date(Date.UTC(today.getUTCFullYear(), q * 3, 1))
        const e = new Date(startQ.getTime() - 86400000)
        const s = new Date(Date.UTC(e.getUTCFullYear(), Math.floor(e.getUTCMonth() / 3) * 3, 1))
        start = iso(s); end = iso(e)
      }
    }
    const daysInRange = (s?: string | null, e?: string | null): number | null => {
      if (!s || !e) return null
      const sd = new Date(s + 'T00:00:00Z')
      const ed = new Date(e + 'T00:00:00Z')
      if (isNaN(sd.valueOf()) || isNaN(ed.valueOf())) return null
      const ms = ed.getTime() - sd.getTime()
      if (ms < 0) return null
      return Math.floor(ms / 86400000) + 1
    }
    const days = daysInRange(start, end)
    const baseYearDays = 365
    const scale = days ? Math.max(1, days) / baseYearDays : 1
    const operations = Math.round(28000 * scale)
    const investing = Math.round(-12000 * scale)
    const financing = Math.round(-6000 * scale)
    const netChange = operations + investing + financing
    const payload: any = { period, sections: { operations, investing, financing }, netChange }
    if (compare) {
      const pOps = Math.round(operations * 0.93)
      const pInv = Math.round(investing * 0.95)
      const pFin = Math.round(financing * 0.9)
      payload.prev = { sections: { operations: pOps, investing: pInv, financing: pFin }, netChange: pOps + pInv + pFin }
    }
    return HttpResponse.json(payload)
  }),

  // A/R Aging
  http.get('/api/reports/ar-aging', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'YTD'
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')
    const parseDate = (s?: string | null): Date | null => {
      if (!s) return null
      const d = new Date(s + 'T00:00:00Z')
      return isNaN(d.valueOf()) ? null : d
    }
    const daysBetween = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / 86400000)
    const isoShift = (base: Date, deltaDays: number) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() + deltaDays); return d.toISOString().slice(0,10) }
    const asOf = parseDate(end) || new Date()
    const startDate = parseDate(start)
    const docs = [
      { name: 'Acme Co',  due: isoShift(asOf, -10), amount: 1200 },
      { name: 'Globex',   due: isoShift(asOf, -35), amount: 400 },
      { name: 'Globex',   due: isoShift(asOf, -65), amount: 300 },
      { name: 'Soylent',  due: isoShift(asOf, -5),  amount: 250 },
      { name: 'Soylent',  due: isoShift(asOf, -95), amount: 100 },
      { name: 'Soylent',  due: isoShift(asOf, -140), amount: 50 },
    ]
    const filtered = docs.filter(d => {
      const dd = parseDate(d.due)!
      if (dd > asOf) return false
      if (startDate && dd < startDate) return false
      return true
    })
    const buckets = ['current','30','60','90','120+'] as const
    const map = new Map<string, any>()
    for (const d of filtered) {
      const dd = parseDate(d.due)!
      const age = Math.max(0, daysBetween(asOf, dd))
      const bucket = age < 30 ? 'current' : age < 60 ? '30' : age < 90 ? '60' : age < 120 ? '90' : '120+'
      const row = map.get(d.name) || { name: d.name, current: 0, 30: 0, 60: 0, 90: 0, '120+': 0 }
      row[bucket] += d.amount
      map.set(d.name, row)
    }
    const rows = Array.from(map.values()).map(r => ({ ...r, total: r.current + r['30'] + r['60'] + r['90'] + r['120+'] }))
    const totals = rows.reduce((acc: any, r: any) => {
      for (const k of buckets) acc[k] = (acc[k] || 0) + (r[k] || 0)
      acc.total = (acc.total || 0) + r.total
      return acc
    }, {} as any)
    return HttpResponse.json({ period, asOf: (asOf as Date).toISOString().slice(0,10), rows, totals })
  }),

  // A/P Aging
  http.get('/api/reports/ap-aging', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'YTD'
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')
    const parseDate = (s?: string | null): Date | null => {
      if (!s) return null
      const d = new Date(s + 'T00:00:00Z')
      return isNaN(d.valueOf()) ? null : d
    }
    const daysBetween = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / 86400000)
    const isoShift = (base: Date, deltaDays: number) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() + deltaDays); return d.toISOString().slice(0,10) }
    const asOf = parseDate(end) || new Date()
    const startDate = parseDate(start)
    const bills = [
      { name: 'Vendor A', due: isoShift(asOf, -12), amount: 900 },
      { name: 'Vendor A', due: isoShift(asOf, -42), amount: 300 },
      { name: 'Vendor B', due: isoShift(asOf, -75), amount: 200 },
      { name: 'Vendor B', due: isoShift(asOf, -100), amount: 150 },
      { name: 'Vendor C', due: isoShift(asOf, -5), amount: 100 },
      { name: 'Vendor C', due: isoShift(asOf, -130), amount: 75 },
    ]
    const filtered = bills.filter(b => {
      const dd = parseDate(b.due)!
      if (dd > asOf) return false
      if (startDate && dd < startDate) return false
      return true
    })
    const buckets = ['current','30','60','90','120+'] as const
    const map = new Map<string, any>()
    for (const b of filtered) {
      const dd = parseDate(b.due)!
      const age = Math.max(0, daysBetween(asOf, dd))
      const bucket = age < 30 ? 'current' : age < 60 ? '30' : age < 90 ? '60' : age < 120 ? '90' : '120+'
      const row = map.get(b.name) || { name: b.name, current: 0, 30: 0, 60: 0, 90: 0, '120+': 0 }
      row[bucket] += b.amount
      map.set(b.name, row)
    }
    const rows = Array.from(map.values()).map(r => ({ ...r, total: r.current + r['30'] + r['60'] + r['90'] + r['120+'] }))
    const totals = rows.reduce((acc: any, r: any) => {
      for (const k of buckets) acc[k] = (acc[k] || 0) + (r[k] || 0)
      acc.total = (acc.total || 0) + r.total
      return acc
    }, {} as any)
    return HttpResponse.json({ period, asOf: (asOf as Date).toISOString().slice(0,10), rows, totals })
  }),

  // Balance Sheet
  http.get('/api/reports/balance-sheet', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'YTD'
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const compare = url.searchParams.get('compare') === '1'
    const bs = computeBalanceSheet({ start, end })
    const payload: any = { period, ...bs, asOf: (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString().slice(0,10) }
    if (compare) {
      const scale = 0.95
      payload.prev = {
        assets: bs.assets.map(a => ({ ...a, amount: Math.round(a.amount * scale) })),
        liabilities: bs.liabilities.map(l => ({ ...l, amount: Math.round(l.amount * scale) })),
        equity: bs.equity.map(e => ({ ...e, amount: Math.round(e.amount * scale) })),
        totals: {
          assets: Math.round(bs.totals.assets * scale),
          liabilities: Math.round(bs.totals.liabilities * scale),
          equity: Math.round(bs.totals.equity * scale),
        }
      }
    }
    return HttpResponse.json(payload)
  }),

  // Apps: list connectors
  http.get('/api/apps/connectors', async () => {
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'reports:read' as any)) return HttpResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { ensureAppSeeded } = await import('../mock/db')
    ensureAppSeeded()
    const connectors = (db.appConnectors || []).map(c => ({
      id: c.id, name: c.name, kind: c.kind, status: c.status, lastSyncAt: c.lastSyncAt || null, lastSyncStatus: c.lastSyncStatus || null,
    }))
    return HttpResponse.json({ connectors })
  }),

  // Apps: trigger sync for connector
  http.post('/api/apps/connectors/:id/sync', async ({ params }) => {
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'journal:write' as any)) return HttpResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = params as { id: string }
    try {
      const { triggerAppSync } = await import('../mock/db')
      const run = triggerAppSync(id)
      return HttpResponse.json({ run, newPostings: run.newPostings })
    } catch (e: any) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),

  // Apps: list postings
  http.get('/api/apps/postings', async ({ request }) => {
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'reports:read' as any)) return HttpResponse.json({ error: 'Forbidden' }, { status: 403 })
    const url = new URL(request.url)
    const connectorId = url.searchParams.get('connectorId') || undefined
    const status = url.searchParams.get('status') || undefined
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const { listAppPostings, ensureAppSeeded } = await import('../mock/db')
    ensureAppSeeded()
    const rows = listAppPostings({ connectorId, status: status as any, start, end })
    return HttpResponse.json({ postings: rows, total: rows.length })
  }),

  // Apps: preview a specific posting
  http.get('/api/apps/postings/:id/preview', async ({ params }) => {
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'reports:read' as any)) return HttpResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = params as { id: string }
    try {
      const { previewAppPosting } = await import('../mock/db')
      const preview = previewAppPosting(id)
      return HttpResponse.json({ preview })
    } catch (e: any) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),

  // Apps: post a specific posting
  http.post('/api/apps/postings/:id/post', async ({ params }) => {
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'journal:write' as any)) return HttpResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = params as { id: string }
    try {
      const { postAppPosting } = await import('../mock/db')
      const posting = postAppPosting(id)
      return HttpResponse.json({ posting })
    } catch (e: any) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),

  // Apps: ignore a specific posting
  http.post('/api/apps/postings/:id/ignore', async ({ params }) => {
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'journal:write' as any)) return HttpResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id } = params as { id: string }
    try {
      const { ignoreAppPosting } = await import('../mock/db')
      const posting = ignoreAppPosting(id)
      return HttpResponse.json({ posting })
    } catch (e: any) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),

  // Transactions list (store-backed)
  http.get('/api/transactions', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const type = url.searchParams.get('type') || undefined
    const bankStatus = url.searchParams.get('bankStatus') || undefined
    const tag = url.searchParams.get('tag') || undefined
    let { rows, total } = listTransactions({ start, end, type, bankStatus, page, limit })
    if (tag) {
      rows = rows.filter(tx => Array.isArray((tx as any).tags) && (tx as any).tags.includes(tag))
      total = rows.length
    }
    return HttpResponse.json({ transactions: rows, total, page, limit })
  }),

  // Invoices list (stateful)
  http.get('/api/invoices', ({ request }) => {
    const url = new URL(request.url)
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const status = url.searchParams.get('status') || undefined
    const tag = url.searchParams.get('tag') || undefined
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    let { rows, total } = listInvoices({ start, end, status, page, limit })
    if (tag) {
      rows = rows.filter(inv => Array.isArray(inv.tags) && inv.tags.includes(tag))
      total = rows.length
    }
    // Map for UI (customer name)
    const mapped = rows.map(inv => ({
      id: inv.id,
      number: inv.number,
      customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId,
      status: inv.status,
      total: inv.total,
      date: inv.date,
      balance: inv.balance,
    }))
    return HttpResponse.json({ invoices: mapped, total, page, limit })
  }),

  // Invoices create (stateful)
  http.post('/api/invoices', async ({ request }) => {
    const body = await request.json().catch(() => ({} as any))
    // Backward compatibility: legacy shape used 'customer' and 'items' with description/amount
    let { number, customerId, customer, lines, items, date, terms, dueDate } = body || {}
    const lineList = Array.isArray(lines) ? lines : (Array.isArray(items) ? items : [])
    // Resolve customerId if only customer (name) provided
    if (!customerId && customer) {
      const found = db.customers.find(c => c.name === customer)
      if (found) customerId = found.id
    }
    if (!customerId && db.customers.length) customerId = db.customers[0].id
    if (!number) number = `INV-${Math.floor(Math.random()*9000+1000)}`
    if (!Array.isArray(lineList) || lineList.length === 0 || !customerId) {
      return HttpResponse.json({ error: 'number, customer/customerId and at least one line item are required' }, { status: 400 })
    }
    const invoice = createInvoice({ number, customerId, date: date || new Date().toISOString(), lines: lineList, terms, dueDate })
    return HttpResponse.json({ invoice })
  }),

  // Invoices by id (GET) stateful
  http.get('/api/invoices/:id', ({ params }) => {
    const { id } = params as { id: string }
    const inv = findInvoice(id)
    if (!inv) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
    return HttpResponse.json({ invoice })
  }),

  // Invoices send (transition draft->sent)
  http.post('/api/invoices/:id/send', ({ params }) => {
    const { id } = params as { id: string }
    try {
      const inv = dbUpdateInvoice(id, { status: 'sent' })
      return HttpResponse.json({ invoice: inv })
    } catch {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),

  // Invoices payments (stateful)
  http.post('/api/invoices/:id/payments', async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = await request.json().catch(() => ({} as any))
    const amount = Number(body?.amount)
    if (!amount || amount <= 0) return HttpResponse.json({ error: 'amount must be > 0' }, { status: 400 })
    try {
      const { invoice, payment } = applyPaymentToInvoice(id, amount)
      return HttpResponse.json({ invoice, payment })
    } catch {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),

  // Invoices update (stateful)
  http.put('/api/invoices/:id', async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = await request.json().catch(() => ({} as any))
    try {
      const lines = Array.isArray(body.lines) ? body.lines : (Array.isArray(body.items) ? body.items : undefined)
      let customerId = body.customerId
      if (!customerId && body.customer) {
        const found = db.customers.find(c => c.name === body.customer)
        if (found) customerId = found.id
      }
      const invoice = dbUpdateInvoice(id, { number: body.number, customerId, status: body.status, date: body.date, lines })
      return HttpResponse.json({ invoice })
    } catch {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),

  // Invoices delete (stateful)
  http.delete('/api/invoices/:id', ({ params }) => {
    const { id } = params as { id: string }
    const ok = dbDeleteInvoice(id)
    if (!ok) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json({ ok: true })
  }),

  // Bills list (stateful)
  http.get('/api/bills', ({ request }) => {
    const url = new URL(request.url)
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const status = url.searchParams.get('status') || undefined
    const tag = url.searchParams.get('tag') || undefined
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    let { rows, total } = listBills({ start, end, status, page, limit })
    if (tag) {
      rows = rows.filter(b => Array.isArray((b as any).tags) && (b as any).tags.includes(tag))
      total = rows.length
    }
    const mapped = rows.map(b => ({
      id: b.id,
      number: b.number,
      vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId,
      status: b.status,
      total: b.total,
      dueDate: b.dueDate,
      scheduledDate: b.scheduledDate,
      balance: b.balance,
    }))
    return HttpResponse.json({ bills: mapped, total, page, limit })
  }),

  // Bills create (stateful)
  http.post('/api/bills', async ({ request }) => {
    const body = await request.json().catch(() => ({} as any))
    const { number, vendorId, lines, billDate, terms, dueDate } = body || {}
    if (!vendorId || !Array.isArray(lines) || lines.length === 0) return HttpResponse.json({ error: 'vendorId and lines required' }, { status: 400 })
    const bill = createBill({ number, vendorId, billDate, terms, dueDate: dueDate || undefined, lines })
    return HttpResponse.json({ bill })
  }),

  // Bills by id (GET) stateful
  http.get('/api/bills/:id', ({ params }) => {
    const { id } = params as { id: string }
    const b = findBill(id)
    if (!b) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    const bill = { ...b, vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId }
    return HttpResponse.json({ bill })
  }),

  // Bills by id (POST) - pay full amount
  http.post('/api/bills/:id', ({ params }) => {
    const { id } = params as { id: string }
    const bill = findBill(id)
    if (!bill) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    const remaining = bill.balance
    const { bill: updated, payment } = applyPaymentToBill(id, remaining)
    return HttpResponse.json({ bill: updated, payment })
  }),

  // Bills schedule set (stateful)
  http.post('/api/bills/:id/schedule', async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = await request.json().catch(() => ({} as any))
    const date = body?.date || new Date().toISOString()
    try {
      const bill = scheduleBill(id, date)
      return HttpResponse.json({ bill })
    } catch {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),

  // Bills schedule cancel (stateful)
  http.delete('/api/bills/:id/schedule', ({ params }) => {
    const { id } = params as { id: string }
    try {
      const bill = cancelBillSchedule(id)
      return HttpResponse.json({ bill })
    } catch {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),

  // Bills update (stateful)
  http.put('/api/bills/:id', async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = await request.json().catch(() => ({} as any))
    try {
      const bill = dbUpdateBill(id, { number: body.number, vendorId: body.vendorId || body.vendor, billDate: body.billDate, terms: body.terms, status: body.status, dueDate: body.dueDate, lines: Array.isArray(body.lines) ? body.lines : (Array.isArray(body.items) ? body.items : undefined) })
      return HttpResponse.json({ bill })
    } catch {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),

  // Bills delete (stateful)
  http.delete('/api/bills/:id', ({ params }) => {
    const { id } = params as { id: string }
    const ok = dbDeleteBill(id)
    if (!ok) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json({ ok: true })
  }),

  // Transactions create (store-backed)
  http.post('/api/transactions', async ({ request }) => {
    const body = await request.json().catch(() => ({} as any))
    const { date, description, category, amount, accountId, bankStatus } = body || {}
    if (!date || !description || typeof amount !== 'number') {
      return HttpResponse.json({ error: 'date, description, amount are required' }, { status: 400 })
    }
    const txn = createTransaction({
      date,
      description,
      category: (['Income','Expense','Transfer'] as const).includes(category) ? category : 'Income',
      amount,
      accountId: accountId || db.accounts[0].id,
      bankStatus: (['for_review','categorized','excluded'] as const).includes(bankStatus) ? bankStatus : 'for_review',
      source: 'manual',
    })
    return HttpResponse.json({ transaction: txn })
  }),

  // Transactions update (store-backed)
  http.put('/api/transactions', async ({ request }) => {
    const body = await request.json().catch(() => ({} as any))
    const { id, date, description, category, amount, accountId, bankStatus } = body || {}
    if (!id || !date || !description || typeof amount !== 'number') {
      return HttpResponse.json({ error: 'id, date, description, amount are required' }, { status: 400 })
    }
    try {
      const txn = updateTransaction({
        id,
        date,
        description,
        category: (['Income','Expense','Transfer'] as const).includes(category) ? category : 'Income',
        amount,
        accountId: accountId || db.accounts[0].id,
        bankStatus: (['for_review','categorized','excluded'] as const).includes(bankStatus) ? bankStatus : undefined,
      })
      return HttpResponse.json({ transaction: txn })
    } catch (e: any) {
      return HttpResponse.json({ error: e.message }, { status: 404 })
    }
  }),

  // Transactions delete (store-backed)
  http.delete('/api/transactions', ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return HttpResponse.json({ error: 'id is required' }, { status: 400 })
    const ok = deleteTransaction(id)
    if (!ok) return HttpResponse.json({ error: 'not found' }, { status: 404 })
    return HttpResponse.json({ ok: true })
  }),
  // A/R Aging (stateful)
  http.get('/api/reports/ar-aging', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'YTD'
    const end = url.searchParams.get('end')
    const asOf = end ? new Date(end + 'T00:00:00Z') : new Date()
    const { rows, totals } = computeARAging(asOf)
    return HttpResponse.json({ period, asOf: asOf.toISOString().slice(0,10), rows, totals })
  }),

  // A/P Aging (stateful)
  http.get('/api/reports/ap-aging', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'YTD'
    const end = url.searchParams.get('end')
    const asOf = end ? new Date(end + 'T00:00:00Z') : new Date()
    const { rows, totals } = computeAPAging(asOf)
    return HttpResponse.json({ period, asOf: asOf.toISOString().slice(0,10), rows, totals })
  }),

  // Unpaid Bills report (stateful)
  http.get('/api/reports/unpaid-bills', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'YTD'
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const { rows, totals } = listUnpaidBills({ start, end })
    const asOf = (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString().slice(0,10)
    return HttpResponse.json({ period, asOf, rows, totals })
  }),

  // Bill approval actions (stateful)
  http.post('/api/bills/:id/approval', async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = await request.json().catch(()=> ({} as any))
    const action = body?.action as 'submit' | 'approve' | 'reject'
    try {
      const bill = billApprovalAction(id, action, body?.note)
      return HttpResponse.json({ bill })
    } catch {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }),
]
