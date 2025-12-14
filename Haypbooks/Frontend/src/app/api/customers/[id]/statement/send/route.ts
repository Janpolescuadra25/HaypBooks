import { NextResponse } from 'next/server'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

// POST /api/customers/:id/statement/send
// Body: { type?: 'BalanceForward'|'OpenTransactions', start?: 'YYYY-MM-DD', asOf?: 'YYYY-MM-DD' }
export async function POST(req: Request, ctx: { params: { id: string } }) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'statements:send')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = ctx.params?.id
  const customer = db.customers.find(c => c.id === id)
  if (!customer) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

  const raw = await req.text()
  let body: any = {}
  if (raw) {
    try { body = JSON.parse(raw) } catch (e) { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }
  }

  // Accept both modern ('summary'|'detail') and legacy tokens ('OpenTransactions'|'BalanceForward')
  // Support reading values from either the POST body or query string (backwards compatibility with tests & callers).
  let qType: string | null = null
  let qStart: string | null = null
  let qAsOf: string | null = null
  try { const parsedUrl = new URL(req.url); qType = parsedUrl.searchParams.get('type'); qStart = parsedUrl.searchParams.get('start'); qAsOf = parsedUrl.searchParams.get('asOf') } catch {}
  const rawType = (body?.type || qType || 'summary') as string
  function normalizeType(t: string) {
    const v = String(t || '').toLowerCase()
    if (v === 'detail' || v === 'balanceforward' || v === 'balance-forward') return 'detail'
    // treat 'opentransactions', 'opentransactions', 'summary' as summary
    if (v === 'summary' || v === 'opentransactions' || v === 'opentransaction' || v === 'open-transactions') return 'summary'
    return null
  }
  const type = normalizeType(rawType) || 'summary'

  const start = body?.start ?? qStart ?? null
  const asOf = body?.asOf ?? qAsOf ?? null
  function isIsoDate(s: any) {
    if (typeof s !== 'string') return false
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
    const [y, m, d] = s.split('-').map((p: string) => Number(p))
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return false
    const dt = new Date(s)
    return dt instanceof Date && !Number.isNaN(dt.getTime()) && dt.getUTCFullYear() === y && (dt.getUTCMonth()+1) === m && dt.getUTCDate() === d
  }
  // Default asOf to today when omitted (matches UI behaviour)
  const asOfIso = asOf || new Date().toISOString().slice(0,10)
  if (start && !isIsoDate(start)) return NextResponse.json({ error: 'Invalid start date' }, { status: 400 })
  if (asOf && !isIsoDate(asOf)) return NextResponse.json({ error: 'Invalid asOf date' }, { status: 400 })

  // Record an audit event for statement send
  const actor = getRoleFromCookies() || 'system'
  const queuedAt = new Date().toISOString()
  // Accept optional message fields from the client: messageId (library id) or messageOverride (raw text)
  let messageSnapshot: string | null = null
  let resolvedMessageId: string | null = null
  try {
    if (body?.messageId) {
      // try to resolve a message from the mock DB
      const found = (db.messages || []).find((m: any) => m.id === String(body.messageId))
      if (found) { resolvedMessageId = found.id; messageSnapshot = found.body }
      else {
        // Not found — treat provided id as an opaque id (we still record it but cannot resolve text)
        resolvedMessageId = String(body.messageId)
      }
    } else if (typeof body?.messageOverride === 'string' && body.messageOverride.trim().length > 0) {
      messageSnapshot = body.messageOverride
      // create a synthetic id for the override so send requests can be correlated in audit
      resolvedMessageId = `override_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
    }
  } catch (e) { /* non-fatal — continue without snapshot */ }

  const messageId = resolvedMessageId || `stmt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
  try {
    db.auditEvents.push({
      id: `aud_${Math.random().toString(36).slice(2)}`,
      ts: queuedAt,
      actor,
      action: 'statement:send',
      entityType: 'customer',
      entityId: id,
      after: { id, asOf: asOfIso, start: start || null, type, messageId, messageSnapshot: messageSnapshot || undefined, status: 'queued', queuedAt },
      meta: { customerId: id },
    } as any)
  } catch {}

  // Return the result object used by UI (result.messageId, queuedAt, status...)
  return NextResponse.json({ result: { id, asOf: asOfIso, start: start || null, type, status: 'queued', queuedAt: new Date().toISOString(), messageId, messageSnapshot }, customer: { id: customer.id, name: customer.name } })
}

