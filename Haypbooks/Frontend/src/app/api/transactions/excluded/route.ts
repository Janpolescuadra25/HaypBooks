import { NextResponse } from 'next/server'
import { db, seedIfNeeded } from '@/mock/db'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'
import { deriveRange } from '@/lib/report-helpers'

// Build excluded-items audit records by inspecting audit trail for when a txn became excluded
function buildExcludedAuditRows(params: { start?: string; end?: string; accountId?: string; tag?: string }) {
  const { start, end, accountId, tag } = params
  // Filter transactions currently marked excluded
  let rows = db.transactions
    .filter(t => (t.bankStatus || 'for_review') === 'excluded')
    .map(t => ({ ...t, dateOnly: (t.date || '').slice(0,10) }))

  if (start) rows = rows.filter(t => t.dateOnly >= start)
  if (end) rows = rows.filter(t => t.dateOnly <= end)
  if (accountId) rows = rows.filter(t => t.accountId === accountId)
  if (tag) rows = rows.filter(t => Array.isArray(t.tags) && t.tags.includes(tag))

  // Map to audit-enhanced objects
  const result = rows.map(t => {
    // Find most recent audit event that set status to excluded (rule or manual update)
    const events = (db.auditEvents || [])
      .filter(e => e.entityType === 'transaction' && e.entityId === t.id)
      .slice()
      .sort((a,b) => String(b.ts||'').localeCompare(String(a.ts||'')))

    let method: 'Rule' | 'Manual' | 'Unknown' = 'Unknown'
    let ruleId: string | undefined
    let actor: string | undefined
    let ts: string | undefined

    for (const ev of events) {
      const after = (ev as any).after
      const before = (ev as any).before
      const becameExcluded = after && (after.bankStatus === 'excluded') && (!before || before.bankStatus !== 'excluded')
      if (ev.action === 'apply-rule' && becameExcluded) {
        method = 'Rule'
        ruleId = ev.meta?.ruleId
        actor = ev.actor
        ts = ev.ts
        break
      }
      if (ev.action === 'update' && becameExcluded) {
        method = 'Manual'
        actor = ev.actor
        ts = ev.ts
        break
      }
    }

    // Resolve rule name if applicable
    let ruleName: string | undefined
    if (method === 'Rule' && ruleId) {
      const r = (db.bankRules || []).find(x => x.id === ruleId)
      ruleName = r?.name
    }

    // Resolve basic account details for context
    const acc = db.accounts.find(a => a.id === t.accountId)

    return {
      id: t.id,
      date: t.dateOnly,
      description: t.description,
      amount: t.amount,
      accountId: t.accountId,
      accountNumber: acc?.number,
      accountName: acc?.name,
      tags: t.tags || [],
      exclusionTs: ts,
      exclusionMethod: method,
      exclusionActor: actor,
      exclusionRuleId: ruleId,
      exclusionRuleName: ruleName,
    }
  })

  // Sort by exclusion timestamp desc, fallback to date desc
  result.sort((a,b) => String(b.exclusionTs||'').localeCompare(String(a.exclusionTs||'')) || String(b.date||'').localeCompare(String(a.date||'')))
  return result
}

export async function GET(req: Request) {
  if (!db.seeded) { try { seedIfNeeded() } catch {} }
  // Audit-style endpoint: require reports read permission
  const role = getRoleFromCookies()
  if (!hasPermission(role, 'reports:read')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const period = url.searchParams.get('period') || undefined
  const startParam = url.searchParams.get('start') || undefined
  const endParam = url.searchParams.get('end') || undefined
  const { start, end } = deriveRange(period, startParam ?? null, endParam ?? null)
  const accountId = url.searchParams.get('accountId') || undefined
  const tag = url.searchParams.get('tag') || undefined

  const rows = buildExcludedAuditRows({ start: start || undefined, end: end || undefined, accountId, tag })
  return NextResponse.json({ excluded: rows, total: rows.length })
}
