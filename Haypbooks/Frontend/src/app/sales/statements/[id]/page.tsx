import { BackButton } from '@/components/BackButton'
import { getBaseUrl } from '@/lib/server-url'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'
import Amount from '@/components/Amount'
import { SendStatementClient } from '@/components/statements/SendStatementClient'

type Statement = Awaited<ReturnType<typeof loadStatement>>

async function loadStatement(id: string, asOfIso: string, opts?: { startIso?: string | null; type?: 'balance-forward' | 'transaction' | 'open-item' }) {
  const base = getBaseUrl()
  const url = new URL(`${base}/api/customers/${id}/statement`)
  url.searchParams.set('asOf', asOfIso)
  if (opts?.startIso) url.searchParams.set('start', opts.startIso)
  if (opts?.type) url.searchParams.set('type', opts.type)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json()
  const stmt = (data?.statement || data) as {
    customerId?: string
    asOf: string
    lines: Array<any>
    totals: { invoices: number; payments: number; credits: number; net: number }
    aging?: { rows: Array<{ name: string; current: number; 30: number; 60: number; 90: number; '120+': number; total: number }>; totals: any }
  }
  let customerName: string | undefined = data?.customer?.name
  if (!customerName) {
    try {
      const cRes = await fetch(`${base}/api/customers/${id}`, { cache: 'no-store' })
      if (cRes.ok) { const cJson = await cRes.json(); customerName = cJson?.customer?.name }
    } catch {}
  }
  return { ...stmt, customerName }
}

export default async function CustomerStatementPage({ params, searchParams }: { params: { id: string }, searchParams?: { asOf?: string; start?: string; type?: 'balance-forward'|'transaction'|'open-item' } }) {
  const role = getRoleFromCookies()
  const canView = hasPermission(role, 'reports:read')
  if (!canView) return null
  const asOfIso = (searchParams?.asOf || new Date().toISOString().slice(0,10))
  const startIso = searchParams?.start || null
  const stmtType = (searchParams?.type as any) || undefined
  const stmt = await loadStatement(params.id, asOfIso, { startIso, type: stmtType as any })
  if (!stmt) return <div className="glass-card max-w-3xl"><div className="mb-3 print:hidden"><BackButton fallback={`/customers/${params.id}`} ariaLabel="Back to Customer" /></div><p className="text-sm text-slate-700">No statement data.</p></div>
  // Load A/R snapshot to display header tiles similar to vendor detail parity
  let snapshot: any = null
  // Optionally load recent statement send audit events
  const canSeeAudit = hasPermission(role, 'audit:read')
  let recentEvents: Array<{ id: string; ts: string; actor?: string; after?: any }> = []
  // Do not render client-only components in this server file to keep SSR/tests stable.
  // A progressive enhancement client bundle can hydrate controls later if needed.
  let StatementFilterFormComp: any = null
  let ActionsClientComp: any = null
  const exportQuery = (() => {
    const sp = new URLSearchParams({ asOf: asOfIso })
    if (startIso) sp.set('start', startIso)
    if (stmtType) sp.set('type', stmtType)
    return sp.toString()
  })()
  const exportHref = `/api/customers/${params.id}/statement/export?${exportQuery}`
  const canSend = hasPermission(role, 'statements:send')
  // Intentionally skip importing client components at build/test time.
  try {
    const snapRes = await fetch(`${getBaseUrl()}/api/customers/${params.id}/ar-snapshot?asOf=${encodeURIComponent(asOfIso)}`, { cache: 'no-store' })
    if (snapRes.ok) { const snapJson = await snapRes.json(); snapshot = snapJson.snapshot }
  } catch {}
  if (canSeeAudit) {
    try {
      const audRes = await fetch(`${getBaseUrl()}/api/customers/${params.id}/statement/audit`, { cache: 'no-store' })
      if (audRes.ok) { const audJson = await audRes.json(); recentEvents = Array.isArray(audJson.events) ? audJson.events.slice(0, 10) : [] }
    } catch {}
  }
  return (
    <div className="glass-card max-w-3xl">
      <div className="mb-3 flex items-center justify-between print:hidden">
        <BackButton fallback={`/customers/${params.id}`} ariaLabel="Back to Customer" />
        {/* Server-safe actions: use dedicated print route and direct CSV export */}
        <div className="flex gap-2 items-center">
          <a className="btn-secondary" href={`/sales/statements/${params.id}/print?${exportQuery}`}>Print</a>
          <a className="btn-secondary" href={exportHref} download>Export CSV</a>
        </div>
        {/* NoScript fallback keeps Export available without handlers */}
        <noscript>
          <div className="flex gap-2 items-center">
            <a className="btn-secondary" href={exportHref} download>Export CSV</a>
          </div>
        </noscript>
      </div>
  <h1 className="text-xl font-semibold text-slate-900 mb-2">Statement - {stmt.customerName || params.id}</h1>
      <p className="text-slate-700 text-sm">{startIso ? <>From {String(startIso)} to {stmt.asOf}</> : <>As of {stmt.asOf}</>}</p>
      <div className="print:hidden">
        <SendStatementClient customerId={params.id} defaultAsOf={asOfIso} defaultStart={startIso || undefined} canSend={canSend} />
      </div>
      {StatementFilterFormComp ? (
        <StatementFilterFormComp initialType={(stmtType as any) || 'open-item'} initialStart={startIso} initialAsOf={asOfIso} />
      ) : (
        <form method="get" className="mt-3 print:hidden" aria-label="Statement filters (server)">
          <input type="hidden" name="asOf" defaultValue={asOfIso} />
          {startIso ? <input type="hidden" name="start" defaultValue={startIso} /> : null}
          {stmtType ? <input type="hidden" name="type" defaultValue={stmtType} /> : null}
          <button className="btn-secondary" type="submit">Refresh</button>
        </form>
      )}
      <div aria-live="polite" className="sr-only">Statement as of {stmt.asOf}. Invoices {stmt.totals.invoices}. Credits {stmt.totals.credits}. Payments {stmt.totals.payments}. Net {stmt.totals.net}.</div>

      {snapshot && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="rounded border p-3"><div className="text-xs text-slate-500">Open Invoices</div><div className="font-semibold tabular-nums">{snapshot.openInvoices ?? 0}</div></div>
          <div className="rounded border p-3"><div className="text-xs text-slate-500">Open Balance</div><div className="font-semibold tabular-nums"><Amount value={Number(snapshot.openBalance)||0} /></div></div>
          <div className="rounded border p-3"><div className="text-xs text-slate-500">Net Receivable</div><div className="font-semibold tabular-nums"><Amount value={Number(snapshot.netReceivable)||0} /></div></div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-right">Running balance</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {stmt.lines.map((l: any) => (
              <tr key={`${l.type}_${l.id}`} className="border-t border-slate-200">
                <td className="px-3 py-2">{String(l.date || '').slice(0,10)}</td>
                <td className="px-3 py-2">{l.type === 'invoice' ? 'Invoice' : l.type === 'credit_memo' ? 'Credit' : 'Payment'}</td>
                <td className="px-3 py-2">{l.description}</td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(l.amount)} /></td>
                <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(l.runningBalance)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="text-slate-700">
            <tr className="border-t border-slate-200">
              <td className="px-3 py-2" colSpan={3}>Totals</td>
              <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(stmt.totals.net)} /></td>
              <td className="px-3 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {canSeeAudit && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Recent statements</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm" aria-label="Recent statements">
              <thead className="text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Queued by</th>
                  <th className="px-3 py-2 text-left">Message</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {recentEvents.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={5}>No recent statements.</td>
                  </tr>
                ) : (
                  recentEvents.map((e) => {
                    const after = (e as any).after || {}
                    const queuedAt = String((e as any).ts || after.queuedAt || '').slice(0, 19).replace('T', ' ')
                    const kind = after.type || 'summary'
                    const status = after.status || 'queued'
                    const actor = (e as any).actor || 'system'
                    const msg = after.messageId || ''
                    return (
                      <tr key={e.id} className="border-t border-slate-200">
                        <td className="px-3 py-2 whitespace-nowrap">{queuedAt}</td>
                        <td className="px-3 py-2 capitalize">{String(kind).replace('-', ' ')}</td>
                        <td className="px-3 py-2">{status}</td>
                        <td className="px-3 py-2">{actor}</td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-600">{msg}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-sm print:hidden">
            <a className="text-sky-700 hover:underline" href={`/sales/statements/send/history?customerId=${encodeURIComponent(params.id)}`}>View full send history</a>
          </div>
        </div>
      )}

      {stmt.aging ? (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Aging</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-right">Current</th>
                  <th className="px-3 py-2 text-right">30</th>
                  <th className="px-3 py-2 text-right">60</th>
                  <th className="px-3 py-2 text-right">90</th>
                  <th className="px-3 py-2 text-right">120+</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {(stmt.aging.rows || []).map((r: any, idx: number) => (
                  <tr key={`${r.name}_${idx}`} className="border-t border-slate-200">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.current)} /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r["30"]) } /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r["60"]) } /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r["90"]) } /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r["120+"]) } /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.total)} /></td>
                  </tr>
                ))}
              </tbody>
              {stmt.aging.totals ? (
                <tfoot className="text-slate-700">
                  <tr className="border-t border-slate-200">
                    <td className="px-3 py-2">Totals</td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number((stmt.aging as any).totals.current) || 0} /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number((stmt.aging as any).totals["30"]) || 0} /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number((stmt.aging as any).totals["60"]) || 0} /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number((stmt.aging as any).totals["90"]) || 0} /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number((stmt.aging as any).totals["120+"]) || 0} /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number((stmt.aging as any).totals.total) || 0} /></td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
// trimmed down page; advanced CSV export button can be added later per JSON-first policy
