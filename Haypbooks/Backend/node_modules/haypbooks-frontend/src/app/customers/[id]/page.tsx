import { BackButton } from '@/components/BackButton'
import { getBaseUrl } from '@/lib/server-url'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'
import AuditEventsPanel from '@/components/AuditEventsPanel'
import dynamic from 'next/dynamic'
const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })
const PromisesPanel = dynamic<{ customerId: string; canManage?: boolean }>(() => import('@/app/customers/[id]/promises-client'), { ssr: false })

async function loadCustomer(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/customers/${id}`, { cache: 'no-store' })
  const data = await res.json()
  const c = (data.customer as any)
  return c || { id, name: `Customer ${id.split('_').pop()}`, email: '', phone: '' }
}

async function loadArSnapshot(id: string, asOfIso: string) {
  const res = await fetch(`${getBaseUrl()}/api/customers/${id}/ar-snapshot?asOf=${asOfIso}`, { cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json()
  return data.snapshot as { customerId: string; asOf: string; openInvoices: number; openBalance: number; unappliedCredits: number; netReceivable: number; lastPaymentDate?: string | null; nextDueDate?: string | null; overdueBalance?: number; daysSinceLastPayment?: number | null; riskLevel?: 'low'|'moderate'|'elevated'|'critical' | null; creditLimit?: number | null; creditUtilizationPct?: number | null; openPromises?: number | null; nextPromiseDate?: string | null; promiseAgingDays?: number | null }
}

export default async function CustomerDetail({ params }: { params: { id: string } }) {
  const c = await loadCustomer(params.id)
  const asOfIso = new Date().toISOString().slice(0,10)
  const snapshot = await loadArSnapshot(params.id, asOfIso)
  const role = getRoleFromCookies()
  const canEdit = hasPermission(role, 'customers:write')
  const canCreateRefund = hasPermission(role, 'invoices:write')
  const canExport = hasPermission(role, 'reports:read')
  const canManagePromises = hasPermission(role, 'invoices:write')
  const canApplyCredits = hasPermission(role, 'invoices:write')
  // Load credit memos
  const cmRes = await fetch(`${getBaseUrl()}/api/credit-memos?customerId=${encodeURIComponent(params.id)}`, { cache: 'no-store' })
  const cmData = cmRes.ok ? await cmRes.json() : { creditMemos: [] }
  const creditMemos = (cmData.creditMemos || []) as Array<{ id: string; number: string; date: string; total: number; remaining: number }>
  // Load customer refunds (id-scoped endpoint for parity)
  const rfRes = await fetch(`${getBaseUrl()}/api/customers/${encodeURIComponent(params.id)}/refunds`, { cache: 'no-store' })
  const rfData = rfRes.ok ? await rfRes.json() : { refunds: [] }
  const refunds = (rfData.refunds || []) as Array<{ id: string; customerId: string; date: string; amount: number; method?: string; reference?: string; creditMemoId?: string }>
  return (
    <div className="glass-card max-w-xl">
      <div className="mb-3 print:hidden"><BackButton fallback="/customers" ariaLabel="Back to Customers" /></div>
      <h1 className="text-xl font-semibold text-slate-900 mb-2">{c.name}</h1>
      <p className="text-slate-700 text-sm">Terms: {c.terms || '\u2014'}</p>
      <p className="text-slate-700 text-sm">Email: {c.email || '\u2014'}</p>
      <p className="text-slate-700 text-sm">Phone: {c.phone || '\u2014'}</p>
      {snapshot && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-sm text-slate-700">A/R snapshot — As of {snapshot.asOf}</div>
            <div className="flex items-center gap-2">
              {snapshot.promiseAgingDays != null && snapshot.promiseAgingDays > 0 && (
                <span className="text-xs px-2 py-1 rounded-full border bg-red-50 text-red-700 border-red-200" title={`Broken promise aging ${snapshot.promiseAgingDays} days`}>
                  Broken promise
                </span>
              )}
              {snapshot.riskLevel && (
                <span className={`text-xs px-2 py-1 rounded-full border ${snapshot.riskLevel==='critical' ? 'bg-red-50 text-red-700 border-red-200' : snapshot.riskLevel==='elevated' ? 'bg-amber-50 text-amber-700 border-amber-200' : snapshot.riskLevel==='moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>Risk: {snapshot.riskLevel}</span>
              )}
            </div>
          </div>
          <div aria-live="polite" className="sr-only">Open balance {snapshot.openBalance}. Net receivable {snapshot.netReceivable}. Overdue {snapshot.overdueBalance ?? 0}. Days since last payment {snapshot.daysSinceLastPayment ?? 0}{snapshot.creditLimit ? `. Credit limit ${snapshot.creditLimit}. Utilization ${snapshot.creditUtilizationPct}%` : ''}{snapshot.openPromises ? `. Open promises ${snapshot.openPromises}${snapshot.nextPromiseDate ? `, next promise ${snapshot.nextPromiseDate}` : ''}${snapshot.promiseAgingDays ? `, promise aging ${snapshot.promiseAgingDays} days` : ''}` : ''} as of {snapshot.asOf}.</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Open Invoices</div><div className="font-semibold tabular-nums">{snapshot.openInvoices ?? 0}</div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Open Balance</div><div className="font-semibold tabular-nums"><Amount value={snapshot.openBalance ?? 0} /></div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Unapplied Credits</div><div className="font-semibold tabular-nums"><Amount value={snapshot.unappliedCredits ?? 0} /></div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Net Receivable</div><div className="font-semibold tabular-nums"><Amount value={snapshot.netReceivable ?? 0} /></div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Last Payment</div><div className="font-semibold tabular-nums">{snapshot.lastPaymentDate || '\u2014'}</div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Next Due</div><div className="font-semibold tabular-nums">{snapshot.nextDueDate || '\u2014'}</div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Overdue Balance</div><div className="font-semibold tabular-nums"><Amount value={snapshot.overdueBalance ?? 0} /></div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Days Since Last Payment</div><div className="font-semibold tabular-nums">{snapshot.daysSinceLastPayment ?? 0}</div></div>
            {snapshot.creditLimit != null && (
              <div className="rounded border p-3"><div className="text-xs text-slate-500">Credit Limit</div><div className="font-semibold tabular-nums"><Amount value={snapshot.creditLimit} /></div></div>
            )}
            {snapshot.creditUtilizationPct != null && (
              <div className="rounded border p-3"><div className="text-xs text-slate-500">Utilization %</div><div className="font-semibold tabular-nums">{Number(snapshot.creditUtilizationPct).toFixed(1)}%</div></div>
            )}
            {snapshot.openPromises != null && (
              <div className="rounded border p-3"><div className="text-xs text-slate-500">Open Promises</div><div className="font-semibold tabular-nums">{snapshot.openPromises ?? 0}</div></div>
            )}
            {snapshot.nextPromiseDate != null && (
              <div className="rounded border p-3"><div className="text-xs text-slate-500">Next Promise Date</div><div className="font-semibold tabular-nums">{snapshot.nextPromiseDate || '\u2014'}</div></div>
            )}
            {snapshot.promiseAgingDays != null && (
              <div className="rounded border p-3"><div className="text-xs text-slate-500">Promise Aging (days)</div><div className="font-semibold tabular-nums">{snapshot.promiseAgingDays ?? 0}</div></div>
            )}
          </div>
        </div>
      )}
      <div className="mt-3 text-sm flex gap-3 print:hidden">
        <a className="text-sky-700 hover:underline" href={`/sales/statements/${encodeURIComponent(params.id)}`}>View statement</a>
        <a className="text-sky-700 hover:underline" href={`/reports/collections-overview?asOf=${encodeURIComponent(new Date().toISOString().slice(0,10))}&customerId=${encodeURIComponent(params.id)}`}>Collections overview</a>
        <a className="text-sky-700 hover:underline" href={`/reports/ar-aging-summary?asOf=${encodeURIComponent(new Date().toISOString().slice(0,10))}`}>A/R aging summary</a>
        <a className="text-sky-700 hover:underline" href={`/receivables/payments/applications/history?customerId=${encodeURIComponent(params.id)}`}>Payment application history</a>
      </div>
      {canEdit && (
        <div className="mt-4">
          <a className="btn-secondary" href={`/customers/${params.id}/edit`}>Edit</a>
        </div>
      )}
      <div className="mt-6 border-t border-slate-200 pt-4">
        <AuditEventsPanel entity="customer" entityId={params.id} title="Recent Activity" />
      </div>
  <PromisesPanel customerId={params.id} canManage={canManagePromises} />
      <div className="mt-6 border-t border-slate-200 pt-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Credit memos</h2>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-slate-900">Credit memos</h2>
        </div>
        {creditMemos.length === 0 ? (
          <p className="text-sm text-slate-700">No credit memos on file.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Number</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2 text-right">Remaining</th></tr></thead>
              <tbody className="text-slate-800">
                {creditMemos.map(cm => (
                  <tr key={cm.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{cm.number}</td>
                    <td className="px-3 py-2">{cm.date?.slice(0,10)}</td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(cm.total)} /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(cm.remaining)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {canApplyCredits && (
          <>
            {/* Manual quick-apply */}
            <QuickApplyCustomerCredits customerId={params.id} canManage={canApplyCredits} />
            {/* Auto-apply preview/apply flow */}
            <AutoApplyCustomerCredits customerId={params.id} canManage={canApplyCredits} />
          </>
        )}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Customer refunds</h2>
          {canExport && (
            <a className="btn-secondary text-sm" href={`/api/customers/${encodeURIComponent(params.id)}/refunds/export`}>Export CSV</a>
          )}
        </div>
        {refunds.length === 0 ? (
          <p className="text-sm text-slate-700">No refunds recorded.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-left">Method</th>
                  <th className="px-3 py-2 text-left">Reference</th>
                  <th className="px-3 py-2 text-left">Linked credit</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {refunds.map(r => {
                  const linked = r.creditMemoId ? creditMemos.find(cm => cm.id === r.creditMemoId) : undefined
                  return (
                    <tr key={r.id} className="border-t border-slate-200">
                      <td className="px-3 py-2">{r.date?.slice(0,10)}</td>
                      <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.amount)} /></td>
                      <td className="px-3 py-2">{r.method || '\u2014'}</td>
                      <td className="px-3 py-2">{r.reference || '\u2014'}</td>
                      <td className="px-3 py-2">{linked ? linked.number : (r.creditMemoId ? 'Credit' : '\u2014')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {canCreateRefund && <NewCustomerRefundForm customerId={params.id} />}
      </div>
    </div>
  )
}

const NewCustomerRefundForm = dynamic<{ customerId: string }>(() => import('@/app/customers/[id]/new-refund-client'), { ssr: false })
const QuickApplyCustomerCredits = dynamic<{ customerId: string; canManage?: boolean }>(() => import('@/app/customers/[id]/quick-apply-client'), { ssr: false })
const AutoApplyCustomerCredits = dynamic<{ customerId: string; canManage?: boolean }>(() => import('@/app/customers/[id]/auto-apply-client'), { ssr: false })
