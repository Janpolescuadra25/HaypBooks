import { getAuditEvents, logEvent } from '@/lib/audit'
import { getPermissionsForRole, hasPermission, getRoleFromCookies } from '@/lib/rbac'
import '../mock/seed'
import {
  listTransactions as dbListTransactions,
  createTransaction as dbCreateTransaction,
  updateTransaction as dbUpdateTransaction,
  deleteTransaction as dbDeleteTransaction,
  db,
  listInvoices as dbListInvoices,
  createInvoice as dbCreateInvoice,
  findInvoice as dbFindInvoice,
  updateInvoice as dbUpdateInvoice,
  deleteInvoice as dbDeleteInvoice,
  applyPaymentToInvoice as dbApplyPaymentToInvoice,
  voidInvoice as dbVoidInvoice,
  createCreditMemo as dbCreateCreditMemo,
  listCreditMemos as dbListCreditMemos,
  applyCreditToInvoice as dbApplyCreditToInvoice,
  createCustomerPayment as dbCreateCustomerPayment,
  listCustomerPayments as dbListCustomerPayments,
  createDeposit as dbCreateDeposit,
  listDeposits as dbListDeposits,
  listCustomerRefunds as dbListCustomerRefunds,
  createCustomerRefund as dbCreateCustomerRefund,
  listVendorRefunds as dbListVendorRefunds,
  createVendorRefund as dbCreateVendorRefund,
  listBills as dbListBills,
  createBill as dbCreateBill,
  findBill as dbFindBill,
  updateBill as dbUpdateBill,
  deleteBill as dbDeleteBill,
  applyPaymentToBill as dbApplyPaymentToBill,
  scheduleBill as dbScheduleBill,
  cancelBillSchedule as dbCancelBillSchedule,
  billApprovalAction as dbBillApprovalAction,
  voidBill as dbVoidBill,
} from '../mock/db'
import { nextCheckNumber, upsertCheck } from '../app/api/checks/store'
import { computeARAging, computeAPAging, listUnpaidBills, computeCustomerStatement, computeCustomerARSnapshot, computeVendorStatement } from '../mock/aggregations'

// Minimal mock router. Mirrors key API endpoints the UI depends on.
export async function mockApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = new URL(path, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  const pathname = url.pathname
  const method = (init?.method || 'GET').toUpperCase()

  // User preferences: report filters
  if (pathname === '/api/user/preferences/report-filters') {
    const lsKey = (rk: string) => `prefs:${rk}`
    if (method === 'GET') {
      const reportKey = url.searchParams.get('reportKey') || ''
      if (!reportKey) throw new Error('400 Bad Request: reportKey is required')
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(lsKey(reportKey)) : null
      if (raw) return JSON.parse(raw) as T
      return { filters: {}, updatedAt: new Date(0).toISOString() } as unknown as T
    }
    if (method === 'PUT') {
      const raw = (init?.body as any) || '{}'
      const body = typeof raw === 'string' ? JSON.parse(raw) : raw
      const reportKey = String(body?.reportKey || '')
      const filters = (body?.filters && typeof body.filters === 'object') ? body.filters as Record<string, string> : null
      if (!reportKey || !filters) throw new Error('400 Bad Request: reportKey and filters are required')
      const payload = { filters, updatedAt: new Date().toISOString() }
      if (typeof window !== 'undefined') window.localStorage.setItem(lsKey(reportKey), JSON.stringify(payload))
      return payload as unknown as T
    }
  }

  // Settings: close period
  if (pathname === '/api/settings/close-period' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const date = String(body?.date || '')
    if (!/\d{4}-\d{2}-\d{2}/.test(date)) throw new Error('400 Bad Request: date is required')
    const closeDate = (await import('../mock/db')).closePeriod(date)
    return { closeDate, closed: closeDate } as unknown as T
  }

  // Settings: reopen period
  if (pathname === '/api/settings/reopen-period' && method === 'POST') {
    ;(await import('../mock/db')).reopenPeriodWithAudit()
    return { ok: true } as unknown as T
  }

  // Reports - Trial Balance
  if (pathname === '/api/reports/trial-balance' && method === 'GET') {
    const period = url.searchParams.get('period') || 'YTD'
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined

    type TBRow = { number: string; name: string; debit: number; credit: number }
    let rows: TBRow[] = [
      { number: '1000', name: 'Cash', debit: 10000, credit: 0 },
      { number: '1100', name: 'Accounts Receivable', debit: 8000, credit: 0 },
      { number: '1200', name: 'Inventory', debit: 5000, credit: 0 },
      { number: '2000', name: 'Accounts Payable', debit: 0, credit: 6000 },
      { number: '2100', name: 'Credit Card Payable', debit: 0, credit: 3000 },
      { number: '4000', name: 'Sales Revenue', debit: 0, credit: 24000 },
      { number: '5000', name: 'Cost of Goods Sold', debit: 7000, credit: 0 },
      { number: '6000', name: 'Operating Expenses', debit: 3000, credit: 0 },
    ]

    if (end) {
      const d = new Date(end + 'T00:00:00Z')
      if (!isNaN(d.valueOf())) {
        const factor = 1 + ((d.getUTCDate() % 10) - 5) / 500
        const scale = (n: number) => Math.round(n * factor)
        const debits: TBRow[] = []
        const credits: TBRow[] = []
        for (const r of rows) {
          if (r.debit) debits.push({ ...r, debit: scale(r.debit) })
          else credits.push({ ...r, credit: scale(r.credit) })
        }
        const debTotal = debits.reduce((s, r) => s + r.debit, 0)
        const crTotal = credits.reduce((s, r) => s + r.credit, 0)
        if (credits.length > 0) {
          const delta = debTotal - crTotal
          credits[0].credit += delta
        }
        rows = [...debits, ...credits]
      }
    }

    const totals = rows.reduce(
      (acc, r) => {
        acc.debit += r.debit
        acc.credit += r.credit
        return acc
      },
      { debit: 0, credit: 0 }
    )

    const payload = {
      period,
      start: start || null,
      end: end || null,
      asOf: (end ? new Date(end + 'T00:00:00Z') : new Date()).toISOString().slice(0, 10),
      rows,
      totals,
      balanced: totals.debit === totals.credit,
    }

    return payload as unknown as T
  }

  // ---------------- Apps / App Transactions ----------------
  if (pathname === '/api/apps/connectors' && method === 'GET') {
    // RBAC: view connectors requires reports:read
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'reports:read' as any)) throw new Error('403 Forbidden: reports:read required')
    const { ensureAppSeeded } = await import('../mock/db')
    ensureAppSeeded()
    const connectors = (db.appConnectors || []).map(c => ({
      id: c.id, name: c.name, kind: c.kind, status: c.status, lastSyncAt: c.lastSyncAt || null, lastSyncStatus: c.lastSyncStatus || null,
    }))
    return { connectors } as unknown as T
  }

  if (pathname.startsWith('/api/apps/connectors/') && pathname.endsWith('/sync') && method === 'POST') {
    // RBAC: triggering sync mutates state; require journal:write
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'journal:write' as any)) throw new Error('403 Forbidden: journal:write required')
    const id = pathname.split('/').slice(-2, -1)[0]
    try {
      const { triggerAppSync } = await import('../mock/db')
      const run = triggerAppSync(id)
      return { run, newPostings: run.newPostings } as unknown as T
    } catch (e: any) {
      if (String(e?.message || '').includes('not found')) throw new Error('404 Not Found: connector')
      throw e
    }
  }

  if (pathname === '/api/apps/postings' && method === 'GET') {
    // RBAC: viewing postings requires reports:read
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'reports:read' as any)) throw new Error('403 Forbidden: reports:read required')
    const connectorId = url.searchParams.get('connectorId') || undefined
    const status = url.searchParams.get('status') || undefined
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const { listAppPostings, ensureAppSeeded } = await import('../mock/db')
    ensureAppSeeded()
    const rows = listAppPostings({ connectorId, status: status as any, start, end })
    return { postings: rows, total: rows.length } as unknown as T
  }

  if (pathname.startsWith('/api/apps/postings/') && pathname.endsWith('/preview') && method === 'GET') {
    // RBAC: preview is read-only; require reports:read
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'reports:read' as any)) throw new Error('403 Forbidden: reports:read required')
    const id = pathname.split('/').slice(-2, -1)[0]
    const { previewAppPosting } = await import('../mock/db')
    try {
      const preview = previewAppPosting(id)
      return { preview } as unknown as T
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('not found')) throw new Error('404 Not Found: posting')
      throw new Error('400 Bad Request: ' + msg)
    }
  }

  if (pathname.startsWith('/api/apps/postings/') && pathname.endsWith('/post') && method === 'POST') {
    // RBAC: posting mutates ledger; require journal:write
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'journal:write' as any)) throw new Error('403 Forbidden: journal:write required')
    const id = pathname.split('/').slice(-2, -1)[0]
    const { postAppPosting } = await import('../mock/db')
    try {
      const posting = postAppPosting(id)
      return { posting } as unknown as T
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('not found')) throw new Error('404 Not Found: posting')
      throw new Error('400 Bad Request: ' + msg)
    }
  }

  if (pathname.startsWith('/api/apps/postings/') && pathname.endsWith('/ignore') && method === 'POST') {
    // RBAC: ignoring changes posting status; require journal:write
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'journal:write' as any)) throw new Error('403 Forbidden: journal:write required')
    const id = pathname.split('/').slice(-2, -1)[0]
    const { ignoreAppPosting } = await import('../mock/db')
    try {
      const posting = ignoreAppPosting(id)
      return { posting } as unknown as T
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('not found')) throw new Error('404 Not Found: posting')
      throw new Error('400 Bad Request: ' + msg)
    }
  }

  // Reports - Adjusted Trial Balance
  if (pathname === '/api/reports/adjusted-trial-balance' && method === 'GET') {
    const period = url.searchParams.get('period') || 'YTD'
    const startQ = url.searchParams.get('start') || undefined
    const endQ = url.searchParams.get('end') || undefined
    // Light derive/alias inline to avoid importing helpers into mock
    const now = new Date()
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const parseIso = (s?: string | null) => (s ? new Date(s + 'T00:00:00Z') : null)
    const anchorEnd = parseIso(endQ) || today
    const iso = (d: Date) => d.toISOString().slice(0, 10)
    const endOfMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0))
    const y = anchorEnd.getUTCFullYear()
    const m = anchorEnd.getUTCMonth()
    const qStartMonth = Math.floor(m / 3) * 3
    const alias = period === 'ThisMonth' ? 'MTD' : period === 'ThisQuarter' ? 'QTD' : period
    let start = startQ || null
    let end = endQ || null
    if (!(start && end)) {
      switch (alias) {
        case 'MTD': {
          const s = new Date(Date.UTC(y, m, 1))
          start = iso(s); end = iso(endQ ? anchorEnd : today)
          break
        }
        case 'QTD': {
          const s = new Date(Date.UTC(y, qStartMonth, 1))
          start = iso(s); end = iso(endQ ? anchorEnd : today)
          break
        }
        case 'YTD': {
          const s = new Date(Date.UTC(y, 0, 1))
          start = iso(s); end = iso(endQ ? anchorEnd : today)
          break
        }
        case 'ThisMonth': {
          const s = new Date(Date.UTC(y, m, 1))
          const e = endQ ? anchorEnd : endOfMonth(y, m)
          start = iso(s); end = iso(e)
          break
        }
        case 'ThisQuarter': {
          const s = new Date(Date.UTC(y, qStartMonth, 1))
          const e = endQ ? anchorEnd : endOfMonth(y, qStartMonth + 2)
          start = iso(s); end = iso(e)
          break
        }
      }
    }
    const { computeAdjustedTrialBalance } = await import('../mock/aggregations')
    const atb = computeAdjustedTrialBalance({ start: start || undefined, end: end || undefined })
    return {
      period,
      start: start || null,
      end: end || null,
      asOf: (end ? new Date((end as string) + 'T00:00:00Z') : new Date()).toISOString().slice(0,10),
      rows: atb.rows,
      totals: atb.totals,
      balanced: atb.balanced,
    } as unknown as T
  }

  // Audit (enhanced) - merged legacy lib events + db auditEvents
  if (pathname === '/api/audit' && method === 'GET') {
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'audit:read')) throw new Error('403 Forbidden: audit:read required')
    const entity = url.searchParams.get('entity') || undefined
    const entityId = url.searchParams.get('entityId') || undefined
    const action = url.searchParams.get('action') || undefined
    const actor = url.searchParams.get('actor') || undefined
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const cursor = url.searchParams.get('cursor') || undefined
    const limitParam = url.searchParams.get('limit')
    const limit = Math.max(1, Math.min(200, limitParam ? Number(limitParam) || 50 : 50))

    // Legacy events (customer/vendor) via audit lib
    const legacyFiltered = getAuditEvents({ entity, entityId, start, end, limit: 200 })
    const legacy = legacyFiltered.map(e => ({
      id: e.id,
      ts: e.ts,
      actor: (e as any).userId || 'system',
      action: e.action,
      entityType: (e as any).entity || e.entity,
      entityId: e.entityId,
      before: undefined,
      after: undefined,
      meta: e.meta || {},
      _source: 'legacy'
    }))

    // New db-backed events
    const dbEvents = (db.auditEvents || []).map(e => ({ ...e, _source: 'db' }))

    let rows: any[] = [...legacy, ...dbEvents]
    // De-duplicate by id (favor db events if collision)
    const seen = new Set<string>()
    rows = rows.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true })
    // Sort desc by timestamp
    rows.sort((a,b)=> b.ts.localeCompare(a.ts))

    // Apply filters
    if (entity) rows = rows.filter(r => r.entityType === entity)
    if (entityId) rows = rows.filter(r => r.entityId === entityId)
    if (action) rows = rows.filter(r => r.action === action)
    if (actor) rows = rows.filter(r => r.actor === actor)
    if (start) {
      const sIso = new Date(start + 'T00:00:00Z').toISOString()
      rows = rows.filter(r => r.ts >= sIso)
    }
    if (end) {
      const eIso = new Date(end + 'T23:59:59Z').toISOString()
      rows = rows.filter(r => r.ts <= eIso)
    }

    const total = rows.length
    let startIndex = 0
    if (cursor) {
      const idx = rows.findIndex(r => r.id === cursor)
      if (idx >= 0) startIndex = idx + 1
    }
    const page = rows.slice(startIndex, startIndex + limit)
    const nextCursor = page.length === limit && rows[startIndex + limit] ? rows[startIndex + limit].id : undefined

    // Backward compatibility: include 'events' array (legacy shape) referencing page
    const response: any = {
      rows: page,
      total,
      nextCursor,
      appliedFilters: { entity, entityId, action, actor, start, end, limit, cursor },
      events: page // legacy
    }
    return response as T
  }

  // Profit & Loss
  if (pathname === '/api/reports/profit-loss' && method === 'GET') {
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
    const revenue = Math.round(125000 * scale)
    const cogs = Math.round(48000 * scale)
    const grossProfit = revenue - cogs
    const expenses = Math.round(38000 * scale)
    const operatingIncome = grossProfit - expenses
    const otherIncome = Math.round(2500 * scale)
    const netIncome = operatingIncome + otherIncome
    const payload: any = {
      period,
      totals: { revenue, cogs, grossProfit, expenses, operatingIncome, otherIncome, netIncome },
      lines: [
        { name: 'Revenue', amount: revenue },
        { name: 'Cost of Goods Sold', amount: -cogs },
        { name: 'Gross Profit', amount: grossProfit },
        { name: 'Operating Expenses', amount: -expenses },
        { name: 'Operating Income', amount: operatingIncome },
        { name: 'Other Income', amount: otherIncome },
        { name: 'Net Income', amount: netIncome },
      ],
    }
    if (compare) {
      const prevRevenue = Math.round(revenue * 0.92)
      const prevCogs = Math.round(cogs * 0.94)
      const prevGross = prevRevenue - prevCogs
      const prevExp = Math.round(expenses * 0.95)
      const prevOpInc = prevGross - prevExp
      const prevOther = Math.round(otherIncome * 0.9)
      const prevNet = prevOpInc + prevOther
      payload.prevTotals = { revenue: prevRevenue, cogs: prevCogs, grossProfit: prevGross, expenses: prevExp, operatingIncome: prevOpInc, otherIncome: prevOther, netIncome: prevNet }
      payload.prevLines = [
        { name: 'Revenue', amount: prevRevenue },
        { name: 'Cost of Goods Sold', amount: -prevCogs },
        { name: 'Gross Profit', amount: prevGross },
        { name: 'Operating Expenses', amount: -prevExp },
        { name: 'Operating Income', amount: prevOpInc },
        { name: 'Other Income', amount: prevOther },
        { name: 'Net Income', amount: prevNet },
      ]
    }
    return payload as unknown as T
  }

  // Cash Flow
  if (pathname === '/api/reports/cash-flow' && method === 'GET') {
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
    return payload as unknown as T
  }

  // A/R Aging (stateful)
  if (pathname === '/api/reports/ar-aging' && method === 'GET') {
    const period = url.searchParams.get('period') || 'YTD'
    const end = url.searchParams.get('end') || new Date().toISOString().slice(0,10)
    const asOf = new Date(end + 'T00:00:00Z')
    const { rows, totals } = computeARAging(asOf)
    return { period, asOf: asOf.toISOString().slice(0,10), rows, totals } as unknown as T
  }

  // A/P Aging (stateful)
  if (pathname === '/api/reports/ap-aging' && method === 'GET') {
    const period = url.searchParams.get('period') || 'YTD'
    const end = url.searchParams.get('end') || new Date().toISOString().slice(0,10)
    const asOf = new Date(end + 'T00:00:00Z')
    const { rows, totals } = computeAPAging(asOf)
    return { period, asOf: asOf.toISOString().slice(0,10), rows, totals } as unknown as T
  }

  // Unpaid Bills (stateful)
  if (pathname === '/api/reports/unpaid-bills' && method === 'GET') {
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const { rows, totals } = listUnpaidBills({ start, end })
    return { start: start || null, end: end || null, rows, totals } as unknown as T
  }

  // Journal (create)
  if (pathname === '/api/journal' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const { date, memo, lines, reversing, recurring, attachments } = body || {}
    if (!date || !Array.isArray(lines) || lines.length < 2) {
      throw new Error('400 Bad Request: date and at least two lines are required')
    }
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i] || {}
      if (!l.account) throw new Error(`400 Bad Request: Line ${i + 1}: account is required`)
      const d = Number(l.debit) || 0
      const c = Number(l.credit) || 0
      if (d > 0 && c > 0) throw new Error(`400 Bad Request: Line ${i + 1}: only one of debit or credit may be non-zero`)
    }
    const totals = (lines as any[]).reduce((acc, l) => ({ debit: acc.debit + (Number(l.debit)||0), credit: acc.credit + (Number(l.credit)||0) }), { debit: 0, credit: 0 })
    const round2 = (n: number) => Math.round(n * 100) / 100
    if (round2(totals.debit - totals.credit) !== 0) throw new Error('400 Bad Request: Debits must equal credits')
    if (reversing?.enabled && !reversing?.date) throw new Error('400 Bad Request: Reversing date required when reversing is enabled')
    if (recurring?.enabled && !recurring?.frequency) throw new Error('400 Bad Request: Frequency required for recurring entries')
    const id = `je_${Math.random().toString(36).slice(2, 8)}`
    const number = `JE-${Math.floor(Math.random() * 900000 + 100000)}`
    const normalizedLines = (lines as any[]).map((l) => ({
      account: String(l.account),
      name: l.name ? String(l.name) : '',
      memo: l.memo ? String(l.memo) : '',
      debit: Number(l.debit)||0,
      credit: Number(l.credit)||0,
    }))
    const response: any = {
      journal: {
        id,
        number,
        date,
        memo: memo || '',
        lines: normalizedLines,
        totals: { debit: round2(totals.debit), credit: round2(totals.credit) },
        attachments: Array.isArray(attachments) ? attachments : [],
      }
    }
    if (reversing?.enabled) {
      response.journal.reversing = { ...reversing, reversingEntryId: `je_${Math.random().toString(36).slice(2, 8)}` }
    }
    if (recurring?.enabled) {
      const count = Math.max(0, Math.min(100, Number(recurring.count) || 0))
      response.journal.recurring = { enabled: true, frequency: recurring.frequency, count }
    }
    return response as unknown as T
  }

  // Journal (list)
  if (pathname === '/api/journal' && method === 'GET') {
    const sample = Array.from({ length: 5 }, (_, i) => ({
      id: `je_${i + 1}`,
      number: `JE-10${i + 1}`,
      date: new Date(Date.now() - i * 86400000).toISOString(),
      memo: `Sample journal ${i + 1}`,
      totals: { debit: 100 + i * 10, credit: 100 + i * 10 },
      lines: [
        { account: '1000 · Cash', debit: 100 + i * 10, credit: 0 },
        { account: '4000 · Sales Revenue', debit: 0, credit: 100 + i * 10 },
      ],
    }))
    return { journals: sample, total: sample.length } as unknown as T
  }

  // Balance Sheet
  if (pathname === '/api/reports/balance-sheet' && method === 'GET') {
    const period = url.searchParams.get('period') || 'YTD'
    const compare = url.searchParams.get('compare') === '1'
    const end = url.searchParams.get('end')
    const asOf = end ? new Date(end + 'T00:00:00Z') : new Date()
    const factor = 1 + ((asOf.getUTCDate() % 10) - 5) / 500
    const scale = (n: number) => Math.round(n * factor)
    const assets = [
      { name: 'Cash', amount: 15000 },
      { name: 'Accounts Receivable', amount: 9000 },
      { name: 'Inventory', amount: 6000 },
    ].map(a => ({ ...a, amount: scale(a.amount) }))
    const liabilities = [
      { name: 'Accounts Payable', amount: 8000 },
      { name: 'Credit Card Payable', amount: 3500 },
    ].map(l => ({ ...l, amount: scale(l.amount) }))
    const totalAssets = assets.reduce((s, a) => s + a.amount, 0)
    const totalLiab = liabilities.reduce((s, l) => s + l.amount, 0)
    const equityTotal = totalAssets - totalLiab
    const eqLen = 2
    const per = Math.floor(equityTotal / eqLen)
    const rem = equityTotal - per * eqLen
    const equity = [
      { name: 'Retained Earnings', amount: per + rem },
      { name: 'Owner Equity', amount: per },
    ]
    const payload: any = {
      period,
      assets,
      liabilities,
      equity,
      totals: { assets: totalAssets, liabilities: totalLiab, equity: equityTotal },
      balanced: Math.round((totalAssets - (totalLiab + equityTotal)) * 100) === 0,
      asOf: asOf.toISOString().slice(0,10),
    }
    if (compare) {
      const prevScale = 0.95
      const ps = (n: number) => Math.round(n * prevScale)
      payload.prev = {
        assets: assets.map(a => ({ ...a, amount: ps(a.amount) })),
        liabilities: liabilities.map(l => ({ ...l, amount: ps(l.amount) })),
        equity: equity.map(e => ({ ...e, amount: ps(e.amount) })),
        totals: {
          assets: ps(totalAssets),
          liabilities: ps(totalLiab),
          equity: ps(equityTotal),
        }
      }
    }
    return payload as unknown as T
  }

  // Transactions (list) - stateful
  if (pathname === '/api/transactions' && method === 'GET') {
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const id = url.searchParams.get('id') || undefined
    if (id) {
      const row = (db.transactions || []).find(t => t.id === id)
      if (!row) throw new Error('404 Not Found: transaction not found')
      return { transaction: row } as unknown as T
    }
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const type = url.searchParams.get('type') || undefined
    const bankStatus = url.searchParams.get('bankStatus') || undefined
    const tag = url.searchParams.get('tag') || undefined
    let { rows, total } = dbListTransactions({ start, end, type, bankStatus, page, limit })
    if (tag) {
      rows = rows.filter((tx: any) => Array.isArray(tx.tags) && tx.tags.includes(tag))
      total = rows.length
    }
    return { transactions: rows, total, page, limit } as unknown as T
  }

  // Invoices (list) - stateful
  if (pathname === '/api/invoices' && method === 'GET') {
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const status = url.searchParams.get('status') || undefined
    const tag = url.searchParams.get('tag') || undefined
    const aging = url.searchParams.get('aging') || undefined
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    let { rows, total } = dbListInvoices({ start, end, status, page, limit })
    if (tag) {
      rows = rows.filter((inv: any) => Array.isArray(inv.tags) && inv.tags.includes(tag))
      total = rows.length
    }
    // Aging enhancements: compute daysPastDue & bucket (reuse computeARAging logic lightly)
    const now = new Date()
    function bucketFor(days: number) {
      if (days < 30) return 'current'
      if (days < 60) return '30'
      if (days < 90) return '60'
      if (days < 120) return '90'
      return '120+'
    }
    const enriched = rows.map(inv => {
      const dueIso = inv.dueDate || inv.date
      const due = new Date(dueIso)
      let daysPastDue = 0
      if (!isNaN(due.valueOf())) {
        daysPastDue = Math.max(0, Math.floor((now.getTime() - due.getTime()) / 86400000))
      }
      const bucket = bucketFor(daysPastDue)
      return { inv, dueIso, daysPastDue, bucket }
    })
    let filtered = enriched
    if (aging) {
      filtered = enriched.filter(e => e.bucket === aging)
    }
    if (aging) {
      total = filtered.length
    }
    // Apply paging after potential aging filter
    const offset = (page - 1) * limit
    const pageRows = filtered.slice(offset, offset + limit)
    const mapped = rows.map(inv => ({
      id: inv.id,
      number: inv.number,
      customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId,
      status: inv.status,
      total: inv.total,
      date: inv.date,
      balance: inv.balance,
    }))
    // Replace mapped with enriched+filtered pageRows to include new fields
    const mappedPaged = pageRows.map(e => ({
      id: e.inv.id,
      number: e.inv.number,
      customer: db.customers.find(c => c.id === e.inv.customerId)?.name || e.inv.customerId,
      customerId: e.inv.customerId,
      status: e.inv.status,
      total: e.inv.total,
      date: e.inv.date,
      dueDate: e.inv.dueDate || e.inv.date,
      daysPastDue: e.daysPastDue,
      agingBucket: e.bucket,
      balance: e.inv.balance,
    }))
    return { invoices: mappedPaged, total, page, limit, aging: aging || null } as unknown as T
  }

  // Customers (list)
  if (pathname === '/api/customers' && method === 'GET') {
    const q = (url.searchParams.get('q') || '').toLowerCase()
    const customers = Array.from({ length: 12 }, (_, i) => ({
      id: `cust_${i + 1}`,
      name: `Customer ${i + 1}`,
      terms: (['Net 15','Net 30','Due on receipt'] as const)[i % 3],
      email: `customer${i + 1}@example.com`,
      phone: `555-01${(i + 1).toString().padStart(2, '0')}`,
    }))
    const list = q ? customers.filter(c => c.name.toLowerCase().includes(q)) : customers
    return { customers: list } as unknown as T
  }

  // Customers (create)
  if (pathname === '/api/customers' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    // Derive a display name similar to server route
    const displayName = String(body?.displayName || '').trim()
    const parts = [body?.firstName, body?.middleName, body?.lastName].filter((v: any) => !!v).join(' ').trim()
    const company = String(body?.companyName || '').trim()
    const legacy = String(body?.name || '').trim()
    const resolved = displayName || parts || company || legacy
    // Basic validation: require some name; if taxExempt, require reason
    if (!resolved) throw new Error('400 Bad Request: display/name is required')
    if (body?.taxExempt && !String(body?.taxExemptReason || '').trim()) {
      throw new Error('400 Bad Request: Tax exemption reason required')
    }
    const id = `cust_${Math.random().toString(36).slice(2,8)}`
    const customer = {
      id,
      name: resolved,
      terms: String(body?.terms || ''),
      email: String(body?.email || ''),
      phone: String(body?.phone || ''),
      billingAddress: body?.billingAddress,
      shippingAddress: body?.shippingAddress,
    } as any
    // Persist into mock db for stateful behavior
    ;(db.customers ||= []).push(customer)
    try { logEvent({ userId: 'u_mock', action: 'customer:create', entity: 'customer', entityId: id, meta: { name: customer.name } }) } catch {}
    return { customer } as unknown as T
  }

  // Customers (detail GET + sub-routes)
  if (pathname.startsWith('/api/customers/') && method === 'GET') {
    const id = pathname.split('/').pop() as string
    // Statement detail sub-route (/api/customers/:id/statement)
    if (pathname.endsWith('/statement')) {
      const asOfParam = url.searchParams.get('asOf') || new Date().toISOString().slice(0,10)
      const asOf = new Date(asOfParam + 'T00:00:00Z')
      const startParam = url.searchParams.get('start')
      const typeParam = url.searchParams.get('type') as any
      const start = startParam ? new Date(startParam + 'T00:00:00Z') : null
      const type = (typeParam === 'balance-forward' || typeParam === 'transaction' || typeParam === 'open-item') ? typeParam : undefined
      const payload = computeCustomerStatement(id, asOf, { start, type })
      return { statement: payload } as unknown as T
    }
    // AR snapshot sub-route (/api/customers/:id/ar-snapshot)
    if (pathname.endsWith('/ar-snapshot')) {
      const asOfParam = url.searchParams.get('asOf') || new Date().toISOString().slice(0,10)
      const asOf = new Date(asOfParam + 'T00:00:00Z')
      const snapshot = computeCustomerARSnapshot(id, asOf)
      return { snapshot } as unknown as T
    }
    const idx = parseInt(id.replace(/\D/g, '').slice(-1) || '1', 10)
    const customer = {
      id,
      name: `Customer ${idx}`,
      terms: (['Net 15','Net 30','Due on receipt'] as const)[idx % 3],
      email: `customer${idx}@example.com`,
      phone: `555-01${String(idx).padStart(2,'0')}`,
    }
    return { customer } as unknown as T
  }

  // Customers (update PUT)
  if (pathname.startsWith('/api/customers/') && method === 'PUT') {
    const id = pathname.split('/').pop() as string
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const name = String(body?.name || '').trim()
    if (!name) throw new Error('400 Bad Request: name is required')
    const customer = {
      id,
      name,
      terms: String(body?.terms || ''),
      email: String(body?.email || ''),
      phone: String(body?.phone || ''),
    }
    logEvent({ userId: 'u_mock', action: 'customer:update', entity: 'customer', entityId: id, meta: { name } })
    return { customer } as unknown as T
  }

  // Vendors (list)
  if (pathname === '/api/vendors' && method === 'GET') {
    const q = (url.searchParams.get('q') || '').toLowerCase()
    const vendors = Array.from({ length: 8 }, (_, i) => ({
      id: `ven_${i + 1}`,
      name: `Vendor ${i + 1}`,
      terms: (['Net 15','Net 30','Due on receipt'] as const)[i % 3],
    }))
    const list = q ? vendors.filter(v => v.name.toLowerCase().includes(q)) : vendors
    return { vendors: list } as unknown as T
  }

  // Vendors (create)
  if (pathname === '/api/vendors' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const name = String(body?.name || '').trim()
    const terms = String(body?.terms || '')
    if (!name) throw new Error('400 Bad Request: name is required')
    const id = `ven_${Math.random().toString(36).slice(2,8)}`
    const vendor = { id, name, terms }
    logEvent({ userId: 'u_mock', action: 'vendor:create', entity: 'vendor', entityId: id, meta: { name, terms } })
    return { vendor } as unknown as T
  }

  // Vendors (detail GET + sub-routes)
  if (pathname.startsWith('/api/vendors/') && method === 'GET') {
    // Statement sub-route: /api/vendors/:id/statement
    if (pathname.endsWith('/statement')) {
      const id = pathname.split('/').slice(-2, -1)[0]
      const asOfParam = url.searchParams.get('asOf') || new Date().toISOString().slice(0,10)
      const asOf = new Date(asOfParam + 'T00:00:00Z')
      const startParam = url.searchParams.get('start')
      const typeParam = url.searchParams.get('type') as any
      const start = startParam ? new Date(startParam + 'T00:00:00Z') : null
      const type = (typeParam === 'balance-forward' || typeParam === 'transaction' || typeParam === 'open-item') ? typeParam : undefined
      const payload = computeVendorStatement(id, asOf, { start, type })
      return payload as unknown as T
    }
    const id = pathname.split('/').pop() as string
    const idx = parseInt(id.replace(/\D/g, '').slice(-1) || '1', 10)
    const vendor = {
      id,
      name: `Vendor ${idx}`,
      terms: (['Net 15','Net 30','Due on receipt'] as const)[idx % 3],
    }
    return { vendor } as unknown as T
  }

  // Vendors (update PUT)
  if (pathname.startsWith('/api/vendors/') && method === 'PUT') {
    const id = pathname.split('/').pop() as string
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const name = String(body?.name || '').trim()
    const terms = String(body?.terms || '')
    if (!name) throw new Error('400 Bad Request: name is required')
    const vendor = { id, name, terms }
    logEvent({ userId: 'u_mock', action: 'vendor:update', entity: 'vendor', entityId: id, meta: { name, terms } })
    return { vendor } as unknown as T
  }

  // Invoices (update) - stateful
  if (pathname.startsWith('/api/invoices/') && !pathname.endsWith('/send') && !pathname.endsWith('/payments') && method === 'PUT') {
    const id = pathname.split('/').pop() as string
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    try {
      const lines = Array.isArray(body.lines) ? body.lines : (Array.isArray(body.items) ? body.items : undefined)
      let customerId = body.customerId
      if (!customerId && body.customer) {
        const found = db.customers.find(c => c.name === body.customer)
        if (found) customerId = found.id
      }
      const inv = dbUpdateInvoice(id, { number: body.number, customerId, status: body.status, date: body.date, lines })
      const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
      return { invoice } as unknown as T
    } catch {
      throw new Error('404 Not Found: invoice not found')
    }
  }

  // Invoices (delete) - stateful
  if (pathname.startsWith('/api/invoices/') && !pathname.endsWith('/send') && !pathname.endsWith('/payments') && method === 'DELETE') {
    const id = pathname.split('/').pop() as string
    const ok = dbDeleteInvoice(id)
    if (!ok) throw new Error('404 Not Found: invoice not found')
    return { ok: true } as unknown as T
  }

  // Invoice detail (GET) - stateful
  if (pathname.startsWith('/api/invoices/') && !pathname.endsWith('/send') && !pathname.endsWith('/payments') && method === 'GET') {
    const id = pathname.split('/').pop() as string
    const inv = dbFindInvoice(id)
    if (!inv) throw new Error('404 Not Found: invoice not found')
    const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
    return { invoice } as unknown as T
  }

  // Invoice send (POST /api/invoices/:id/send) - stateful
  if (pathname.startsWith('/api/invoices/') && pathname.endsWith('/send') && method === 'POST') {
    const id = pathname.split('/').slice(-2, -1)[0]
    try {
      const inv = dbUpdateInvoice(id, { status: 'sent' })
      const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
      return { invoice } as unknown as T
    } catch {
      throw new Error('404 Not Found: invoice not found')
    }
  }

  // Invoice payments (POST /api/invoices/:id/payments) - stateful
  if (pathname.startsWith('/api/invoices/') && pathname.endsWith('/payments') && method === 'POST') {
    const id = pathname.split('/').slice(-2, -1)[0]
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const amount = Number(body?.amount)
    if (!amount || amount <= 0) throw new Error('400 Bad Request: amount is required and must be > 0')
    try {
  const { invoice: inv, payment } = dbApplyPaymentToInvoice(id, amount, { date: body?.date })
  // Audit: invoice payment applied
  try { logEvent({ userId: 'u_mock', action: 'invoice:payment', entity: 'invoice', entityId: id, meta: { amount, paymentId: payment.id } }) } catch {}
      const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
      return { invoice, payment } as unknown as T
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (/closed period/i.test(msg) || /exceeds remaining balance/i.test(msg) || /amount is required/i.test(msg)) {
        // Surface underlying validation errors directly to tests/UI
        throw new Error(msg)
      }
      throw new Error('404 Not Found: invoice not found')
    }
  }

  // Invoice reminder (POST /api/invoices/:id/remind) - stateful (collections)
  if (pathname.startsWith('/api/invoices/') && pathname.endsWith('/remind') && method === 'POST') {
    const id = pathname.split('/').slice(-2, -1)[0]
    try {
      const inv = dbFindInvoice(id)
      if (!inv) throw new Error('404 Not Found: invoice not found')
      // Log an audit event for reminder sent
      logEvent({ userId: 'u_mock', action: 'invoice:remind', entity: 'invoice', entityId: id, meta: { number: inv.number } })
      const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
      return { ok: true, invoice } as unknown as T
    } catch {
      throw new Error('404 Not Found: invoice not found')
    }
  }

  // Credit memos (GET list)
  if (pathname === '/api/credit-memos' && method === 'GET') {
    const customerId = url.searchParams.get('customerId') || undefined
    const memos = dbListCreditMemos({ customerId }).map(cm => ({
      id: cm.id,
      number: cm.number,
      customerId: cm.customerId,
      date: cm.date,
      total: cm.total,
      remaining: cm.remaining,
      applied: cm.applied,
    }))
    return { creditMemos: memos } as unknown as T
  }

  // Credit memos (POST create)
  if (pathname === '/api/credit-memos' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const customerId = String(body?.customerId || '')
    const lines = Array.isArray(body?.lines) ? body.lines : []
    if (!customerId || lines.length === 0) throw new Error('400 Bad Request: customerId and lines required')
    const cm = dbCreateCreditMemo({ number: body.number, customerId, date: body.date, lines })
    return { creditMemo: cm } as unknown as T
  }

  // Customer payments (POST create multi-invoice allocation)
  if (pathname === '/api/customer-payments' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const customerId = String(body?.customerId || '')
    const amountReceived = Number(body?.amountReceived)
    const allocations = Array.isArray(body?.allocations) ? body.allocations : []
    if (!customerId || !(amountReceived > 0)) throw new Error('400 Bad Request: customerId & amountReceived required')
    try {
  const cp = dbCreateCustomerPayment({ customerId, amountReceived, allocations, date: body.date, method: body.method, reference: body.reference, autoCreditUnapplied: body.autoCreditUnapplied !== false })
  try { logEvent({ userId: 'u_mock', action: 'customer-payment:create', entity: 'customer-payment', entityId: cp.id, meta: { customerId, amountReceived, allocationCount: allocations.length } }) } catch {}
      // Return affected invoices (light hydration: number & balance)
      const affectedIds = new Set<string>(allocations.map((a: any)=> a.invoiceId))
      const affectedInvoices = db.invoices.filter(inv => affectedIds.has(inv.id)).map(inv => ({ id: inv.id, number: inv.number, balance: inv.balance, status: inv.status }))
      return { customerPayment: cp, invoices: affectedInvoices } as unknown as T
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('not found')) throw new Error('404 Not Found: resource')
      throw new Error('400 Bad Request: ' + msg)
    }
  }

  // Customer payments (GET list)
  if (pathname === '/api/customer-payments' && method === 'GET') {
    const customerId = url.searchParams.get('customerId') || undefined
    const payments = dbListCustomerPayments({ customerId }).map(p => ({
      id: p.id,
      customerId: p.customerId,
      date: p.date,
      amountReceived: p.amountReceived,
      amountAllocated: p.amountAllocated,
      amountUnapplied: p.amountUnapplied,
      status: p.status,
      allocations: p.allocations,
    }))
    return { customerPayments: payments, total: payments.length } as unknown as T
  }

  // Deposits (POST create)
  if (pathname === '/api/deposits' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const paymentIds = Array.isArray(body?.paymentIds) ? body.paymentIds : []
    if (!paymentIds.length) throw new Error('400 Bad Request: paymentIds required')
    try {
  const dep = dbCreateDeposit({ date: body.date, paymentIds })
  try { logEvent({ userId: 'u_mock', action: 'deposit:create', entity: 'deposit', entityId: dep.id, meta: { paymentCount: paymentIds.length, total: dep.total } }) } catch {}
      return { deposit: dep } as unknown as T
    } catch (e: any) {
      const msg = String(e?.message || '')
      throw new Error('400 Bad Request: ' + msg)
    }
  }

  // Deposits (GET list)
  if (pathname === '/api/deposits' && method === 'GET') {
    const deposits = dbListDeposits().map(d => ({ id: d.id, date: d.date, total: d.total, paymentCount: d.paymentIds.length }))
    return { deposits, total: deposits.length } as unknown as T
  }

  // Customer refunds (GET list)
  if (pathname === '/api/customer-refunds' && method === 'GET') {
    const customerId = url.searchParams.get('customerId') || undefined
    const rows = dbListCustomerRefunds({ customerId })
    return { refunds: rows, total: rows.length } as unknown as T
  }

  // Customer refunds (POST create)
  if (pathname === '/api/customer-refunds' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const customerId = String(body?.customerId || '')
    const amount = Number(body?.amount)
    if (!customerId || !(amount > 0)) throw new Error('400 Bad Request: customerId and positive amount required')
    try {
      const refund = dbCreateCustomerRefund({ customerId, amount, date: body.date, method: body.method, reference: body.reference, creditMemoId: body.creditMemoId })
      return { refund } as unknown as T
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('not found')) throw new Error('404 Not Found: resource')
      throw new Error('400 Bad Request: ' + msg)
    }
  }

  // Vendor refunds (GET list)
  if (pathname === '/api/vendor-refunds' && method === 'GET') {
    const vendorId = url.searchParams.get('vendorId') || undefined
    const rows = dbListVendorRefunds({ vendorId })
    return { refunds: rows, total: rows.length } as unknown as T
  }

  // Vendor refunds (POST create)
  if (pathname === '/api/vendor-refunds' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const vendorId = String(body?.vendorId || '')
    const amount = Number(body?.amount)
    if (!vendorId || !(amount > 0)) throw new Error('400 Bad Request: vendorId and positive amount required')
    try {
      const refund = dbCreateVendorRefund({ vendorId, amount, date: body.date, method: body.method, reference: body.reference, vendorCreditId: body.vendorCreditId })
      return { refund } as unknown as T
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('not found')) throw new Error('404 Not Found: resource')
      throw new Error('400 Bad Request: ' + msg)
    }
  }

  // Deposits (GET detail)
  if (pathname.startsWith('/api/deposits/') && method === 'GET') {
    const id = pathname.split('/').pop() as string
    const dep = (db.deposits || []).find(d => d.id === id)
    if (!dep) throw new Error('404 Not Found: deposit')
    // Hydrate basic payment info
    const payments: any[] = []
    for (const inv of db.invoices) {
      for (const p of inv.payments) {
        if (dep.paymentIds.includes(p.id)) payments.push({ id: p.id, invoiceId: inv.id, invoiceNumber: inv.number, amount: p.amount, date: p.date })
      }
    }
    return { deposit: { id: dep.id, date: dep.date, total: dep.total, payments } } as unknown as T
  }

  // Undeposited payments (GET list) - derived across invoices
  if (pathname === '/api/undeposited-payments' && method === 'GET') {
    const rows: any[] = []
    for (const inv of db.invoices) {
      for (const p of inv.payments) {
        if (p.fundSource === 'undeposited' && !p.depositId) {
          rows.push({ id: p.id, invoiceId: inv.id, invoiceNumber: inv.number, customerId: inv.customerId, customer: db.customers.find(c=>c.id===inv.customerId)?.name || inv.customerId, amount: p.amount, date: p.date })
        }
      }
    }
    rows.sort((a,b)=> b.date.localeCompare(a.date))
    return { payments: rows, total: rows.length } as unknown as T
  }

  // Apply credit memo to invoice (POST /api/invoices/:id/apply-credit)
  if (pathname.startsWith('/api/invoices/') && pathname.endsWith('/apply-credit') && method === 'POST') {
    // RBAC: invoices:write is required to apply credits
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'invoices:write' as any)) {
      throw new Error('403 Forbidden: invoices:write required')
    }
    const id = pathname.split('/').slice(-2, -1)[0]
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const creditMemoId = String(body?.creditMemoId || '')
    const amount = Number(body?.amount)
    if (!creditMemoId || !amount) throw new Error('400 Bad Request: creditMemoId and amount required')
    try {
      const { invoice, creditMemo } = dbApplyCreditToInvoice(creditMemoId, id, amount)
      const hydrated = { ...invoice, customer: db.customers.find(c => c.id === invoice.customerId)?.name || invoice.customerId }
      return { invoice: hydrated, creditMemo } as unknown as T
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('not found')) throw new Error('404 Not Found: resource')
      throw new Error('400 Bad Request: ' + msg)
    }
  }

  // Auto-apply customer credits to open invoices (POST /api/customers/:id/credits/auto-apply)
  if (pathname.startsWith('/api/customers/') && pathname.endsWith('/credits/auto-apply') && method === 'POST') {
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'invoices:write' as any)) {
      throw new Error('403 Forbidden: invoices:write required')
    }
    const id = pathname.split('/').slice(-3, -2)[0]
    const cust = (db.customers || []).find(c => c.id === id)
    if (!cust) throw new Error('404 Not Found: customer')
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const dryRun = body?.dryRun === true
    // Gather open invoices (positive balance) for this customer, oldest due first (fallback to date)
    const openInvs = (db.invoices || [])
      .filter(inv => inv.customerId === id && Number(inv.balance || 0) > 0 && inv.status !== 'void')
      .slice()
      .sort((a: any, b: any) => {
        const ad = String(a.dueDate || a.date || '').slice(0,10)
        const bd = String(b.dueDate || b.date || '').slice(0,10)
        return ad.localeCompare(bd) || String(a.number||'').localeCompare(String(b.number||''))
      })
    // Available credits for this customer, oldest first
    const credits = ((db as any).creditMemos || [])
      .filter((cm: any) => cm.customerId === id && Number(cm.remaining || 0) > 0)
      .slice()
      .sort((a: any, b: any) => String(a.date||'').slice(0,10).localeCompare(String(b.date||'').slice(0,10)) || String(a.number||'').localeCompare(String(b.number||'')))

    const results: Array<{ invoiceId: string; invoiceNumber: string; creditMemoId: string; creditNumber: string; amount: number }>
      = []
    const jeBefore = (db.journalEntries || []).length
    // Local mirrors for dryRun simulation
    const invBalMap = new Map<string, number>()
    const cmRemMap = new Map<string, number>()
    for (const inv of openInvs) invBalMap.set(inv.id, Number(inv.balance || 0))
    for (const cm of credits) cmRemMap.set(cm.id, Number(cm.remaining || 0))
    for (const cm of credits) {
      for (const inv of openInvs) {
        const invBal = dryRun ? (invBalMap.get(inv.id) || 0) : Number(inv.balance || 0)
        const cmRem = dryRun ? (cmRemMap.get(cm.id) || 0) : Number(cm.remaining || 0)
        if (invBal <= 0 || cmRem <= 0) continue
        const applyAmt = Math.min(invBal, cmRem)
        if (applyAmt > 0) {
          if (!dryRun) {
            dbApplyCreditToInvoice(cm.id, inv.id, applyAmt)
          } else {
            invBalMap.set(inv.id, Number((invBal - applyAmt).toFixed(2)))
            cmRemMap.set(cm.id, Number((cmRem - applyAmt).toFixed(2)))
          }
          results.push({ invoiceId: inv.id, invoiceNumber: inv.number, creditMemoId: cm.id, creditNumber: cm.number, amount: applyAmt })
        }
      }
    }
    const jeAfter = (db.journalEntries || []).length
    const nonPosting = jeAfter === jeBefore
    const totalApplied = Number(results.reduce((s,r)=> s + r.amount, 0).toFixed(2))
    if (!dryRun && results.length > 0) {
      ;(db.auditEvents ||= []).push({
        id: `aud_${Date.now()}`,
        ts: new Date().toISOString(),
        actor: 'system',
        action: 'ar:auto-apply-credits',
        entityType: 'customer',
        entityId: id,
        after: undefined,
        meta: { allocations: results.length, totalApplied }
      } as any)
    }
    const invoices = openInvs.map(inv => ({ id: inv.id, number: inv.number, balance: inv.balance, status: inv.status }))
    return { ok: results.length, results, invoices, nonPosting, dryRun, totalApplied } as unknown as T
  }

  // Auto-apply vendor credits to open bills (POST /api/vendors/:id/credits/auto-apply)
  if (pathname.startsWith('/api/vendors/') && pathname.endsWith('/credits/auto-apply') && method === 'POST') {
    const role = getRoleFromCookies()
    if (!hasPermission(role, 'bills:write' as any)) {
      throw new Error('403 Forbidden: bills:write required')
    }
    const id = pathname.split('/').slice(-3, -2)[0]
    const ven = (db.vendors || []).find(v => v.id === id)
    if (!ven) throw new Error('404 Not Found: vendor')
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const dryRun = body?.dryRun === true
    // Gather open bills (positive balance) for this vendor, oldest due first
    const openBills = (db.bills || [])
      .filter(b => b.vendorId === id && Number(b.balance || 0) > 0 && b.status !== 'void')
      .slice()
      .sort((a: any, b: any) => {
        const ad = String(a.dueDate || a.billDate || '').slice(0,10)
        const bd = String(b.dueDate || b.billDate || '').slice(0,10)
        return ad.localeCompare(bd) || String(a.number||'').localeCompare(String(b.number||''))
      })
    // Available vendor credits, oldest first
    const vendorCredits = ((db as any).vendorCredits || [])
      .filter((vc: any) => vc.vendorId === id && Number(vc.remaining || 0) > 0)
      .slice()
      .sort((a: any, b: any) => String(a.date||'').slice(0,10).localeCompare(String(b.date||'').slice(0,10)) || String(a.number||'').localeCompare(String(b.number||'')))

    const results: Array<{ billId: string; billNumber: string; vendorCreditId: string; creditNumber: string; amount: number }> = []
    const jeBefore = (db.journalEntries || []).length
    // Reuse apply function from mock db
    const { applyVendorCreditToBill } = await import('../mock/db')
    // Local mirrors for dryRun simulation
    const billBalMap = new Map<string, number>()
    const vcRemMap = new Map<string, number>()
    for (const b of openBills) billBalMap.set(b.id, Number(b.balance || 0))
    for (const vc of vendorCredits) vcRemMap.set(vc.id, Number(vc.remaining || 0))
    for (const vc of vendorCredits) {
      for (const bill of openBills) {
        const billBal = dryRun ? (billBalMap.get(bill.id) || 0) : Number(bill.balance || 0)
        const vcRem = dryRun ? (vcRemMap.get(vc.id) || 0) : Number(vc.remaining || 0)
        if (billBal <= 0 || vcRem <= 0) continue
        const applyAmt = Math.min(billBal, vcRem)
        if (applyAmt > 0) {
          if (!dryRun) {
            applyVendorCreditToBill(vc.id, bill.id, applyAmt)
          } else {
            billBalMap.set(bill.id, Number((billBal - applyAmt).toFixed(2)))
            vcRemMap.set(vc.id, Number((vcRem - applyAmt).toFixed(2)))
          }
          results.push({ billId: bill.id, billNumber: bill.number, vendorCreditId: vc.id, creditNumber: vc.number, amount: applyAmt })
        }
      }
    }
    const jeAfter = (db.journalEntries || []).length
    const nonPosting = jeAfter === jeBefore
    const totalApplied = Number(results.reduce((s,r)=> s + r.amount, 0).toFixed(2))
    if (!dryRun && results.length > 0) {
      ;(db.auditEvents ||= []).push({
        id: `aud_${Date.now()}`,
        ts: new Date().toISOString(),
        actor: 'system',
        action: 'ap:auto-apply-credits',
        entityType: 'vendor',
        entityId: id,
        after: undefined,
        meta: { allocations: results.length, totalApplied }
      } as any)
    }
    const bills = openBills.map(b => ({ id: b.id, number: b.number, balance: b.balance, status: b.status }))
    return { ok: results.length, results, bills, nonPosting, dryRun, totalApplied } as unknown as T
  }

  // Invoice batch reminders (POST /api/invoices/reminders) - stateful (collections)
  if (pathname === '/api/invoices/reminders' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const ids: string[] = Array.isArray(body?.ids) ? body.ids.map((v: any) => String(v)) : []
    if (!ids.length) throw new Error('400 Bad Request: ids array required')
    const unique: string[] = Array.from(new Set<string>(ids))
    const results = unique.map((id: string) => {
      const inv = dbFindInvoice(id)
      if (!inv) return { id, ok: false, message: 'Not found' }
      if (inv.status === 'paid') return { id, ok: false, message: 'Already paid' }
      // Simulate occasional transient failures for realism
      const transientFail = Math.random() < 0.05
      if (transientFail) return { id, ok: false, message: 'Temporary failure, retry' }
      logEvent({ userId: 'u_mock', action: 'invoice:remind', entity: 'invoice', entityId: id, meta: { number: inv.number, batch: true } })
      return { id, ok: true }
    })
    return { results } as unknown as T
  }

  // Invoice void (POST /api/invoices/:id/void) - stateful
  if (pathname.startsWith('/api/invoices/') && pathname.endsWith('/void') && method === 'POST') {
    const id = pathname.split('/').slice(-2, -1)[0]
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const { createReversing, reason, reversalDate } = body || {}
    try {
      const inv = dbFindInvoice(id)
      if (!inv) throw new Error('404 Not Found: invoice not found')
      // Normalize reversal date to next open date if provided date is closed (or use today)
      const preferred = (typeof reversalDate === 'string' && /\d{4}-\d{2}-\d{2}/.test(reversalDate)) ? reversalDate : new Date().toISOString().slice(0,10)
      const close = db.settings?.closeDate
      const adjusted = close && preferred <= close ? (() => { const d = new Date(close + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0,10) })() : preferred
      const warning = adjusted !== preferred
      dbVoidInvoice(id, { createReversing, reason, reversalDate: adjusted })
      const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
      const audit = (db.auditEvents || []).filter(e => e.entityType === 'invoice' && e.entityId === id).slice(-5)
      return { invoice, audit, warning: warning ? 'Reversal date adjusted to next open period' : undefined, usedReversalDate: adjusted } as unknown as T
    } catch (e: any) {
      if (String(e?.message || '').includes('not found')) throw new Error('404 Not Found: invoice not found')
      throw e
    }
  }

  // Invoices (create) - stateful (supports legacy customer field)
  if (pathname === '/api/invoices' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    let { number, customerId, customer, lines, items, date, terms, dueDate } = body || {}
    const lineList = Array.isArray(lines) ? lines : (Array.isArray(items) ? items : [])
    if (!customerId && customer) {
      const found = db.customers.find(c => c.name === customer)
      if (found) customerId = found.id
    }
    if (!customerId && db.customers.length) customerId = db.customers[0].id
    if (!customerId || !Array.isArray(lineList) || lineList.length === 0) {
      throw new Error('400 Bad Request: number, customer/customerId and at least one line item are required')
    }
    if (!number) number = `INV-${Math.floor(Math.random()*9000+1000)}`
    const inv = dbCreateInvoice({ number, customerId, date: date || new Date().toISOString(), lines: lineList, terms, dueDate })
    const invoice = { ...inv, customer: db.customers.find(c => c.id === inv.customerId)?.name || inv.customerId }
    return { invoice } as unknown as T
  }

  // Bill payments (POST /api/bills/:id/payments) - stateful
  if (pathname.startsWith('/api/bills/') && pathname.endsWith('/payments') && method === 'POST') {
    const id = pathname.split('/').slice(-2, -1)[0]
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const amount = Number(body?.amount)
    if (!amount || amount <= 0) throw new Error('400 Bad Request: amount is required and must be > 0')
    try {
      const { bill: b, payment } = dbApplyPaymentToBill(id, amount, { date: body?.date })
      // Attach optional metadata to payment for downstream consumers
      const method = typeof body?.method === 'string' ? body.method : undefined
      const reference = typeof body?.reference === 'string' ? body.reference : undefined
      const accountNumber = typeof body?.accountNumber === 'string' ? body.accountNumber : undefined
      const printLater = body?.printLater === true
      const checkAccount = typeof body?.checkAccount === 'string' ? body.checkAccount : undefined
      if (method) (payment as any).method = method
      if (reference) (payment as any).reference = reference
      if (accountNumber) (payment as any).accountNumber = accountNumber

      // If paying by check and opting to print later, create a queued Check and audit it
      if (method === 'check' && printLater && checkAccount) {
        const payee = db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId
        const number = nextCheckNumber(checkAccount)
        const chk = upsertCheck({
          id: `chk_${Math.random().toString(36).slice(2, 10)}`,
          date: (payment.date || new Date().toISOString()).slice(0, 10),
          payee,
          amount: Number(amount),
          account: checkAccount,
          number,
          status: 'to_print',
          memo: reference || undefined,
        })
        ;(db.auditEvents ||= []).push({
          id: `aud_${Date.now()}`,
          ts: new Date().toISOString(),
          actor: 'system',
          action: 'check:create',
          entityType: 'check',
          entityId: chk.id,
          after: { ...chk },
          meta: { source: 'billPayment', billId: b.id, account: chk.account, number: chk.number, amount: chk.amount }
        } as any)
      }

      const bill = { ...b, vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId }
      return { bill, payment } as unknown as T
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (/not found/i.test(msg)) throw new Error('404 Not Found: bill not found')
      if (/closed period/i.test(msg)) throw new Error('400 Bad Request: Date is in closed period')
      if (/exceeds/i.test(msg)) throw new Error('400 Bad Request: Payment exceeds remaining balance')
      throw new Error('400 Bad Request: ' + msg)
    }
  }

  // Bills (list) - stateful
  if (pathname === '/api/bills' && method === 'GET') {
    const start = url.searchParams.get('start') || undefined
    const end = url.searchParams.get('end') || undefined
    const status = url.searchParams.get('status') || undefined
    const tag = url.searchParams.get('tag') || undefined
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    let { rows, total } = dbListBills({ start, end, status, page, limit })
    if (tag) {
      rows = rows.filter((b: any) => Array.isArray(b.tags) && b.tags.includes(tag))
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
    return { bills: mapped, total, page, limit } as unknown as T
  }

  // Tags catalog
  if (pathname === '/api/tags' && method === 'GET') {
    const tags = (db.tags || []).map(t => ({ id: t.id, name: t.name, group: t.group || null }))
    const groups = Array.from(new Set(tags.map(t => t.group || 'Ungrouped')))
    return { tags, groups } as unknown as T
  }

  // Bills (create) - stateful (supports legacy vendor field)
  if (pathname === '/api/bills' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    let { number, vendorId, vendor, dueDate, billDate, terms, lines, items } = body || {}
    const lineList = Array.isArray(lines) ? lines : (Array.isArray(items) ? items : [])
    if (!vendorId && vendor) {
      const found = db.vendors.find(v => v.name === vendor)
      if (found) vendorId = found.id
    }
    if (!vendorId && db.vendors.length) vendorId = db.vendors[0].id
    if (!vendorId || !Array.isArray(lineList) || lineList.length === 0) {
      throw new Error('400 Bad Request: vendor/vendorId and at least one line item are required')
    }
    const billEntity = dbCreateBill({ number, vendorId, billDate, terms, dueDate, lines: lineList })
    const bill = { ...billEntity, vendor: db.vendors.find(v => v.id === billEntity.vendorId)?.name || billEntity.vendorId }
    return { bill } as unknown as T
  }

  // Bills detail (GET) - stateful
  if (pathname.startsWith('/api/bills/') && !pathname.endsWith('/schedule') && !pathname.endsWith('/payments') && !pathname.endsWith('/approval') && method === 'GET') {
    const id = pathname.split('/').pop() as string
    const b = dbFindBill(id)
    if (!b) throw new Error('404 Not Found: bill not found')
    const bill = { ...b, vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId }
    return { bill } as unknown as T
  }

  // Bills update (PUT) - stateful
  if (pathname.startsWith('/api/bills/') && !pathname.endsWith('/schedule') && !pathname.endsWith('/payments') && !pathname.endsWith('/approval') && method === 'PUT') {
    const id = pathname.split('/').pop() as string
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    try {
      const lines = Array.isArray(body.lines) ? body.lines : (Array.isArray(body.items) ? body.items : undefined)
      let vendorId = body.vendorId
      if (!vendorId && body.vendor) {
        const found = db.vendors.find(v => v.name === body.vendor)
        if (found) vendorId = found.id
      }
      const b = dbUpdateBill(id, { number: body.number, vendorId, status: body.status, dueDate: body.dueDate, lines, scheduledDate: body.scheduledDate })
      const bill = { ...b, vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId }
      return { bill } as unknown as T
    } catch {
      throw new Error('404 Not Found: bill not found')
    }
  }

  // Bills delete (DELETE) - stateful
  if (pathname.startsWith('/api/bills/') && !pathname.endsWith('/schedule') && !pathname.endsWith('/payments') && !pathname.endsWith('/approval') && method === 'DELETE') {
    const id = pathname.split('/').pop() as string
    const ok = dbDeleteBill(id)
    if (!ok) throw new Error('404 Not Found: bill not found')
    return { ok: true } as unknown as T
  }

  // Bills schedule set (POST /api/bills/:id/schedule) - stateful
  if (pathname.startsWith('/api/bills/') && pathname.endsWith('/schedule') && method === 'POST') {
    const id = pathname.split('/').slice(-2, -1)[0]
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const date = body?.date || new Date().toISOString()
    try {
      const b = dbScheduleBill(id, date)
      const bill = { ...b, vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId }
      return { bill } as unknown as T
    } catch {
      throw new Error('404 Not Found: bill not found')
    }
  }

  // Bills schedule cancel (DELETE /api/bills/:id/schedule) - stateful
  if (pathname.startsWith('/api/bills/') && pathname.endsWith('/schedule') && method === 'DELETE') {
    const id = pathname.split('/').slice(-2, -1)[0]
    try {
      const b = dbCancelBillSchedule(id)
      const bill = { ...b, vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId }
      return { bill } as unknown as T
    } catch {
      throw new Error('404 Not Found: bill not found')
    }
  }

  // Bill void (POST /api/bills/:id/void) - stateful
  if (pathname.startsWith('/api/bills/') && pathname.endsWith('/void') && method === 'POST') {
    const id = pathname.split('/').slice(-2, -1)[0]
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const { createReversing, reason, reversalDate } = body || {}
    try {
      const b = dbFindBill(id)
      if (!b) throw new Error('404 Not Found: bill not found')
      const preferred = (typeof reversalDate === 'string' && /\d{4}-\d{2}-\d{2}/.test(reversalDate)) ? reversalDate : new Date().toISOString().slice(0,10)
      const close = db.settings?.closeDate
      const adjusted = close && preferred <= close ? (() => { const d = new Date(close + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0,10) })() : preferred
      const warning = adjusted !== preferred
      dbVoidBill(id, { createReversing, reason, reversalDate: adjusted })
      const bill = { ...b, vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId }
      const audit = (db.auditEvents || []).filter(e => e.entityType === 'bill' && e.entityId === id).slice(-5)
      return { bill, audit, warning: warning ? 'Reversal date adjusted to next open period' : undefined, usedReversalDate: adjusted } as unknown as T
    } catch (e: any) {
      if (String(e?.message || '').includes('not found')) throw new Error('404 Not Found: bill not found')
      throw e
    }
  }

  // Bills approval actions (POST /api/bills/:id/approval) - stateful
  if (pathname.startsWith('/api/bills/') && pathname.endsWith('/approval') && method === 'POST') {
    const id = pathname.split('/').slice(-2, -1)[0]
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const action = String(body?.action || '') as 'submit' | 'approve' | 'reject'
    if (!['submit','approve','reject'].includes(action)) throw new Error('400 Bad Request: invalid action')
    try {
      const b = dbBillApprovalAction(id, action, body?.note)
      const bill = { ...b, vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId }
      return { bill } as unknown as T
    } catch {
      throw new Error('404 Not Found: bill not found')
    }
  }

  // Bills mark paid (POST /api/bills/:id) - backward compat (apply full remaining balance)
  if (method === 'POST' && pathname.startsWith('/api/bills/')) {
    const parts = pathname.split('/').filter(Boolean)
    const isExactId = parts.length === 3 && parts[0] === 'api' && parts[1] === 'bills'
    const isExcluded = pathname.endsWith('/schedule') || pathname.endsWith('/payments') || pathname.endsWith('/approval')
    if (isExactId && !isExcluded) {
      const id = parts[2]
      try {
        const b = dbFindBill(id)
        if (!b) throw new Error('404 Not Found: bill not found')
        const remaining = b.balance
        if (remaining <= 0) {
          const bill = { ...b, vendor: db.vendors.find(v => v.id === b.vendorId)?.name || b.vendorId }
          return { bill, payment: null } as unknown as T
        }
        const { bill: updated, payment } = dbApplyPaymentToBill(id, remaining)
        const bill = { ...updated, vendor: db.vendors.find(v => v.id === updated.vendorId)?.name || updated.vendorId }
        return { bill, payment } as unknown as T
      } catch (e: any) {
        if (String(e?.message || '').includes('not found')) throw new Error('404 Not Found: bill not found')
        throw e
      }
    }
  }

  // Transactions (create) - stateful
  if (pathname === '/api/transactions' && method === 'POST') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const { date, description, category, amount, accountId, bankStatus, splits } = body || {}
    if (!date || !description || typeof amount !== 'number') {
      throw new Error('400 Bad Request: date, description, amount are required')
    }
    const txn = dbCreateTransaction({
      date,
      description,
      category: (['Income', 'Expense', 'Transfer'] as const).includes(category) ? category : 'Income',
      amount: Number(amount),
      accountId: accountId || db.accounts[0].id,
      bankStatus: (['for_review','categorized','excluded'] as const).includes(bankStatus) ? bankStatus : 'for_review',
      source: 'manual',
      splits: Array.isArray(splits) ? splits : undefined,
    })
    return { transaction: txn } as unknown as T
  }

  // Transactions (update) - stateful
  if (pathname === '/api/transactions' && method === 'PUT') {
    const raw = (init?.body as any) || '{}'
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    const { id, date, description, category, amount, accountId, bankStatus, splits } = body || {}
    if (!id) throw new Error('400 Bad Request: id is required')
    if (!date || !description || typeof amount !== 'number') {
      throw new Error('400 Bad Request: date, description, amount are required')
    }
    try {
      const txn = dbUpdateTransaction({
        id,
        date,
        description,
        category: (['Income', 'Expense', 'Transfer'] as const).includes(category) ? category : 'Income',
        amount: Number(amount),
        accountId: accountId || db.accounts[0].id,
        bankStatus: (['for_review','categorized','excluded'] as const).includes(bankStatus) ? bankStatus : undefined,
        splits: Array.isArray(splits) ? splits : undefined,
      })
      return { transaction: txn } as unknown as T
    } catch {
      throw new Error('404 Not Found: transaction not found')
    }
  }

  // Transactions (delete) - stateful
  if (pathname === '/api/transactions' && method === 'DELETE') {
    const id = url.searchParams.get('id')
    if (!id) throw new Error('400 Bad Request: id is required')
    const ok = dbDeleteTransaction(id)
    if (!ok) throw new Error('404 Not Found: transaction not found')
    return { ok: true } as unknown as T
  }

  // Default: fall through to real fetch for anything unmapped, so dev can mix real and mock.
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}
