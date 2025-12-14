import React from 'react'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { getBaseUrl } from '@/lib/base-url'
import { deriveRange } from '@/lib/report-helpers'
import Amount from '@/components/Amount'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { buildCsvCaption } from '@/lib/report-helpers'
import { formatCurrency } from '@/lib/format'

async function fetchAccounts() {
  const res = await fetch(`${getBaseUrl()}/api/accounts?includeInactive=1`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json().catch(()=>({ accounts: [] }))
  return Array.isArray(data.accounts) ? data.accounts : []
}

async function fetchRegister(params: URLSearchParams) {
  const url = `${getBaseUrl()}/api/reports/bank-register${params.size ? `?${params.toString()}` : ''}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function BankRegisterPage({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const period = searchParams.period || 'ThisMonth'
  const start = searchParams.start || ''
  const end = searchParams.end || ''
  const accountId = searchParams.accountId || ''
  const sp = new URLSearchParams()
  if (period) sp.set('period', period)
  if (start) sp.set('start', start)
  if (end) sp.set('end', end)
  if (accountId) sp.set('accountId', accountId)

  const [accounts, data] = await Promise.all([fetchAccounts(), fetchRegister(sp)])
  const acc = accounts.find((a:any) => a.id === (accountId || data?.account?.id)) || accounts.find((a:any) => a.number === '1000') || accounts[0]
  const { start: dStart, end: dEnd } = deriveRange(period, start, end)
  const caption = buildCsvCaption(dStart, dEnd, dEnd)

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Bank Register</h1>
          <div className="flex flex-wrap items-center gap-1.5">
            <ExportCsvButton exportPath="/api/reports/bank-register/export" title="Export Register" />
            <PrintButton />
          </div>
        </div>
      </div>
      <div className="glass-card">
        {!data ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-3">
            {data.reconcileDiscrepancy ? (
              <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 text-sm flex items-center justify-between gap-3">
                <div>Some previously reconciled transaction details have changed since the last reconciliation. Review your register and consider re-reconciling.</div>
                <a className="btn-secondary btn-xs" href={`/reports/reconciliation-discrepancy?accountId=${encodeURIComponent(acc?.id || '')}`}>
                  View discrepancy details
                </a>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span>Account</span>
                <ClientAccountSelect accounts={accounts} currentId={acc?.id} />
              </div>
              <ReportPeriodSelect value={period as any} />
              <div>Opening: <span className="font-mono tabular-nums"><Amount value={data.openingBalance} /></span></div>
              <div>Closing: <span className="font-mono tabular-nums"><Amount value={data.closingBalance} /></span></div>
              {/* Accessibility: announce key totals and context when data/filters change */}
              <div className="sr-only" aria-live="polite">
                {`Bank Register for ${acc?.number || 'selected account'}${acc?.name ? `, ${acc.name}` : ''}. ${caption}. `}
                {`Opening balance ${formatCurrency(data.openingBalance)}. `}
                {`Closing balance ${formatCurrency(data.closingBalance)}.`}
              </div>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Bank Status</th>
                    <th className="px-3 py-2">Cleared</th>
                    <th className="px-3 py-2">Reconciled</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-right">Running Balance</th>
                    <th className="px-3 py-2">Matched</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r:any) => (
                    <tr key={r.id} className="border-t border-slate-200">
                      <td className="px-3 py-1.5 font-mono">{r.date}</td>
                      <td className="px-3 py-1.5">{r.description}</td>
                      <td className="px-3 py-1.5">{r.bankStatus || 'for_review'}</td>
                      <td className="px-3 py-1.5">{r.cleared ? 'Yes' : ''}</td>
                      <td className="px-3 py-1.5">
                        <span className="inline-flex items-center gap-2">
                          {r.reconciled ? 'Yes' : ''}
                          {r.reconciled ? <ClientUnreconcileButton txnId={r.id} accountId={data.account?.id} /> : null}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums font-mono"><Amount value={r.amount} /></td>
                      <td className="px-3 py-1.5 text-right tabular-nums font-mono"><Amount value={r.runningBalance} /></td>
                      <td className="px-3 py-1.5">
                        {r.matchedRef ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 text-slate-800 border border-slate-200 px-2 py-[1px] text-[11px]">
                            <span className="uppercase text-[10px] text-slate-500">{r.matchedKind}</span>
                            {r.matchedKind === 'invoice' && r.matchedId ? (
                              <a className="text-sky-700 hover:underline" href={`/invoices/${r.matchedId}`}>{r.matchedRef}</a>
                            ) : r.matchedKind === 'bill' && r.matchedId ? (
                              <a className="text-sky-700 hover:underline" href={`/bills/${r.matchedId}`}>{r.matchedRef}</a>
                            ) : r.matchedKind === 'deposit' && r.matchedId ? (
                              <a className="text-sky-700 hover:underline" href={`/sales/deposits/${r.matchedId}`}>{r.matchedRef}</a>
                            ) : (
                              <span>{r.matchedRef}</span>
                            )}
                          </span>
                        ) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ClientAccountSelect({ accounts, currentId }: { accounts: Array<{ id: string; number: string; name?: string }>; currentId?: string }) {
  'use client'
  const { usePathname, useRouter, useSearchParams } = require('next/navigation') as typeof import('next/navigation')
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  return (
    <select
      className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm"
      value={currentId || ''}
      onChange={(e) => {
        const qs = new URLSearchParams(sp?.toString() || '')
        const v = e.target.value
        if (v) qs.set('accountId', v); else qs.delete('accountId')
  router.push((`${pathname}?${qs.toString()}`) as any)
      }}
      aria-label="Select account"
    >
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>{a.number}{a.name ? ` · ${a.name}` : ''}</option>
      ))}
    </select>
  )
}

function ClientUnreconcileButton({ txnId, accountId }: { txnId: string; accountId?: string }) {
  'use client'
  const { useRouter } = require('next/navigation') as typeof import('next/navigation')
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  return (
    <button
      type="button"
      className="text-[11px] px-2 py-[1px] rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      disabled={busy}
      title="Mark this transaction as not reconciled"
      onClick={async () => {
        setBusy(true)
        try {
          const res = await fetch('/api/reconciliation/unreconcile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txnId, accountId }),
          })
          if (!res.ok) {
            const j = await res.json().catch(()=>({ error: 'Failed' }))
            alert(j?.error || 'Failed to unreconcile')
          } else {
            router.refresh()
          }
        } finally {
          setBusy(false)
        }
      }}
    >Unreconcile</button>
  )
}
