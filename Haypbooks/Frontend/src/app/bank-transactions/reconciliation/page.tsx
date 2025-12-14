import { getBaseUrl } from '@/lib/server-url'
import { redirect } from 'next/navigation'
import Amount from '@/components/Amount'

async function toggleCleared(id: string, cleared: boolean, accountId: string, periodEnd?: string) {
  await fetch(`${getBaseUrl()}/api/reconciliation/toggle-cleared`, { method: 'POST', body: JSON.stringify({ id, cleared, accountId, periodEnd }), headers: { 'Content-Type': 'application/json' }, cache: 'no-store' })
}

export default async function ReconciliationPage({ searchParams }: { searchParams: { asOf?: string; statementEndDate?: string } }) {
  const sp = new URLSearchParams()
  if (searchParams?.asOf) sp.set('asOf', searchParams.asOf)
  if (searchParams?.statementEndDate) sp.set('statementEndDate', searchParams.statementEndDate)
  const url = `${getBaseUrl()}/api/reports/reconciliation/summary${sp.toString() ? `?${sp.toString()}` : ''}`
  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  const accountId: string = String(data.accountId || '')
  const effectivePeriodEnd = String((searchParams?.statementEndDate || searchParams?.asOf || data.statementEndDate || data.asOf || ''))
  // Fetch accounts to allow selecting a specific bank account (asset accounts only)
  const accRes = await fetch(`${getBaseUrl()}/api/accounts?includeInactive=1`, { cache: 'no-store' })
  const accJson = accRes.ok ? await accRes.json() : { accounts: [] }
  const accounts: Array<{ id: string; number: string; name: string; type: string }> = Array.isArray(accJson.accounts) ? accJson.accounts.filter((a: any) => a.type === 'Asset') : []
  const notice = (searchParams as any)?.notice as string | undefined
  const error = (searchParams as any)?.error as string | undefined
  const filterParam = new URLSearchParams(searchParams as any).get('filter') || ''
  const allItems: any[] = Array.isArray(data.items) ? data.items : []
  const filteredItems: any[] = filterParam === 'outstanding'
    ? allItems.filter((it: any) => !it.cleared)
    : (filterParam === 'cleared' ? allItems.filter((it: any) => it.cleared) : allItems)
  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Reconciliation Summary</h1>
          <a href="/bank-transactions/reconciliation/history" className="btn-secondary">History</a>
        </div>
        {error ? (
          <div className="mt-2 rounded-md border border-rose-300 bg-rose-50 text-rose-800 text-sm px-3 py-2">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="mt-2 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm px-3 py-2">
            {notice}
          </div>
        ) : null}
        <div className="text-sm text-slate-600">As of <span className="font-mono">{data.asOf}</span>{data.statementEndDate ? <> · Statement end <span className="font-mono">{data.statementEndDate}</span></> : null}</div>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <form action="/bank-transactions/reconciliation" method="get" className="flex items-end gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-slate-600" htmlFor="accountId">Account</label>
              <select id="accountId" name="accountId" defaultValue={accountId} className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm min-w-[24ch]">
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.number} · {a.name}</option>
                ))}
              </select>
            </div>
            <input type="hidden" name="asOf" value={String(data.asOf)} />
            <button className="btn-secondary">Apply</button>
          </form>
          <a
            className="btn-secondary"
            href={`/api/reports/reconciliation/export?asOf=${encodeURIComponent(String(data.asOf))}${accountId ? `&accountId=${encodeURIComponent(accountId)}` : ''}&csvVersion=true`}
            title="Export reconciliation CSV"
          >Export CSV</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="glass-card p-3">
            <div className="text-xs text-slate-500">Statement ending balance</div>
            <div className="text-base font-semibold"><Amount value={Number(data.statementEndingBalance || 0)} /></div>
          </div>
          <div className="glass-card p-3">
            <div className="text-xs text-slate-500">Cleared</div>
            <div className="text-sm">Debits: <Amount value={Number(data.clearedDebits || 0)} /></div>
            <div className="text-sm">Credits: <Amount value={Number(data.clearedCredits || 0)} /></div>
          </div>
          <div className="glass-card p-3">
            <div className="text-xs text-slate-500">Outstanding</div>
            <div className="text-sm">Checks: <Amount value={Number(data.outstandingChecks || 0)} /></div>
            <div className="text-sm">Deposits: <Amount value={Number(data.outstandingDeposits || 0)} /></div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="glass-card p-3">
            <div className="text-xs text-slate-500">Beginning balance</div>
            <div className="text-base font-semibold"><Amount value={Number(data.beginningBalance || 0)} /></div>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xs text-slate-500">Difference</div>
          <div className={Number(data.difference || 0) === 0 ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
            <Amount value={Number(data.difference || 0)} />
          </div>
        </div>
        <form
          className="mt-4 flex flex-wrap items-end gap-2"
          action={`${getBaseUrl()}/api/reconciliation/finalize`}
          method="post"
        >
          <div className="flex flex-col">
            <label className="text-xs text-slate-600" htmlFor="endingBalance">Statement ending balance</label>
            <input name="endingBalance" id="endingBalance" defaultValue={String(Number(data.statementEndingBalance || 0))} className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm w-[18ch]" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-600" htmlFor="serviceCharge">Service charge</label>
            <input name="serviceCharge" id="serviceCharge" defaultValue="0" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm w-[12ch]" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-600" htmlFor="interestEarned">Interest earned</label>
            <input name="interestEarned" id="interestEarned" defaultValue="0" className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm w-[12ch]" />
          </div>
          <input type="hidden" name="periodEnd" value={String(data.statementEndDate || data.asOf)} />
          <input type="hidden" name="accountId" value={accountId} />
          <button
            className="btn-primary"
            formAction={async (formData) => {
              'use server'
              const eb = Number(formData.get('endingBalance') || 0)
              const sc = Number(formData.get('serviceCharge') || 0)
              const ie = Number(formData.get('interestEarned') || 0)
              const acct = String(formData.get('accountId') || accountId)
              const periodEnd = String(formData.get('periodEnd') || data.asOf)
              // Clear all items marked cleared in current view
              const clearedIds = Array.isArray(data.items) ? data.items.filter((it: any) => it.cleared).map((it: any) => it.id) : []
              const r = await fetch(`${getBaseUrl()}/api/reconciliation/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: acct, periodEnd, endingBalance: eb, serviceCharge: sc, interestEarned: ie, clearedIds }),
                cache: 'no-store',
              })
              const next = new URL(`${getBaseUrl()}/bank-transactions/reconciliation`)
              next.searchParams.set('asOf', String(data.asOf))
              if (!r.ok) {
                let msg = 'Unable to finalize reconciliation.'
                try { const j = await r.json(); if (j?.error) msg = j.error } catch {}
                next.searchParams.set('error', msg)
                redirect(next.toString())
              }
              next.searchParams.set('notice', 'Reconciliation finalized')
              redirect(next.toString())
            }}
          >Finalize</button>
        </form>
      </div>
      <div className="glass-card overflow-x-auto">
        <div className="p-2 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            <span className="font-medium">Items</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <a className="btn-secondary" href={`?asOf=${encodeURIComponent(String(data.asOf))}${accountId ? `&accountId=${encodeURIComponent(accountId)}` : ''}&filter=outstanding`}>
              Only outstanding
            </a>
            <a className="btn-secondary" href={`?asOf=${encodeURIComponent(String(data.asOf))}${accountId ? `&accountId=${encodeURIComponent(accountId)}` : ''}&filter=cleared`}>
              Only cleared
            </a>
            <a className="btn-secondary" href={`?asOf=${encodeURIComponent(String(data.asOf))}${accountId ? `&accountId=${encodeURIComponent(accountId)}` : ''}`}>
              Show all
            </a>
          </div>
        </div>
        <table className="min-w-full text-sm caption-top">
          <caption className="text-center py-2 text-slate-600">Cleared and outstanding items</caption>
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-center">Cleared</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? filteredItems.map((it: any) => (
              <tr key={it.id} className="border-t border-slate-200">
                <td className="px-3 py-2 font-mono">{it.date}</td>
                <td className="px-3 py-2">{it.type}</td>
                <td className="px-3 py-2 tabular-nums text-right"><Amount value={Number(it.amount || 0)} /></td>
                <td className="px-3 py-2 text-center">
                  <form action={`${getBaseUrl()}/api/reconciliation/toggle-cleared`} method="post">
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="cleared" value={String(!it.cleared)} />
                    <input type="hidden" name="accountId" value={accountId} />
                    <input type="hidden" name="periodEnd" value={effectivePeriodEnd} />
                    <button
                      className={`inline-flex items-center justify-center min-w-[6ch] rounded-md border px-2 py-0.5 text-xs ${it.cleared ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white/80 border-slate-200 text-slate-700'} ${(it.reconciled || (effectivePeriodEnd && String(it.date || '') > effectivePeriodEnd)) ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title={it.reconciled ? 'This item is already reconciled. Undo the reconciliation to change it.' : ((effectivePeriodEnd && String(it.date || '') > effectivePeriodEnd) ? 'This item is after the statement end date.' : undefined)}
                      disabled={Boolean(it.reconciled) || Boolean(effectivePeriodEnd && String(it.date || '') > effectivePeriodEnd)}
                      formAction={async () => {
                        'use server'
                        const r = await fetch(`${getBaseUrl()}/api/reconciliation/toggle-cleared`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: it.id, cleared: !it.cleared, accountId, periodEnd: effectivePeriodEnd }),
                          cache: 'no-store',
                        })
                        const next = new URL(`${getBaseUrl()}/bank-transactions/reconciliation`)
                        next.searchParams.set('asOf', String(data.asOf))
                        if (!r.ok) {
                          let msg = 'Unable to change cleared state.'
                          try { const j = await r.json(); if (j?.error) msg = j.error } catch {}
                          next.searchParams.set('error', msg)
                          redirect(next.toString())
                        }
                        const f = new URLSearchParams(searchParams as any).get('filter')
                        if (f) next.searchParams.set('filter', f)
                        redirect(next.toString())
                      }}
                    >{it.cleared ? 'Yes' : 'No'}</button>
                  </form>
                </td>
              </tr>
            )) : (
              <tr><td className="px-3 py-4 text-center text-slate-500" colSpan={4}>No items</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
