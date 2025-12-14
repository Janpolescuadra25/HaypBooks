import { BackButton } from '@/components/BackButton'
import { getBaseUrl } from '@/lib/server-url'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'
import AuditEventsPanel from '@/components/AuditEventsPanel'
import dynamic from 'next/dynamic'
import type { VendorAPSnapshot } from '@/mock/aggregations'
const Amount = dynamic(() => import('@/components/Amount'), { ssr: false })

async function loadVendor(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/vendors/${id}`, { cache: 'no-store' })
  const data = await res.json()
  const v = (data.vendor as any)
  return v || { id, name: `Vendor ${id.split('_').pop()}`, terms: 'Net 30' }
}

export default async function VendorDetail({ params }: { params: { id: string } }) {
  const v = await loadVendor(params.id)
  const asOfIso = new Date().toISOString().slice(0,10)
  // Fetch A/P snapshot
  const snapRes = await fetch(`${getBaseUrl()}/api/vendors/${params.id}/ap-snapshot?asOf=${asOfIso}`, { cache: 'no-store' })
  const snapJson = snapRes.ok ? await snapRes.json() : { snapshot: null }
  const snapshot = (snapJson.snapshot as VendorAPSnapshot | null)
  const role = getRoleFromCookies()
  const canEdit = hasPermission(role, 'vendors:write')
  const canCreateCredit = hasPermission(role, 'bills:write')
  const canCreateRefund = hasPermission(role, 'bills:write')
  // Load vendor credits
  const res = await fetch(`${getBaseUrl()}/api/vendor-credits?vendorId=${encodeURIComponent(params.id)}`, { cache: 'no-store' })
  const data = res.ok ? await res.json() : { vendorCredits: [] }
  const credits = (data.vendorCredits || []) as Array<{ id: string; number: string; date: string; total: number; remaining: number }>
  // Load vendor refunds (id-scoped endpoint for parity)
  const rres = await fetch(`${getBaseUrl()}/api/vendors/${encodeURIComponent(params.id)}/refunds`, { cache: 'no-store' })
  const rdata = rres.ok ? await rres.json() : { refunds: [] }
  const refunds = (rdata.refunds || []) as Array<{ id: string; vendorId: string; date: string; amount: number; method?: string; reference?: string; vendorCreditId?: string }>
  return (
    <div className="glass-card max-w-xl">
      <div className="mb-3 print:hidden"><BackButton fallback="/vendors" ariaLabel="Back to Vendors" /></div>
      <h1 className="text-xl font-semibold text-slate-900 mb-2">{v.name}</h1>
      <p className="text-slate-700 text-sm">Terms: {v.terms || '\u2014'}</p>
      <div className="mt-4 flex gap-2">
        {canEdit && (
          <a className="btn-secondary" href={`/vendors/${params.id}/edit`}>Edit</a>
        )}
        <a className="btn-secondary" href={`/vendor-statements/${params.id}`}>View Statement</a>
      </div>
      {snapshot && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm text-slate-700">A/P snapshot — As of {snapshot.asOf}</div>
            {snapshot.riskLevel && (
              <span className={`text-xs px-2 py-1 rounded-full border ${snapshot.riskLevel==='critical' ? 'bg-red-50 text-red-700 border-red-200' : snapshot.riskLevel==='elevated' ? 'bg-amber-50 text-amber-700 border-amber-200' : snapshot.riskLevel==='moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>Risk: {snapshot.riskLevel}</span>
            )}
          </div>
          <div aria-live="polite" className="sr-only">Open balance {snapshot.openBalance}. Net payable {snapshot.netPayable}. Overdue {snapshot.overdueBalance ?? 0}. Days since last payment {snapshot.daysSinceLastPayment ?? 0} as of {snapshot.asOf}.</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Open Bills</div><div className="font-semibold tabular-nums">{snapshot.openBills ?? 0}</div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Open Balance</div><div className="font-semibold tabular-nums"><Amount value={snapshot.openBalance ?? 0} /></div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Unapplied Credits</div><div className="font-semibold tabular-nums"><Amount value={snapshot.unappliedCredits ?? 0} /></div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Net Payable</div><div className="font-semibold tabular-nums"><Amount value={snapshot.netPayable ?? 0} /></div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Last Payment</div><div className="font-semibold tabular-nums">{snapshot.lastPaymentDate || '\u2014'}</div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Next Due</div><div className="font-semibold tabular-nums">{snapshot.nextDueDate || '\u2014'}</div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Overdue Balance</div><div className="font-semibold tabular-nums"><Amount value={snapshot.overdueBalance ?? 0} /></div></div>
            <div className="rounded border p-3"><div className="text-xs text-slate-500">Days Since Last Payment</div><div className="font-semibold tabular-nums">{snapshot.daysSinceLastPayment ?? 0}</div></div>
          </div>
          <div className="mt-3 text-sm flex gap-3 print:hidden">
            <a className="text-sky-700 hover:underline" href={`/expenses/vendor-statements/${encodeURIComponent(params.id)}`}>View statement</a>
            <a className="text-sky-700 hover:underline" href={`/reports/ap-aging-summary?asOf=${encodeURIComponent(asOfIso)}`}>A/P aging summary</a>
          </div>
        </div>
      )}
      <div className="mt-6 border-t border-slate-200 pt-4">
        <AuditEventsPanel entity="vendor" entityId={params.id} title="Recent Activity" />
      </div>
      <div className="mt-6 border-t border-slate-200 pt-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Vendor credits</h2>
        {credits.length === 0 ? (
          <p className="text-sm text-slate-700">No credits on file.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600"><tr><th className="px-3 py-2 text-left">Number</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2 text-right">Remaining</th></tr></thead>
              <tbody className="text-slate-800">
                {credits.map(c => (
                  <tr key={c.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{c.number}</td>
                    <td className="px-3 py-2">{c.date?.slice(0,10)}</td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(c.total)} /></td>
                    <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(c.remaining)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {canCreateCredit && (
          <>
            <NewVendorCreditForm vendorId={params.id} />
            <QuickApplyVendorCredits vendorId={params.id} />
            <AutoApplyVendorCredits vendorId={params.id} />
          </>
        )}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Vendor refunds</h2>
          {hasPermission(getRoleFromCookies(), 'reports:read') && (
            <a className="btn-secondary text-sm" href={`/api/vendors/${encodeURIComponent(params.id)}/refunds/export`}>Export CSV</a>
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
                  const linked = r.vendorCreditId ? credits.find(c => c.id === r.vendorCreditId) : undefined
                  return (
                    <tr key={r.id} className="border-t border-slate-200">
                      <td className="px-3 py-2">{r.date?.slice(0,10)}</td>
                      <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(r.amount)} /></td>
                      <td className="px-3 py-2">{r.method || '\u2014'}</td>
                      <td className="px-3 py-2">{r.reference || '\u2014'}</td>
                      <td className="px-3 py-2">{linked ? linked.number : (r.vendorCreditId ? 'Credit' : '\u2014')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {canCreateRefund && <NewVendorRefundForm vendorId={params.id} />}
      </div>
    </div>
  )
}

const NewVendorCreditForm = dynamic<{ vendorId: string }>(() => import('./new-credit-client'), { ssr: false })
const QuickApplyVendorCredits = dynamic<{ vendorId: string }>(() => import('./quick-apply-client'), { ssr: false })
const AutoApplyVendorCredits = dynamic<{ vendorId: string; canManage?: boolean }>(() => import('@/app/vendors/[id]/auto-apply-client'), { ssr: false })
const NewVendorRefundForm = dynamic<{ vendorId: string }>(() => import('@/app/vendors/[id]/new-refund-client'), { ssr: false })
