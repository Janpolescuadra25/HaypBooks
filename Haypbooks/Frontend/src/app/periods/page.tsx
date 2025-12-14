import { getRoleFromCookies, hasPermission } from '@/lib/rbac'
import { ExportCsvButton, PrintButton } from '@/components/ReportActions'
import { getBaseUrl } from '@/lib/server-url'

async function fetchPeriods(): Promise<{ closedThrough: string | null; periods: Array<{ id: string; start: string; end: string; status: string }> }> {
  const res = await fetch(`${getBaseUrl()}/api/periods`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load periods')
  return res.json()
}

export default async function PeriodsPage() {
  const data = await fetchPeriods()
  const role = getRoleFromCookies()
  const canWrite = hasPermission(role, 'journal:write')
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 print:hidden">
        <div className="flex items-end gap-2">
          <div className="flex flex-col">
            <label htmlFor="ct" className="text-xs text-slate-600">Closed through</label>
            <input id="ct" readOnly className="w-[18ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" value={data.closedThrough || '—'} />
          </div>
          {canWrite && (
            <form action={async (formData: FormData) => {
              'use server'
              const end = String(formData.get('end') || '')
              if (!end) return
              await fetch(`${getBaseUrl()}/api/periods`, { method: 'POST', body: JSON.stringify({ action: 'close-through', end }) })
            }}>
              <div className="flex items-end gap-2">
                <div className="flex flex-col">
                  <label htmlFor="end" className="text-xs text-slate-600">Close through</label>
                  <input id="end" name="end" type="date" className="w-[18ch] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-sm" required />
                </div>
                <button type="submit" className="rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-sm">Apply</button>
              </div>
            </form>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ExportCsvButton exportPath="/api/periods/export" />
          <PrintButton />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/80">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Start</th>
              <th className="px-4 py-2">End</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.periods.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-mono">{p.id}</td>
                <td className="px-4 py-2">{p.start}</td>
                <td className="px-4 py-2">{p.end}</td>
                <td className="px-4 py-2">{p.status}</td>
              </tr>
            ))}
            {data.periods.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No periods yet. Use &quot;Close through&quot; to lock prior dates.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
