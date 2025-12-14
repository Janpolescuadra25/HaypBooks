import React from 'react'
import { getBaseUrl } from '@/lib/base-url'
import { ReportPeriodSelect } from '@/components/ReportPeriodSelect'
import { ExportCsvButton } from '@/components/ReportActions'

async function fetchAccounts() {
  const res = await fetch(`${getBaseUrl()}/api/accounts?includeInactive=1`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json().catch(()=>({ accounts: [] }))
  return Array.isArray(data.accounts) ? data.accounts : []
}

async function fetchDiscrepancies({ accountId, sessionId }: { accountId?: string; sessionId?: string }) {
  const qs = new URLSearchParams()
  if (sessionId) qs.set('sessionId', sessionId)
  else if (accountId) qs.set('accountId', accountId)
  const res = await fetch(`${getBaseUrl()}/api/reconciliation/discrepancies?${qs.toString()}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function ReconciliationDiscrepancyReport({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const accountId = searchParams.accountId || ''
  const sessionId = searchParams.sessionId || ''
  const [accounts, data] = await Promise.all([fetchAccounts(), fetchDiscrepancies({ accountId, sessionId })])
  const acc = accounts.find((a:any) => a.id === (accountId || data?.session?.accountId)) || accounts.find((a:any) => a.number === '1000') || accounts[0]
  const discrepancies = Array.isArray(data?.discrepancies) ? data.discrepancies : []

  return (
    <div className="space-y-4">
      <div className="glass-card print:hidden">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">Reconciliation Discrepancy</h1>
          <div className="flex flex-wrap items-center gap-1.5">
            {data?.session ? (
              <ExportCsvButton exportPath={`/api/reconciliation/sessions/${encodeURIComponent(data.session.id)}/export?csv=discrepancy`} title="Export CSV" />
            ) : null}
          </div>
        </div>
      </div>
      <div className="glass-card">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span>Account</span>
            <ClientAccountSelect accounts={accounts} currentId={acc?.id} />
          </div>
          <div className="text-slate-600">Latest session: {data?.session ? (data.session.periodEnd || '').slice(0,10) : '—'}</div>
        </div>
        <div className="mt-3 overflow-auto">
          {discrepancies.length === 0 ? (
            <div className="text-sm text-slate-600">No discrepancies found for the latest reconciliation.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="px-3 py-2">Txn ID</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Change</th>
                  <th className="px-3 py-2">Snapshot Date</th>
                  <th className="px-3 py-2">Snapshot Amount</th>
                  <th className="px-3 py-2">Current Date</th>
                  <th className="px-3 py-2">Current Amount</th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {discrepancies.map((d:any) => (
                  <tr key={d.id} className="border-t border-slate-200">
                    <td className="px-3 py-1.5 font-mono text-[12px]">{d.id}</td>
                    <td className="px-3 py-1.5 capitalize">{d.status}</td>
                    <td className="px-3 py-1.5">{d.changeType || ''}</td>
                    <td className="px-3 py-1.5 font-mono tabular-nums">{d.snapDate || ''}</td>
                    <td className="px-3 py-1.5 font-mono tabular-nums">{typeof d.snapAmount === 'number' ? d.snapAmount.toFixed(2) : ''}</td>
                    <td className="px-3 py-1.5 font-mono tabular-nums">{d.curDate || ''}</td>
                    <td className="px-3 py-1.5 font-mono tabular-nums">{typeof d.curAmount === 'number' ? d.curAmount.toFixed(2) : ''}</td>
                    <td className="px-3 py-1.5">{d.actor || ''}</td>
                    <td className="px-3 py-1.5 font-mono tabular-nums">{d.at ? String(d.at).slice(0,19).replace('T',' ') : ''}</td>
                    <td className="px-3 py-1.5">{d.action || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
