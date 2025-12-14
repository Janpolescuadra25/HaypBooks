import Link from 'next/link'
import type { Route } from 'next'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'
import { ExportCsvButton, PrintButton, RefreshButton } from '@/components/ReportActions'
import { AccountActivateButton } from '@/components/AccountActivateButton'
import { AccountMergeButton } from '@/components/AccountMergeButton'
import { getBaseUrl } from '@/lib/server-url'
import AuditEventsPanel from '@/components/AuditEventsPanel'
import { formatCurrency } from '@/lib/format'

type Account = { id: string; number: string; name: string; type: string; active?: boolean; reconcilable?: boolean; openingBalanceDate?: string; parentId?: string; parentNumber?: string; detailType?: string; balance?: number }

async function fetchAccounts(q?: string, includeInactive?: boolean, asOf?: string | null): Promise<{ accounts: Account[]; total: number }> {
  const sp = new URLSearchParams()
  if (q) sp.set('q', q)
  if (includeInactive) sp.set('includeInactive', '1')
  // Always include balances so we can optionally show roll-ups
  sp.set('includeBalances', '1')
  if (asOf) sp.set('asOf', asOf)
  const res = await fetch(`${getBaseUrl()}/api/accounts${sp.size ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load accounts')
  return res.json()
}

async function fetchSettings(): Promise<{ baseCurrency: string }> {
  const res = await fetch(`${getBaseUrl()}/api/settings`, { cache: 'no-store' })
  if (!res.ok) return { baseCurrency: 'USD' }
  const body = await res.json().catch(() => ({ settings: { baseCurrency: 'USD' } }))
  return { baseCurrency: body?.settings?.baseCurrency || 'USD' }
}

function computeRollups(accounts: Account[]): Record<string, number> {
  const byId: Record<string, Account> = {}
  const children: Record<string, Account[]> = {}
  accounts.forEach(a => { byId[a.id] = a })
  accounts.forEach(a => {
    if (a.parentId) {
      children[a.parentId] ||= []
      children[a.parentId].push(a)
    }
  })
  const memo: Record<string, number> = {}
  const sumTree = (id: string): number => {
    if (memo[id] != null) return memo[id]
    const self = Number(byId[id]?.balance || 0)
    const kids = children[id] || []
    const total = kids.reduce((s, c) => s + sumTree(c.id), self)
    memo[id] = Number(total.toFixed(2))
    return memo[id]
  }
  accounts.forEach(a => { sumTree(a.id) })
  return memo
}

export default async function ChartOfAccountsPage({ searchParams }: { searchParams: { q?: string; includeInactive?: string; rollup?: string; asOf?: string } }) {
  const { q } = searchParams
  const includeInactive = searchParams?.includeInactive === '1'
  const rollup = searchParams?.rollup === '1'
  const asOf = (searchParams?.asOf || '').slice(0,10) || null
  const [data, settings] = await Promise.all([fetchAccounts(q, includeInactive, asOf), fetchSettings()])
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'journal:write')
  const canAudit = hasPermission(role, 'audit:read')
  const baseCurrency = settings.baseCurrency || 'USD'
  const rollups = computeRollups(data.accounts)
  return (
    <div className="space-y-4">
      {/* Single glass card: toolbar lives inside the card header */}
      <div className="glass-card">
        <div className="mb-3 flex items-end justify-between gap-3 print:hidden">
          <form
            className="glass-formbar flex w-full items-center justify-between gap-3 px-3 py-2 transition-all duration-200"
            action="/transactions/chart-of-accounts"
            method="get"
          >
            <div className="flex flex-wrap items-center gap-2">
              {/* Accessible but visually hidden label */}
              <label htmlFor="q" className="sr-only">Search</label>
              <div className="flex items-center gap-2">
                <input id="q" name="q" defaultValue={q || ''} placeholder="Number or Name" className="w-[28ch] rounded-md border border-slate-200 bg-white px-2 py-1 text-sm" />
                <button className="btn-secondary btn-sm" type="submit">Search</button>
                <RefreshButton />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="asOf" className="text-sm text-slate-700">As of</label>
                <input id="asOf" name="asOf" type="date" defaultValue={asOf || ''} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm" />
              </div>
              <label className="ml-2 flex items-center gap-2">
                <input type="checkbox" name="includeInactive" value="1" defaultChecked={includeInactive} />
                <span className="text-sm text-slate-700">Include inactive</span>
              </label>
              <label className="ml-2 flex items-center gap-2">
                <input type="checkbox" name="rollup" value="1" defaultChecked={rollup} />
                <span className="text-sm text-slate-700">Roll up parent totals</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <ExportCsvButton exportPath="/api/accounts/export" />
              <PrintButton />
              {canAudit && (
                <Link href={'/activity?entity=account' as Route} className="btn-secondary btn-sm" title="View account change log">Change log</Link>
              )}
              {canWrite && (
                <Link href={'/accounts/import?from=%2Ftransactions%2Fchart-of-accounts' as Route} className="btn-secondary btn-sm" title="Preview COA import">Import (preview)</Link>
              )}
              {canWrite && (
                <Link href={'/accounts/new?from=%2Ftransactions%2Fchart-of-accounts' as Route} className="btn-primary btn-sm">New</Link>
              )}
            </div>
          </form>
        </div>

        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="px-4 py-2">Number</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Detail Type</th>
              <th className="px-4 py-2">Parent</th>
              <th className="px-4 py-2">Balance{rollup ? ' (roll-up)' : ''}</th>
              <th className="px-4 py-2">Reconcilable</th>
              <th className="px-4 py-2">Opening Balance Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-mono"><Link href={`/reports/account-ledger?account=${encodeURIComponent(a.number)}&from=%2Ftransactions%2Fchart-of-accounts` as Route} className="text-sky-700 hover:underline">{a.number}</Link></td>
                <td className="px-4 py-2">
                  <span className={`inline-block ${a.parentId ? 'pl-5' : ''}`}>
                    {a.parentId ? <span className="mr-1 text-slate-400">└</span> : null}
                    {a.name}
                  </span>
                </td>
                <td className="px-4 py-2">{a.type}</td>
                <td className="px-4 py-2">{a.detailType || ''}</td>
                <td className="px-4 py-2">{a.parentNumber || ''}</td>
                <td className="px-4 py-2 tabular-nums">{formatCurrency(rollup ? rollups[a.id] ?? Number(a.balance || 0) : Number(a.balance || 0), baseCurrency)}</td>
                <td className="px-4 py-2">{a.reconcilable ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">{a.openingBalanceDate ? a.openingBalanceDate : ''}</td>
                <td className="px-4 py-2">{a.active === false ? 'Inactive' : 'Active'}</td>
                <td className="px-4 py-2 text-right">
                  {canWrite && (
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/accounts/${a.id}?from=%2Ftransactions%2Fchart-of-accounts` as Route} className="text-blue-600 hover:underline">Edit</Link>
                      <AccountActivateButton id={a.id} active={a.active} />
                      <AccountMergeButton sourceId={a.id} sourceType={a.type as any} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canAudit && (
        <AuditEventsPanel entity="account" title="Recent account activity" limit={10} />
      )}
    </div>
  )
}
