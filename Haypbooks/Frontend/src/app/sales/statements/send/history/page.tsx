import { getBaseUrl } from '@/lib/server-url'
import { getRoleFromCookies, hasPermission } from '@/lib/rbac-server'

async function fetchHistory(params: { start?: string; end?: string; customerId?: string; batchId?: string }) {
  const sp = new URLSearchParams()
  if (params.start) sp.set('start', params.start)
  if (params.end) sp.set('end', params.end)
  if (params.customerId) sp.set('customerId', params.customerId)
  if (params.batchId) sp.set('batchId', params.batchId)
  const res = await fetch(`${getBaseUrl()}/api/customers/statements/send/history${sp.toString() ? `?${sp.toString()}` : ''}`, { cache: 'no-store' })
  if (!res.ok) return { rows: [], count: 0 }
  const json = await res.json()
  return { rows: json?.history?.rows ?? [], count: json?.history?.count ?? 0 }
}

export default async function StatementSendHistoryPage({ searchParams }: { searchParams: { start?: string; end?: string; customerId?: string; batchId?: string; csv?: string } }) {
  const { start, end, customerId, batchId } = searchParams || {}
  const csv = (searchParams?.csv === '1') ? '1' : undefined
  const data = await fetchHistory({ start, end, customerId, batchId })
  const role = getRoleFromCookies()
  const canExport = hasPermission(role, 'audit:read') && hasPermission(role, 'reports:read')
  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Statement Send History</h1>
            <p className="text-sm text-slate-600">Audit of statement sends</p>
          </div>
          <div className="flex items-center gap-2">
            {canExport ? (
              <a className="btn-secondary" href={`/api/customers/statements/send/history/export${(() => { const u = new URLSearchParams(); if (start) u.set('start', start); if (end) u.set('end', end); if (customerId) u.set('customerId', customerId); if (batchId) u.set('batchId', batchId); if (csv === '1') u.set('csv','1'); return u.toString() ? `?${u.toString()}` : '' })()}`}>Export CSV</a>
            ) : (
              <span className="btn-secondary opacity-60 cursor-not-allowed" title="Requires audit and reports permissions">Export CSV</span>
            )}
            <button className="btn-secondary" onClick={() => { if (typeof window !== 'undefined') window.print() }}>Print</button>
          </div>
        </div>
        <form className="mt-3 flex flex-wrap items-end gap-2" method="get">
          <div className="flex flex-col">
            <label htmlFor="start" className="text-xs text-slate-600">Start</label>
            <input id="start" type="date" name="start" defaultValue={start} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="end" className="text-xs text-slate-600">End</label>
            <input id="end" type="date" name="end" defaultValue={end} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="customerId" className="text-xs text-slate-600">Customer Id</label>
            <input id="customerId" name="customerId" defaultValue={customerId} className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="batchId" className="text-xs text-slate-600">Batch Id</label>
            <input id="batchId" name="batchId" defaultValue={batchId} className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" name="csv" value="1" defaultChecked={csv === '1'} /> Include CSV-Version row
          </label>
          <button className="btn-secondary">Apply</button>
        </form>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white/70 backdrop-blur z-10 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">As of</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Message Id</th>
              <th className="px-3 py-2 text-left">Batch Id</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data?.rows) && data.rows.length > 0 ? data.rows.map((r: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-3 py-2 font-mono">{(r.date || '').slice(0,10)}</td>
                <td className="px-3 py-2">{r.customerId}</td>
                <td className="px-3 py-2 font-mono">{r.asOf}</td>
                <td className="px-3 py-2">{r.type}</td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2 font-mono">{r.messageId}</td>
                <td className="px-3 py-2 font-mono">{r.batchId || ''}</td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-3 py-4 text-center text-slate-500">No statement sends</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
