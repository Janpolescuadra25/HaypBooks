import { getBaseUrl } from '@/lib/server-url'
import Amount from '@/components/Amount'
import { formatAsOf } from '@/lib/date'
import { PrintButton, ExportCsvButton } from '@/components/ReportActions'
import StatementFilterForm from '@/components/StatementFilterForm'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac'
import ActionsClient from './ActionsClient'

type Params = { params: { id: string }, searchParams?: { asOf?: string; start?: string; type?: 'balance-forward'|'transaction'|'open-item' } }

async function fetchStatement(id: string, asOfIso: string, opts?: { startIso?: string | null; type?: 'balance-forward'|'transaction'|'open-item' }) {
  const base = getBaseUrl()
  const url = new URL(`${base}/api/vendors/${id}/statement`)
  url.searchParams.set('asOf', asOfIso)
  if (opts?.startIso) url.searchParams.set('start', opts.startIso)
  if (opts?.type) url.searchParams.set('type', opts.type)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load statement')
  return res.json() as Promise<{
    vendor?: { id: string; name?: string }
    asOf: string
    lines: Array<{ id?: string; date: string; type: string; description: string; amount: number; runningBalance: number }>
    totals?: { bills?: number; payments?: number; credits?: number; net?: number }
    aging?: { totals?: { current?: number; 30?: number; 60?: number; 90?: number; '120+'?: number; total?: number } }
  }>
}

function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function toIso(date?: string): string {
  return (date || new Date().toISOString()).slice(0, 10)
}

// replaced by client Actions to keep event handlers on the client

function Table({ rows }: { rows: Array<{ date: string; type: string; description: string; amount: number; runningBalance: number }> }) {
  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 sticky top-0">
          <tr>
            <th className="text-left px-3 py-2">Date</th>
            <th className="text-left px-3 py-2">Type</th>
            <th className="text-left px-3 py-2">Description</th>
            <th className="text-right px-3 py-2">Amount</th>
            <th className="text-right px-3 py-2">Running Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.date + r.description + idx} className="odd:bg-white even:bg-slate-50/50">
              <td className="px-3 py-1 whitespace-nowrap tabular-nums">{toIso(r.date)}</td>
              <td className="px-3 py-1 whitespace-nowrap">{titleCase(r.type)}</td>
              <td className="px-3 py-1">{r.description}</td>
              <td className="px-3 py-1 text-right tabular-nums"><Amount value={Number(r.amount)||0} /></td>
              <td className="px-3 py-1 text-right tabular-nums"><Amount value={Number(r.runningBalance)||0} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function Page({ params, searchParams }: Params) {
  const id = params.id
  const asOfIso = (searchParams?.asOf || new Date().toISOString().slice(0,10))
  const startIso = searchParams?.start || null
  const stmtType = (searchParams?.type as any) || undefined
  const data = await fetchStatement(id, asOfIso, { startIso, type: stmtType as any })
  const role = getRoleFromCookies()
  const name = data.vendor?.name || id
  const lines = data.lines || []
  const ending = lines.length ? lines[lines.length - 1].runningBalance : 0
  const aging = data.aging?.totals || {}

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vendor Statement - {name}</h1>
          <div className="text-xs text-slate-600">{startIso ? <>From {String(startIso)} to {toIso(asOfIso)}</> : formatAsOf(asOfIso)}</div>
        </div>
        <div className="print:hidden">
          <ActionsClient vendorId={id} asOfIso={asOfIso} startIso={startIso} stmtType={stmtType as any} canSend={hasPermission(role, 'bills:write')} />
        </div>
      </div>

      {/* Filters */}
      <StatementFilterForm initialType={(stmtType as any) || 'open-item'} initialStart={startIso} initialAsOf={toIso(asOfIso)} />

      {/* Aging summary */}
      <div className="overflow-auto border rounded">
        <table className="min-w-[480px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2">Aging</th>
              <th className="text-right px-3 py-2">Current</th>
              <th className="text-right px-3 py-2">30</th>
              <th className="text-right px-3 py-2">60</th>
              <th className="text-right px-3 py-2">90</th>
              <th className="text-right px-3 py-2">120+</th>
              <th className="text-right px-3 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-1">As of {toIso(asOfIso)}</td>
              <td className="px-3 py-1 text-right tabular-nums"><Amount value={Number(aging.current)||0} /></td>
              <td className="px-3 py-1 text-right tabular-nums"><Amount value={Number((aging as any)[30])||0} /></td>
              <td className="px-3 py-1 text-right tabular-nums"><Amount value={Number((aging as any)[60])||0} /></td>
              <td className="px-3 py-1 text-right tabular-nums"><Amount value={Number((aging as any)[90])||0} /></td>
              <td className="px-3 py-1 text-right tabular-nums"><Amount value={Number((aging as any)['120+'])||0} /></td>
              <td className="px-3 py-1 text-right tabular-nums"><Amount value={Number(aging.total)||0} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <Table rows={lines} />

      <div className="flex justify-end">
        <table className="text-sm">
          <tbody>
            <tr>
              <td className="px-3 py-2 font-medium">Totals</td>
              <td className="px-3 py-2 text-right tabular-nums"><Amount value={Number(ending)||0} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
